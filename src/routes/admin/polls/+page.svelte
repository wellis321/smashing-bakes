<script lang="ts">
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
	<h1 class="font-display text-3xl text-ink">Flavour polls</h1>
	<a
		href="/admin/polls/new"
		class="bg-pink hover:bg-pink-deep rounded-full px-4 py-2 text-sm font-semibold text-cream transition-colors"
	>
		+ New poll
	</a>
</div>
<p class="text-ink-soft mt-2 max-w-lg text-sm">
	Only one poll can be active at a time &mdash; it's what shows on <span class="text-ink font-medium">/vote</span>.
	Customers must be logged in to vote, and get exactly one vote per poll (up to 3 picks each) — so
	every vote doubles as a prize-draw entry. Once submitted, a customer's picks can't be changed.
</p>

{#if data.polls.length === 0}
	<p class="text-ink-soft mt-10">No polls yet — create your first one.</p>
{:else}
	<div class="border-ink/10 mt-6 divide-y divide-ink/10 rounded-xl border bg-white/60">
		{#each data.polls as poll (poll.id)}
			<div class="flex items-center gap-4 px-4 py-3">
				<a href={`/admin/polls/${poll.id}/edit`} class="min-w-0 flex-1">
					<p class="text-ink truncate text-sm font-medium">{poll.title}</p>
					<p class="text-ink-soft text-xs">{poll.options.length} options &middot; {poll.votes.length} votes</p>
				</a>

				{#if poll.isActive}
					<form method="POST" action="?/deactivate" use:enhance>
						<input type="hidden" name="id" value={poll.id} />
						<button type="submit" class="bg-pink/15 text-pink-deep rounded-full px-3 py-1 text-xs font-semibold">
							Active
						</button>
					</form>
				{:else}
					<form method="POST" action="?/setActive" use:enhance>
						<input type="hidden" name="id" value={poll.id} />
						<button type="submit" class="bg-ink/5 text-ink-soft rounded-full px-3 py-1 text-xs font-semibold hover:bg-ink/10">
							Set active
						</button>
					</form>
				{/if}

				<a href={`/admin/polls/${poll.id}/edit`} class="text-ink-soft hover:text-ink text-sm">Edit</a>

				<form method="POST" action="?/delete" use:enhance onsubmit={(e) => confirmDelete(e, poll.title)}>
					<input type="hidden" name="id" value={poll.id} />
					<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
				</form>
			</div>
		{/each}
	</div>
{/if}
