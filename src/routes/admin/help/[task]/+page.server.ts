import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { helpTaskBySlug, helpTasks } from '$lib/help-tasks';

export const load: PageServerLoad = ({ params }) => {
	const task = helpTaskBySlug.get(params.task);
	if (!task) throw error(404, 'Help page not found');
	const related = helpTasks.filter((t) => t.section === task.section && t.slug !== task.slug);
	return { task, related };
};
