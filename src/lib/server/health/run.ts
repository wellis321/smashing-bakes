import { and, desc, eq, inArray, ne } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '$lib/server/db';
import { healthRuns, healthTasks } from '$lib/server/db/schema';
import { getAllActiveProductsWithCategory, getVisibleCategories } from '$lib/server/db/queries';
import { auditPage, auditSite, type Check } from '$lib/server/health/audit';
import { guideFor, LIGHTHOUSE_GUIDE } from '$lib/server/health/fix-guide';
import { findBrokenPhotos } from '$lib/server/photo-usage';

// The pages that matter most, plus one real category and one real product.
export async function pagesToTest(): Promise<string[]> {
	const [categories, products] = await Promise.all([
		getVisibleCategories(),
		getAllActiveProductsWithCategory()
	]);
	const pages = ['/', '/shop', '/about', '/contact', '/bespoke-cakes', '/menus'];
	if (categories[0]) pages.splice(2, 0, `/shop/${categories[0].slug}`);
	if (products[0]) pages.splice(3, 0, `/product/${products[0].slug}`);
	return pages;
}

type Failure = { id: string; label: string; detail?: string };

const slug = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80);

// Turns each failing check into a to-do (once), reopens ones that come back,
// and closes ones that now pass. `pages` are the pages this run actually covered.
export async function syncTasks(
	kind: string,
	pages: string[],
	failuresByPage: Record<string, Failure[]>
): Promise<void> {
	try {
		const now = new Date();
		const seen = new Set<string>();
		for (const page of pages) {
			for (const f of failuresByPage[page] ?? []) {
				const taskKey = `${kind}|${page}|${f.id}`.slice(0, 255);
				seen.add(taskKey);
				const guide = kind === 'quick' ? guideFor(f.id, page) : LIGHTHOUSE_GUIDE;
				const existing = await db.query.healthTasks.findFirst({
					where: eq(healthTasks.taskKey, taskKey)
				});
				if (!existing) {
					await db.insert(healthTasks).values({
						taskKey,
						kind,
						page,
						title: f.label.slice(0, 300),
						detail: f.detail ?? null,
						who: guide.who,
						howToFix: guide.how
					});
				} else {
					await db
						.update(healthTasks)
						.set({
							lastSeen: now,
							detail: f.detail ?? null,
							// A problem that came back is open again; anything ignored stays ignored.
							...(existing.status === 'fixed' ? { status: 'open' as const, resolvedAt: null } : {})
						})
						.where(eq(healthTasks.id, existing.id));
				}
			}
		}
		// Anything on these pages that no longer fails is fixed.
		const stillOpen = await db.query.healthTasks.findMany({
			where: and(
				eq(healthTasks.kind, kind),
				inArray(healthTasks.page, pages),
				inArray(healthTasks.status, ['open', 'working'])
			)
		});
		for (const task of stillOpen) {
			if (!seen.has(task.taskKey)) {
				await db
					.update(healthTasks)
					.set({ status: 'fixed', resolvedAt: now })
					.where(eq(healthTasks.id, task.id));
			}
		}
	} catch (err) {
		// The plan is a bonus: a missing table must never stop a test run.
		console.error('[health] could not update the improvement plan', err);
	}
}

export const toFailures = (checks: Check[]): Failure[] =>
	checks.filter((c) => !c.pass).map((c) => ({ id: c.id, label: c.label, detail: c.detail }));

export { slug as taskSlug };

// One full set of instant checks, saved to the history. Used by the button and
// by the nightly automatic run.
export async function runQuickChecks(base: string): Promise<string> {
	const runId = randomUUID();
	const pages = await pagesToTest();
	const failuresByPage: Record<string, Failure[]> = {};

	for (const path of pages) {
		try {
			const audit = await auditPage(base, path);
			const failures = toFailures(audit.checks);
			failuresByPage[path] = failures;
			await db.insert(healthRuns).values({
				runId,
				kind: 'quick',
				url: path,
				performance: audit.scores.performance,
				accessibility: audit.scores.accessibility,
				seo: audit.scores.seo,
				metrics: JSON.stringify(audit.metrics),
				details: JSON.stringify(failures)
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
		site.score = Math.round((site.checks.filter((c) => c.pass).length / site.checks.length) * 100);
	} catch (err) {
		console.error('[health] photo check failed', err);
	}
	const siteFailures = toFailures(site.checks);
	failuresByPage['(whole site)'] = siteFailures;
	await db.insert(healthRuns).values({
		runId,
		kind: 'quick',
		url: '(whole site)',
		bestPractices: site.score,
		details: JSON.stringify(siteFailures)
	});

	await syncTasks('quick', [...pages, '(whole site)'], failuresByPage);
	await logReport(runId);
	return runId;
}

// A short plain-text summary, in the server log and for the "copy report" button,
// so the results can be read and acted on without opening the admin.
export async function buildReport(): Promise<string> {
	const rows = await db.select().from(healthRuns).orderBy(desc(healthRuns.createdAt)).limit(400);
	const lines: string[] = [
		`Smashin' Bakes site health report — ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
		''
	];

	for (const kind of ['quick', 'lighthouse-mobile', 'lighthouse-desktop']) {
		const ofKind = rows.filter((r) => r.kind === kind);
		const runId = ofKind[0]?.runId;
		if (!runId) continue;
		const group = ofKind.filter((r) => r.runId === runId);
		const avg = (key: 'performance' | 'accessibility' | 'bestPractices' | 'seo') => {
			const v = group.map((r) => r[key]).filter((x): x is number => x != null);
			return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : '-';
		};
		lines.push(
			`## ${kind} (run ${ofKind[0].createdAt.toISOString().slice(0, 16).replace('T', ' ')} UTC)`,
			`Average scores: speed ${avg('performance')}, accessibility ${avg('accessibility')}, SEO ${avg('seo')}, ${kind === 'quick' ? 'site basics' : 'best practice'} ${avg('bestPractices')}`
		);
		for (const r of [...group].reverse()) {
			const failures: Failure[] = r.details ? JSON.parse(r.details) : [];
			const scores = `speed ${r.performance ?? '-'}, access ${r.accessibility ?? '-'}, seo ${r.seo ?? '-'}, basics ${r.bestPractices ?? '-'}`;
			lines.push(`- ${r.url}: ${r.error ? `ERROR ${r.error}` : scores}`);
			for (const f of failures) lines.push(`    • ${f.label}${f.detail ? ` — ${f.detail}` : ''}`);
		}
		lines.push('');
	}

	try {
		const tasks = await db.query.healthTasks.findMany({
			where: ne(healthTasks.status, 'fixed'),
			orderBy: [desc(healthTasks.lastSeen)]
		});
		lines.push(`## Improvement plan (${tasks.filter((t) => t.status !== 'ignored').length} open)`);
		for (const t of tasks) {
			lines.push(
				`- [${t.status}] (${t.who}) ${t.page}: ${t.title}${t.detail ? ` — ${t.detail}` : ''}`
			);
		}
	} catch {
		/* plan table not created yet */
	}
	return lines.join('\n');
}

async function logReport(runId: string): Promise<void> {
	try {
		const report = await buildReport();
		console.log(`[health-report] run=${runId}\n${report.slice(0, 7000)}`);
	} catch (err) {
		console.error('[health] could not write the report to the log', err);
	}
}

export { logReport };
