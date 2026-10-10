import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { healthRuns } from '$lib/server/db/schema';
import { runQuickChecks } from '$lib/server/health/run';
import { SITE_URL } from '$lib/site';

// Runs the instant checks by itself about once a day, so the history and the
// improvement plan stay up to date without anyone pressing a button. It lives in
// the running site (no Hostinger cron job, no secret key). If the site restarts
// it simply carries on: a run only happens when the last one is over a day old.
const DAY_MS = 24 * 60 * 60 * 1000;
const CHECK_EVERY_MS = 30 * 60 * 1000;

let started = false;
let running = false;

async function maybeRun() {
	if (running) return;
	// Only the real site, never a local copy.
	if (process.env.NODE_ENV !== 'production') return;
	running = true;
	try {
		const [last] = await db
			.select({ at: healthRuns.createdAt })
			.from(healthRuns)
			.where(eq(healthRuns.kind, 'quick'))
			.orderBy(desc(healthRuns.createdAt))
			.limit(1);
		if (!last || Date.now() - last.at.getTime() > DAY_MS) {
			console.log('[health] starting the daily automatic checks');
			await runQuickChecks(SITE_URL);
			console.log('[health] daily automatic checks finished');
		}
	} catch (err) {
		console.error('[health] automatic checks failed', err);
	} finally {
		running = false;
	}
}

// Called once, from the first request (never while the site is being built).
export function ensureHealthScheduler() {
	if (started) return;
	started = true;
	setTimeout(maybeRun, 3 * 60 * 1000).unref();
	setInterval(maybeRun, CHECK_EVERY_MS).unref();
}
