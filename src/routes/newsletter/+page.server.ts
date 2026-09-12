import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { newsletterSubscribers } from '$lib/server/db/schema';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		// Honeypot: real visitors never see or fill this field. If it's filled, quietly
		// pretend success rather than tipping off whatever's submitting it.
		if (String(formData.get('company') ?? '').trim() !== '') {
			return { success: true, alreadySubscribed: false };
		}

		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const name = String(formData.get('name') ?? '').trim() || null;
		const source = String(formData.get('source') ?? '').trim() || 'newsletter-page';

		if (!email) {
			return fail(400, { message: 'Enter your email address.' });
		}
		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { message: 'That email address doesn’t look quite right.' });
		}

		const existing = await db.query.newsletterSubscribers.findFirst({
			where: eq(newsletterSubscribers.email, email)
		});

		if (existing) {
			return { success: true, alreadySubscribed: true };
		}

		await db.insert(newsletterSubscribers).values({ email, name, source, unsubscribeToken: randomBytes(24).toString('hex') });

		return { success: true, alreadySubscribed: false };
	}
};
