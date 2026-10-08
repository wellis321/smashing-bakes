import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { helpTaskBySlug } from '$lib/help-tasks';

export const load: PageServerLoad = ({ params }) => {
	const task = helpTaskBySlug.get(params.task);
	if (!task) throw error(404, 'Help page not found');
	return { task };
};
