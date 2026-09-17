import { error, fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { staffSessions, staffUsers } from '$lib/server/db/schema';
import { generateTempPassword, hashPassword } from '$lib/server/auth/password';
import { isProtectedFromOthers } from '$lib/server/auth/staff-auth';
import { logStaffActivity } from '$lib/server/auth/activity-log';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.staff?.role !== 'admin') throw error(403, 'Only admins can manage staff accounts.');

	// Named staffList, not staff — the parent /admin layout already returns a
	// `staff` key for the logged-in user, and same-named keys from a page's own
	// load silently shadow the parent's in the merged `data`/`page.data`.
	const staffList = await db.query.staffUsers.findMany({
		orderBy: [desc(staffUsers.createdAt)],
		columns: {
			id: true,
			name: true,
			email: true,
			role: true,
			isActive: true,
			isProtected: true,
			createdAt: true
		}
	});

	return { staffList };
};

export const actions: Actions = {
	create: async (event) => {
		const { request, locals } = event;
		if (locals.staff?.role !== 'admin')
			return fail(403, { message: 'Only admins can add staff accounts.' });

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
		const [inserted] = await db
			.insert(staffUsers)
			.values({ name, email, role, passwordHash })
			.$returningId();
		await logStaffActivity({
			event,
			action: 'staff_created',
			actorStaffUserId: locals.staff.id,
			actorEmail: locals.staff.email,
			targetStaffUserId: inserted?.id ?? null,
			targetEmail: email,
			detail: `role: ${role}`
		});

		// Echo values back on success too (not just failure) — the form is left
		// filled in on purpose so the password shown clearly matches the visible
		// name/email rather than sitting above a form that's already gone blank.
		return { success: true, tempPassword, createdName: name, createdEmail: email, values };
	},

	toggleActive: async (event) => {
		const { request, locals } = event;
		if (locals.staff?.role !== 'admin') return fail(403, { message: 'Only admins can do that.' });

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextValue = formData.get('nextValue') === 'true';
		if (!id) return fail(400, { message: 'Missing staff id.' });
		if (id === locals.staff.id)
			return fail(400, { message: "You can't deactivate your own account." });
		if (await isProtectedFromOthers(id, locals.staff.id)) {
			return fail(403, { message: 'This account can only be changed by its own owner.' });
		}

		const target = await db.query.staffUsers.findFirst({
			where: eq(staffUsers.id, id),
			columns: { email: true }
		});
		await db.update(staffUsers).set({ isActive: nextValue }).where(eq(staffUsers.id, id));
		await logStaffActivity({
			event,
			action: nextValue ? 'staff_activated' : 'staff_deactivated',
			actorStaffUserId: locals.staff.id,
			actorEmail: locals.staff.email,
			targetStaffUserId: id,
			targetEmail: target?.email ?? null
		});
		return { success: true };
	},

	changeRole: async (event) => {
		const { request, locals } = event;
		if (locals.staff?.role !== 'admin') return fail(403, { message: 'Only admins can do that.' });

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const nextRole = formData.get('nextRole') === 'admin' ? 'admin' : 'staff';
		if (!id) return fail(400, { message: 'Missing staff id.' });
		if (id === locals.staff.id) return fail(400, { message: "You can't change your own role." });
		if (await isProtectedFromOthers(id, locals.staff.id)) {
			return fail(403, { message: 'This account can only be changed by its own owner.' });
		}

		const target = await db.query.staffUsers.findFirst({
			where: eq(staffUsers.id, id),
			columns: { email: true, role: true }
		});
		await db.update(staffUsers).set({ role: nextRole }).where(eq(staffUsers.id, id));
		await logStaffActivity({
			event,
			action: 'staff_role_changed',
			actorStaffUserId: locals.staff.id,
			actorEmail: locals.staff.email,
			targetStaffUserId: id,
			targetEmail: target?.email ?? null,
			detail: `${target?.role ?? '?'} → ${nextRole}`
		});
		return { success: true };
	},

	delete: async (event) => {
		const { request, locals } = event;
		if (locals.staff?.role !== 'admin') return fail(403, { message: 'Only admins can do that.' });

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing staff id.' });
		if (id === locals.staff.id) return fail(400, { message: "You can't delete your own account." });
		if (await isProtectedFromOthers(id, locals.staff.id)) {
			return fail(403, { message: 'This account can only be changed by its own owner.' });
		}

		const target = await db.query.staffUsers.findFirst({
			where: eq(staffUsers.id, id),
			columns: { email: true }
		});

		// staff_sessions references staff_users with no cascade delete.
		await db.delete(staffSessions).where(eq(staffSessions.staffUserId, id));
		await db.delete(staffUsers).where(eq(staffUsers.id, id));
		await logStaffActivity({
			event,
			action: 'staff_deleted',
			actorStaffUserId: locals.staff.id,
			actorEmail: locals.staff.email,
			targetStaffUserId: id,
			targetEmail: target?.email ?? null
		});

		return { success: true };
	}
};
