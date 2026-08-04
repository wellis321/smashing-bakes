<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import Badge from '$lib/components/Badge.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const product = $derived(data.product);
	const image = $derived(product.images[0]);
	const onSale = $derived(product.badge === 'sale' && product.salePricePence != null);

	// Match the column count to how many related products there actually are, so a
	// short row never leaves a gap of empty columns on the right.
	const relatedColsClass = $derived(
		data.related.length === 2 ? 'sm:grid-cols-2' : data.related.length === 1 ? 'sm:grid-cols-1' : 'sm:grid-cols-3'
	);
</script>

<svelte:head>
	<title>{product.name} — Smashin&rsquo; Bakes</title>
	<meta name="description" content={product.description ?? ''} />
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8">
	<a href={`/shop/${product.category.slug}`} class="text-ink-soft hover:text-ink text-sm font-semibold">
		&larr; {product.category.name}
	</a>

	<div class="mt-6 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
		<div class="relative overflow-hidden rounded-[2rem]">
			{#if image}
				<img
					src={image.url}
					alt={image.altText ?? product.name}
					class="aspect-square w-full object-cover"
				/>
			{/if}
			{#if product.badge !== 'none'}
				<Badge kind={product.badge} />
			{/if}
		</div>

		<div class="lg:pt-4">
			<h1 class="font-display text-4xl text-ink sm:text-5xl">{product.name}</h1>

			<p class="mt-4 flex items-baseline gap-3">
				{#if onSale}
					<span class="text-pink-deep text-2xl font-semibold">{formatPence(product.salePricePence!)}</span>
					<span class="text-ink-soft/60 text-lg line-through">{formatPence(product.basePricePence)}</span>
				{:else}
					<span class="text-ink text-2xl font-semibold">{formatPence(product.basePricePence)}</span>
				{/if}
			</p>

			{#if product.description}
				<p class="text-ink-soft mt-6 max-w-md leading-relaxed">{product.description}</p>
			{/if}

			<div class="bg-blush mt-8 max-w-md rounded-2xl p-6">
				<p class="font-display text-lg text-ink">Reserve this for pickup</p>
				<p class="text-ink-soft mt-2 text-sm leading-relaxed">
					Online ordering is on its way. For now, message us on Instagram or Facebook with what
					you&rsquo;d like and your preferred pickup day &mdash; Friday or Saturday.
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<a
						href="https://www.instagram.com/smashinbakes"
						target="_blank"
						rel="noreferrer"
						class="bg-pink hover:bg-pink-deep rounded-full px-5 py-2.5 text-sm font-semibold text-cream transition-colors"
					>
						Message on Instagram
					</a>
					<a
						href="https://www.facebook.com/p/Smashin-Bakes-61588572510001/?locale=en_GB"
						target="_blank"
						rel="noreferrer"
						class="text-ink rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink/30"
					>
						Message on Facebook
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

{#if data.related.length > 0}
	<section class="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
		<h2 class="font-display text-3xl text-ink">You might also like</h2>
		<div class={`mt-8 grid grid-cols-2 gap-x-6 gap-y-10 ${relatedColsClass}`}>
			{#each data.related as related (related.id)}
				<ProductCard product={related} />
			{/each}
		</div>
	</section>
{/if}
