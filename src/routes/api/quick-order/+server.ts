import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { productVariants } from '$lib/server/db/schema';
import { getAllActiveProductsWithCategory, getVisibleCategories } from '$lib/server/db/queries';

// A light list of every available bake for the "Quick order" panel. It is only
// fetched when someone opens the panel, so it adds nothing to normal page loads.
export const GET: RequestHandler = async () => {
	const [categories, products, variants] = await Promise.all([
		getVisibleCategories(),
		getAllActiveProductsWithCategory(),
		db.query.productVariants.findMany({
			where: eq(productVariants.isActive, true),
			columns: { productId: true }
		})
	]);
	const withOptions = new Set(variants.map((v) => v.productId));
	const order = new Map(categories.map((c, i) => [c.id, i]));

	const items = [...products]
		.sort(
			(a, b) =>
				(order.get(a.categoryId) ?? 999) - (order.get(b.categoryId) ?? 999) ||
				a.sortOrder - b.sortOrder
		)
		.map((p) => {
			const onSale = p.badge === 'sale' && p.salePricePence != null;
			const image = p.images[0];
			return {
				id: p.id,
				slug: p.slug,
				name: p.name,
				category: p.category.name,
				pricePence: onSale ? p.salePricePence! : p.basePricePence,
				wasPence: onSale ? p.basePricePence : null,
				badge: p.badge,
				imageUrl: image?.url ?? null,
				zoom: image?.zoom ?? 100,
				focal: image?.focalPoint ?? 'center',
				hasOptions: withOptions.has(p.id)
			};
		});

	return json(
		{ items },
		{ headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' } }
	);
};
