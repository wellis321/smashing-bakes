<script lang="ts">
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

<a href="/admin/polls" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Polls</a>
<h1 class="font-display mt-2 text-3xl text-ink">{data.poll.title}</h1>

<form
	method="POST"
	action="?/update"
	class="border-ink/10 mt-6 max-w-2xl rounded-2xl border bg-white/60 p-6"
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
			<label for="title" class="text-ink-soft text-sm font-medium">Poll title</label>
			<input
				id="title"
				name="title"
				required
				value={data.poll.title}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div class="sm:col-span-2">
			<label for="description" class="text-ink-soft text-sm font-medium">Description (optional)</label>
			<textarea
				id="description"
				name="description"
				rows="2"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				>{data.poll.description ?? ''}</textarea
			>
		</div>

		<div class="sm:col-span-2">
			{#if hasVotes}
				<p class="text-ink-soft text-sm font-medium">Flavour options</p>
				<p class="text-ink-soft/70 mt-1 text-xs">
					Options can't be edited once voting has started (would break existing votes).
				</p>
				<ul class="mt-2 flex flex-wrap gap-2">
					{#each data.poll.options as option (option.id)}
						<li class="bg-ink/5 text-ink-soft rounded-full px-3 py-1 text-sm">{option.name}</li>
					{/each}
				</ul>
			{:else}
				<PollOptionsEditor initialOptions={data.poll.options.map((o) => o.name)} />
			{/if}
		</div>

		<div>
			<label for="prizeDescription" class="text-ink-soft text-sm font-medium">Prize (optional)</label>
			<input
				id="prizeDescription"
				name="prizeDescription"
				value={data.poll.prizeDescription ?? ''}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="deadlineText" class="text-ink-soft text-sm font-medium">Deadline (optional)</label>
			<input
				id="deadlineText"
				name="deadlineText"
				value={data.poll.deadlineText ?? ''}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label class="text-ink-soft flex items-center gap-2 text-sm">
				<input type="checkbox" name="isActive" value="true" checked={data.poll.isActive} class="accent-pink h-4 w-4" />
				Active (shows on /vote)
			</label>
		</div>
	</div>

	<div class="mt-6 flex gap-3">
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = false)}
			class="bg-pink hover:bg-pink-deep rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save changes'}
		</button>
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = true)}
			class="text-ink rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold transition-colors hover:border-ink/30 disabled:opacity-60"
		>
			Save &amp; close
		</button>
	</div>
</form>

<div class="border-ink/10 mt-8 max-w-2xl rounded-2xl border bg-white/60 p-6">
	<h2 class="text-ink text-lg font-semibold">Results &mdash; {data.poll.votes.length} vote{data.poll.votes.length === 1 ? '' : 's'}</h2>

	{#if data.results.length === 0 || data.poll.votes.length === 0}
		<p class="text-ink-soft mt-3 text-sm">No votes yet.</p>
	{:else}
		<div class="mt-4 space-y-3">
			{#each data.results as result (result.option.id)}
				<div>
					<div class="flex items-center justify-between text-sm">
						<span class="text-ink font-medium">{result.option.name}</span>
						<span class="text-ink-soft">{result.count}</span>
					</div>
					<div class="bg-ink/5 mt-1 h-2 overflow-hidden rounded-full">
						<div class="bg-pink h-full rounded-full" style:width={`${(result.count / maxCount) * 100}%`}></div>
					</div>
				</div>
			{/each}
		</div>

		<h3 class="text-ink mt-6 text-sm font-semibold">Entries (prize draw)</h3>
		<ul class="text-ink-soft mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">
			{#each data.poll.votes as vote (vote.id)}
				<li>{vote.customer.name} &mdash; <span class="text-ink-soft/70">{vote.customer.email}</span></li>
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
				class="bg-ink hover:bg-ink/90 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
			>
				<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="10" cy="7" r="4.5" />
					<path d="M7 11l-1.5 6L10 15l4.5 2L13 11" />
				</svg>
				{pickingWinner ? 'Picking…' : 'Pick random winner'}
			</button>
			{#if form?.winner}
				<p class="text-ink mt-3 text-sm">
					Winner: <span class="font-semibold">{form.winner.name}</span>
					<span class="text-ink-soft">({form.winner.email})</span>
				</p>
			{/if}
			{#if form?.winnerMessage}
				<p class="text-ink-soft mt-3 text-sm">{form.winnerMessage}</p>
			{/if}
		</form>
	{/if}
</div>

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4 max-w-2xl">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this poll</button>
</form>
