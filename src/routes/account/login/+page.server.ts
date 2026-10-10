import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { verifyPassword } from '$lib/server/auth/password';
import { createCustomerSession } from '$lib/server/auth/customer-auth';
import { safeRedirectTarget } from '$lib/utils/safe-redirect';
import { rateLimit, resetRateLimit } from '$lib/server/rate-limit';

const MAX_FAILED = 5;
const WINDOW_MS = 15 * 60 * 1000;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.customer)
		throw redirect(303, safeRedirectTarget(url.searchParams.get('redirectTo'), '/account'));
	return { redirectTo: url.searchParams.get('redirectTo') ?? '' };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');
		const redirectTo = String(formData.get('redirectTo') ?? '');

		if (!email || !password) {
			return fail(400, { message: 'Enter your email and password.', email });
		}

		const key = `customer-login:${email}`;
		if (!rateLimit(key, MAX_FAILED, WINDOW_MS, false).ok) {
			return fail(429, {
				message: 'Too many wrong attempts. Please wait 15 minutes and try again.',
				email
			});
		}

		const user = await db.query.customers.findFirst({ where: eq(customers.email, email) });
		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			rateLimit(key, MAX_FAILED, WINDOW_MS);
			return fail(400, { message: 'Incorrect email or password.', email });
		}
		resetRateLimit(key);

		await createCustomerSession(user.id, event);

		throw redirect(303, safeRedirectTarget(redirectTo, '/account'));
	}
};
