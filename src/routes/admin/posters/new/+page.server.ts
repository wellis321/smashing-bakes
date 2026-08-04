import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { posters } from '$lib/server/db/schema';
import { saveUploadedImage } from '$lib/server/uploads';

const STYLES = ['announcement', 'sold-out', 'celebration', 'general'] as const;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const heading = String(formData.get('heading') ?? '').trim();
		const message = String(formData.get('message') ?? '').trim();
		const style = String(formData.get('style') ?? 'general') as (typeof STYLES)[number];
		const ctaLabel = String(formData.get('ctaLabel') ?? '').trim() || null;
		const ctaUrl = String(formData.get('ctaUrl') ?? '').trim() || null;
		const imageFile = formData.get('image');

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
		}

		await db.insert(posters).values({ heading, message, style, ctaLabel, ctaUrl, imageUrl });

		throw redirect(303, '/admin/posters');
	}
};
