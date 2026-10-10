import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { healthTasks } from '$lib/server/db/schema';
import { buildReport } from '$lib/server/health/run';
import { loadTasks } from '$lib/server/health/load';

export const load: PageServerLoad = async () => {
	const { tasks, tasksMissing } = await loadTasks();
	let report = '';
	try {
		report = tasksMissing ? '' : await buildReport();
	} catch {
		report = '';
	}
	return { tasks, tasksMissing, report };
};

export const actions: Actions = {
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
