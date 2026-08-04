import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllActiveProductsWithCategory, getProductBySlug, getProductsForCategory } from '$lib/server/db/queries';

const RELATED_COUNT = 3;

export const load: PageServerLoad = async ({ params }) => {
	const product = await getProductBySlug(params.slug);
	if (!product) throw error(404, 'Product not found');

	const categoryProducts = await getProductsForCategory(product.categoryId);
	let related = categoryProducts.filter((p) => p.id !== product.id).slice(0, RELATED_COUNT);

	// Pad out with products from other categories so the "you might also like" row
	// always fills out to a full 3 (rather than 1-2 undersized cards with a gap).
	if (related.length < RELATED_COUNT) {
		const excludeIds = new Set([product.id, ...related.map((p) => p.id)]);
		const others = await getAllActiveProductsWithCategory();
		const padding = others.filter((p) => !excludeIds.has(p.id)).slice(0, RELATED_COUNT - related.length);
		related = [...related, ...padding];
	}

	return { product, related };
};
