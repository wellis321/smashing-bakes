import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { productImages, products, productVariants } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const allProducts = await db.query.products.findMany({
		orderBy: [asc(products.sortOrder)],
		with: { category: true, images: true }
	});
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
