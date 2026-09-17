import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { staffActivityLog } from '$lib/server/db/schema';

type StaffActivityAction =
	| 'login_success'
	| 'login_failed'
	| 'logout'
	| 'staff_created'
	| 'staff_updated'
	| 'staff_role_changed'
	| 'staff_activated'
	| 'staff_deactivated'
	| 'staff_deleted'
	| 'password_changed_self'
	| 'password_reset_by_admin'
	| 'password_reset_requested'
	| 'password_reset_completed';

type LogStaffActivityParams = {
	event: RequestEvent;
	action: StaffActivityAction;
	actorStaffUserId?: number | null;
	actorEmail?: string | null;
	targetStaffUserId?: number | null;
	targetEmail?: string | null;
	detail?: string | null;
};

// Best-effort: a logging failure must never break the login/action it's
// recording, so this swallows its own errors rather than propagating them.
export async function logStaffActivity({
	event,
	action,
	actorStaffUserId = null,
	actorEmail = null,
	targetStaffUserId = null,
	targetEmail = null,
	detail = null
}: LogStaffActivityParams): Promise<void> {
	try {
		await db.insert(staffActivityLog).values({
			action,
			actorStaffUserId,
			actorEmail,
			targetStaffUserId,
			targetEmail,
			detail,
			ipAddress: event.getClientAddress(),
			userAgent: event.request.headers.get('user-agent')?.slice(0, 255) ?? null
		});
	} catch (err) {
		console.error('Failed to write staff activity log entry:', err);
	}
}
