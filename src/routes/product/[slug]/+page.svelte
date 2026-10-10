<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { goto } from '$app/navigation';
	import { formatPence } from '$lib/utils/money';
	import { cart } from '$lib/stores/cart.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import PhotoFrame from '$lib/components/PhotoFrame.svelte';
	import ShopWindow from '$lib/components/shop/ShopWindow.svelte';
	import Shelf from '$lib/components/shop/Shelf.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FulfilmentBenefits from '$lib/components/FulfilmentBenefits.svelte';
	import { safeJsonLd } from '$lib/utils/json-ld';
	import { SITE_URL } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const product = $derived(data.product);
	const image = $derived(product.images[0]);
	// Anything beyond the main photo — shown as a row of thumbnails below it,
	// sized up as there are fewer of them so a single extra photo isn't a
	// tiny square floating under a big one.
	const extraImages = $derived(product.images.slice(1));
	const onSale = $derived(product.badge === 'sale' && product.salePricePence != null);
	const activeVariants = $derived(product.variants.filter((v) => v.isActive));

	let selectedVariantId = $state<number | null>(null);
	let quantity = $state(1);
	let justAdded = $state(false);

	// The photo stretches to match the details column. A little stretch is fine
	// (the photo just crops a touch more); a lot would chop the sides off, so
	// past this point the whole photo is shown over a soft blurred copy of itself.
	let frameWidth = $state(0);
	let frameHeight = $state(0);
	const stretched = $derived(frameWidth > 0 && frameHeight / frameWidth > 1.18);

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

	const productJsonLd = $derived(
		safeJsonLd({
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			description: product.description ?? undefined,
			url: `${SITE_URL}/product/${product.slug}`,
			image: image ? [`${SITE_URL}${image.url}`] : undefined,
			sku: product.slug,
			category: product.category.name,
			brand: { '@type': 'Brand', name: "Smashin' Bakes" },
			offers: {
				'@type': 'Offer',
				url: `${SITE_URL}/product/${product.slug}`,
				seller: { '@id': `${SITE_URL}/#bakery` },
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
	breadcrumbs={[
		{ name: 'Home', path: '/' },
		{ name: 'Shop', path: '/shop' },
		{ name: product.category.name, path: `/shop/${product.category.slug}` },
		{ name: product.name, path: `/product/${product.slug}` }
	]}
/>

<svelte:head>
	{@html `<script type="application/ld+json">${productJsonLd}<\/script>`}
</svelte:head>

<ShopWindow openingHours={data.openingHours}>
	<a
		href={`/shop/${product.category.slug}`}
		class="text-sm font-semibold text-ink-soft hover:text-ink"
	>
		&larr; {product.category.name}
	</a>

	<div class="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-12">
		<div class="flex flex-col">
			<!-- The square spacer sets the minimum height; on wide screens the photo
			     then grows to match whichever column is taller, so the two columns
			     line up at the top and bottom. -->
			<div
				class="relative flex-auto overflow-hidden rounded-[2rem] bg-cream-dim"
				bind:clientWidth={frameWidth}
				bind:clientHeight={frameHeight}
			>
				<div class="aspect-square w-full"></div>
				{#if image}
					{#if stretched}
						<img
							src={image.url}
							alt=""
							aria-hidden="true"
							class="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
						/>
					{/if}
					{#if stretched}
						<img
							src={image.url}
							alt={image.altText ?? product.name}
							class="absolute inset-0 h-full w-full object-contain"
						/>
					{:else}
						<div class="absolute inset-0">
							<PhotoFrame
								src={image.url}
								alt={image.altText ?? product.name}
								zoom={image.zoom ?? 100}
								focal={image.focalPoint ?? 'center'}
								class="h-full w-full"
							/>
						</div>
					{/if}
				{/if}
				{#if product.badge !== 'none'}
					<Badge kind={product.badge} />
				{/if}
			</div>

			{#if extraImages.length > 0}
				<div class="mt-4 flex gap-4">
					{#each extraImages as extra (extra.id)}
						<div
							class={`flex-1 overflow-hidden rounded-2xl bg-cream-dim ${
								extraImages.length === 1 ? 'aspect-[16/9]' : 'aspect-square'
							}`}
						>
							<img
								src={extra.url}
								alt={extra.altText ?? product.name}
								class="h-full w-full object-cover"
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex flex-col">
			<div class="flex flex-wrap items-center gap-3">
				<h1 class="font-display text-4xl text-ink sm:text-5xl">{product.name}</h1>
				{#if data.staff}
					<HelpLink
						section="products"
						title="Staff only: how to edit this product"
						task="edit-product"
						label="Staff help"
						staff
					/>
				{/if}
			</div>

			<p class="mt-4 flex items-baseline gap-3">
				{#if selectedVariant?.priceOverridePence != null}
					<span class="text-2xl font-semibold text-ink"
						>{formatPence(selectedVariant.priceOverridePence)}</span
					>
				{:else if onSale}
					<span class="text-2xl font-semibold text-pink-deep"
						>{formatPence(product.salePricePence!)}</span
					>
					<span class="text-lg text-ink-soft line-through"
						>{formatPence(product.basePricePence)}</span
					>
				{:else}
					<span class="text-2xl font-semibold text-ink">{formatPence(product.basePricePence)}</span>
				{/if}
			</p>

			{#if product.description}
				<p class="mt-6 max-w-md leading-relaxed text-ink-soft">{product.description}</p>
			{/if}

			<div class="mt-auto pt-8">
				<div class="rounded-3xl bg-blush p-6">
					{#if activeVariants.length > 0}
						<p class="text-base font-semibold text-ink">Choose an option</p>
						<div class="mt-3 flex flex-wrap gap-2.5">
							{#each activeVariants as variant (variant.id)}
								<button
									type="button"
									onclick={() => (selectedVariantId = variant.id)}
									class={`rounded-full border px-5 py-2.5 text-base font-semibold transition-colors ${
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

					<div class="mt-4 flex items-center gap-4">
						<p class="text-base font-semibold text-ink">Quantity</p>
						<div class="flex items-center rounded-full border border-ink/15 bg-white">
							<button
								type="button"
								onclick={() => (quantity = Math.max(1, quantity - 1))}
								class="grid h-11 w-11 place-items-center text-xl font-semibold text-ink hover:text-pink-deep"
								aria-label="Decrease quantity"
							>
								&minus;
							</button>
							<span class="w-8 text-center text-base font-semibold text-ink">{quantity}</span>
							<button
								type="button"
								onclick={() => (quantity = Math.min(20, quantity + 1))}
								class="grid h-11 w-11 place-items-center text-xl font-semibold text-ink hover:text-pink-deep"
								aria-label="Increase quantity"
							>
								+
							</button>
						</div>
					</div>

					<div class="mt-4 flex flex-wrap gap-3">
						<button
							type="button"
							onclick={buyNow}
							class="rounded-full bg-pink-deep px-8 py-3.5 text-base font-semibold text-cream transition-colors hover:bg-pink-darker"
						>
							Buy now &mdash; {formatPence(unitPricePence * quantity)}
						</button>
						<button
							type="button"
							onclick={addToCart}
							class="rounded-full border border-ink/15 bg-white/60 px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/30"
						>
							{justAdded ? 'Added ✓' : 'Add to cart'}
						</button>
					</div>
					<p class="mt-3 text-sm leading-snug text-ink-soft">
						Pay in person when you collect or it&rsquo;s delivered &mdash; online payment is coming
						soon.
					</p>
					<div class="mt-4">
						<FulfilmentBenefits variant="roomy" />
					</div>
				</div>
			</div>
		</div>
	</div>

	{#if data.staff}
		<div
			class="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-pink/40 px-4 py-3"
		>
			<p class="text-sm text-ink-soft">Staff only: add or remove photos on this page</p>
			<HelpLink
				section="products"
				task="product-photos"
				title="Staff only: how to add extra photos to this product"
				label="Staff help"
				staff
			/>
		</div>
	{/if}
	{#if data.related.length > 0}
		<Shelf
			label="You might also like"
			labelId="related"
			showCount={false}
			products={data.related}
			fit={data.related.length}
		/>
	{/if}
</ShopWindow>
