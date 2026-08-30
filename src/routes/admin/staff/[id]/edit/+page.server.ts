import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { staffSessions, staffUsers } from '$lib/server/db/schema';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async ({ params, locals }) => {
	if (locals.staff?.role !== 'admin') throw error(403, 'Only admins can manage staff accounts.');

	const id = Number(params.id);
	const member = await db.query.staffUsers.findFirst({
		where: eq(staffUsers.id, id),
		columns: { id: true, name: true, email: true, role: true, isActive: true }
	});
	if (!member) throw error(404, 'Staff account not found');

	return { member, isSelf: id === locals.staff.id };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (locals.staff?.role !== 'admin') return fail(403, { message: 'Only admins can do that.' });

		const id = Number(params.id);
		const isSelf = id === locals.staff.id;
		const formData = await request.formData();

		const name = String(formData.get('name') ?? '').trim();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		if (!name || !email) {
			return fail(400, { message: 'Enter a name and email address.' });
		}
		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { message: 'That email address doesn’t look quite right.' });
		}

		const existing = await db.query.staffUsers.findFirst({ where: eq(staffUsers.email, email) });
		if (existing && existing.id !== id) {
			return fail(400, { message: 'Another account already uses that email.' });
		}

		// Role and active status are edited from here for other accounts, but
		// never from your own record — same self-protection as the quick
		// toggles on the list page, just enforced here too rather than trusting
		// the form fields to have stayed disabled client-side.
		if (isSelf) {
			await db.update(staffUsers).set({ name, email }).where(eq(staffUsers.id, id));
		} else {
			const role = formData.get('role') === 'admin' ? 'admin' : 'staff';
			const isActive = formData.get('isActive') === 'true';
			await db.update(staffUsers).set({ name, email, role, isActive }).where(eq(staffUsers.id, id));
		}

		return { success: true };
	},

	delete: async ({ params, locals }) => {
		if (locals.staff?.role !== 'admin') return fail(403, { message: 'Only admins can do that.' });

		const id = Number(params.id);
		if (id === locals.staff.id) {
			return fail(400, { message: "You can't delete your own account." });
		}

		// staff_sessions references staff_users with no cascade delete.
		await db.delete(staffSessions).where(eq(staffSessions.staffUserId, id));
		await db.delete(staffUsers).where(eq(staffUsers.id, id));

		throw redirect(303, '/admin/staff');
	}
};
