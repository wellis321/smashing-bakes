import { count, desc, eq, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { bespokeOrderEnquiries, categories, products } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	// MariaDB doesn't support the LATERAL JOIN Drizzle's `with:` API needs — two
	// flat queries instead (see src/lib/server/db/queries.ts for more).
	const recentProductRows = await db.query.products.findMany({
		orderBy: [desc(products.updatedAt)],
		limit: 6
	});
	const recentCategories =
		recentProductRows.length === 0
			? []
			: await db.query.categories.findMany({
					where: inArray(
						categories.id,
						recentProductRows.map((p) => p.categoryId)
					)
				});
	const categoryById = new Map(recentCategories.map((c) => [c.id, c]));
	// categoryId is a NOT NULL FK and category deletion is blocked while products
	// reference it, so the category is always present here.
	const recentProducts = recentProductRows.map((p) => ({ ...p, category: categoryById.get(p.categoryId)! }));

	const [{ value: productCount }] = await db.select({ value: count() }).from(products);
	const [{ value: categoryCount }] = await db.select({ value: count() }).from(categories);
	const [{ value: newEnquiryCount }] = await db
		.select({ value: count() })
		.from(bespokeOrderEnquiries)
		.where(eq(bespokeOrderEnquiries.status, 'new'));

	return { productCount, categoryCount, newEnquiryCount, recentProducts };
};
