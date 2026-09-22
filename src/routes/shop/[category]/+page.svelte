<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FulfilmentBenefits from '$lib/components/FulfilmentBenefits.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	title={`${data.category.name} — Smashin' Bakes`}
	description={`${data.category.name} baked fresh in Barrhead — order online for Friday & Saturday pickup or free delivery.`}
/>

<section class="mx-auto max-w-6xl px-5 pt-14 pb-8 sm:px-8">
	<a href="/shop" class="text-sm font-semibold text-ink-soft hover:text-ink">&larr; All bakes</a>
	<h1 class="mt-3 font-display text-4xl text-ink sm:text-5xl">{data.category.name}</h1>
	{#if data.category.description}
		<p class="mt-4 leading-relaxed text-ink-soft">{data.category.description}</p>
	{/if}
	<div class="mt-5">
		<FulfilmentBenefits />
	</div>

	<nav class="mt-8 flex flex-wrap gap-2.5">
		<a
			href="/shop"
			class="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
		>
			All
		</a>
		{#each data.categories as category (category.id)}
			{#if category.slug === data.category.slug}
				<span class="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream"
					>{category.name}</span
				>
			{:else}
				<a
					href={`/shop/${category.slug}`}
					class="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
				>
					{category.name}
				</a>
			{/if}
		{/each}
	</nav>
</section>

<section class="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
	{#if data.products.length === 0}
		<p class="py-16 text-center text-ink-soft">
			Nothing baked in this category just yet — check back soon.
		</p>
	{:else}
		<div class="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
			{#each data.products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	{/if}
</section>
