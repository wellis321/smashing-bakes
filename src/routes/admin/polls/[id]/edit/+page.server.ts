import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { flavorPollOptions, flavorPollVoteSelections, flavorPollVotes, flavorPolls } from '$lib/server/db/schema';

async function loadPollWithResults(id: number) {
	const poll = await db.query.flavorPolls.findFirst({
		where: eq(flavorPolls.id, id),
		with: {
			options: { orderBy: [asc(flavorPollOptions.sortOrder)] },
			votes: {
				with: {
					customer: true,
					selections: { with: { option: true } }
				}
			}
		}
	});
	if (!poll) return null;

	const results = poll.options.map((option) => ({
		option,
		count: poll.votes.filter((vote) => vote.selections.some((s) => s.optionId === option.id)).length
	}));

	return { poll, results };
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
		const votes = await db.query.flavorPollVotes.findMany({
			where: eq(flavorPollVotes.pollId, id),
			with: { customer: true }
		});
		if (votes.length === 0) {
			return fail(400, { winnerMessage: 'No votes yet — nobody to pick from.' });
		}
		const winner = votes[Math.floor(Math.random() * votes.length)];
		return { winner: { name: winner.customer.name, email: winner.customer.email } };
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
