<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function confirmDelete(event: SubmitEvent, title: string) {
		if (!confirm(`Delete "${title}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Polls — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-2">
		<h1 class="font-display text-3xl text-ink">Flavour polls</h1>
		<HelpLink section="polls" task="flavour-poll" />
	</div>
	<a
		href="/admin/polls/new"
		class="rounded-full bg-pink-deep px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker"
	>
		+ New poll
	</a>
</div>
<p class="mt-2 max-w-lg text-sm text-ink-soft">
	Only one poll can be active at a time &mdash; it's what shows on <span
		class="font-medium text-ink">/vote</span
	>. Customers must be logged in to vote, and get exactly one vote per poll (up to 3 picks each) —
	so every vote doubles as a prize-draw entry. Once submitted, a customer's picks can't be changed.
</p>

{#if data.polls.length === 0}
	<p class="mt-10 text-ink-soft">No polls yet — create your first one.</p>
{:else}
	<div class="mt-6 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white/60">
		{#each data.polls as poll (poll.id)}
			<div class="flex items-center gap-4 px-4 py-3">
				<a href={`/admin/polls/${poll.id}/edit`} class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-ink">{poll.title}</p>
					<p class="text-xs text-ink-soft">
						{poll.options.length} options &middot; {poll.votes.length} votes
					</p>
				</a>

				{#if poll.isActive}
					<form method="POST" action="?/deactivate" use:enhance>
						<input type="hidden" name="id" value={poll.id} />
						<button
							type="submit"
							class="rounded-full bg-pink/15 px-3 py-1 text-xs font-semibold text-pink-deep"
						>
							Active
						</button>
					</form>
				{:else}
					<form method="POST" action="?/setActive" use:enhance>
						<input type="hidden" name="id" value={poll.id} />
						<button
							type="submit"
							class="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink-soft hover:bg-ink/10"
						>
							Set active
						</button>
					</form>
				{/if}

				<a href={`/admin/polls/${poll.id}/edit`} class="text-sm text-ink-soft hover:text-ink"
					>Edit</a
				>

				<form
					method="POST"
					action="?/delete"
					use:enhance
					onsubmit={(e) => confirmDelete(e, poll.title)}
				>
					<input type="hidden" name="id" value={poll.id} />
					<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
				</form>
			</div>
		{/each}
	</div>
{/if}
