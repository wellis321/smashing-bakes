<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import Badge from './Badge.svelte';
	import type { ProductCardData } from '$lib/types';

	let { product }: { product: ProductCardData } = $props();

	const image = $derived(product.images[0]);
	const onSale = $derived(product.badge === 'sale' && product.salePricePence != null);
</script>

<a
	href={`/product/${product.slug}`}
	class="group block"
	aria-label={`View ${product.name}`}
>
	<div class="relative overflow-hidden rounded-[1.75rem] bg-cream-dim">
		{#if image}
			<img
				src={image.url}
				alt={image.altText ?? product.name}
				loading="lazy"
				class="aspect-square w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
			/>
		{/if}
		{#if product.badge !== 'none'}
			<div class="absolute -top-1 -left-1 rotate-[-4deg]">
				<Badge kind={product.badge} />
			</div>
		{/if}
	</div>

	<div class="mt-4 flex items-start justify-between gap-3">
		<h3 class="font-display text-lg leading-tight text-ink">{product.name}</h3>
	</div>

	<p class="mt-1 flex items-baseline gap-2">
		{#if onSale}
			<span class="text-pink-deep font-semibold">{formatPence(product.salePricePence!)}</span>
			<span class="text-ink-soft/60 text-sm line-through">{formatPence(product.basePricePence)}</span>
		{:else}
			<span class="text-ink-soft font-medium">{formatPence(product.basePricePence)}</span>
		{/if}
	</p>
</a>
