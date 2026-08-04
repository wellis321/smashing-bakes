import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { productImages, productVariants, products } from '$lib/server/db/schema';
import { getActiveCategories } from '$lib/server/db/queries';
import { slugify } from '$lib/utils/slugify';
import { saveProductImage } from '$lib/server/uploads';

async function loadProduct(id: number) {
	// MariaDB doesn't support the LATERAL JOIN Drizzle's `with:` API needs — two
	// flat queries instead (see src/lib/server/db/queries.ts for more).
	const product = await db.query.products.findFirst({ where: eq(products.id, id) });
	if (!product) return undefined;
	const images = await db.query.productImages.findMany({ where: eq(productImages.productId, id) });
	return { ...product, images };
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const product = await loadProduct(id);
	if (!product) throw error(404, 'Product not found');

	return { product, categories: await getActiveCategories() };
};

function parsePrice(value: FormDataEntryValue | null): number | null {
	if (!value || value === '') return null;
	const pounds = Number(value);
	if (Number.isNaN(pounds)) return null;
	return Math.round(pounds * 100);
}

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const name = String(formData.get('name') ?? '').trim();
		const categoryId = Number(formData.get('categoryId'));
		const description = String(formData.get('description') ?? '').trim();
		const basePricePence = parsePrice(formData.get('basePrice'));
		const salePricePence = parsePrice(formData.get('salePrice'));
		const badge = (formData.get('badge') as 'none' | 'sale' | 'new') || 'none';
		const isActive = formData.get('isActive') === 'true';
		const isFeatured = formData.get('isFeatured') === 'true';
		const slug = slugify(String(formData.get('slug') || name));
		const imageFile = formData.get('image');

		if (!name || !categoryId || basePricePence == null || !slug) {
			return fail(400, { message: 'Please fill in the product name, category and price.' });
		}

		let imageUrl: string | null = null;
		if (imageFile instanceof File && imageFile.size > 0) {
			try {
				imageUrl = await saveProductImage(imageFile);
			} catch (err) {
				return fail(400, { message: err instanceof Error ? err.message : 'Could not upload image.' });
			}
		}

		try {
			await db
				.update(products)
				.set({ categoryId, name, slug, description, basePricePence, salePricePence, badge, isActive, isFeatured })
				.where(eq(products.id, id));
		} catch {
			return fail(400, { message: 'A product with that URL slug already exists — please choose another.' });
		}

		if (imageUrl) {
			const existing = await db.query.productImages.findFirst({
				where: eq(productImages.productId, id)
			});
			if (existing) {
				await db.update(productImages).set({ url: imageUrl, altText: name }).where(eq(productImages.id, existing.id));
			} else {
				await db.insert(productImages).values({ productId: id, url: imageUrl, altText: name, isPrimary: true });
			}
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		await db.delete(productImages).where(eq(productImages.productId, id));
		await db.delete(productVariants).where(eq(productVariants.productId, id));
		await db.delete(products).where(eq(products.id, id));
		throw redirect(303, '/admin/products');
	}
};
