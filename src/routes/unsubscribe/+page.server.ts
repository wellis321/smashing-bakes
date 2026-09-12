import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers, newsletterSubscribers } from '$lib/server/db/schema';

async function findByToken(token: string) {
	const subscriber = await db.query.newsletterSubscribers.findFirst({ where: eq(newsletterSubscribers.unsubscribeToken, token) });
	if (subscriber) return { kind: 'subscriber' as const, email: subscriber.email };

	const customer = await db.query.customers.findFirst({ where: eq(customers.unsubscribeToken, token) });
	if (customer) return { kind: 'customer' as const, email: customer.email };

	return null;
}

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token') ?? '';
	if (!token) return { match: null };
	const match = await findByToken(token);
	return { match };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const token = String(formData.get('token') ?? '');
		if (!token) return fail(400, { message: 'Missing unsubscribe link — please use the link from the email.' });

		const match = await findByToken(token);
		if (!match) return fail(400, { message: 'That unsubscribe link has already been used or has expired.' });

		if (match.kind === 'subscriber') {
			await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.unsubscribeToken, token));
		} else {
			await db.update(customers).set({ marketingOptIn: false }).where(eq(customers.unsubscribeToken, token));
		}

		return { success: true, email: match.email };
	}
};
