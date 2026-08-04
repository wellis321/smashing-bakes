import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posters } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const all = await db.query.posters.findMany({ orderBy: [desc(posters.updatedAt)] });
	return { posters: all };
};

export const actions: Actions = {
	setActive: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing poster id.' });

		await db.transaction(async (tx) => {
			await tx.update(posters).set({ isActive: false });
			await tx.update(posters).set({ isActive: true }).where(eq(posters.id, id));
		});
		return { success: true };
	},

	deactivate: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing poster id.' });

		await db.update(posters).set({ isActive: false }).where(eq(posters.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing poster id.' });

		await db.delete(posters).where(eq(posters.id, id));
		return { success: true };
	}
};
