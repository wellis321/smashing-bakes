import type { PageServerLoad } from './$types';
import { getActiveCategories, getAllActiveProductsWithCategory } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	return {
		categories: await getActiveCategories(),
		products: await getAllActiveProductsWithCategory()
	};
};
