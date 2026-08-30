import { error, fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { staffSessions, staffUsers } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/auth/password';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateTempPassword(): string {
	// Base64url, trimmed to something easy enough to read aloud/type — still
	// well over the entropy a brute-force lockout needs to make guessing moot.
	return randomBytes(9).toString('base64url');
}

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.staff?.role !== 'admin') throw error(403, 'Only admins can manage staff accounts.');

	// Named staffList, not staff — the parent /admin layout already returns a
	// `staff` key for the logged-in user, and same-named keys from a page's own
	// load silently shadow the parent's in the merged `data`/`page.data`.
	const staffList = await db.query.staffUsers.findMany({
		orderBy: [desc(staffUsers.createdAt)],
		columns: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
	});

	return { staffList };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (locals.staff?.role !== 'admin') return fail(403, { message: 'Only admins can add staff accounts.' });

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const role = formData.get('role') === 'admin' ? 'admin' : 'staff';

		const values = { name, email, role };

		if (!name || !email) {
			return fail(400, { message: 'Enter a name and email address.', values });
		}
		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { message: 'That email address doesn’t look quite right.', values });
		}

		const existing = await db.query.staffUsers.findFirst({ where: eq(staffUsers.email, email) });
		if (existing) {
			return fail(400, { message: 'An account already exists with that email.', values });
		}

		const tempPassword = generateTempPassword();
		const passwordHash = await hashPassword(tempPassword);
		await db.insert(staffUsers).values({ name, email, role, passwordHash });

		// Echo values back on success too (not just failure) — the form is left
		// filled in on purpose so the password shown clearly matches the visible
		// name/email rather than sitting above a form that's already gone blank.
		return { success: true, tempPassword, createdName: name, createdEmail: email, values };
	},

	toggleActive: async ({ request, locals }) => {
		if (locals.staff?.role !== 'admin') return fail(403, { message: 'Only admins can do that.' });

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextValue = formData.get('nextValue') === 'true';
		if (!id) return fail(400, { message: 'Missing staff id.' });
		if (id === locals.staff.id) return fail(400, { message: "You can't deactivate your own account." });

		await db.update(staffUsers).set({ isActive: nextValue }).where(eq(staffUsers.id, id));
		return { success: true };
	},

	changeRole: async ({ request, locals }) => {
		if (locals.staff?.role !== 'admin') return fail(403, { message: 'Only admins can do that.' });

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextRole = formData.get('nextRole') === 'admin' ? 'admin' : 'staff';
		if (!id) return fail(400, { message: 'Missing staff id.' });
		if (id === locals.staff.id) return fail(400, { message: "You can't change your own role." });

		await db.update(staffUsers).set({ role: nextRole }).where(eq(staffUsers.id, id));
		return { success: true };
	},

	delete: async ({ request, locals }) => {
		if (locals.staff?.role !== 'admin') return fail(403, { message: 'Only admins can do that.' });

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing staff id.' });
		if (id === locals.staff.id) return fail(400, { message: "You can't delete your own account." });

		// staff_sessions references staff_users with no cascade delete.
		await db.delete(staffSessions).where(eq(staffSessions.staffUserId, id));
		await db.delete(staffUsers).where(eq(staffUsers.id, id));

		return { success: true };
	}
};
