import { fail } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { flavorPollVoteSelections, flavorPollVotes } from '$lib/server/db/schema';
import { getActivePoll } from '$lib/server/db/queries';

const MAX_SELECTIONS = 3;

export const load: PageServerLoad = async ({ locals }) => {
	const poll = await getActivePoll();
	if (!poll) return { poll: null, myVote: null, results: null };

	let myVote: { optionIds: number[] } | null = null;
	let results: { optionId: number; count: number }[] | null = null;

	if (locals.customer) {
		// MariaDB doesn't support the LATERAL JOIN Drizzle's `with:` API needs — two
		// flat queries instead (see queries.ts for the fuller explanation).
		const existingVote = await db.query.flavorPollVotes.findFirst({
			where: and(eq(flavorPollVotes.pollId, poll.id), eq(flavorPollVotes.customerId, locals.customer.id))
		});
		if (existingVote) {
			const selections = await db.query.flavorPollVoteSelections.findMany({
				where: eq(flavorPollVoteSelections.voteId, existingVote.id)
			});
			myVote = { optionIds: selections.map((s) => s.optionId) };
		}
	}

	if (myVote) {
		const allVotes = await db.query.flavorPollVotes.findMany({
			where: eq(flavorPollVotes.pollId, poll.id)
		});
		const allSelections =
			allVotes.length === 0
				? []
				: await db.query.flavorPollVoteSelections.findMany({
						where: inArray(
							flavorPollVoteSelections.voteId,
							allVotes.map((v) => v.id)
						)
					});
		results = poll.options.map((option) => ({
			optionId: option.id,
			count: allSelections.filter((s) => s.optionId === option.id).length
		}));
	}

	return { poll, myVote, results };
};

export const actions: Actions = {
	vote: async ({ request, locals }) => {
		if (!locals.customer) {
			return fail(401, { message: 'You need to log in to vote.' });
		}

		const poll = await getActivePoll();
		if (!poll) {
			return fail(400, { message: 'This poll has closed.' });
		}

		const formData = await request.formData();
		const optionIds = formData.getAll('optionId').map(Number).filter(Boolean);

		if (optionIds.length === 0) {
			return fail(400, { message: 'Pick at least 1 flavour.' });
		}
		if (optionIds.length > MAX_SELECTIONS) {
			return fail(400, { message: `Pick up to ${MAX_SELECTIONS} flavours.` });
		}
		const validOptionIds = new Set(poll.options.map((o) => o.id));
		if (!optionIds.every((id) => validOptionIds.has(id))) {
			return fail(400, { message: 'One of those options isn’t valid — please try again.' });
		}

		const existingVote = await db.query.flavorPollVotes.findFirst({
			where: and(eq(flavorPollVotes.pollId, poll.id), eq(flavorPollVotes.customerId, locals.customer.id))
		});
		if (existingVote) {
			return fail(400, { message: 'You’ve already voted in this poll.' });
		}

		try {
			await db.transaction(async (tx) => {
				const [result] = await tx
					.insert(flavorPollVotes)
					.values({ pollId: poll.id, customerId: locals.customer!.id });
				const voteId = result.insertId;
				for (const optionId of optionIds) {
					await tx.insert(flavorPollVoteSelections).values({ voteId, optionId });
				}
			});
		} catch {
			return fail(400, { message: 'You’ve already voted in this poll.' });
		}

		return { success: true };
	}
};
