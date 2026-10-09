import type { PageServerLoad } from './$types';
import { getVisibleCategories, getAllActiveProductsWithCategory } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	return {
		categories: await getVisibleCategories(),
		products: await getAllActiveProductsWithCategory()
	};
};
