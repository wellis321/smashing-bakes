import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPromotionBySlug } from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ params }) => {
	const promotion = await getPromotionBySlug(params.slug);
	if (!promotion) throw error(404, 'Promotion not found');
	return { promotion };
};
