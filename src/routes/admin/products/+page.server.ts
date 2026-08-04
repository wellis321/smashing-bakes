import { fail } from '@sveltejs/kit';
import { asc, eq, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, productImages, products, productVariants } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	// MariaDB doesn't support the LATERAL JOIN Drizzle's `with:` API needs — flat
	// queries instead (see src/lib/server/db/queries.ts for more).
	const productRows = await db.query.products.findMany({ orderBy: [asc(products.sortOrder)] });
	const [cats, images] =
		productRows.length === 0
			? [[], []]
			: await Promise.all([
					db.query.categories.findMany({
						where: inArray(
							categories.id,
							productRows.map((p) => p.categoryId)
						)
					}),
					db.query.productImages.findMany({
						where: inArray(
							productImages.productId,
							productRows.map((p) => p.id)
						),
						orderBy: [asc(productImages.sortOrder)]
					})
				]);
	const categoryById = new Map(cats.map((c) => [c.id, c]));
	const imagesByProduct = new Map<number, typeof images>();
	for (const img of images) {
		const list = imagesByProduct.get(img.productId);
		if (list) list.push(img);
		else imagesByProduct.set(img.productId, [img]);
	}
	const allProducts = productRows.map((p) => ({
		...p,
		// categoryId is a NOT NULL FK and category deletion is blocked while products
		// reference it, so the category is always present here.
		category: categoryById.get(p.categoryId)!,
		images: imagesByProduct.get(p.id) ?? []
	}));
	return { products: allProducts };
};

export const actions: Actions = {
	toggleActive: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextValue = formData.get('nextValue') === 'true';
		if (!id) return fail(400, { message: 'Missing product id.' });

		await db.update(products).set({ isActive: nextValue }).where(eq(products.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing product id.' });

		await db.delete(productImages).where(eq(productImages.productId, id));
		await db.delete(productVariants).where(eq(productVariants.productId, id));
		await db.delete(products).where(eq(products.id, id));
		return { success: true };
	}
};
