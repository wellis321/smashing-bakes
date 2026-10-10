import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { bespokeOrderEnquiries, newsletterSubscribers } from '$lib/server/db/schema';
import { rateLimit } from '$lib/server/rate-limit';
import { notifyOwnerOfEnquiry } from '$lib/server/email/owner-notifications';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only gates the /contact page itself — this action is also the target for
// the enquiry form embedded on /bespoke-cakes, which is gated independently
// by that route's own load, so disabling one doesn't silently break the
// other's form.
export const load: PageServerLoad = async ({ parent }) => {
	const { navVisibility } = await parent();
	if (!navVisibility.contact) throw error(404, 'Not found');
};

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

		// A flood guard across the whole form (it also protects the owner's inbox).
		if (!rateLimit('contact-form', 15, 10 * 60 * 1000).ok) {
			return fail(429, {
				message: 'We’re getting a lot of messages right now — please try again in a few minutes.',
				values
			});
		}

		if (!name || !email || !details) {
			return fail(400, {
				message: 'Please fill in your name, email and what you’re after.',
				values
			});
		}
		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { message: 'That email address doesn’t look quite right.', values });
		}

		await db.insert(bespokeOrderEnquiries).values({ name, email, phone, details, wantsNewsletter });
		await notifyOwnerOfEnquiry({ name, email, phone, details });

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
