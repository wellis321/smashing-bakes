import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { healthRuns, healthTasks } from '$lib/server/db/schema';

export const KINDS = ['quick', 'lighthouse-mobile', 'lighthouse-desktop'] as const;

type Row = typeof healthRuns.$inferSelect;
type ScoreKey = 'performance' | 'accessibility' | 'bestPractices' | 'seo';

const average = (rows: Row[], key: ScoreKey) => {
	const values = rows.map((r) => r[key]).filter((v): v is number => v != null);
	return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
};

export type HistoryPoint = {
	runId: string;
	at: string;
	performance: number | null;
	accessibility: number | null;
	bestPractices: number | null;
	seo: number | null;
};

export type LatestRun = {
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
};

// Scores over time and the most recent run, for each kind of test.
export async function loadHistory() {
	let rows: Row[] = [];
	let tableMissing = false;
	try {
		rows = await db.select().from(healthRuns).orderBy(desc(healthRuns.createdAt)).limit(3000);
	} catch {
		tableMissing = true;
	}

	const history: Record<string, HistoryPoint[]> = {};
	const latest: Record<string, LatestRun | null> = {};

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
	return { history, latest, tableMissing };
}

export type TaskView = {
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
};

export async function loadTasks(): Promise<{ tasks: TaskView[]; tasksMissing: boolean }> {
	try {
		const all = await db.query.healthTasks.findMany({ orderBy: [desc(healthTasks.lastSeen)] });
		return {
			tasksMissing: false,
			tasks: all.map((t) => ({
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
			}))
		};
	} catch {
		return { tasks: [], tasksMissing: true };
	}
}
