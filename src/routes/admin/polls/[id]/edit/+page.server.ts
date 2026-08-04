import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers, flavorPollOptions, flavorPollVoteSelections, flavorPollVotes, flavorPolls } from '$lib/server/db/schema';

// MariaDB doesn't support the LATERAL JOIN Drizzle's `with:` API needs — flat
// queries instead (see src/lib/server/db/queries.ts for more).
async function loadPollWithResults(id: number) {
	const poll = await db.query.flavorPolls.findFirst({ where: eq(flavorPolls.id, id) });
	if (!poll) return null;

	const options = await db.query.flavorPollOptions.findMany({
		where: eq(flavorPollOptions.pollId, id),
		orderBy: [asc(flavorPollOptions.sortOrder)]
	});
	const voteRows = await db.query.flavorPollVotes.findMany({ where: eq(flavorPollVotes.pollId, id) });
	const [voteCustomers, selections] =
		voteRows.length === 0
			? [[], []]
			: await Promise.all([
					db.query.customers.findMany({
						where: inArray(
							customers.id,
							voteRows.map((v) => v.customerId)
						)
					}),
					db.query.flavorPollVoteSelections.findMany({
						where: inArray(
							flavorPollVoteSelections.voteId,
							voteRows.map((v) => v.id)
						)
					})
				]);
	const customerById = new Map(voteCustomers.map((c) => [c.id, c]));
	const selectionsByVote = new Map<number, typeof selections>();
	for (const s of selections) {
		const list = selectionsByVote.get(s.voteId);
		if (list) list.push(s);
		else selectionsByVote.set(s.voteId, [s]);
	}
	const votes = voteRows.map((v) => ({
		...v,
		customer: customerById.get(v.customerId)!,
		selections: selectionsByVote.get(v.id) ?? []
	}));

	const results = options.map((option) => ({
		option,
		count: votes.filter((vote) => vote.selections.some((s) => s.optionId === option.id)).length
	}));

	return { poll: { ...poll, options, votes }, results };
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const data = await loadPollWithResults(id);
	if (!data) throw error(404, 'Poll not found');
	return data;
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const title = String(formData.get('title') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim() || null;
		const prizeDescription = String(formData.get('prizeDescription') ?? '').trim() || null;
		const deadlineText = String(formData.get('deadlineText') ?? '').trim() || null;
		const isActive = formData.get('isActive') === 'true';

		if (!title) {
			return fail(400, { message: 'Please give the poll a title.' });
		}

		const existingVotes = await db.query.flavorPollVotes.findMany({ where: eq(flavorPollVotes.pollId, id) });

		await db.transaction(async (tx) => {
			if (isActive) {
				await tx.update(flavorPolls).set({ isActive: false });
			}
			await tx.update(flavorPolls).set({ title, description, prizeDescription, deadlineText, isActive }).where(eq(flavorPolls.id, id));

			// Only safe to rewrite the option list while nobody has voted yet — once votes
			// exist, deleting options would orphan their selections.
			if (existingVotes.length === 0) {
				const options = formData
					.getAll('optionName')
					.map((v) => String(v).trim())
					.filter(Boolean);
				if (options.length >= 2) {
					await tx.delete(flavorPollOptions).where(eq(flavorPollOptions.pollId, id));
					for (const [index, name] of options.entries()) {
						await tx.insert(flavorPollOptions).values({ pollId: id, name, sortOrder: index });
					}
				}
			}
		});

		return { success: true };
	},

	pickWinner: async ({ params }) => {
		const id = Number(params.id);
		const votes = await db.query.flavorPollVotes.findMany({ where: eq(flavorPollVotes.pollId, id) });
		if (votes.length === 0) {
			return fail(400, { winnerMessage: 'No votes yet — nobody to pick from.' });
		}
		const winner = votes[Math.floor(Math.random() * votes.length)];
		const winnerCustomer = await db.query.customers.findFirst({ where: eq(customers.id, winner.customerId) });
		if (!winnerCustomer) {
			return fail(400, { winnerMessage: 'Could not find that voter — please try again.' });
		}
		return { winner: { name: winnerCustomer.name, email: winnerCustomer.email } };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		const votes = await db.query.flavorPollVotes.findMany({ where: eq(flavorPollVotes.pollId, id) });
		for (const vote of votes) {
			await db.delete(flavorPollVoteSelections).where(eq(flavorPollVoteSelections.voteId, vote.id));
		}
		await db.delete(flavorPollVotes).where(eq(flavorPollVotes.pollId, id));
		await db.delete(flavorPollOptions).where(eq(flavorPollOptions.pollId, id));
		await db.delete(flavorPolls).where(eq(flavorPolls.id, id));
		throw redirect(303, '/admin/polls');
	}
};
