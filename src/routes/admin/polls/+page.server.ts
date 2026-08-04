import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { flavorPollOptions, flavorPollVoteSelections, flavorPollVotes, flavorPolls } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const polls = await db.query.flavorPolls.findMany({
		orderBy: [desc(flavorPolls.createdAt)],
		with: { options: true, votes: true }
	});
	return { polls };
};

export const actions: Actions = {
	setActive: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing poll id.' });

		await db.transaction(async (tx) => {
			await tx.update(flavorPolls).set({ isActive: false });
			await tx.update(flavorPolls).set({ isActive: true }).where(eq(flavorPolls.id, id));
		});
		return { success: true };
	},

	deactivate: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing poll id.' });

		await db.update(flavorPolls).set({ isActive: false }).where(eq(flavorPolls.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { message: 'Missing poll id.' });

		const votes = await db.query.flavorPollVotes.findMany({ where: eq(flavorPollVotes.pollId, id) });
		for (const vote of votes) {
			await db.delete(flavorPollVoteSelections).where(eq(flavorPollVoteSelections.voteId, vote.id));
		}
		await db.delete(flavorPollVotes).where(eq(flavorPollVotes.pollId, id));
		await db.delete(flavorPollOptions).where(eq(flavorPollOptions.pollId, id));
		await db.delete(flavorPolls).where(eq(flavorPolls.id, id));
		return { success: true };
	}
};
