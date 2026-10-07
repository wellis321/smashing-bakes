import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { navVisibility } = await parent();
	if (!navVisibility.about) throw error(404, 'Not found');
};
