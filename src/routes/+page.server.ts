import type { PageServerLoad } from './$types';
import { getActiveCategories, getActivePoster, getFeaturedProducts, getFeaturedPromotion } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	return {
		categories: await getActiveCategories(),
		featured: await getFeaturedProducts(),
		promotion: await getFeaturedPromotion(),
		poster: await getActivePoster()
	};
};
