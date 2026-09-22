<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FulfilmentBenefits from '$lib/components/FulfilmentBenefits.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	title="Shop all bakes — Smashin' Bakes"
	description="Cupcakes, brownies, cookies, pies and cakes, baked fresh in Barrhead. Order online for Friday & Saturday pickup or free delivery."
/>

<section class="mx-auto max-w-6xl px-5 pt-14 pb-8 sm:px-8">
	<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">The full menu</p>
	<h1 class="mt-2 font-display text-4xl text-ink sm:text-5xl">Shop all bakes</h1>
	<p class="mt-4 leading-relaxed text-ink-soft">
		Everything we&rsquo;re baking this week. Pick your favourites and choose how to get them when
		you check out.
	</p>
	<div class="mt-5">
		<FulfilmentBenefits />
	</div>

	<nav class="mt-8 flex flex-wrap gap-2.5">
		<span class="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream">All</span>
		{#each data.categories as category (category.id)}
			<a
				href={`/shop/${category.slug}`}
				class="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
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
