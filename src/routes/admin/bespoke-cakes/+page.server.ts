import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	siteSettings,
	bespokeCakeGalleryItems,
	bespokeCakeTestimonials
} from '$lib/server/db/schema';
import { saveUploadedImage } from '$lib/server/uploads';
import { getMediaLibraryItems } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	const [settings, mediaItems, galleryItems, testimonials] = await Promise.all([
		db.query.siteSettings.findFirst(),
		getMediaLibraryItems(),
		db.query.bespokeCakeGalleryItems.findMany({
			orderBy: [desc(bespokeCakeGalleryItems.createdAt)]
		}),
		db.query.bespokeCakeTestimonials.findMany({
			orderBy: [desc(bespokeCakeTestimonials.createdAt)]
		})
	]);

	return { settings, mediaItems, galleryItems, testimonials };
};

// Same single-row upsert pattern as /admin/settings — this page just owns a
// different slice of the same site_settings row (the page content fields).
async function upsertSettings(values: Record<string, unknown>) {
	const existing = await db.query.siteSettings.findFirst();
	if (existing) {
		await db.update(siteSettings).set(values).where(eq(siteSettings.id, existing.id));
	} else {
		await db.insert(siteSettings).values(values as never);
	}
}

export const actions: Actions = {
	updatePageContent: async ({ request }) => {
		const formData = await request.formData();
		const bespokeCakesHeading = String(formData.get('bespokeCakesHeading') ?? '').trim();
		const bespokeCakesIntro = String(formData.get('bespokeCakesIntro') ?? '').trim();

		if (!bespokeCakesHeading || !bespokeCakesIntro) {
			return fail(400, { contentMessage: 'Both the heading and intro text are required.' });
		}

		const updates: Record<string, string | null> = { bespokeCakesHeading, bespokeCakesIntro };

		const file = formData.get('bespokeCakesImageFile');
		const libraryUrl = String(formData.get('bespokeCakesImageUrl') ?? '').trim();
		if (file instanceof File && file.size > 0) {
			try {
				updates.bespokeCakesImageUrl = await saveUploadedImage(file, 'media');
			} catch (err) {
				return fail(400, {
					contentMessage: err instanceof Error ? err.message : 'Could not upload image.'
				});
			}
		} else if (libraryUrl) {
			updates.bespokeCakesImageUrl = libraryUrl;
		} else {
			updates.bespokeCakesImageUrl = null;
		}

		await upsertSettings(updates);

		return { contentSuccess: true };
	},

	addGalleryImage: async ({ request }) => {
		const formData = await request.formData();
		const caption = String(formData.get('caption') ?? '').trim() || null;
		const file = formData.get('imageFile');
		const libraryUrl = String(formData.get('imageUrl') ?? '').trim();

		let imageUrl: string | null = null;
		if (file instanceof File && file.size > 0) {
			try {
				imageUrl = await saveUploadedImage(file, 'media');
			} catch (err) {
				return fail(400, {
					galleryMessage: err instanceof Error ? err.message : 'Could not upload image.'
				});
			}
		} else if (libraryUrl) {
			imageUrl = libraryUrl;
		}

		if (!imageUrl) {
			return fail(400, { galleryMessage: 'Choose or upload a photo first.' });
		}

		await db.insert(bespokeCakeGalleryItems).values({ imageUrl, caption });
		return { gallerySuccess: true };
	},

	deleteGalleryImage: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { galleryMessage: 'Missing gallery item id.' });

		await db.delete(bespokeCakeGalleryItems).where(eq(bespokeCakeGalleryItems.id, id));
		return { gallerySuccess: true };
	},

	addTestimonial: async ({ request }) => {
		const formData = await request.formData();
		const quote = String(formData.get('quote') ?? '').trim();
		const authorName = String(formData.get('authorName') ?? '').trim() || null;

		if (!quote) {
			return fail(400, { testimonialMessage: 'Enter the quote text.' });
		}

		await db.insert(bespokeCakeTestimonials).values({ quote, authorName });
		return { testimonialSuccess: true };
	},

	updateTestimonial: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const quote = String(formData.get('quote') ?? '').trim();
		const authorName = String(formData.get('authorName') ?? '').trim() || null;

		if (!id) return fail(400, { testimonialMessage: 'Missing testimonial id.' });
		if (!quote) return fail(400, { testimonialMessage: 'Enter the quote text.' });

		await db
			.update(bespokeCakeTestimonials)
			.set({ quote, authorName })
			.where(eq(bespokeCakeTestimonials.id, id));
		return { testimonialSuccess: true };
	},

	deleteTestimonial: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { testimonialMessage: 'Missing testimonial id.' });

		await db.delete(bespokeCakeTestimonials).where(eq(bespokeCakeTestimonials.id, id));
		return { testimonialSuccess: true };
	}
};
