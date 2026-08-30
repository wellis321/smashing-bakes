import { error } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';

function csvEscape(value: string): string {
	if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
	return value;
}

// +server.ts endpoints don't go through the /admin layout's `load` guard — that
// only runs for page navigations — so the staff check has to happen here too.
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.staff) throw error(401, 'Not authorized');

	const customerRows = await db.query.customers.findMany({
		orderBy: [desc(customers.createdAt)],
		columns: { name: true, email: true, marketingOptIn: true, createdAt: true }
	});

	const header = ['Name', 'Email', 'Marketing opt-in', 'Joined'];
	const rows = customerRows.map((c) => [c.name, c.email, c.marketingOptIn ? 'yes' : 'no', c.createdAt.toISOString()]);
	const csv = [header, ...rows].map((row) => row.map((cell) => csvEscape(cell)).join(',')).join('\n');

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`
		}
	});
};
