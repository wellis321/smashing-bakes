import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { productVariants } from '$lib/server/db/schema';
import { getAllActiveProductsWithCategory, getVisibleCategories } from '$lib/server/db/queries';

// Every bake in one simple list. Bakes that have options (sizes, flavours) can't be
// added with one tap, so the page needs to know which ones those are.
export const load: PageServerLoad = async () => {
	const [categories, products, variants] = await Promise.all([
		getVisibleCategories(),
		getAllActiveProductsWithCategory(),
		db.query.productVariants.findMany({
			where: eq(productVariants.isActive, true),
			columns: { productId: true }
		})
	]);

	// Shop order: by category, then by each bake's place within it.
	const categoryOrder = new Map(categories.map((c, i) => [c.id, i]));
	const ordered = [...products].sort(
		(a, b) =>
			(categoryOrder.get(a.categoryId) ?? 999) - (categoryOrder.get(b.categoryId) ?? 999) ||
			a.sortOrder - b.sortOrder
	);

	return {
		categories,
		products: ordered,
		withOptions: [...new Set(variants.map((v) => v.productId))]
	};
};
