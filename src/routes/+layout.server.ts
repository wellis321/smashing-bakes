import type { LayoutServerLoad } from './$types';
import { getActiveCategories } from '$lib/server/db/queries';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		categories: await getActiveCategories(),
		staff: locals.staff,
		customer: locals.customer
	};
};
