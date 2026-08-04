import { fail } from '@sveltejs/kit';
import { desc, eq, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { flavorPollOptions, flavorPollVoteSelections, flavorPollVotes, flavorPolls } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	// MariaDB doesn't support the LATERAL JOIN Drizzle's `with:` API needs — flat
	// queries instead (see src/lib/server/db/queries.ts for more).
	const pollRows = await db.query.flavorPolls.findMany({ orderBy: [desc(flavorPolls.createdAt)] });
	const [options, votes] =
		pollRows.length === 0
			? [[], []]
			: await Promise.all([
					db.query.flavorPollOptions.findMany({
						where: inArray(
							flavorPollOptions.pollId,
							pollRows.map((p) => p.id)
						)
					}),
					db.query.flavorPollVotes.findMany({
						where: inArray(
							flavorPollVotes.pollId,
							pollRows.map((p) => p.id)
						)
					})
				]);
	const optionsByPoll = new Map<number, typeof options>();
	for (const o of options) {
		const list = optionsByPoll.get(o.pollId);
		if (list) list.push(o);
		else optionsByPoll.set(o.pollId, [o]);
	}
	const votesByPoll = new Map<number, typeof votes>();
	for (const v of votes) {
		const list = votesByPoll.get(v.pollId);
		if (list) list.push(v);
		else votesByPoll.set(v.pollId, [v]);
	}
	const polls = pollRows.map((p) => ({
		...p,
		options: optionsByPoll.get(p.id) ?? [],
		votes: votesByPoll.get(p.id) ?? []
	}));
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
