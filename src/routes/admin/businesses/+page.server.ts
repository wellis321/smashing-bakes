import { fail } from '@sveltejs/kit';
import { and, asc, count, desc, eq, gte, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { businessChoices, customers, localBusinesses, promotions } from '$lib/server/db/schema';
import { weekStartIso } from '$lib/utils/week';

async function getBusinessPickerPromotion() {
	return db.query.promotions.findFirst({
		where: and(eq(promotions.mechanic, 'business_picker'), eq(promotions.isPublished, true)),
		orderBy: [desc(promotions.createdAt)]
	});
}

export const load: PageServerLoad = async () => {
	const businessRows = await db.query.localBusinesses.findMany({
		orderBy: [asc(localBusinesses.sortOrder), asc(localBusinesses.name)]
	});

	const promotion = await getBusinessPickerPromotion();

	let entries: { id: number; customerName: string; customerEmail: string; businessName: string; choiceDate: string }[] = [];
	let entryCountByBusiness = new Map<number, number>();

	if (promotion) {
		const weekChoices = await db.query.businessChoices.findMany({
			where: and(eq(businessChoices.promotionId, promotion.id), gte(businessChoices.choiceDate, weekStartIso())),
			orderBy: [desc(businessChoices.createdAt)]
		});

		if (weekChoices.length > 0) {
			const [choiceCustomers, choiceBusinesses] = await Promise.all([
				db.query.customers.findMany({
					where: inArray(
						customers.id,
						weekChoices.map((c) => c.customerId)
					)
				}),
				db.query.localBusinesses.findMany({
					where: inArray(
						localBusinesses.id,
						weekChoices.map((c) => c.businessId)
					)
				})
			]);
			const customerById = new Map(choiceCustomers.map((c) => [c.id, c]));
			const businessById = new Map(choiceBusinesses.map((b) => [b.id, b]));

			entries = weekChoices.map((c) => ({
				id: c.id,
				customerName: customerById.get(c.customerId)?.name ?? 'Unknown',
				customerEmail: customerById.get(c.customerId)?.email ?? '',
				businessName: businessById.get(c.businessId)?.name ?? 'Unknown',
				choiceDate: c.choiceDate
			}));

			entryCountByBusiness = new Map();
			for (const c of weekChoices) {
				entryCountByBusiness.set(c.businessId, (entryCountByBusiness.get(c.businessId) ?? 0) + 1);
			}
		}
	}

	return {
		businesses: businessRows,
		promotion,
		entries,
		entryCounts: Object.fromEntries(entryCountByBusiness),
		weekStart: weekStartIso()
	};
};

export const actions: Actions = {
	bulkAdd: async ({ request }) => {
		const formData = await request.formData();
		const raw = String(formData.get('names') ?? '');
		const lines = raw
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean);

		if (lines.length === 0) {
			return fail(400, { message: 'Paste at least one business name.' });
		}

		const existing = await db.query.localBusinesses.findMany();
		const existingNames = new Set(existing.map((b) => b.name.toLowerCase()));
		const maxSortOrder = existing.reduce((max, b) => Math.max(max, b.sortOrder), -1);

		let sortOrder = maxSortOrder + 1;
		let added = 0;
		let skipped = 0;
		for (const line of lines) {
			const [namePart, categoryPart] = line.split('|').map((s) => s.trim());
			if (!namePart) continue;
			if (existingNames.has(namePart.toLowerCase())) {
				skipped++;
				continue;
			}
			await db.insert(localBusinesses).values({
				name: namePart,
				category: categoryPart || null,
				sortOrder: sortOrder++
			});
			existingNames.add(namePart.toLowerCase());
			added++;
		}

		return { success: true, added, skipped };
	},

	toggleActive: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextValue = formData.get('nextValue') === 'true';
		if (!id) return fail(400, { message: 'Missing business id.' });

		await db.update(localBusinesses).set({ isActive: nextValue }).where(eq(localBusinesses.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing business id.' });

		const [{ value: choiceCount }] = await db
			.select({ value: count() })
			.from(businessChoices)
			.where(eq(businessChoices.businessId, id));
		if (choiceCount > 0) {
			return fail(400, {
				message: `Can't delete — this business has been chosen ${choiceCount} time${choiceCount === 1 ? '' : 's'}. Deactivate it instead to keep the history.`
			});
		}

		await db.delete(localBusinesses).where(eq(localBusinesses.id, id));
		return { success: true };
	},

	pickWinner: async () => {
		const promotion = await getBusinessPickerPromotion();
		if (!promotion) {
			return fail(400, { winnerMessage: 'No local-business promotion is currently published.' });
		}

		const weekChoices = await db.query.businessChoices.findMany({
			where: and(eq(businessChoices.promotionId, promotion.id), gte(businessChoices.choiceDate, weekStartIso()))
		});
		if (weekChoices.length === 0) {
			return fail(400, { winnerMessage: 'No entries yet this week — nobody to pick from.' });
		}

		const winnerChoice = weekChoices[Math.floor(Math.random() * weekChoices.length)];
		const [winnerCustomer, winnerBusiness] = await Promise.all([
			db.query.customers.findFirst({ where: eq(customers.id, winnerChoice.customerId) }),
			db.query.localBusinesses.findFirst({ where: eq(localBusinesses.id, winnerChoice.businessId) })
		]);
		if (!winnerCustomer || !winnerBusiness) {
			return fail(400, { winnerMessage: 'Could not find that entry — please try again.' });
		}

		return {
			winner: {
				customerName: winnerCustomer.name,
				customerEmail: winnerCustomer.email,
				businessName: winnerBusiness.name
			}
		};
	}
};
