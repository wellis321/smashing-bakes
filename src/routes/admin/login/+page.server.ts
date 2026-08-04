import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { staffUsers } from '$lib/server/db/schema';
import { verifyPassword } from '$lib/server/auth/password';
import { createStaffSession } from '$lib/server/auth/staff-auth';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 1000 * 60 * 15;

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.staff) throw redirect(303, '/admin');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { message: 'Enter your email and password.', email });
		}

		const [user] = await db.select().from(staffUsers).where(eq(staffUsers.email, email));

		if (!user || !user.isActive) {
			return fail(400, { message: 'Incorrect email or password.', email });
		}

		if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
			return fail(400, {
				message: 'This account is temporarily locked after too many failed attempts. Try again later.',
				email
			});
		}

		const validPassword = await verifyPassword(password, user.passwordHash);

		if (!validPassword) {
			const attempts = user.failedLoginAttempts + 1;
			const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;
			await db
				.update(staffUsers)
				.set({ failedLoginAttempts: attempts, lockedUntil })
				.where(eq(staffUsers.id, user.id));
			return fail(400, { message: 'Incorrect email or password.', email });
		}

		await db
			.update(staffUsers)
			.set({ failedLoginAttempts: 0, lockedUntil: null })
			.where(eq(staffUsers.id, user.id));

		await createStaffSession(user.id, event);

		throw redirect(303, '/admin');
	}
};
