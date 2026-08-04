import { randomBytes, createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { staffSessions, staffUsers } from '$lib/server/db/schema';

const SESSION_COOKIE_NAME = 'staff_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const RENEW_THRESHOLD_MS = SESSION_DURATION_MS / 2;

export type StaffSessionUser = {
	id: number;
	email: string;
	name: string;
	role: 'admin' | 'staff';
};

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createStaffSession(staffUserId: number, event: RequestEvent) {
	const token = randomBytes(32).toString('base64url');
	const id = hashToken(token);
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

	await db.insert(staffSessions).values({ id, staffUserId, expiresAt });

	event.cookies.set(SESSION_COOKIE_NAME, token, {
		path: '/',
		httpOnly: true,
		secure: !event.url.hostname.includes('localhost'),
		sameSite: 'lax',
		expires: expiresAt
	});
}

export async function validateStaffSession(
	event: RequestEvent
): Promise<{ user: StaffSessionUser } | null> {
	const token = event.cookies.get(SESSION_COOKIE_NAME);
	if (!token) return null;

	const id = hashToken(token);
	const [row] = await db
		.select({
			sessionId: staffSessions.id,
			expiresAt: staffSessions.expiresAt,
			userId: staffUsers.id,
			email: staffUsers.email,
			name: staffUsers.name,
			role: staffUsers.role,
			isActive: staffUsers.isActive
		})
		.from(staffSessions)
		.innerJoin(staffUsers, eq(staffSessions.staffUserId, staffUsers.id))
		.where(eq(staffSessions.id, id));

	if (!row || !row.isActive || row.expiresAt.getTime() < Date.now()) {
		if (row) await db.delete(staffSessions).where(eq(staffSessions.id, id));
		event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		return null;
	}

	// Sliding expiration: renew if more than half the TTL has elapsed.
	const remaining = row.expiresAt.getTime() - Date.now();
	if (remaining < RENEW_THRESHOLD_MS) {
		const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
		await db
			.update(staffSessions)
			.set({ expiresAt: newExpiresAt })
			.where(eq(staffSessions.id, id));
		event.cookies.set(SESSION_COOKIE_NAME, token, {
			path: '/',
			httpOnly: true,
			secure: !event.url.hostname.includes('localhost'),
			sameSite: 'lax',
			expires: newExpiresAt
		});
	}

	return {
		user: { id: row.userId, email: row.email, name: row.name, role: row.role }
	};
}

export async function invalidateStaffSession(event: RequestEvent) {
	const token = event.cookies.get(SESSION_COOKIE_NAME);
	if (token) {
		await db.delete(staffSessions).where(eq(staffSessions.id, hashToken(token)));
	}
	event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}
