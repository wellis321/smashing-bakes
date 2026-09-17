import { createHash } from 'node:crypto';
import { eq, gt, and } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { staffUsers, staffSessions } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/auth/password';
import { createStaffSession } from '$lib/server/auth/staff-auth';
import { logStaffActivity } from '$lib/server/auth/activity-log';

async function findByToken(token: string) {
	const tokenHash = createHash('sha256').update(token).digest('hex');
	return db.query.staffUsers.findFirst({
		where: and(
			eq(staffUsers.passwordResetTokenHash, tokenHash),
			gt(staffUsers.passwordResetExpiresAt, new Date())
		)
	});
}

export const load: PageServerLoad = async ({ params }) => {
	const user = await findByToken(params.token);
	return { valid: Boolean(user) };
};

export const actions: Actions = {
	default: async (event) => {
		const user = await findByToken(event.params.token);
		if (!user) {
			return fail(400, { message: 'This reset link is invalid or has expired.' });
		}

		const formData = await event.request.formData();
		const password = String(formData.get('password') ?? '');

		if (password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters.' });
		}

		const passwordHash = await hashPassword(password);
		await db
			.update(staffUsers)
			.set({
				passwordHash,
				passwordResetTokenHash: null,
				passwordResetExpiresAt: null,
				failedLoginAttempts: 0,
				lockedUntil: null
			})
			.where(eq(staffUsers.id, user.id));

		// A password reset is a good moment to sign every other session out too.
		await db.delete(staffSessions).where(eq(staffSessions.staffUserId, user.id));

		await createStaffSession(user.id, event);
		await logStaffActivity({
			event,
			action: 'password_reset_completed',
			actorStaffUserId: user.id,
			actorEmail: user.email
		});

		throw redirect(303, '/admin');
	}
};
