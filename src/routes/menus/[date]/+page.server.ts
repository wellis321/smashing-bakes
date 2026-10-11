import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMenuByDate } from '$lib/server/db/queries';
import { attachMenuProducts } from '$lib/server/menu-photos';

export const load: PageServerLoad = async ({ params }) => {
	const menu = await getMenuByDate(params.date);
	if (!menu) throw error(404, 'Menu not found');
	const [withPhotos] = await attachMenuProducts([menu]);
	return { menu: withPhotos };
};
