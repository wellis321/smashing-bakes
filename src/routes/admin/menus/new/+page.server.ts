import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { menuItems, menuSections, weeklyMenus } from '$lib/server/db/schema';

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
	default: async ({ request }) => {
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
				const [result] = await tx
					.insert(weeklyMenus)
					.values({ menuDate, title, openingHoursText, noteText, isPublished });
				const menuId = result.insertId;

				for (const [sectionIndex, section] of sections.entries()) {
					const [sectionResult] = await tx
						.insert(menuSections)
						.values({ menuId, title: section.title, sortOrder: sectionIndex });
					const sectionId = sectionResult.insertId;

					for (const [itemIndex, itemName] of section.items.entries()) {
						await tx.insert(menuItems).values({ sectionId, name: itemName, sortOrder: itemIndex });
					}
				}
			});
		} catch {
			return fail(400, { message: 'A menu for that date already exists — edit it instead, or pick a different date.' });
		}

		throw redirect(303, '/admin/menus');
	}
};
