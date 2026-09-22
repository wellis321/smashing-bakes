<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatPence } from '$lib/utils/money';
	import { cart } from '$lib/stores/cart.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FulfilmentBenefits from '$lib/components/FulfilmentBenefits.svelte';
	import { safeJsonLd } from '$lib/utils/json-ld';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const product = $derived(data.product);
	const image = $derived(product.images[0]);
	const onSale = $derived(product.badge === 'sale' && product.salePricePence != null);
	const activeVariants = $derived(product.variants.filter((v) => v.isActive));

	let selectedVariantId = $state<number | null>(null);
	let quantity = $state(1);
	let justAdded = $state(false);

	$effect(() => {
		// Reset per-product state when navigating between products (e.g. via
		// "You might also like") rather than carrying over a stale selection.
		product.id;
		selectedVariantId = activeVariants[0]?.id ?? null;
		quantity = 1;
		justAdded = false;
	});

	const selectedVariant = $derived(activeVariants.find((v) => v.id === selectedVariantId) ?? null);
	const unitPricePence = $derived(
		selectedVariant?.priceOverridePence ??
			(onSale ? product.salePricePence! : product.basePricePence)
	);

	function currentCartItem() {
		return {
			productId: product.id,
			variantId: selectedVariant?.id ?? null,
			slug: product.slug,
			name: product.name,
			variantName: selectedVariant?.name ?? null,
			unitPricePence,
			imageUrl: image?.url ?? null
		};
	}

	function addToCart() {
		cart.add(currentCartItem(), quantity);
		justAdded = true;
		setTimeout(() => (justAdded = false), 2000);
	}

	function buyNow() {
		cart.add(currentCartItem(), quantity);
		goto('/checkout');
	}

	// Match the column count to how many related products there actually are, so a
	// short row never leaves a gap of empty columns on the right.
	const relatedColsClass = $derived(
		data.related.length === 2
			? 'sm:grid-cols-2'
			: data.related.length === 1
				? 'sm:grid-cols-1'
				: 'sm:grid-cols-3'
	);

	const productJsonLd = $derived(
		safeJsonLd({
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			description: product.description ?? undefined,
			image: image ? [image.url] : undefined,
			offers: {
				'@type': 'Offer',
				priceCurrency: 'GBP',
				price: ((onSale ? product.salePricePence! : product.basePricePence) / 100).toFixed(2),
				availability: product.isActive
					? 'https://schema.org/InStock'
					: 'https://schema.org/OutOfStock'
			}
		})
	);
</script>

<SeoHead
	title={`${product.name} — Smashin' Bakes`}
	description={product.description ?? `${product.name}, baked fresh in Barrhead by Smashin' Bakes.`}
	image={image?.url}
	type="product"
/>

<svelte:head>
	{@html `<script type="application/ld+json">${productJsonLd}<\/script>`}
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8">
	<a
		href={`/shop/${product.category.slug}`}
		class="text-sm font-semibold text-ink-soft hover:text-ink"
	>
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
				{#if selectedVariant?.priceOverridePence != null}
					<span class="text-2xl font-semibold text-ink"
						>{formatPence(selectedVariant.priceOverridePence)}</span
					>
				{:else if onSale}
					<span class="text-2xl font-semibold text-pink-deep"
						>{formatPence(product.salePricePence!)}</span
					>
					<span class="text-lg text-ink-soft/60 line-through"
						>{formatPence(product.basePricePence)}</span
					>
				{:else}
					<span class="text-2xl font-semibold text-ink">{formatPence(product.basePricePence)}</span>
				{/if}
			</p>

			{#if product.description}
				<p class="mt-6 max-w-md leading-relaxed text-ink-soft">{product.description}</p>
			{/if}

			<div class="mt-8 max-w-md rounded-2xl bg-blush p-6">
				{#if activeVariants.length > 0}
					<p class="text-sm font-semibold text-ink">Choose an option</p>
					<div class="mt-2.5 flex flex-wrap gap-2">
						{#each activeVariants as variant (variant.id)}
							<button
								type="button"
								onclick={() => (selectedVariantId = variant.id)}
								class={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
									selectedVariantId === variant.id
										? 'border-pink bg-pink text-cream'
										: 'border-ink/15 bg-white text-ink hover:border-ink/30'
								}`}
							>
								{variant.name}
							</button>
						{/each}
					</div>
				{/if}

				<div class="mt-4 flex items-center gap-3">
					<p class="text-sm font-semibold text-ink">Quantity</p>
					<div class="flex items-center rounded-full border border-ink/15 bg-white">
						<button
							type="button"
							onclick={() => (quantity = Math.max(1, quantity - 1))}
							class="grid h-9 w-9 place-items-center text-lg font-semibold text-ink hover:text-pink-deep"
							aria-label="Decrease quantity"
						>
							&minus;
						</button>
						<span class="w-6 text-center text-sm font-semibold text-ink">{quantity}</span>
						<button
							type="button"
							onclick={() => (quantity = Math.min(20, quantity + 1))}
							class="grid h-9 w-9 place-items-center text-lg font-semibold text-ink hover:text-pink-deep"
							aria-label="Increase quantity"
						>
							+
						</button>
					</div>
				</div>

				<div class="mt-5 flex flex-wrap gap-3">
					<button
						type="button"
						onclick={buyNow}
						class="rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep"
					>
						Buy now &mdash; {formatPence(unitPricePence * quantity)}
					</button>
					<button
						type="button"
						onclick={addToCart}
						class="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
					>
						{justAdded ? 'Added ✓' : 'Add to cart'}
					</button>
				</div>
				<p class="mt-3 text-xs text-ink-soft/70">
					Pay in person when you collect or it&rsquo;s delivered &mdash; online payment is coming
					soon.
				</p>
				<div class="mt-4">
					<FulfilmentBenefits variant="compact" />
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
