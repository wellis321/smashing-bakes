<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.category.name} — Smashin&rsquo; Bakes</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-14 pb-8 sm:px-8">
	<a href="/shop" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; All bakes</a>
	<h1 class="font-display mt-3 text-4xl text-ink sm:text-5xl">{data.category.name}</h1>
	{#if data.category.description}
		<p class="text-ink-soft mt-4 max-w-lg leading-relaxed">{data.category.description}</p>
	{/if}

	<nav class="mt-8 flex flex-wrap gap-2.5">
		<a
			href="/shop"
			class="text-ink-soft rounded-full border border-ink/10 px-4 py-2 text-sm font-medium transition-colors hover:border-ink/20 hover:text-ink"
		>
			All
		</a>
		{#each data.categories as category (category.id)}
			{#if category.slug === data.category.slug}
				<span class="bg-ink rounded-full px-4 py-2 text-sm font-semibold text-cream">{category.name}</span>
			{:else}
				<a
					href={`/shop/${category.slug}`}
					class="text-ink-soft rounded-full border border-ink/10 px-4 py-2 text-sm font-medium transition-colors hover:border-ink/20 hover:text-ink"
				>
					{category.name}
				</a>
			{/if}
		{/each}
	</nav>
</section>

<section class="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
	{#if data.products.length === 0}
		<p class="text-ink-soft py-16 text-center">Nothing baked in this category just yet — check back soon.</p>
	{:else}
		<div class="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
			{#each data.products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	{/if}
</section>
