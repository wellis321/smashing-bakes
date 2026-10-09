import type { LayoutServerLoad } from './$types';
import {
	getVisibleCategories,
	getNavVisibility,
	getOpeningHours,
	getWelcomeOffer
} from '$lib/server/db/queries';

export const load: LayoutServerLoad = async ({ locals }) => {
	const [categories, welcomeOffer, navVisibility, openingHours] = await Promise.all([
		getVisibleCategories(),
		getWelcomeOffer(),
		getNavVisibility(),
		getOpeningHours()
	]);

	return {
		categories,
		welcomeOffer,
		navVisibility,
		openingHours,
		staff: locals.staff,
		customer: locals.customer
	};
};
