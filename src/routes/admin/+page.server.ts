import { count, desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { bespokeOrderEnquiries, categories, products } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const recentProducts = await db.query.products.findMany({
		orderBy: [desc(products.updatedAt)],
		limit: 6,
		with: { category: true }
	});
	const [{ value: productCount }] = await db.select({ value: count() }).from(products);
	const [{ value: categoryCount }] = await db.select({ value: count() }).from(categories);
	const [{ value: newEnquiryCount }] = await db
		.select({ value: count() })
		.from(bespokeOrderEnquiries)
		.where(eq(bespokeOrderEnquiries.status, 'new'));

	return { productCount, categoryCount, newEnquiryCount, recentProducts };
};
