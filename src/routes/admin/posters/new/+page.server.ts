import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posters } from '$lib/server/db/schema';
import { saveUploadedImage } from '$lib/server/uploads';
import { getMediaLibraryItems } from '$lib/server/db/queries';

const STYLES = ['announcement', 'sold-out', 'celebration', 'general'] as const;

export const load: PageServerLoad = async () => {
	return { mediaItems: await getMediaLibraryItems() };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const eyebrow = String(formData.get('eyebrow') ?? '').trim() || null;
		const heading = String(formData.get('heading') ?? '').trim();
		const message = String(formData.get('message') ?? '').trim();
		const perks = String(formData.get('perks') ?? '').trim() || null;
		const style = String(formData.get('style') ?? 'general') as (typeof STYLES)[number];
		const ctaLabel = String(formData.get('ctaLabel') ?? '').trim() || null;
		const ctaUrl = String(formData.get('ctaUrl') ?? '').trim() || null;
		const imageFile = formData.get('image');
		const libraryImageUrl = String(formData.get('imageUrl') ?? '').trim();

		if (!heading || !message) {
			return fail(400, { message: 'Please fill in a heading and a message.' });
		}
		if (!STYLES.includes(style)) {
			return fail(400, { message: 'Invalid style selected.' });
		}

		let imageUrl: string | null = null;
		if (imageFile instanceof File && imageFile.size > 0) {
			try {
				imageUrl = await saveUploadedImage(imageFile, 'posters');
			} catch (err) {
				return fail(400, { message: err instanceof Error ? err.message : 'Could not upload image.' });
			}
		} else if (libraryImageUrl) {
			imageUrl = libraryImageUrl;
		}

		await db.insert(posters).values({ eyebrow, heading, message, perks, style, ctaLabel, ctaUrl, imageUrl });

		throw redirect(303, '/admin/posters');
	}
};
