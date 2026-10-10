<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import PollOptionsEditor from '$lib/components/admin/PollOptionsEditor.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
	let pickingWinner = $state(false);
	let closeAfterSave = $state(false);

	const hasVotes = $derived(data.poll.votes.length > 0);
	const maxCount = $derived(Math.max(1, ...data.results.map((r) => r.count)));

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.poll.title}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit {data.poll.title} — Admin</title>
</svelte:head>

<a href="/admin/polls" class="text-sm font-semibold text-ink-soft hover:text-ink">&larr; Polls</a>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">{data.poll.title}</h1>
	<HelpLink section="polls" task="flavour-poll" />
</div>

<form
	method="POST"
	action="?/update"
	class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			submitting = false;
			if (closeAfterSave && result.type === 'success') goto('/admin/polls');
			closeAfterSave = false;
		};
	}}
>
	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
	{/if}
	{#if form?.success}
		<p class="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>
	{/if}

	<div class="grid gap-6 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<label for="title" class="text-sm font-medium text-ink-soft">Poll title</label>
			<input
				id="title"
				name="title"
				required
				value={data.poll.title}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div class="sm:col-span-2">
			<label for="description" class="text-sm font-medium text-ink-soft"
				>Description (optional)</label
			>
			<textarea
				id="description"
				name="description"
				rows="2"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				>{data.poll.description ?? ''}</textarea
			>
		</div>

		<div class="sm:col-span-2">
			{#if hasVotes}
				<p class="text-sm font-medium text-ink-soft">Flavour options</p>
				<p class="mt-1 text-xs text-ink-soft/70">
					Options can't be edited once voting has started (would break existing votes).
				</p>
				<ul class="mt-2 flex flex-wrap gap-2">
					{#each data.poll.options as option (option.id)}
						<li class="rounded-full bg-ink/5 px-3 py-1 text-sm text-ink-soft">{option.name}</li>
					{/each}
				</ul>
			{:else}
				<PollOptionsEditor initialOptions={data.poll.options.map((o) => o.name)} />
			{/if}
		</div>

		<div>
			<label for="prizeDescription" class="text-sm font-medium text-ink-soft"
				>Prize (optional)</label
			>
			<input
				id="prizeDescription"
				name="prizeDescription"
				value={data.poll.prizeDescription ?? ''}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="deadlineText" class="text-sm font-medium text-ink-soft">Deadline (optional)</label
			>
			<input
				id="deadlineText"
				name="deadlineText"
				value={data.poll.deadlineText ?? ''}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label class="flex items-center gap-2 text-sm text-ink-soft">
				<input
					type="checkbox"
					name="isActive"
					value="true"
					checked={data.poll.isActive}
					class="h-4 w-4 accent-pink"
				/>
				Active (shows on /vote)
			</label>
		</div>
	</div>

	<div class="mt-6 flex gap-3">
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = false)}
			class="rounded-full bg-pink-deep px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save changes'}
		</button>
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = true)}
			class="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-60"
		>
			Save &amp; close
		</button>
	</div>
</form>

<div class="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6">
	<h2 class="text-lg font-semibold text-ink">
		Results &mdash; {data.poll.votes.length} vote{data.poll.votes.length === 1 ? '' : 's'}
	</h2>
	<div class="mt-2">
		<HelpLink
			section="polls"
			task="pick-winner"
			label="Pick a winner"
			title="How to pick a random winner"
		/>
	</div>

	{#if data.results.length === 0 || data.poll.votes.length === 0}
		<p class="mt-3 text-sm text-ink-soft">No votes yet.</p>
	{:else}
		<div class="mt-4 space-y-3">
			{#each data.results as result (result.option.id)}
				<div>
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium text-ink">{result.option.name}</span>
						<span class="text-ink-soft">{result.count}</span>
					</div>
					<div class="mt-1 h-2 overflow-hidden rounded-full bg-ink/5">
						<div
							class="h-full rounded-full bg-pink-deep"
							style:width={`${(result.count / maxCount) * 100}%`}
						></div>
					</div>
				</div>
			{/each}
		</div>

		<h3 class="mt-6 text-sm font-semibold text-ink">Entries (prize draw)</h3>
		<ul class="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm text-ink-soft">
			{#each data.poll.votes as vote (vote.id)}
				<li>
					{vote.customer.name} &mdash; <span class="text-ink-soft/70">{vote.customer.email}</span>
				</li>
			{/each}
		</ul>

		<form
			method="POST"
			action="?/pickWinner"
			use:enhance={() => {
				pickingWinner = true;
				return async ({ update }) => {
					await update({ reset: false });
					pickingWinner = false;
				};
			}}
			class="mt-4"
		>
			<button
				type="submit"
				disabled={pickingWinner}
				class="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink/90 disabled:opacity-60"
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="10" cy="7" r="4.5" />
					<path d="M7 11l-1.5 6L10 15l4.5 2L13 11" />
				</svg>
				{pickingWinner ? 'Picking…' : 'Pick random winner'}
			</button>
			{#if form?.winner}
				<p class="mt-3 text-sm text-ink">
					Winner: <span class="font-semibold">{form.winner.name}</span>
					<span class="text-ink-soft">({form.winner.email})</span>
				</p>
			{/if}
			{#if form?.winnerMessage}
				<p class="mt-3 text-sm text-ink-soft">{form.winnerMessage}</p>
			{/if}
		</form>
	{/if}
</div>

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this poll</button>
</form>
