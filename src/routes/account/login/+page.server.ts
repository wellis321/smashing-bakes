import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { verifyPassword } from '$lib/server/auth/password';
import { createCustomerSession } from '$lib/server/auth/customer-auth';
import { safeRedirectTarget } from '$lib/utils/safe-redirect';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.customer) throw redirect(303, safeRedirectTarget(url.searchParams.get('redirectTo'), '/account'));
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

		const user = await db.query.customers.findFirst({ where: eq(customers.email, email) });
		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			return fail(400, { message: 'Incorrect email or password.', email });
		}

		await createCustomerSession(user.id, event);

		throw redirect(303, safeRedirectTarget(redirectTo, '/account'));
	}
};
