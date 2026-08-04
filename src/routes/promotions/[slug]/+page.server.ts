import { error, fail } from '@sveltejs/kit';
import { and, asc, eq, gte } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { businessChoices, localBusinesses } from '$lib/server/db/schema';
import { getPromotionBySlug } from '$lib/server/db/queries';
import { todayIso, weekStartIso } from '$lib/utils/week';

export const load: PageServerLoad = async ({ params, locals }) => {
	const promotion = await getPromotionBySlug(params.slug);
	if (!promotion) throw error(404, 'Promotion not found');

	if (promotion.mechanic !== 'business_picker') {
		return { promotion, businesses: null, todaysChoice: null, weekCount: 0 };
	}

	const businesses = await db.query.localBusinesses.findMany({
		where: eq(localBusinesses.isActive, true),
		orderBy: [asc(localBusinesses.sortOrder), asc(localBusinesses.name)]
	});

	let todaysChoice: { businessId: number; businessName: string } | null = null;
	let weekCount = 0;

	if (locals.customer) {
		const [todayRow, weekRows] = await Promise.all([
			db.query.businessChoices.findFirst({
				where: and(
					eq(businessChoices.promotionId, promotion.id),
					eq(businessChoices.customerId, locals.customer.id),
					eq(businessChoices.choiceDate, todayIso())
				)
			}),
			db.query.businessChoices.findMany({
				where: and(
					eq(businessChoices.promotionId, promotion.id),
					eq(businessChoices.customerId, locals.customer.id),
					gte(businessChoices.choiceDate, weekStartIso())
				)
			})
		]);
		weekCount = weekRows.length;
		if (todayRow) {
			const business = businesses.find((b) => b.id === todayRow.businessId);
			todaysChoice = business ? { businessId: business.id, businessName: business.name } : null;
		}
	}

	return { promotion, businesses, todaysChoice, weekCount };
};

export const actions: Actions = {
	choose: async ({ request, locals }) => {
		if (!locals.customer) {
			return fail(401, { message: 'You need to log in to choose a business.' });
		}

		const formData = await request.formData();
		const promotionId = Number(formData.get('promotionId'));
		const businessId = Number(formData.get('businessId'));
		if (!promotionId || !businessId) {
			return fail(400, { message: 'Missing business selection.' });
		}

		const business = await db.query.localBusinesses.findFirst({
			where: and(eq(localBusinesses.id, businessId), eq(localBusinesses.isActive, true))
		});
		if (!business) {
			return fail(400, { message: 'That business isn’t available right now — please pick another.' });
		}

		const existing = await db.query.businessChoices.findFirst({
			where: and(
				eq(businessChoices.promotionId, promotionId),
				eq(businessChoices.customerId, locals.customer.id),
				eq(businessChoices.choiceDate, todayIso())
			)
		});
		if (existing) {
			return fail(400, { message: 'You’ve already chosen a business today — come back tomorrow!' });
		}

		try {
			await db.insert(businessChoices).values({
				promotionId,
				customerId: locals.customer.id,
				businessId,
				choiceDate: todayIso()
			});
		} catch {
			return fail(400, { message: 'You’ve already chosen a business today — come back tomorrow!' });
		}

		return { success: true, chosenBusinessId: businessId, chosenBusinessName: business.name };
	}
};
