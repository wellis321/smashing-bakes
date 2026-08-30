import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const customerRows = await db.query.customers.findMany({
		orderBy: [desc(customers.createdAt)],
		columns: { id: true, name: true, email: true, marketingOptIn: true, createdAt: true }
	});

	return { customers: customerRows };
};
