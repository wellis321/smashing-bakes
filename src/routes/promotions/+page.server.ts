import type { PageServerLoad } from './$types';
import { getPublishedPromotions } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	return { promotions: await getPublishedPromotions() };
};
