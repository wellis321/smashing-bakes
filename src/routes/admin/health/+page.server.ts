import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { healthRuns, healthTasks } from '$lib/server/db/schema';
import { getSalesReport } from '$lib/server/health/sales';
import {
	buildReport,
	logReport,
	pagesToTest,
	runQuickChecks,
	syncTasks,
	taskSlug
} from '$lib/server/health/run';
import { publicBase } from '$lib/site';

const KINDS = ['quick', 'lighthouse-mobile', 'lighthouse-desktop'] as const;
type Kind = (typeof KINDS)[number];

type Row = typeof healthRuns.$inferSelect;
const average = (rows: Row[], key: 'performance' | 'accessibility' | 'bestPractices' | 'seo') => {
	const values = rows.map((r) => r[key]).filter((v): v is number => v != null);
	return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
};

export const load: PageServerLoad = async () => {
	let rows: Row[] = [];
	let tableMissing = false;
	try {
		rows = await db.select().from(healthRuns).orderBy(desc(healthRuns.createdAt)).limit(3000);
	} catch {
		tableMissing = true;
	}

	const history: Record<
		string,
		{
			runId: string;
			at: string;
			performance: number | null;
			accessibility: number | null;
			bestPractices: number | null;
			seo: number | null;
		}[]
	> = {};
	const latest: Record<
		string,
		{
			runId: string;
			at: string;
			rows: {
				url: string;
				performance: number | null;
				accessibility: number | null;
				bestPractices: number | null;
				seo: number | null;
				metrics: Record<string, number> | null;
				details: { label: string; detail?: string }[];
				error: string | null;
			}[];
		} | null
	> = {};

	for (const kind of KINDS) {
		const ofKind = rows.filter((r) => r.kind === kind);
		const runIds = [...new Set(ofKind.map((r) => r.runId))]; // newest first
		history[kind] = runIds
			.slice(0, 30)
			.map((runId) => {
				const group = ofKind.filter((r) => r.runId === runId);
				return {
					runId,
					at: group[0].createdAt.toISOString(),
					performance: average(group, 'performance'),
					accessibility: average(group, 'accessibility'),
					bestPractices: average(group, 'bestPractices'),
					seo: average(group, 'seo')
				};
			})
			.reverse();
		const newest = runIds[0];
		latest[kind] = newest
			? {
					runId: newest,
					at: ofKind.find((r) => r.runId === newest)!.createdAt.toISOString(),
					rows: ofKind
						.filter((r) => r.runId === newest)
						.reverse()
						.map((r) => ({
							url: r.url,
							performance: r.performance,
							accessibility: r.accessibility,
							bestPractices: r.bestPractices,
							seo: r.seo,
							metrics: r.metrics ? JSON.parse(r.metrics) : null,
							details: r.details ? JSON.parse(r.details) : [],
							error: r.error
						}))
				}
			: null;
	}

	let tasks: {
		id: number;
		page: string;
		title: string;
		detail: string | null;
		who: string;
		howToFix: string | null;
		status: string;
		note: string | null;
		kind: string;
		firstSeen: string;
		resolvedAt: string | null;
	}[] = [];
	let tasksMissing = false;
	try {
		const all = await db.query.healthTasks.findMany({ orderBy: [desc(healthTasks.lastSeen)] });
		tasks = all.map((t) => ({
			id: t.id,
			page: t.page,
			title: t.title,
			detail: t.detail,
			who: t.who,
			howToFix: t.howToFix,
			status: t.status,
			note: t.note,
			kind: t.kind,
			firstSeen: t.firstSeen.toISOString(),
			resolvedAt: t.resolvedAt?.toISOString() ?? null
		}));
	} catch {
		tasksMissing = true;
	}

	let sales = null;
	try {
		sales = await getSalesReport();
	} catch (err) {
		console.error('[health] sales report failed', err);
	}

	let report = '';
	try {
		report = tableMissing ? '' : await buildReport();
	} catch {
		report = '';
	}

	return {
		history,
		latest,
		sales,
		tasks,
		tasksMissing,
		report,
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
	},

	// Moves a to-do between open / working on it / ignore, with an optional note.
	setTask: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = String(formData.get('status') ?? '');
		const note = String(formData.get('note') ?? '')
			.trim()
			.slice(0, 1000);
		if (!id || !['open', 'working', 'ignored', 'fixed'].includes(status)) {
			return fail(400, { message: 'Invalid request.' });
		}
		await db
			.update(healthTasks)
			.set({
				status: status as 'open' | 'working' | 'ignored' | 'fixed',
				note: note || null,
				resolvedAt: status === 'fixed' ? new Date() : null
			})
			.where(eq(healthTasks.id, id));
		return { taskSaved: true };
	}
};
