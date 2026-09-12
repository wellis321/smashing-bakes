import { error, fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { newsletters, newsletterHighlights } from '$lib/server/db/schema';
import { getMediaLibraryItems, getNewsletterAudience } from '$lib/server/db/queries';
import { isEmailConfigured, sendTestEmail } from '$lib/server/email/resend';
import { saveUploadedImage } from '$lib/server/uploads';
import { renderNewsletterHtml } from '$lib/email/newsletter-template';
import { dispatchNewsletter, NewsletterSendError } from '$lib/server/newsletters';

async function loadNewsletter(id: number) {
	const newsletter = await db.query.newsletters.findFirst({ where: eq(newsletters.id, id) });
	if (!newsletter) return null;
	const highlights = await db.query.newsletterHighlights.findMany({
		where: eq(newsletterHighlights.newsletterId, id),
		orderBy: [asc(newsletterHighlights.sortOrder)]
	});
	return { newsletter, highlights };
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = Number(params.id);
	const [result, mediaItems, audience] = await Promise.all([loadNewsletter(id), getMediaLibraryItems(), getNewsletterAudience()]);
	if (!result) throw error(404, 'Newsletter not found');

	return {
		newsletter: result.newsletter,
		highlights: result.highlights,
		mediaItems,
		audienceCount: audience.length,
		emailConfigured: isEmailConfigured(),
		staffEmail: locals.staff?.email ?? ''
	};
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

async function requireEditableDraft(id: number) {
	const newsletter = await db.query.newsletters.findFirst({ where: eq(newsletters.id, id) });
	if (!newsletter) return { error: fail(404, { message: 'Newsletter not found.' }) } as const;
	if (newsletter.status === 'sent') {
		return { error: fail(400, { message: "This newsletter has already been sent and can't be changed." }) } as const;
	}
	return { newsletter } as const;
}

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const guard = await requireEditableDraft(id);
		if ('error' in guard) return guard.error;

		const formData = await request.formData();
		const subject = String(formData.get('subject') ?? '').trim();
		const preheader = String(formData.get('preheader') ?? '').trim() || null;
		const heroImageFile = formData.get('heroImageFile');
		const heroImageUrlField = String(formData.get('heroImageUrl') ?? '').trim() || null;
		const heading = String(formData.get('heading') ?? '').trim();
		const intro = String(formData.get('intro') ?? '').trim() || null;
		const ctaLabel = String(formData.get('ctaLabel') ?? '').trim() || null;
		const ctaUrl = String(formData.get('ctaUrl') ?? '').trim() || null;
		const signOff = String(formData.get('signOff') ?? '').trim() || null;

		if (!subject || !heading) {
			return fail(400, { message: 'Please fill in at least a subject and a heading.' });
		}

		let heroImageUrl = heroImageUrlField;
		if (heroImageFile instanceof File && heroImageFile.size > 0) {
			try {
				heroImageUrl = await saveUploadedImage(heroImageFile, 'media');
			} catch (err) {
				return fail(400, { message: err instanceof Error ? err.message : 'Could not upload image.' });
			}
		}

		await db
			.update(newsletters)
			.set({ subject, preheader, heroImageUrl, heading, intro, ctaLabel, ctaUrl, signOff })
			.where(eq(newsletters.id, id));

		await db.delete(newsletterHighlights).where(eq(newsletterHighlights.newsletterId, id));
		const highlights = parseHighlights(formData);
		for (const [index, h] of highlights.entries()) {
			await db.insert(newsletterHighlights).values({ newsletterId: id, ...h, sortOrder: index });
		}

		return { success: true };
	},

	schedule: async ({ request, params }) => {
		const id = Number(params.id);
		const guard = await requireEditableDraft(id);
		if ('error' in guard) return guard.error;

		const formData = await request.formData();
		const scheduledFor = String(formData.get('scheduledFor') ?? '');
		if (!scheduledFor) return fail(400, { message: 'Pick a date and time to schedule for.' });

		await db.update(newsletters).set({ status: 'scheduled', scheduledFor: new Date(scheduledFor) }).where(eq(newsletters.id, id));
		return { success: true, scheduled: true };
	},

	unschedule: async ({ params }) => {
		const id = Number(params.id);
		const guard = await requireEditableDraft(id);
		if ('error' in guard) return guard.error;

		await db.update(newsletters).set({ status: 'draft', scheduledFor: null }).where(eq(newsletters.id, id));
		return { success: true };
	},

	sendTest: async ({ request, params, url }) => {
		const id = Number(params.id);
		if (!isEmailConfigured()) {
			return fail(400, { message: "Email sending isn't configured yet — add RESEND_API_KEY and RESEND_FROM_EMAIL to the server environment." });
		}
		const formData = await request.formData();
		const testEmail = String(formData.get('testEmail') ?? '').trim();
		if (!testEmail) return fail(400, { message: 'Enter an email address to send the test to.' });

		const result = await loadNewsletter(id);
		if (!result) return fail(404, { message: 'Newsletter not found.' });

		const html = renderNewsletterHtml(result.newsletter, result.highlights, {
			siteUrl: url.origin,
			unsubscribeUrl: `${url.origin}/unsubscribe?token=test-preview`
		});

		try {
			await sendTestEmail(testEmail, `[Test] ${result.newsletter.subject}`, html);
		} catch (err) {
			return fail(400, { message: err instanceof Error ? err.message : 'Could not send the test email.' });
		}

		return { success: true, testSentTo: testEmail };
	},

	sendNow: async ({ params, url }) => {
		const id = Number(params.id);
		const guard = await requireEditableDraft(id);
		if ('error' in guard) return guard.error;

		try {
			const { sent, failed } = await dispatchNewsletter(id, url.origin);
			return { success: true, sent, failed };
		} catch (err) {
			if (err instanceof NewsletterSendError) return fail(400, { message: err.message });
			return fail(400, { message: 'Could not send the newsletter.' });
		}
	}
};
