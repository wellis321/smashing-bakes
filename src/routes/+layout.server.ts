import type { LayoutServerLoad } from './$types';
import { getActiveCategories, getWelcomeOffer } from '$lib/server/db/queries';

export const load: LayoutServerLoad = async ({ locals }) => {
	const [categories, welcomeOffer] = await Promise.all([getActiveCategories(), getWelcomeOffer()]);

	return {
		categories,
		welcomeOffer,
		staff: locals.staff,
		customer: locals.customer
	};
};
