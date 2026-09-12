import { createHash } from 'node:crypto';
import { eq, gt, and } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers, customerSessions } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/auth/password';
import { createCustomerSession } from '$lib/server/auth/customer-auth';

async function findByToken(token: string) {
	const tokenHash = createHash('sha256').update(token).digest('hex');
	return db.query.customers.findFirst({
		where: and(eq(customers.passwordResetTokenHash, tokenHash), gt(customers.passwordResetExpiresAt, new Date()))
	});
}

export const load: PageServerLoad = async ({ params }) => {
	const customer = await findByToken(params.token);
	return { valid: Boolean(customer) };
};

export const actions: Actions = {
	default: async (event) => {
		const customer = await findByToken(event.params.token);
		if (!customer) {
			return fail(400, { message: 'This reset link is invalid or has expired.' });
		}

		const formData = await event.request.formData();
		const password = String(formData.get('password') ?? '');

		if (password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters.' });
		}

		const passwordHash = await hashPassword(password);
		await db
			.update(customers)
			.set({ passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null })
			.where(eq(customers.id, customer.id));

		// A password reset is a good moment to sign every other session out too.
		await db.delete(customerSessions).where(eq(customerSessions.customerId, customer.id));

		await createCustomerSession(customer.id, event);

		throw redirect(303, '/account');
	}
};
