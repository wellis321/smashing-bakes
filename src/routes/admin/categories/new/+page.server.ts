import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { slugify } from '$lib/utils/slugify';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim() || null;
		const slug = slugify(String(formData.get('slug') || name));

		if (!name || !slug) {
			return fail(400, { message: 'Please give the category a name.' });
		}

		try {
			await db.insert(categories).values({ name, slug, description });
		} catch {
			return fail(400, { message: 'A category with that URL slug already exists — please choose another.' });
		}

		throw redirect(303, '/admin/categories');
	}
};
