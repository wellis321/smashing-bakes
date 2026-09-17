import { error } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { staffActivityLog } from '$lib/server/db/schema';

const PAGE_SIZE = 200;

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.staff?.role !== 'admin') throw error(403, 'Only admins can view the activity log.');

	const entries = await db.query.staffActivityLog.findMany({
		orderBy: [desc(staffActivityLog.createdAt)],
		limit: PAGE_SIZE
	});

	return { entries };
};
