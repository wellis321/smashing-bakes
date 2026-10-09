import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getVisibleCategories, getCategoryBySlug, getProductsForCategory } from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ params }) => {
	const category = await getCategoryBySlug(params.category);
	if (!category) throw error(404, 'Category not found');

	return {
		category,
		categories: await getVisibleCategories(),
		products: await getProductsForCategory(category.id)
	};
};
