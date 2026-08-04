import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.customer) throw redirect(303, '/account/login?redirectTo=/account');
	return { customer: locals.customer };
};
