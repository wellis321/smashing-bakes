import type { LayoutServerLoad } from './$types';
import { getActiveCategories, getNavVisibility, getWelcomeOffer } from '$lib/server/db/queries';

export const load: LayoutServerLoad = async ({ locals }) => {
	const [categories, welcomeOffer, navVisibility] = await Promise.all([
		getActiveCategories(),
		getWelcomeOffer(),
		getNavVisibility()
	]);

	return {
		categories,
		welcomeOffer,
		navVisibility,
		staff: locals.staff,
		customer: locals.customer
	};
};
