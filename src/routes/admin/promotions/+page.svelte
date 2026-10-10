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
	<title>Promotions — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-2">
		<h1 class="font-display text-3xl text-ink">Promotions</h1>
		<HelpLink section="promotions" task="edit-promotion" />
	</div>
	<a
		href="/admin/promotions/new"
		class="rounded-full bg-pink-deep px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker"
	>
		+ New promotion
	</a>
</div>
<p class="mt-2 max-w-lg text-sm text-ink-soft">
	Giveaways, community shout-outs and seasonal offers. Publish one to give it a live page at
	<span class="font-medium text-ink">/promotions/[slug]</span>, and feature it to show it on the
	homepage.
</p>

{#if data.promotions.length === 0}
	<p class="mt-10 text-ink-soft">No promotions yet — create your first one.</p>
{:else}
	<div class="mt-6 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white/60">
		{#each data.promotions as promo (promo.id)}
			<div class="flex items-center gap-4 px-4 py-3">
				<a href={`/admin/promotions/${promo.id}/edit`} class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-ink">{promo.title}</p>
					<p class="text-xs text-ink-soft">/promotions/{promo.slug}</p>
				</a>

				{#if promo.isFeaturedOnHomepage}
					<span class="hidden text-xs text-ink-soft uppercase sm:inline">Featured</span>
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

				<a href={`/admin/promotions/${promo.id}/edit`} class="text-sm text-ink-soft hover:text-ink"
					>Edit</a
				>

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
