import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { promotionSteps, promotions } from '$lib/server/db/schema';
import { slugify } from '$lib/utils/slugify';
import { saveUploadedImage } from '$lib/server/uploads';

function parseSteps(formData: FormData) {
	const labels = formData.getAll('stepLabel').map(String);
	const descriptions = formData.getAll('stepDescription').map(String);
	return labels
		.map((label, i) => ({ label: label.trim(), description: (descriptions[i] ?? '').trim() }))
		.filter((s) => s.label || s.description);
}

export const actions: Actions = {
	default: async ({ request }) => {
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

		let heroImageUrl: string | null = null;
		if (heroImageFile instanceof File && heroImageFile.size > 0) {
			try {
				heroImageUrl = await saveUploadedImage(heroImageFile, 'promotions');
			} catch (err) {
				return fail(400, { message: err instanceof Error ? err.message : 'Could not upload image.' });
			}
		}

		let insertedId: number;
		try {
			const [result] = await db.insert(promotions).values({
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
				heroImageUrl
			});
			insertedId = result.insertId;
		} catch {
			return fail(400, { message: 'A promotion with that URL slug already exists — please choose another.' });
		}

		for (const [index, step] of steps.entries()) {
			await db.insert(promotionSteps).values({ promotionId: insertedId, ...step, sortOrder: index });
		}

		throw redirect(303, '/admin/promotions');
	}
};
