import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateStaffSession } from '$lib/server/auth/staff-auth';

export const POST: RequestHandler = async (event) => {
	await invalidateStaffSession(event);
	throw redirect(303, '/admin/login');
};
