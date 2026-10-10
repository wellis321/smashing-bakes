import { redirect } from '@sveltejs/kit';
import { inArray, count } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { adminFeedback } from '$lib/server/db/schema';

// Reachable without a staff session — everything else under /admin redirects
// to the login page if you're not signed in.
const PUBLIC_PATHS = ['/admin/login', '/admin/forgot-password'];

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isPublic =
		PUBLIC_PATHS.includes(url.pathname) || url.pathname.startsWith('/admin/reset-password/');
	if (!locals.staff && !isPublic) {
		throw redirect(303, '/admin/login');
	}

	// Shown as a badge on the Feedback link. Never let this break the admin.
	let openFeedbackCount = 0;
	if (locals.staff) {
		try {
			const [row] = await db
				.select({ value: count() })
				.from(adminFeedback)
				.where(inArray(adminFeedback.status, ['new', 'working']));
			openFeedbackCount = row?.value ?? 0;
		} catch {
			openFeedbackCount = 0;
		}
	}

	return { staff: locals.staff, openFeedbackCount };
};
