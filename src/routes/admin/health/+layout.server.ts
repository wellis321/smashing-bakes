import { inArray } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { healthTasks } from '$lib/server/db/schema';

// The number shown on the "To-do list" tab.
export const load: LayoutServerLoad = async () => {
	try {
		const openTasks = await db.$count(
			healthTasks,
			inArray(healthTasks.status, ['open', 'working'])
		);
		return { openTasks };
	} catch {
		return { openTasks: 0 };
	}
};
