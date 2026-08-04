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
	<title>Promotions — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<h1 class="font-display text-3xl text-ink">Promotions</h1>
	<a
		href="/admin/promotions/new"
		class="bg-pink hover:bg-pink-deep rounded-full px-4 py-2 text-sm font-semibold text-cream transition-colors"
	>
		+ New promotion
	</a>
</div>
<p class="text-ink-soft mt-2 max-w-lg text-sm">
	Giveaways, community shout-outs and seasonal offers. Publish one to give it a live page at
	<span class="text-ink font-medium">/promotions/[slug]</span>, and feature it to show it on the homepage.
</p>

{#if data.promotions.length === 0}
	<p class="text-ink-soft mt-10">No promotions yet — create your first one.</p>
{:else}
	<div class="border-ink/10 mt-6 divide-y divide-ink/10 rounded-xl border bg-white/60">
		{#each data.promotions as promo (promo.id)}
			<div class="flex items-center gap-4 px-4 py-3">
				<a href={`/admin/promotions/${promo.id}/edit`} class="min-w-0 flex-1">
					<p class="text-ink truncate text-sm font-medium">{promo.title}</p>
					<p class="text-ink-soft text-xs">/promotions/{promo.slug}</p>
				</a>

				{#if promo.isFeaturedOnHomepage}
					<span class="text-ink-soft hidden text-xs uppercase sm:inline">Featured</span>
				{/if}

				<form method="POST" action="?/togglePublished" use:enhance>
					<input type="hidden" name="id" value={promo.id} />
					<input type="hidden" name="nextValue" value={(!promo.isPublished).toString()} />
					<button
						type="submit"
						class={`rounded-full px-3 py-1 text-xs font-semibold ${
							promo.isPublished ? 'bg-ink/5 text-ink-soft' : 'bg-pink/10 text-pink-deep'
						}`}
					>
						{promo.isPublished ? 'Published' : 'Draft'}
					</button>
				</form>

				<a href={`/admin/promotions/${promo.id}/edit`} class="text-ink-soft hover:text-ink text-sm">Edit</a>

				<form
					method="POST"
					action="?/delete"
					use:enhance
					onsubmit={(e) => confirmDelete(e, promo.title)}
				>
					<input type="hidden" name="id" value={promo.id} />
					<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
				</form>
			</div>
		{/each}
	</div>
{/if}
