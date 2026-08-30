import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { mediaLibraryItems } from '$lib/server/db/schema';
import { saveUploadedImage, deleteUploadedImage } from '$lib/server/uploads';

export const load: PageServerLoad = async () => {
	const items = await db.query.mediaLibraryItems.findMany({
		orderBy: [desc(mediaLibraryItems.uploadedAt)]
	});

	return { items };
};

export const actions: Actions = {
	upload: async ({ request }) => {
		const formData = await request.formData();
		const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);

		if (files.length === 0) {
			return fail(400, { message: 'Choose at least one image.' });
		}

		let uploaded = 0;
		const errors: string[] = [];

		// Each file is saved independently so one bad file (wrong type, too
		// large) doesn't throw away the rest of a multi-file selection.
		for (const file of files) {
			try {
				const url = await saveUploadedImage(file, 'media');
				await db.insert(mediaLibraryItems).values({ url, filename: file.name });
				uploaded++;
			} catch (err) {
				errors.push(`${file.name}: ${err instanceof Error ? err.message : 'upload failed'}`);
			}
		}

		if (uploaded === 0) {
			return fail(400, { message: errors.join(' ') });
		}

		return {
			success: true,
			uploaded,
			skipped: errors.length,
			message: errors.length > 0 ? errors.join(' ') : undefined
		};
	},

	updateAlt: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const altText = String(formData.get('altText') ?? '').trim() || null;
		if (!id) return fail(400, { message: 'Missing media id.' });

		await db.update(mediaLibraryItems).set({ altText }).where(eq(mediaLibraryItems.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing media id.' });

		const item = await db.query.mediaLibraryItems.findFirst({ where: eq(mediaLibraryItems.id, id) });
		if (item) {
			await deleteUploadedImage(item.url);
			await db.delete(mediaLibraryItems).where(eq(mediaLibraryItems.id, id));
		}

		return { success: true };
	}
};
