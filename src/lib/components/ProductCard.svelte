<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import Badge from './Badge.svelte';
	import PhotoFrame from './PhotoFrame.svelte';
	import type { ProductCardData } from '$lib/types';

	let { product }: { product: ProductCardData } = $props();

	const image = $derived(product.images[0]);
	const onSale = $derived(product.badge === 'sale' && product.salePricePence != null);
</script>

<a href={`/product/${product.slug}`} class="group block">
	<div class="relative overflow-hidden rounded-[1.75rem] bg-cream-dim">
		{#if image}
			<PhotoFrame
				src={image.url}
				alt=""
				zoom={image.zoom ?? 100}
				focal={image.focalPoint ?? 'center'}
				class="aspect-square w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
			/>
		{/if}
		{#if product.badge !== 'none'}
			<Badge kind={product.badge} />
		{/if}
	</div>

	<div class="mt-4 flex items-start justify-between gap-3">
		<h3 class="font-display text-lg leading-tight text-ink">{product.name}</h3>
	</div>

	<p class="mt-1 flex items-baseline gap-2">
		{#if onSale}
			<span class="font-semibold text-pink-deep">{formatPence(product.salePricePence!)}</span>
			<span class="text-sm text-ink-soft line-through"
				>{formatPence(product.basePricePence)}</span
			>
		{:else}
			<span class="font-medium text-ink-soft">{formatPence(product.basePricePence)}</span>
		{/if}
	</p>
</a>
