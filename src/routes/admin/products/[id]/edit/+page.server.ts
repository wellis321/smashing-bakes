import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { productImages, productVariants, products } from '$lib/server/db/schema';
import { getActiveCategories, getMediaLibraryItems } from '$lib/server/db/queries';
import { slugify } from '$lib/utils/slugify';
import { saveProductImage } from '$lib/server/uploads';

// Beyond the one main (primary) photo — kept small since the product page
// only ever has room to show these as a row of thumbnails, not a full grid.
const MAX_EXTRA_IMAGES = 3;

async function loadProduct(id: number) {
	// MariaDB doesn't support the LATERAL JOIN Drizzle's `with:` API needs — two
	// flat queries instead (see src/lib/server/db/queries.ts for more).
	const product = await db.query.products.findFirst({ where: eq(products.id, id) });
	if (!product) return undefined;
	// sortOrder ascending — the primary photo is always sortOrder 0, so this
	// ordering is what keeps `images[0]` reliably "the main photo" everywhere
	// else on the site without those call sites needing to know about
	// isPrimary at all.
	const images = await db.query.productImages.findMany({
		where: eq(productImages.productId, id),
		orderBy: [asc(productImages.sortOrder)]
	});
	return { ...product, images };
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const [product, categories, mediaItems] = await Promise.all([
		loadProduct(id),
		getActiveCategories(),
		getMediaLibraryItems()
	]);
	if (!product) throw error(404, 'Product not found');

	return { product, categories, mediaItems };
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
		const libraryImageUrl = String(formData.get('imageUrl') ?? '').trim();

		if (!name || !categoryId || basePricePence == null || !slug) {
			return fail(400, { message: 'Please fill in the product name, category and price.' });
		}

		let imageUrl: string | null = null;
		if (imageFile instanceof File && imageFile.size > 0) {
			try {
				imageUrl = await saveProductImage(imageFile);
			} catch (err) {
				return fail(400, {
					message: err instanceof Error ? err.message : 'Could not upload image.'
				});
			}
		} else if (libraryImageUrl) {
			imageUrl = libraryImageUrl;
		}

		try {
			await db
				.update(products)
				.set({
					categoryId,
					name,
					slug,
					description,
					basePricePence,
					salePricePence,
					badge,
					isActive,
					isFeatured
				})
				.where(eq(products.id, id));
		} catch {
			return fail(400, {
				message: 'A product with that URL slug already exists — please choose another.'
			});
		}

		if (imageUrl) {
			// Specifically the primary row, not just "any" image row — with
			// additional (non-primary) photos now possible, findFirst with no
			// filter could otherwise grab and overwrite one of those instead.
			const existingPrimary = await db.query.productImages.findFirst({
				where: and(eq(productImages.productId, id), eq(productImages.isPrimary, true))
			});
			if (existingPrimary) {
				await db
					.update(productImages)
					.set({ url: imageUrl, altText: name })
					.where(eq(productImages.id, existingPrimary.id));
			} else {
				await db
					.insert(productImages)
					.values({ productId: id, url: imageUrl, altText: name, isPrimary: true, sortOrder: 0 });
			}
		}

		return { success: true };
	},

	addImage: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		const file = formData.get('image');
		const libraryUrl = String(formData.get('imageUrl') ?? '').trim();

		let imageUrl: string | null = null;
		if (file instanceof File && file.size > 0) {
			try {
				imageUrl = await saveProductImage(file);
			} catch (err) {
				return fail(400, {
					imagesMessage: err instanceof Error ? err.message : 'Could not upload image.'
				});
			}
		} else if (libraryUrl) {
			imageUrl = libraryUrl;
		}

		if (!imageUrl) {
			return fail(400, { imagesMessage: 'Choose or upload a photo first.' });
		}

		const existing = await db.query.productImages.findMany({
			where: eq(productImages.productId, id),
			orderBy: [asc(productImages.sortOrder)]
		});
		const extraCount = existing.filter((img) => !img.isPrimary).length;
		if (extraCount >= MAX_EXTRA_IMAGES) {
			return fail(400, {
				imagesMessage: `Up to ${MAX_EXTRA_IMAGES} additional photos — remove one first.`
			});
		}

		const nextSortOrder = existing.reduce((max, img) => Math.max(max, img.sortOrder), 0) + 1;
		const product = await db.query.products.findFirst({
			where: eq(products.id, id),
			columns: { name: true }
		});

		await db.insert(productImages).values({
			productId: id,
			url: imageUrl,
			altText: product?.name ?? null,
			isPrimary: false,
			sortOrder: nextSortOrder
		});

		return { imagesSuccess: true };
	},

	deleteImage: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		const imageId = Number(formData.get('imageId'));
		if (!imageId) return fail(400, { imagesMessage: 'Missing image id.' });

		// Only ever removes an additional (non-primary) photo here — the main
		// photo is replaced, not deleted, via the photo field above.
		await db
			.delete(productImages)
			.where(
				and(
					eq(productImages.id, imageId),
					eq(productImages.productId, id),
					eq(productImages.isPrimary, false)
				)
			);

		return { imagesSuccess: true };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		await db.delete(productImages).where(eq(productImages.productId, id));
		await db.delete(productVariants).where(eq(productVariants.productId, id));
		await db.delete(products).where(eq(products.id, id));
		throw redirect(303, '/admin/products');
	}
};
