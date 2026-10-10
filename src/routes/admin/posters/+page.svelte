<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const styleLabels: Record<string, string> = {
		announcement: 'Announcement',
		'sold-out': 'Sold out',
		celebration: 'Celebration',
		general: 'General'
	};

	function confirmDelete(event: SubmitEvent, heading: string) {
		if (!confirm(`Delete "${heading}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Posters — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-2">
		<h1 class="font-display text-3xl text-ink">Posters</h1>
		<HelpLink section="posters" task="banner" />
	</div>
	<div class="flex items-center gap-3">
		<HelpLink
			section="posters"
			task="new-banner"
			label="Add a banner"
			title="How to add a new homepage banner"
		/>
		<a
			href="/admin/posters/new"
			class="rounded-full bg-pink-deep px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker"
		>
			+ New poster
		</a>
	</div>
</div>
<p class="mt-2 max-w-lg text-sm text-ink-soft">
	Swappable heading + image + message blocks, like your Instagram announcement posts. Only one can
	be active at a time — it shows at the top of the homepage.
</p>

{#if data.posters.length === 0}
	<p class="mt-10 text-ink-soft">No posters yet — create your first one.</p>
{:else}
	<div class="mt-6 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white/60">
		{#each data.posters as poster (poster.id)}
			<div class="flex items-center gap-4 px-4 py-3">
				<a href={`/admin/posters/${poster.id}/edit`} class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-ink">{poster.heading}</p>
					<p class="text-xs text-ink-soft">{styleLabels[poster.style]}</p>
				</a>

				{#if poster.isActive}
					<form method="POST" action="?/deactivate" use:enhance>
						<input type="hidden" name="id" value={poster.id} />
						<button
							type="submit"
							class="rounded-full bg-pink/15 px-3 py-1 text-xs font-semibold text-pink-deep"
						>
							Active
						</button>
					</form>
				{:else}
					<form method="POST" action="?/setActive" use:enhance>
						<input type="hidden" name="id" value={poster.id} />
						<button
							type="submit"
							class="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink-soft hover:bg-ink/10"
						>
							Set active
						</button>
					</form>
				{/if}

				<a href={`/admin/posters/${poster.id}/edit`} class="text-sm text-ink-soft hover:text-ink"
					>Edit</a
				>

				<form
					method="POST"
					action="?/delete"
					use:enhance
					onsubmit={(e) => confirmDelete(e, poster.heading)}
				>
					<input type="hidden" name="id" value={poster.id} />
					<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
				</form>
			</div>
		{/each}
	</div>
{/if}
