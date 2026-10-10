import type { Handle, HandleServerError } from '@sveltejs/kit';
import { validateStaffSession } from '$lib/server/auth/staff-auth';
import { isCanonicalHost, requestedHost } from '$lib/site';
import { validateCustomerSession } from '$lib/server/auth/customer-auth';

export const handle: Handle = async ({ event, resolve }) => {
	// One address for the site: send www.smashinbakes.com to smashinbakes.com so
	// search engines don't see two copies. Hostinger's proxy may rename the host,
	// so look at the forwarded header as well.
	const host = requestedHost(event.request.headers);
	if (host.startsWith('www.smashinbakes.com') && ['GET', 'HEAD'].includes(event.request.method)) {
		return new Response(null, {
			status: 301,
			headers: { location: `https://smashinbakes.com${event.url.pathname}${event.url.search}` }
		});
	}

	const [staffSession, customerSession] = await Promise.all([
		validateStaffSession(event),
		validateCustomerSession(event)
	]);
	event.locals.staff = staffSession?.user ?? null;
	event.locals.customer = customerSession?.user ?? null;

	const response = await resolve(event);

	// Browser-side protections that cost nothing: HTTPS only, no content-type
	// guessing, no framing by other sites, and a tighter referrer.
	try {
		// The free hostingersite.com address must never compete with the real one.
		if (!isCanonicalHost(host)) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
		response.headers.set('Strict-Transport-Security', 'max-age=31536000');
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'SAMEORIGIN');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set(
			'Permissions-Policy',
			'camera=(), microphone=(), geolocation=(), payment=(self)'
		);
	} catch {
		// Some responses (e.g. redirects built elsewhere) have read-only headers.
	}

	return response;
};

// This deploy target (Hostinger's git-triggered Node.js build) never runs
// drizzle migrations automatically — only `npm run build`. A schema change
// that isn't manually applied to the production database shows up here as a
// MySQL "table/column doesn't exist" error buried in an opaque query stack
// trace. Flagging that specific shape up front in the runtime log turns a
// stack-trace hunt into an immediate "go run the pending migration" signal.
export const handleError: HandleServerError = ({ error }) => {
	// SvelteKit's default handleError (which defining this hook overrides)
	// just logs the raw error — keep doing that before adding our own line.
	console.error(error);

	// Drizzle hides the real database error inside `cause` — log its code and
	// message (these name the host and user but never the password) so a
	// connection problem can be diagnosed from the runtime log.
	const cause = (error as { cause?: { code?: string; errno?: number; message?: string } })?.cause;
	if (cause) {
		console.error(
			`[db cause] code=${cause.code ?? '?'} errno=${cause.errno ?? '?'} message=${cause.message ?? '?'}`
		);
	}

	// mysql2 sets `.code` on its own error object, but drizzle wraps that as
	// `DrizzleQueryError#cause` rather than surfacing it directly — check both.
	const code =
		(error as { code?: string })?.code ?? (error as { cause?: { code?: string } })?.cause?.code;
	if (code === 'ER_NO_SUCH_TABLE' || code === 'ER_BAD_FIELD_ERROR') {
		console.error(
			`[schema mismatch] ${code} — the production database is missing a table/column that the app code expects. This deploy target does not auto-run migrations; apply the pending drizzle/ migration to the production database (see README's "Deploying schema changes" section).`
		);
	}
	return { message: (error as { message?: string })?.message ?? 'Internal Error' };
};
