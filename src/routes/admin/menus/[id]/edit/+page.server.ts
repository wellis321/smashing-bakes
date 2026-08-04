import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { menuItems, menuSections, weeklyMenus } from '$lib/server/db/schema';

async function loadMenu(id: number) {
	return db.query.weeklyMenus.findFirst({
		where: eq(weeklyMenus.id, id),
		with: {
			sections: {
				orderBy: [asc(menuSections.sortOrder)],
				with: { items: { orderBy: [asc(menuItems.sortOrder)] } }
			}
		}
	});
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const menu = await loadMenu(id);
	if (!menu) throw error(404, 'Menu not found');
	return { menu };
};

function parseSections(formData: FormData) {
	const titles = formData.getAll('sectionTitle').map(String);
	const itemsTexts = formData.getAll('sectionItems').map(String);
	return titles
		.map((title, i) => ({
			title: title.trim(),
			items: (itemsTexts[i] ?? '')
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
		}))
		.filter((s) => s.title || s.items.length > 0);
}

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const menuDate = String(formData.get('menuDate') ?? '').trim();
		const title = String(formData.get('title') ?? '').trim() || null;
		const openingHoursText = String(formData.get('openingHoursText') ?? '').trim() || null;
		const noteText = String(formData.get('noteText') ?? '').trim() || null;
		const isPublished = formData.get('isPublished') === 'true';
		const sections = parseSections(formData);

		if (!menuDate) {
			return fail(400, { message: 'Please choose the weekend date this menu is for.' });
		}

		try {
			await db.transaction(async (tx) => {
				await tx
					.update(weeklyMenus)
					.set({ menuDate, title, openingHoursText, noteText, isPublished })
					.where(eq(weeklyMenus.id, id));

				const existingSections = await tx.query.menuSections.findMany({
					where: eq(menuSections.menuId, id)
				});
				for (const section of existingSections) {
					await tx.delete(menuItems).where(eq(menuItems.sectionId, section.id));
				}
				await tx.delete(menuSections).where(eq(menuSections.menuId, id));

				for (const [sectionIndex, section] of sections.entries()) {
					const [sectionResult] = await tx
						.insert(menuSections)
						.values({ menuId: id, title: section.title, sortOrder: sectionIndex });
					const sectionId = sectionResult.insertId;

					for (const [itemIndex, itemName] of section.items.entries()) {
						await tx.insert(menuItems).values({ sectionId, name: itemName, sortOrder: itemIndex });
					}
				}
			});
		} catch {
			return fail(400, { message: 'A menu for that date already exists — pick a different date.' });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		const sections = await db.query.menuSections.findMany({ where: eq(menuSections.menuId, id) });
		for (const section of sections) {
			await db.delete(menuItems).where(eq(menuItems.sectionId, section.id));
		}
		await db.delete(menuSections).where(eq(menuSections.menuId, id));
		await db.delete(weeklyMenus).where(eq(weeklyMenus.id, id));
		throw redirect(303, '/admin/menus');
	}
};
