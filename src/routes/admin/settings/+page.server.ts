import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { siteSettings } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const row = await db.query.siteSettings.findFirst();
	return { settings: row };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const welcomeOfferCode = String(formData.get('welcomeOfferCode') ?? '').trim();
		const welcomeOfferDescription = String(formData.get('welcomeOfferDescription') ?? '').trim();

		const values = { welcomeOfferCode, welcomeOfferDescription };

		if (!welcomeOfferCode || !welcomeOfferDescription) {
			return fail(400, { message: 'Both fields are required.', values });
		}

		// Single-row settings table — update it if it exists, create it if this
		// is the first time anyone's saved settings.
		const existing = await db.query.siteSettings.findFirst();
		if (existing) {
			await db
				.update(siteSettings)
				.set({ welcomeOfferCode, welcomeOfferDescription })
				.where(eq(siteSettings.id, existing.id));
		} else {
			await db.insert(siteSettings).values({ welcomeOfferCode, welcomeOfferDescription });
		}

		return { success: true };
	}
};
