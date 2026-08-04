import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateCustomerSession } from '$lib/server/auth/customer-auth';

export const POST: RequestHandler = async (event) => {
	await invalidateCustomerSession(event);
	throw redirect(303, '/');
};
