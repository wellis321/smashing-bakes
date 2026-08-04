import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/auth/password';
import { createCustomerSession } from '$lib/server/auth/customer-auth';
import { safeRedirectTarget } from '$lib/utils/safe-redirect';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.customer) throw redirect(303, safeRedirectTarget(url.searchParams.get('redirectTo'), '/account'));
	return { redirectTo: url.searchParams.get('redirectTo') ?? '' };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');
		const marketingOptIn = formData.get('marketingOptIn') === 'true';
		const redirectTo = String(formData.get('redirectTo') ?? '');

		const values = { name, email };

		if (!name || !email || !password) {
			return fail(400, { message: 'Please fill in your name, email and a password.', values });
		}
		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { message: 'That email address doesn’t look quite right.', values });
		}
		if (password.length < 8) {
			return fail(400, { message: 'Your password needs to be at least 8 characters.', values });
		}

		const existing = await db.query.customers.findFirst({ where: eq(customers.email, email) });
		if (existing) {
			return fail(400, { message: 'An account already exists with that email — try logging in instead.', values });
		}

		const passwordHash = await hashPassword(password);
		const [result] = await db.insert(customers).values({ name, email, passwordHash, marketingOptIn });

		await createCustomerSession(result.insertId, event);

		throw redirect(303, safeRedirectTarget(redirectTo, '/account'));
	}
};
