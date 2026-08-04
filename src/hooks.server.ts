import type { Handle } from '@sveltejs/kit';
import { validateStaffSession } from '$lib/server/auth/staff-auth';
import { validateCustomerSession } from '$lib/server/auth/customer-auth';

export const handle: Handle = async ({ event, resolve }) => {
	const [staffSession, customerSession] = await Promise.all([
		validateStaffSession(event),
		validateCustomerSession(event)
	]);
	event.locals.staff = staffSession?.user ?? null;
	event.locals.customer = customerSession?.user ?? null;

	return resolve(event);
};
