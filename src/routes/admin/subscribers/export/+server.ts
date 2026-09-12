import { error } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { newsletterSubscribers } from '$lib/server/db/schema';

function csvEscape(value: string): string {
	if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
	return value;
}

// +server.ts endpoints don't go through the /admin layout's `load` guard — that
// only runs for page navigations — so the staff check has to happen here too.
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.staff) throw error(401, 'Not authorized');

	const subscribers = await db.query.newsletterSubscribers.findMany({
		orderBy: [desc(newsletterSubscribers.subscribedAt)]
	});

	const header = ['Email', 'Name', 'Birthday', 'Source', 'Subscribed at', 'Welcome offer redeemed'];
	const rows = subscribers.map((s) => [
		s.email,
		s.name ?? '',
		s.birthday ?? '',
		s.source ?? '',
		s.subscribedAt.toISOString(),
		s.welcomeCodeRedeemedAt ? s.welcomeCodeRedeemedAt.toISOString() : ''
	]);
	const csv = [header, ...rows].map((row) => row.map((cell) => csvEscape(cell)).join(',')).join('\n');

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`
		}
	});
};
