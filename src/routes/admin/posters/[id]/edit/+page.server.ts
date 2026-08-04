import { error, fail, redirect } from '@sveltejs/kit';
import { eq, ne } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posters } from '$lib/server/db/schema';
import { saveUploadedImage } from '$lib/server/uploads';

const STYLES = ['announcement', 'sold-out', 'celebration', 'general'] as const;

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const poster = await db.query.posters.findFirst({ where: eq(posters.id, id) });
	if (!poster) throw error(404, 'Poster not found');
	return { poster };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const heading = String(formData.get('heading') ?? '').trim();
		const message = String(formData.get('message') ?? '').trim();
		const style = String(formData.get('style') ?? 'general') as (typeof STYLES)[number];
		const ctaLabel = String(formData.get('ctaLabel') ?? '').trim() || null;
		const ctaUrl = String(formData.get('ctaUrl') ?? '').trim() || null;
		const isActive = formData.get('isActive') === 'true';
		const imageFile = formData.get('image');
		const imageZoom = Math.min(200, Math.max(100, Number(formData.get('imageZoom')) || 100));

		if (!heading || !message) {
			return fail(400, { message: 'Please fill in a heading and a message.' });
		}
		if (!STYLES.includes(style)) {
			return fail(400, { message: 'Invalid style selected.' });
		}

		let imageUrl: string | undefined;
		if (imageFile instanceof File && imageFile.size > 0) {
			try {
				imageUrl = await saveUploadedImage(imageFile, 'posters');
			} catch (err) {
				return fail(400, { message: err instanceof Error ? err.message : 'Could not upload image.' });
			}
		}

		await db.transaction(async (tx) => {
			if (isActive) {
				await tx.update(posters).set({ isActive: false }).where(ne(posters.id, id));
			}
			await tx
				.update(posters)
				.set({ heading, message, style, ctaLabel, ctaUrl, isActive, imageZoom, ...(imageUrl ? { imageUrl } : {}) })
				.where(eq(posters.id, id));
		});

		return { success: true };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		await db.delete(posters).where(eq(posters.id, id));
		throw redirect(303, '/admin/posters');
	}
};
