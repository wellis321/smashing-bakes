import { fail } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { healthRuns } from '$lib/server/db/schema';
import {
	logReport,
	pagesToTest,
	runQuickChecks,
	syncTasks,
	taskSlug
} from '$lib/server/health/run';
import { loadHistory } from '$lib/server/health/load';
import { publicBase } from '$lib/site';

type Kind = 'quick' | 'lighthouse-mobile' | 'lighthouse-desktop';

export const load: PageServerLoad = async () => {
	const { history, latest, tableMissing } = await loadHistory();
	return {
		history,
		latest,
		tableMissing,
		hasPageSpeedKey: Boolean(env.PAGESPEED_API_KEY),
		pages: await pagesToTest()
	};
};

export const actions: Actions = {
	// Our own instant checks: every key page, plus the whole site.
	quick: async ({ url }) => {
		try {
			await runQuickChecks(publicBase(url));
		} catch (err) {
			console.error('[health] quick run failed', err);
			return fail(500, { message: 'The checks could not finish. Please try again.' });
		}
		return { quickDone: true };
	},

	// One page, one device, tested by Google Lighthouse (needs the free API key).
	lighthouse: async ({ request, url }) => {
		const key = env.PAGESPEED_API_KEY;
		if (!key) return fail(400, { message: 'The PageSpeed key has not been added yet.' });

		const formData = await request.formData();
		const path = String(formData.get('path') ?? '/');
		const strategy = formData.get('strategy') === 'desktop' ? 'desktop' : 'mobile';
		const runId = String(formData.get('runId') ?? randomUUID()).slice(0, 36);
		const last = formData.get('last') === 'true';
		const kind: Kind = strategy === 'desktop' ? 'lighthouse-desktop' : 'lighthouse-mobile';
		if (!path.startsWith('/')) return fail(400, { message: 'Invalid page.' });

		const target = `${publicBase(url)}${path}`;
		const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
		api.searchParams.set('url', target);
		api.searchParams.set('strategy', strategy);
		api.searchParams.set('key', key);
		for (const c of ['performance', 'accessibility', 'best-practices', 'seo']) {
			api.searchParams.append('category', c);
		}

		try {
			const res = await fetch(api, { signal: AbortSignal.timeout(110000) });
			const body = await res.json();
			if (!res.ok) {
				const message = body?.error?.message ?? `Google answered ${res.status}`;
				await db
					.insert(healthRuns)
					.values({ runId, kind, url: path, error: String(message).slice(0, 500) });
				return fail(502, { message: String(message).slice(0, 200), runId });
			}
			const lh = body.lighthouseResult;
			const score = (name: string) =>
				lh.categories[name]?.score != null ? Math.round(lh.categories[name].score * 100) : null;
			const audit = (id: string) => lh.audits[id]?.numericValue as number | undefined;
			const problems = Object.values<any>(lh.audits)
				.filter(
					(a) =>
						// "Network dependency tree" only describes the order things load in: it can't be fixed.
						!/network-dependency-tree/i.test(String(a.id)) &&
						a.score != null &&
						a.score < 0.9 &&
						['binary', 'numeric', 'metricSavings'].includes(a.scoreDisplayMode)
				)
				.sort((a, b) => a.score - b.score)
				.slice(0, 10)
				.map((a) => ({
					id: taskSlug(String(a.id ?? a.title)),
					label: String(a.title),
					detail: a.displayValue ? String(a.displayValue) : undefined
				}));
			await db.insert(healthRuns).values({
				runId,
				kind,
				url: path,
				performance: score('performance'),
				accessibility: score('accessibility'),
				bestPractices: score('best-practices'),
				seo: score('seo'),
				metrics: JSON.stringify({
					fcpMs: Math.round(audit('first-contentful-paint') ?? 0),
					lcpMs: Math.round(audit('largest-contentful-paint') ?? 0),
					tbtMs: Math.round(audit('total-blocking-time') ?? 0),
					cls: Number((audit('cumulative-layout-shift') ?? 0).toFixed(3)),
					speedIndexMs: Math.round(audit('speed-index') ?? 0),
					totalKb: Math.round((audit('total-byte-weight') ?? 0) / 1024)
				}),
				details: JSON.stringify(problems)
			});
			await syncTasks(kind, [path], { [path]: problems });
			if (last) await logReport(runId);
			return { lighthouseDone: true, runId, path };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'The test did not finish';
			await db.insert(healthRuns).values({ runId, kind, url: path, error: message.slice(0, 500) });
			return fail(504, { message: message.slice(0, 200), runId });
		}
	}
};
