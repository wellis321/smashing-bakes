import { fail } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { healthRuns } from '$lib/server/db/schema';
import { getAllActiveProductsWithCategory, getVisibleCategories } from '$lib/server/db/queries';
import { auditPage, auditSite } from '$lib/server/health/audit';
import { getSalesReport } from '$lib/server/health/sales';
import { publicBase } from '$lib/site';
import { findBrokenPhotos } from '$lib/server/photo-usage';

const KINDS = ['quick', 'lighthouse-mobile', 'lighthouse-desktop'] as const;
type Kind = (typeof KINDS)[number];

// The pages that matter most, plus one real category and one real product.
async function pagesToTest(): Promise<string[]> {
	const [categories, products] = await Promise.all([
		getVisibleCategories(),
		getAllActiveProductsWithCategory()
	]);
	const pages = ['/', '/shop', '/about', '/contact', '/bespoke-cakes', '/menus'];
	if (categories[0]) pages.splice(2, 0, `/shop/${categories[0].slug}`);
	if (products[0]) pages.splice(3, 0, `/product/${products[0].slug}`);
	return pages;
}

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
			.slice(0, 24)
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

	let sales = null;
	try {
		sales = await getSalesReport();
	} catch (err) {
		console.error('[health] sales report failed', err);
	}

	return {
		history,
		latest,
		sales,
		tableMissing,
		hasPageSpeedKey: Boolean(env.PAGESPEED_API_KEY),
		pages: await pagesToTest()
	};
};

export const actions: Actions = {
	// Our own instant checks: every key page, plus the whole site.
	quick: async ({ url }) => {
		const base = publicBase(url);
		const runId = randomUUID();
		try {
			const pages = await pagesToTest();
			for (const path of pages) {
				try {
					const audit = await auditPage(base, path);
					await db.insert(healthRuns).values({
						runId,
						kind: 'quick',
						url: path,
						performance: audit.scores.performance,
						accessibility: audit.scores.accessibility,
						seo: audit.scores.seo,
						metrics: JSON.stringify(audit.metrics),
						details: JSON.stringify(
							audit.checks.filter((c) => !c.pass).map((c) => ({ label: c.label, detail: c.detail }))
						)
					});
				} catch (err) {
					await db.insert(healthRuns).values({
						runId,
						kind: 'quick',
						url: path,
						error: err instanceof Error ? err.message : 'Could not be tested'
					});
				}
			}
			const site = await auditSite(base);
			// Every photo the site points at should actually exist.
			try {
				const broken = await findBrokenPhotos();
				site.checks.push({
					id: 'photos',
					area: 'practice',
					label: 'Every photo on the site still exists',
					pass: broken.length === 0,
					detail: broken.length
						? broken.map((b) => `${b.place}: ${b.url.split('/').pop()}`).join('; ')
						: undefined
				});
				site.score = Math.round(
					(site.checks.filter((c) => c.pass).length / site.checks.length) * 100
				);
			} catch (err) {
				console.error('[health] photo check failed', err);
			}
			await db.insert(healthRuns).values({
				runId,
				kind: 'quick',
				url: '(whole site)',
				bestPractices: site.score,
				details: JSON.stringify(
					site.checks.filter((c) => !c.pass).map((c) => ({ label: c.label, detail: c.detail }))
				)
			});
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
			return { lighthouseDone: true, runId, path };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'The test did not finish';
			await db.insert(healthRuns).values({ runId, kind, url: path, error: message.slice(0, 500) });
			return fail(504, { message: message.slice(0, 200), runId });
		}
	}
};
