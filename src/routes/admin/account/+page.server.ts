import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { staffUsers } from '$lib/server/db/schema';
import { hashPassword, verifyPassword } from '$lib/server/auth/password';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.staff) throw redirect(303, '/admin/login');
	return { staff: locals.staff };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.staff) throw redirect(303, '/admin/login');

		const formData = await request.formData();
		const currentPassword = String(formData.get('currentPassword') ?? '');
		const newPassword = String(formData.get('newPassword') ?? '');
		const confirmPassword = String(formData.get('confirmPassword') ?? '');

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { message: 'Fill in all three fields.' });
		}
		if (newPassword.length < 8) {
			return fail(400, { message: 'Your new password needs to be at least 8 characters.' });
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

		return { success: true };
	}
};
