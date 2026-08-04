import { fail } from '@sveltejs/kit';
import { count, desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { bespokeOrderEnquiries, newsletterSubscribers } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const enquiries = await db.query.bespokeOrderEnquiries.findMany({
		orderBy: [desc(bespokeOrderEnquiries.createdAt)]
	});
	const [{ value: subscriberCount }] = await db.select({ value: count() }).from(newsletterSubscribers);

	return { enquiries, subscriberCount };
};

export const actions: Actions = {
	setStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = String(formData.get('status') ?? '') as 'new' | 'contacted' | 'archived';
		if (!id || !['new', 'contacted', 'archived'].includes(status)) {
			return fail(400, { message: 'Invalid request.' });
		}

		await db.update(bespokeOrderEnquiries).set({ status }).where(eq(bespokeOrderEnquiries.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing enquiry id.' });

		await db.delete(bespokeOrderEnquiries).where(eq(bespokeOrderEnquiries.id, id));
		return { success: true };
	}
};
