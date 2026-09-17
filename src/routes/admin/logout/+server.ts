import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateStaffSession } from '$lib/server/auth/staff-auth';
import { logStaffActivity } from '$lib/server/auth/activity-log';

export const POST: RequestHandler = async (event) => {
	// Read locals before invalidating — the session that identifies "who" is
	// what's about to be deleted.
	const staff = event.locals.staff;
	await invalidateStaffSession(event);
	if (staff) {
		await logStaffActivity({
			event,
			action: 'logout',
			actorStaffUserId: staff.id,
			actorEmail: staff.email
		});
	}
	throw redirect(303, '/admin/login');
};
