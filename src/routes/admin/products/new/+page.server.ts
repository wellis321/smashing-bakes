import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { productImages, products } from '$lib/server/db/schema';
import { getActiveCategories } from '$lib/server/db/queries';
import { slugify } from '$lib/utils/slugify';
import { saveProductImage } from '$lib/server/uploads';

export const load: PageServerLoad = async () => {
	return { categories: await getActiveCategories() };
};

function parsePrice(value: FormDataEntryValue | null): number | null {
	if (!value || value === '') return null;
	const pounds = Number(value);
	if (Number.isNaN(pounds)) return null;
	return Math.round(pounds * 100);
}

export const actions: Actions = {
	default: async ({ request }) => {
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
			return fail(400, {
				message: 'Please fill in the product name, category and price.',
				values: { name, categoryId, description, basePricePence, salePricePence, badge, isActive, isFeatured, slug }
			});
		}

		let imageUrl: string | null = null;
		if (imageFile instanceof File && imageFile.size > 0) {
			try {
				imageUrl = await saveProductImage(imageFile);
			} catch (err) {
				return fail(400, {
					message: err instanceof Error ? err.message : 'Could not upload image.',
					values: { name, categoryId, description, basePricePence, salePricePence, badge, isActive, isFeatured, slug }
				});
			}
		}

		let insertedId: number;
		try {
			const [result] = await db.insert(products).values({
				categoryId,
				name,
				slug,
				description,
				basePricePence,
				salePricePence,
				badge,
				isActive,
				isFeatured
			});
			insertedId = result.insertId;
		} catch {
			return fail(400, {
				message: 'A product with that URL slug already exists — please choose another.',
				values: { name, categoryId, description, basePricePence, salePricePence, badge, isActive, isFeatured, slug }
			});
		}

		if (imageUrl) {
			await db.insert(productImages).values({
				productId: insertedId,
				url: imageUrl,
				altText: name,
				isPrimary: true
			});
		}

		throw redirect(303, '/admin/products');
	}
};
