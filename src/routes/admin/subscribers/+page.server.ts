import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { newsletterSubscribers } from '$lib/server/db/schema';
import { getWelcomeOffer } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	const [subscribers, welcomeOffer] = await Promise.all([
		db.query.newsletterSubscribers.findMany({ orderBy: [desc(newsletterSubscribers.subscribedAt)] }),
		getWelcomeOffer()
	]);

	return { subscribers, welcomeOffer };
};

export const actions: Actions = {
	toggleRedeemed: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextValue = formData.get('nextValue') === 'true';
		if (!id) return fail(400, { message: 'Missing subscriber id.' });

		await db
			.update(newsletterSubscribers)
			.set({ welcomeCodeRedeemedAt: nextValue ? new Date() : null })
			.where(eq(newsletterSubscribers.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing subscriber id.' });

		await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));

		return { success: true };
	}
};
