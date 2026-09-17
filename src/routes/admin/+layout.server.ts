import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Reachable without a staff session — everything else under /admin redirects
// to the login page if you're not signed in.
const PUBLIC_PATHS = ['/admin/login', '/admin/forgot-password'];

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isPublic =
		PUBLIC_PATHS.includes(url.pathname) || url.pathname.startsWith('/admin/reset-password/');
	if (!locals.staff && !isPublic) {
		throw redirect(303, '/admin/login');
	}

	return { staff: locals.staff };
};
