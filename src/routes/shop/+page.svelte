<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Shop all bakes — Smashin&rsquo; Bakes</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-14 pb-8 sm:px-8">
	<p class="text-pink-deep text-sm font-semibold tracking-widest uppercase">The full menu</p>
	<h1 class="font-display mt-2 text-4xl text-ink sm:text-5xl">Shop all bakes</h1>
	<p class="text-ink-soft mt-4 max-w-lg leading-relaxed">
		Everything we&rsquo;re baking this week. Pick your favourites and choose Friday or Saturday
		pickup at checkout.
	</p>

	<nav class="mt-8 flex flex-wrap gap-2.5">
		<span class="bg-ink rounded-full px-4 py-2 text-sm font-semibold text-cream">All</span>
		{#each data.categories as category (category.id)}
			<a
				href={`/shop/${category.slug}`}
				class="text-ink-soft rounded-full border border-ink/10 px-4 py-2 text-sm font-medium transition-colors hover:border-ink/20 hover:text-ink"
			>
				{category.name}
			</a>
		{/each}
	</nav>
</section>

<section class="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
	<div class="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
		{#each data.products as product (product.id)}
			<ProductCard {product} />
		{/each}
	</div>
</section>
