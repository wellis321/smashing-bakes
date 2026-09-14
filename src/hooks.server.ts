import type { Handle, HandleServerError } from '@sveltejs/kit';
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
