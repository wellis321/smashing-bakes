import { fail } from '@sveltejs/kit';
import { asc, count, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, products } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const allCategories = await db.query.categories.findMany({ orderBy: [asc(categories.sortOrder)] });
	const productCounts = await db.select({ categoryId: products.categoryId, value: count() }).from(products).groupBy(products.categoryId);
	const countsByCategory = new Map(productCounts.map((row) => [row.categoryId, row.value]));

	return {
		categories: allCategories.map((category) => ({
			...category,
			productCount: countsByCategory.get(category.id) ?? 0
		}))
	};
};

export const actions: Actions = {
	toggleActive: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextValue = formData.get('nextValue') === 'true';
		if (!id) return fail(400, { message: 'Missing category id.' });

		await db.update(categories).set({ isActive: nextValue }).where(eq(categories.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing category id.' });

		const [{ value: productCount }] = await db.select({ value: count() }).from(products).where(eq(products.categoryId, id));
		if (productCount > 0) {
			return fail(400, {
				message: `Can't delete — ${productCount} product${productCount === 1 ? '' : 's'} still use this category. Move or delete them first.`
			});
		}

		await db.delete(categories).where(eq(categories.id, id));
		return { success: true };
	}
};
