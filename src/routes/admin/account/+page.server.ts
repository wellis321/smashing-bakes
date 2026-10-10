import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { staffUsers } from '$lib/server/db/schema';
import { checkPassword, STAFF_MIN_LENGTH } from '$lib/server/auth/password-policy';
import { hashPassword, verifyPassword } from '$lib/server/auth/password';
import { logStaffActivity } from '$lib/server/auth/activity-log';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.staff) throw redirect(303, '/admin/login');
	return { staff: locals.staff };
};

export const actions: Actions = {
	default: async (event) => {
		const { request, locals } = event;
		if (!locals.staff) throw redirect(303, '/admin/login');

		const formData = await request.formData();
		const currentPassword = String(formData.get('currentPassword') ?? '');
		const newPassword = String(formData.get('newPassword') ?? '');
		const confirmPassword = String(formData.get('confirmPassword') ?? '');

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { message: 'Fill in all three fields.' });
		}
		const passwordProblem = checkPassword(newPassword, STAFF_MIN_LENGTH, locals.staff.email);
		if (passwordProblem) {
			return fail(400, { message: passwordProblem });
		}
		if (newPassword !== confirmPassword) {
			return fail(400, { message: "New password and confirmation don't match." });
		}

		const user = await db.query.staffUsers.findFirst({ where: eq(staffUsers.id, locals.staff.id) });
		if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
			return fail(400, { message: 'Current password is incorrect.' });
		}

		const passwordHash = await hashPassword(newPassword);
		await db.update(staffUsers).set({ passwordHash }).where(eq(staffUsers.id, locals.staff.id));
		await logStaffActivity({
			event,
			action: 'password_changed_self',
			actorStaffUserId: locals.staff.id,
			actorEmail: locals.staff.email
		});

		return { success: true };
	}
};
