import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { businessChoices, localBusinesses } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const business = await db.query.localBusinesses.findFirst({ where: eq(localBusinesses.id, id) });
	if (!business) throw error(404, 'Business not found');
	return { business };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const name = String(formData.get('name') ?? '').trim();
		const category = String(formData.get('category') ?? '').trim() || null;
		const description = String(formData.get('description') ?? '').trim() || null;
		const address = String(formData.get('address') ?? '').trim() || null;
		const phone = String(formData.get('phone') ?? '').trim() || null;
		const website = String(formData.get('website') ?? '').trim() || null;
		const isActive = formData.get('isActive') === 'true';

		if (!name) {
			return fail(400, { message: 'Please give the business a name.' });
		}

		await db
			.update(localBusinesses)
			.set({ name, category, description, address, phone, website, isActive })
			.where(eq(localBusinesses.id, id));

		return { success: true };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);

		const existingChoice = await db.query.businessChoices.findFirst({ where: eq(businessChoices.businessId, id) });
		if (existingChoice) {
			return fail(400, {
				message: "Can't delete — this business has been chosen before. Deactivate it instead to keep the history."
			});
		}

		await db.delete(localBusinesses).where(eq(localBusinesses.id, id));
		throw redirect(303, '/admin/businesses');
	}
};
