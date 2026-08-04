import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { flavorPollOptions, flavorPolls } from '$lib/server/db/schema';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const title = String(formData.get('title') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim() || null;
		const prizeDescription = String(formData.get('prizeDescription') ?? '').trim() || null;
		const deadlineText = String(formData.get('deadlineText') ?? '').trim() || null;
		const options = formData
			.getAll('optionName')
			.map((v) => String(v).trim())
			.filter(Boolean);

		if (!title) {
			return fail(400, { message: 'Please give the poll a title.' });
		}
		if (options.length < 2) {
			return fail(400, { message: 'Add at least 2 flavour options.' });
		}

		const [result] = await db.insert(flavorPolls).values({ title, description, prizeDescription, deadlineText });
		const pollId = result.insertId;

		for (const [index, name] of options.entries()) {
			await db.insert(flavorPollOptions).values({ pollId, name, sortOrder: index });
		}

		throw redirect(303, '/admin/polls');
	}
};
