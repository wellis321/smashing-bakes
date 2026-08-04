import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { promotionSteps, promotions } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const all = await db.query.promotions.findMany({ orderBy: [desc(promotions.createdAt)] });
	return { promotions: all };
};

export const actions: Actions = {
	togglePublished: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextValue = formData.get('nextValue') === 'true';
		if (!id) return fail(400, { message: 'Missing promotion id.' });

		await db.update(promotions).set({ isPublished: nextValue }).where(eq(promotions.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing promotion id.' });

		await db.delete(promotionSteps).where(eq(promotionSteps.promotionId, id));
		await db.delete(promotions).where(eq(promotions.id, id));
		return { success: true };
	}
};
