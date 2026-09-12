import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { newsletters, newsletterHighlights } from '$lib/server/db/schema';
import { getMediaLibraryItems } from '$lib/server/db/queries';
import { saveUploadedImage } from '$lib/server/uploads';

export const load: PageServerLoad = async () => {
	return { mediaItems: await getMediaLibraryItems() };
};

function parseHighlights(formData: FormData) {
	const titles = formData.getAll('highlightTitle').map(String);
	const descriptions = formData.getAll('highlightDescription').map(String);
	const linkUrls = formData.getAll('highlightLinkUrl').map(String);
	const imageUrls = formData.getAll('highlightImageUrl').map(String);
	return titles
		.map((title, i) => ({
			title: title.trim(),
			description: (descriptions[i] ?? '').trim() || null,
			linkUrl: (linkUrls[i] ?? '').trim() || null,
			imageUrl: (imageUrls[i] ?? '').trim() || null
		}))
		.filter((h) => h.title);
}

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const subject = String(formData.get('subject') ?? '').trim();
		const preheader = String(formData.get('preheader') ?? '').trim() || null;
		const heroImageFile = formData.get('heroImageFile');
		const libraryHeroImageUrl = String(formData.get('heroImageUrl') ?? '').trim();
		const heading = String(formData.get('heading') ?? '').trim();
		const intro = String(formData.get('intro') ?? '').trim() || null;
		const ctaLabel = String(formData.get('ctaLabel') ?? '').trim() || null;
		const ctaUrl = String(formData.get('ctaUrl') ?? '').trim() || null;
		const signOff = String(formData.get('signOff') ?? '').trim() || null;

		if (!subject || !heading) {
			return fail(400, { message: 'Please fill in at least a subject and a heading.' });
		}

		let heroImageUrl: string | null = null;
		if (heroImageFile instanceof File && heroImageFile.size > 0) {
			try {
				heroImageUrl = await saveUploadedImage(heroImageFile, 'media');
			} catch (err) {
				return fail(400, { message: err instanceof Error ? err.message : 'Could not upload image.' });
			}
		} else if (libraryHeroImageUrl) {
			heroImageUrl = libraryHeroImageUrl;
		}

		const [{ insertId }] = await db.insert(newsletters).values({
			subject,
			preheader,
			heroImageUrl,
			heading,
			intro,
			ctaLabel,
			ctaUrl,
			signOff
		});

		const highlights = parseHighlights(formData);
		for (const [index, h] of highlights.entries()) {
			await db.insert(newsletterHighlights).values({ newsletterId: insertId, ...h, sortOrder: index });
		}

		throw redirect(303, `/admin/newsletters/${insertId}/edit`);
	}
};
