import { randomBytes, createHash } from 'node:crypto';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { isEmailConfigured, sendTestEmail } from '$lib/server/email/resend';
import { renderPasswordResetEmail } from '$lib/email/transactional-template';

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.customer) throw redirect(303, '/account');
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		if (!email) {
			return fail(400, { message: 'Enter your email address.' });
		}

		const customer = await db.query.customers.findFirst({ where: eq(customers.email, email) });

		// Always the same response whether or not the email matches an account —
		// confirming/denying an email exists here would let anyone enumerate
		// registered customers.
		if (customer) {
			const token = randomBytes(32).toString('base64url');
			const tokenHash = createHash('sha256').update(token).digest('hex');
			await db
				.update(customers)
				.set({ passwordResetTokenHash: tokenHash, passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) })
				.where(eq(customers.id, customer.id));

			const resetUrl = `${url.origin}/account/reset-password/${token}`;
			if (isEmailConfigured()) {
				try {
					await sendTestEmail(customer.email, "Reset your password — Smashin' Bakes", renderPasswordResetEmail(resetUrl));
				} catch (err) {
					console.error('Failed to send password reset email:', err);
				}
			} else {
				// No sender configured yet (pre-launch) — log so this is still
				// testable locally without a real inbox to check.
				console.log(`[password reset] email not configured; link for ${customer.email}: ${resetUrl}`);
			}
		}

		return { success: true };
	}
};
