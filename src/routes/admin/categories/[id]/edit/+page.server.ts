import { error, fail, redirect } from '@sveltejs/kit';
import { count, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, products } from '$lib/server/db/schema';
import { slugify } from '$lib/utils/slugify';
import { saveUploadedImage } from '$lib/server/uploads';
import { getMediaLibraryItems } from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const [category, mediaItems] = await Promise.all([
		db.query.categories.findFirst({ where: eq(categories.id, id) }),
		getMediaLibraryItems()
	]);
	if (!category) throw error(404, 'Category not found');
	return { category, mediaItems };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim() || null;
		const isActive = formData.get('isActive') === 'true';
		const slug = slugify(String(formData.get('slug') || name));

		if (!name || !slug) {
			return fail(400, { message: 'Please give the category a name.' });
		}

		// "Use the built-in illustration" wins over any file/library pick; with
		// neither, the picker's hidden field re-submits the existing url.
		let imageUrl: string | null = null;
		const file = formData.get('imageFile');
		const libraryUrl = String(formData.get('imageUrl') ?? '').trim();
		if (formData.get('clearImage') === 'true') {
			imageUrl = null;
		} else if (file instanceof File && file.size > 0) {
			try {
				imageUrl = await saveUploadedImage(file, 'media');
			} catch (err) {
				return fail(400, {
					message: err instanceof Error ? err.message : 'Could not upload image.'
				});
			}
		} else if (libraryUrl) {
			imageUrl = libraryUrl;
		}

		try {
			await db
				.update(categories)
				.set({ name, slug, description, isActive, imageUrl })
				.where(eq(categories.id, id));
		} catch {
			return fail(400, {
				message: 'A category with that URL slug already exists — please choose another.'
			});
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);

		const [{ value: productCount }] = await db
			.select({ value: count() })
			.from(products)
			.where(eq(products.categoryId, id));
		if (productCount > 0) {
			return fail(400, {
				message: `Can't delete — ${productCount} product${productCount === 1 ? '' : 's'} still use this category. Move or delete them first.`
			});
		}

		await db.delete(categories).where(eq(categories.id, id));
		throw redirect(303, '/admin/categories');
	}
};
