import type { PageServerLoad } from './$types';
import {
	getVisibleCategories,
	getActivePoster,
	getFeaturedProducts,
	getFeaturedPromotion,
	getHeroImages
} from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	return {
		categories: await getVisibleCategories(),
		featured: await getFeaturedProducts(),
		promotion: await getFeaturedPromotion(),
		poster: await getActivePoster(),
		heroImages: await getHeroImages()
	};
};
