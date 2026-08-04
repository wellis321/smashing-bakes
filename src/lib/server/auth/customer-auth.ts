import { randomBytes, createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customerSessions, customers } from '$lib/server/db/schema';

const SESSION_COOKIE_NAME = 'customer_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const RENEW_THRESHOLD_MS = SESSION_DURATION_MS / 2;

export type CustomerSessionUser = {
	id: number;
	email: string;
	name: string;
};

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createCustomerSession(customerId: number, event: RequestEvent) {
	const token = randomBytes(32).toString('base64url');
	const id = hashToken(token);
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

	await db.insert(customerSessions).values({ id, customerId, expiresAt });

	event.cookies.set(SESSION_COOKIE_NAME, token, {
		path: '/',
		httpOnly: true,
		secure: !event.url.hostname.includes('localhost'),
		sameSite: 'lax',
		expires: expiresAt
	});
}

export async function validateCustomerSession(
	event: RequestEvent
): Promise<{ user: CustomerSessionUser } | null> {
	const token = event.cookies.get(SESSION_COOKIE_NAME);
	if (!token) return null;

	const id = hashToken(token);
	const [row] = await db
		.select({
			sessionId: customerSessions.id,
			expiresAt: customerSessions.expiresAt,
			customerId: customers.id,
			email: customers.email,
			name: customers.name
		})
		.from(customerSessions)
		.innerJoin(customers, eq(customerSessions.customerId, customers.id))
		.where(eq(customerSessions.id, id));

	if (!row || row.expiresAt.getTime() < Date.now()) {
		if (row) await db.delete(customerSessions).where(eq(customerSessions.id, id));
		event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		return null;
	}

	// Sliding expiration: renew if more than half the TTL has elapsed.
	const remaining = row.expiresAt.getTime() - Date.now();
	if (remaining < RENEW_THRESHOLD_MS) {
		const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
		await db
			.update(customerSessions)
			.set({ expiresAt: newExpiresAt })
			.where(eq(customerSessions.id, id));
		event.cookies.set(SESSION_COOKIE_NAME, token, {
			path: '/',
			httpOnly: true,
			secure: !event.url.hostname.includes('localhost'),
			sameSite: 'lax',
			expires: newExpiresAt
		});
	}

	return {
		user: { id: row.customerId, email: row.email, name: row.name }
	};
}

export async function invalidateCustomerSession(event: RequestEvent) {
	const token = event.cookies.get(SESSION_COOKIE_NAME);
	if (token) {
		await db.delete(customerSessions).where(eq(customerSessions.id, hashToken(token)));
	}
	event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}
