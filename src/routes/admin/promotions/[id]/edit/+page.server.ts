import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { promotionSteps, promotions } from '$lib/server/db/schema';
import { slugify } from '$lib/utils/slugify';
import { saveUploadedImage } from '$lib/server/uploads';

async function loadPromotion(id: number) {
	// MariaDB doesn't support the LATERAL JOIN Drizzle's `with:` API needs — two
	// flat queries instead (see src/lib/server/db/queries.ts for more).
	const promotion = await db.query.promotions.findFirst({ where: eq(promotions.id, id) });
	if (!promotion) return undefined;
	const steps = await db.query.promotionSteps.findMany({
		where: eq(promotionSteps.promotionId, id),
		orderBy: [asc(promotionSteps.sortOrder)]
	});
	return { ...promotion, steps };
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const promotion = await loadPromotion(id);
	if (!promotion) throw error(404, 'Promotion not found');
	return { promotion };
};

function parseSteps(formData: FormData) {
	const labels = formData.getAll('stepLabel').map(String);
	const descriptions = formData.getAll('stepDescription').map(String);
	return labels
		.map((label, i) => ({ label: label.trim(), description: (descriptions[i] ?? '').trim() }))
		.filter((s) => s.label || s.description);
}

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const title = String(formData.get('title') ?? '').trim();
		const tagline = String(formData.get('tagline') ?? '').trim() || null;
		const introText = String(formData.get('introText') ?? '').trim() || null;
		const prizeDescription = String(formData.get('prizeDescription') ?? '').trim() || null;
		const areaText = String(formData.get('areaText') ?? '').trim() || null;
		const deadlineText = String(formData.get('deadlineText') ?? '').trim() || null;
		const ctaLabel = String(formData.get('ctaLabel') ?? '').trim() || null;
		const ctaUrl = String(formData.get('ctaUrl') ?? '').trim() || null;
		const isPublished = formData.get('isPublished') === 'true';
		const isFeaturedOnHomepage = formData.get('isFeaturedOnHomepage') === 'true';
		const mechanic = (formData.get('mechanic') as 'manual' | 'business_picker') || 'manual';
		const slug = slugify(String(formData.get('slug') || title));
		const heroImageFile = formData.get('heroImage');
		const steps = mechanic === 'manual' ? parseSteps(formData) : [];

		if (!title || !slug) {
			return fail(400, { message: 'Please give the promotion a title.' });
		}

		let heroImageUrl: string | undefined;
		if (heroImageFile instanceof File && heroImageFile.size > 0) {
			try {
				heroImageUrl = await saveUploadedImage(heroImageFile, 'promotions');
			} catch (err) {
				return fail(400, { message: err instanceof Error ? err.message : 'Could not upload image.' });
			}
		}

		try {
			await db
				.update(promotions)
				.set({
					title,
					slug,
					tagline,
					introText,
					prizeDescription,
					areaText,
					deadlineText,
					ctaLabel,
					ctaUrl,
					isPublished,
					isFeaturedOnHomepage,
					mechanic,
					...(heroImageUrl ? { heroImageUrl } : {})
				})
				.where(eq(promotions.id, id));
		} catch {
			return fail(400, { message: 'A promotion with that URL slug already exists — please choose another.' });
		}

		await db.delete(promotionSteps).where(eq(promotionSteps.promotionId, id));
		for (const [index, step] of steps.entries()) {
			await db.insert(promotionSteps).values({ promotionId: id, ...step, sortOrder: index });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		await db.delete(promotionSteps).where(eq(promotionSteps.promotionId, id));
		await db.delete(promotions).where(eq(promotions.id, id));
		throw redirect(303, '/admin/promotions');
	}
};
