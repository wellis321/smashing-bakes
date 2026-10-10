import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { FEEDBACK_STATUSES, adminFeedback } from '$lib/server/db/schema';

type Status = (typeof FEEDBACK_STATUSES)[number];
const isStatus = (value: string): value is Status =>
	(FEEDBACK_STATUSES as readonly string[]).includes(value);

export const load: PageServerLoad = async () => {
	const items = await db.query.adminFeedback.findMany({
		orderBy: [desc(adminFeedback.createdAt)]
	});
	return { items };
};

export const actions: Actions = {
	submit: async ({ request, locals }) => {
		if (!locals.staff) return fail(401, { message: 'Please sign in again.' });
		const formData = await request.formData();
		const message = String(formData.get('message') ?? '').trim();
		const rawPath = String(formData.get('path') ?? '').trim();
		// Only ever record a path within the admin area.
		const pagePath = rawPath.startsWith('/admin') ? rawPath.slice(0, 500) : '/admin';

		if (!message) return fail(400, { message: 'Please write something first.' });

		await db.insert(adminFeedback).values({
			staffId: locals.staff.id,
			staffName: locals.staff.name,
			pagePath,
			message: message.slice(0, 3000)
		});
		return { success: true };
	},

	update: async ({ request, locals }) => {
		if (!locals.staff) return fail(401, { message: 'Please sign in again.' });
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = String(formData.get('status') ?? '');
		const note = String(formData.get('note') ?? '')
			.trim()
			.slice(0, 3000);
		if (!id || !isStatus(status)) return fail(400, { message: 'Invalid request.' });

		await db
			.update(adminFeedback)
			.set({ status, note: note || null })
			.where(eq(adminFeedback.id, id));
		return { success: true };
	},

	delete: async ({ request, locals }) => {
		if (!locals.staff) return fail(401, { message: 'Please sign in again.' });
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing id.' });
		await db.delete(adminFeedback).where(eq(adminFeedback.id, id));
		return { success: true };
	}
};
