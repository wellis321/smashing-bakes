import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.staff && url.pathname !== '/admin/login') {
		throw redirect(303, '/admin/login');
	}

	return { staff: locals.staff };
};
