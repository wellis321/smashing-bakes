import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { siteSettings } from '$lib/server/db/schema';
import { saveUploadedImage } from '$lib/server/uploads';
import { getMediaLibraryItems } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	const [row, mediaItems] = await Promise.all([
		db.query.siteSettings.findFirst(),
		getMediaLibraryItems()
	]);
	return { settings: row, mediaItems };
};

// Both actions share this — inserts the settings row on first save, updates
// it on every one after, since it's a single-row table.
async function upsertSettings(values: Record<string, unknown>) {
	const existing = await db.query.siteSettings.findFirst();
	if (existing) {
		await db.update(siteSettings).set(values).where(eq(siteSettings.id, existing.id));
	} else {
		await db.insert(siteSettings).values(values as never);
	}
}

export const actions: Actions = {
	// SvelteKit doesn't allow a plain "default" action alongside named ones —
	// once there's more than one action they all have to be named.
	updateOffer: async ({ request }) => {
		const formData = await request.formData();
		const welcomeOfferCode = String(formData.get('welcomeOfferCode') ?? '').trim();
		const welcomeOfferDescription = String(formData.get('welcomeOfferDescription') ?? '').trim();

		const values = { welcomeOfferCode, welcomeOfferDescription };

		if (!welcomeOfferCode || !welcomeOfferDescription) {
			return fail(400, { message: 'Both fields are required.', values });
		}

		await upsertSettings(values);

		return { success: true };
	},

	updateHeroImages: async ({ request }) => {
		const formData = await request.formData();

		const slots = [1, 2, 3] as const;
		const updates: Record<string, string | null> = {};

		for (const slot of slots) {
			const file = formData.get(`heroImage${slot}File`);
			const libraryUrl = String(formData.get(`heroImage${slot}Url`) ?? '').trim();

			if (file instanceof File && file.size > 0) {
				try {
					updates[`heroImage${slot}Url`] = await saveUploadedImage(file, 'media');
				} catch (err) {
					return fail(400, {
						heroMessage: err instanceof Error ? err.message : 'Could not upload image.'
					});
				}
			} else if (libraryUrl) {
				updates[`heroImage${slot}Url`] = libraryUrl;
			} else {
				updates[`heroImage${slot}Url`] = null;
			}
		}

		await upsertSettings(updates);

		return { heroSuccess: true };
	},

	updateBespokeCakesPage: async ({ request }) => {
		const formData = await request.formData();
		const bespokeCakesHeading = String(formData.get('bespokeCakesHeading') ?? '').trim();
		const bespokeCakesIntro = String(formData.get('bespokeCakesIntro') ?? '').trim();

		if (!bespokeCakesHeading || !bespokeCakesIntro) {
			return fail(400, { bespokeMessage: 'Both the heading and intro text are required.' });
		}

		const updates: Record<string, string | null> = { bespokeCakesHeading, bespokeCakesIntro };

		const file = formData.get('bespokeCakesImageFile');
		const libraryUrl = String(formData.get('bespokeCakesImageUrl') ?? '').trim();
		if (file instanceof File && file.size > 0) {
			try {
				updates.bespokeCakesImageUrl = await saveUploadedImage(file, 'media');
			} catch (err) {
				return fail(400, {
					bespokeMessage: err instanceof Error ? err.message : 'Could not upload image.'
				});
			}
		} else if (libraryUrl) {
			updates.bespokeCakesImageUrl = libraryUrl;
		} else {
			updates.bespokeCakesImageUrl = null;
		}

		await upsertSettings(updates);

		return { bespokeSuccess: true };
	}
};
