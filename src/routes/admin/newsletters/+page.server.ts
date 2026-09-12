import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { newsletters, newsletterHighlights } from '$lib/server/db/schema';
import { getNewsletterAudience } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	const [items, audience] = await Promise.all([
		db.query.newsletters.findMany({ orderBy: [desc(newsletters.createdAt)] }),
		getNewsletterAudience()
	]);
	return { newsletters: items, audienceCount: audience.length };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing newsletter id.' });

		const newsletter = await db.query.newsletters.findFirst({ where: eq(newsletters.id, id) });
		if (newsletter?.status === 'sent') {
			return fail(400, { message: "Can't delete a newsletter that's already been sent — it stays as a record." });
		}

		await db.delete(newsletterHighlights).where(eq(newsletterHighlights.newsletterId, id));
		await db.delete(newsletters).where(eq(newsletters.id, id));
		return { success: true };
	}
};
