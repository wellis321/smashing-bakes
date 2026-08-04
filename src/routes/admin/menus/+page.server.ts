import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { menuItems, menuSections, weeklyMenus } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const all = await db.query.weeklyMenus.findMany({
		orderBy: [desc(weeklyMenus.menuDate)],
		with: { sections: { with: { items: true } } }
	});
	return { menus: all };
};

export const actions: Actions = {
	togglePublished: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextValue = formData.get('nextValue') === 'true';
		if (!id) return fail(400, { message: 'Missing menu id.' });

		await db.update(weeklyMenus).set({ isPublished: nextValue }).where(eq(weeklyMenus.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing menu id.' });

		const sections = await db.query.menuSections.findMany({ where: eq(menuSections.menuId, id) });
		for (const section of sections) {
			await db.delete(menuItems).where(eq(menuItems.sectionId, section.id));
		}
		await db.delete(menuSections).where(eq(menuSections.menuId, id));
		await db.delete(weeklyMenus).where(eq(weeklyMenus.id, id));
		return { success: true };
	}
};
