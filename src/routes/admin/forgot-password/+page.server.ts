import { randomBytes, createHash } from 'node:crypto';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { staffUsers } from '$lib/server/db/schema';
import { isEmailConfigured, sendTestEmail } from '$lib/server/email/resend';
import { renderPasswordResetEmail } from '$lib/email/transactional-template';
import { logStaffActivity } from '$lib/server/auth/activity-log';

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.staff) throw redirect(303, '/admin');
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		if (!email) {
			return fail(400, { message: 'Enter your email address.' });
		}

		const user = await db.query.staffUsers.findFirst({ where: eq(staffUsers.email, email) });

		// Always the same response whether or not the email matches an account,
		// or whether that account is active — confirming/denying either here
		// would let anyone enumerate staff accounts or probe who's deactivated.
		if (user && user.isActive) {
			const token = randomBytes(32).toString('base64url');
			const tokenHash = createHash('sha256').update(token).digest('hex');
			await db
				.update(staffUsers)
				.set({
					passwordResetTokenHash: tokenHash,
					passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
				})
				.where(eq(staffUsers.id, user.id));

			const resetUrl = `${event.url.origin}/admin/reset-password/${token}`;
			if (isEmailConfigured()) {
				try {
					await sendTestEmail(
						user.email,
						"Reset your password — Smashin' Bakes admin",
						renderPasswordResetEmail(resetUrl)
					);
				} catch (err) {
					console.error('Failed to send staff password reset email:', err);
				}
			} else {
				// No sender configured — log so this is still testable locally,
				// and so a real deploy with this unset is visible in the runtime
				// logs rather than just silently never emailing anyone.
				console.log(
					`[staff password reset] email not configured; link for ${user.email}: ${resetUrl}`
				);
			}

			await logStaffActivity({
				event,
				action: 'password_reset_requested',
				actorStaffUserId: user.id,
				actorEmail: user.email
			});
		}

		return { success: true };
	}
};
