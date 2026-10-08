<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let bulkAdding = $state(false);
	let pickingWinner = $state(false);

	const totalEntries = $derived(data.entries.length);
	const uniqueCustomers = $derived(new Set(data.entries.map((e) => e.customerEmail)).size);

	function confirmDelete(event: SubmitEvent, name: string) {
		if (!confirm(`Delete "${name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Local businesses — Admin</title>
</svelte:head>

<div class="flex items-center gap-2">
	<h1 class="font-display text-3xl text-ink">Local businesses</h1>
	<HelpLink section="local-businesses" />
</div>
<p class="mt-1 text-sm text-ink-soft">
	Powers the "choose a local business" strip on the Supporting Local Businesses promotion.
</p>

{#if !data.promotion}
	<p class="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
		No promotion is currently set to the "local business picker" mechanic — the strip won't show on
		the site until one is. Set it on a promotion's edit page.
	</p>
{/if}

<div class="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
	<div>
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-6">
			<h2 class="text-lg font-semibold text-ink">Add businesses</h2>
			<p class="mt-1 text-sm text-ink-soft">
				One per line. Add a category after a <code class="text-xs">|</code> if you like, e.g.
				<code class="text-xs">Cafe 136 | Cafe</code>. Names already in the list are skipped.
			</p>
			<form
				method="POST"
				action="?/bulkAdd"
				class="mt-4"
				use:enhance={() => {
					bulkAdding = true;
					return async ({ update }) => {
						await update();
						bulkAdding = false;
					};
				}}
			>
				<textarea
					name="names"
					rows="6"
					placeholder={'Cafe 136 | Cafe\nBarrhead Bowling Club\nThe Ashcraig | Restaurant'}
					class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				></textarea>
				{#if form?.message}
					<p class="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
				{/if}
				{#if form?.added !== undefined}
					<p class="mt-2 text-sm text-ink-soft">
						Added {form.added}{form.skipped ? `, skipped ${form.skipped} already in the list` : ''}.
					</p>
				{/if}
				<button
					type="submit"
					disabled={bulkAdding}
					class="mt-3 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
				>
					{bulkAdding ? 'Adding…' : 'Add businesses'}
				</button>
			</form>
		</div>

		<div class="mt-6 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/60">
			{#if data.businesses.length === 0}
				<p class="px-4 py-8 text-center text-sm text-ink-soft">No businesses added yet.</p>
			{/if}
			{#each data.businesses as business (business.id)}
				<div class="flex items-center gap-3 px-4 py-3">
					<a href={`/admin/businesses/${business.id}/edit`} class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-ink">{business.name}</p>
						{#if business.category}
							<p class="text-xs text-ink-soft">{business.category}</p>
						{/if}
					</a>
					{#if data.entryCounts[business.id]}
						<span
							class="shrink-0 rounded-full bg-pink/10 px-2.5 py-0.5 text-xs font-semibold text-pink-deep"
						>
							{data.entryCounts[business.id]} this week
						</span>
					{/if}
					<form method="POST" action="?/toggleActive" use:enhance>
						<input type="hidden" name="id" value={business.id} />
						<input type="hidden" name="nextValue" value={(!business.isActive).toString()} />
						<button
							type="submit"
							class={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
								business.isActive ? 'bg-ink/5 text-ink-soft' : 'bg-pink/10 text-pink-deep'
							}`}
						>
							{business.isActive ? 'Active' : 'Hidden'}
						</button>
					</form>
					<a
						href={`/admin/businesses/${business.id}/edit`}
						class="text-sm text-ink-soft hover:text-ink">Edit</a
					>
					<form
						method="POST"
						action="?/delete"
						use:enhance
						onsubmit={(e) => confirmDelete(e, business.name)}
					>
						<input type="hidden" name="id" value={business.id} />
						<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
					</form>
				</div>
			{/each}
		</div>
	</div>

	<div>
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-6">
			<h2 class="text-lg font-semibold text-ink">This week's entries</h2>
			<p class="mt-1 text-sm text-ink-soft">
				Week starting {data.weekStart} &mdash; resets every Monday.
			</p>

			<p class="mt-4 text-sm text-ink">
				<span class="font-semibold">{totalEntries}</span> entr{totalEntries === 1 ? 'y' : 'ies'} from
				<span class="font-semibold">{uniqueCustomers}</span> customer{uniqueCustomers === 1
					? ''
					: 's'}
			</p>

			{#if data.entries.length > 0}
				<ul class="mt-3 max-h-64 space-y-1.5 overflow-y-auto text-sm text-ink-soft">
					{#each data.entries as entry (entry.id)}
						<li class="flex items-center justify-between gap-2">
							<span class="truncate">{entry.customerName} &rarr; {entry.businessName}</span>
							<span class="shrink-0 text-xs text-ink-soft/60">{entry.choiceDate}</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-3 text-sm text-ink-soft">No entries yet this week.</p>
			{/if}

			{#if data.promotion}
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
							Winner: <span class="font-semibold">{form.winner.customerName}</span>
							<span class="text-ink-soft">({form.winner.customerEmail})</span> chose
							<span class="font-semibold">{form.winner.businessName}</span>
						</p>
					{/if}
					{#if form?.winnerMessage}
						<p class="mt-3 text-sm text-ink-soft">{form.winnerMessage}</p>
					{/if}
				</form>
			{/if}
		</div>
	</div>
</div>
