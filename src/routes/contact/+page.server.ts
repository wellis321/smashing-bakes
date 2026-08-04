import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { bespokeOrderEnquiries, newsletterSubscribers } from '$lib/server/db/schema';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		// Honeypot: real visitors never see or fill this field. If it's filled, quietly
		// pretend success rather than tipping off whatever's submitting it.
		if (String(formData.get('company') ?? '').trim() !== '') {
			return { success: true };
		}

		const name = String(formData.get('name') ?? '').trim();
		const email = String(formData.get('email') ?? '').trim();
		const phone = String(formData.get('phone') ?? '').trim() || null;
		const details = String(formData.get('details') ?? '').trim();
		const wantsNewsletter = formData.get('wantsNewsletter') === 'true';

		const values = { name, email, phone: phone ?? '', details };

		if (!name || !email || !details) {
			return fail(400, { message: 'Please fill in your name, email and what you’re after.', values });
		}
		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { message: 'That email address doesn’t look quite right.', values });
		}

		await db.insert(bespokeOrderEnquiries).values({ name, email, phone, details, wantsNewsletter });

		if (wantsNewsletter) {
			const existing = await db.query.newsletterSubscribers.findFirst({
				where: eq(newsletterSubscribers.email, email)
			});
			if (!existing) {
				await db.insert(newsletterSubscribers).values({ email, source: 'bespoke-order-form' });
			}
		}

		return { success: true };
	}
};
