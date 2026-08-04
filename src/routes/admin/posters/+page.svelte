<script lang="ts">
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
	<h1 class="font-display text-3xl text-ink">Posters</h1>
	<a
		href="/admin/posters/new"
		class="bg-pink hover:bg-pink-deep rounded-full px-4 py-2 text-sm font-semibold text-cream transition-colors"
	>
		+ New poster
	</a>
</div>
<p class="text-ink-soft mt-2 max-w-lg text-sm">
	Swappable heading + image + message blocks, like your Instagram announcement posts. Only one can
	be active at a time — it shows at the top of the homepage.
</p>

{#if data.posters.length === 0}
	<p class="text-ink-soft mt-10">No posters yet — create your first one.</p>
{:else}
	<div class="border-ink/10 mt-6 divide-y divide-ink/10 rounded-xl border bg-white/60">
		{#each data.posters as poster (poster.id)}
			<div class="flex items-center gap-4 px-4 py-3">
				<a href={`/admin/posters/${poster.id}/edit`} class="min-w-0 flex-1">
					<p class="text-ink truncate text-sm font-medium">{poster.heading}</p>
					<p class="text-ink-soft text-xs">{styleLabels[poster.style]}</p>
				</a>

				{#if poster.isActive}
					<form method="POST" action="?/deactivate" use:enhance>
						<input type="hidden" name="id" value={poster.id} />
						<button type="submit" class="bg-pink/15 text-pink-deep rounded-full px-3 py-1 text-xs font-semibold">
							Active
						</button>
					</form>
				{:else}
					<form method="POST" action="?/setActive" use:enhance>
						<input type="hidden" name="id" value={poster.id} />
						<button type="submit" class="bg-ink/5 text-ink-soft rounded-full px-3 py-1 text-xs font-semibold hover:bg-ink/10">
							Set active
						</button>
					</form>
				{/if}

				<a href={`/admin/posters/${poster.id}/edit`} class="text-ink-soft hover:text-ink text-sm">Edit</a>

				<form method="POST" action="?/delete" use:enhance onsubmit={(e) => confirmDelete(e, poster.heading)}>
					<input type="hidden" name="id" value={poster.id} />
					<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
				</form>
			</div>
		{/each}
	</div>
{/if}
