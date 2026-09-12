import { error, json } from '@sveltejs/kit';
import { and, eq, lte } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { newsletters } from '$lib/server/db/schema';
import { dispatchNewsletter } from '$lib/server/newsletters';

// Meant to be hit periodically by an external scheduled task (a Hostinger cron
// job, or any uptime/cron service) — not by a person. Protected by a shared
// secret query param rather than staff login, since a cron job can't log in.
// +server.ts routes don't go through the /admin layout's auth guard either way.
export const GET: RequestHandler = async ({ url }) => {
	if (!env.CRON_SECRET) throw error(503, 'CRON_SECRET is not configured — this endpoint is disabled until it is.');
	if (url.searchParams.get('secret') !== env.CRON_SECRET) throw error(401, 'Invalid secret.');

	const due = await db.query.newsletters.findMany({
		where: and(eq(newsletters.status, 'scheduled'), lte(newsletters.scheduledFor, new Date()))
	});

	const results = [];
	for (const n of due) {
		try {
			const { sent, failed } = await dispatchNewsletter(n.id, url.origin);
			results.push({ id: n.id, subject: n.subject, sent, failed });
		} catch (err) {
			results.push({ id: n.id, subject: n.subject, error: err instanceof Error ? err.message : 'failed' });
		}
	}

	return json({ checked: due.length, results });
};
