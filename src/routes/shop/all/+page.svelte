<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ShopWindow from '$lib/components/shop/ShopWindow.svelte';
	import ShopHeader from '$lib/components/shop/ShopHeader.svelte';
	import PhotoFrame from '$lib/components/PhotoFrame.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { formatPence } from '$lib/utils/money';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let justAdded = $state<number | null>(null);
	let announcement = $state('');

	const hasOptions = $derived(new Set(data.withOptions));

	const shown = $derived(
		data.products.filter((p) => {
			const q = search.trim().toLowerCase();
			return (
				q === '' || p.name.toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q)
			);
		})
	);

	const onSale = (p: (typeof data.products)[number]) =>
		p.badge === 'sale' && p.salePricePence != null;
	const price = (p: (typeof data.products)[number]) =>
		onSale(p) ? p.salePricePence! : p.basePricePence;
	const inCart = (id: number) =>
		cart.items.filter((i) => i.productId === id).reduce((n, i) => n + i.quantity, 0);

	function add(p: (typeof data.products)[number]) {
		cart.add({
			productId: p.id,
			variantId: null,
			slug: p.slug,
			name: p.name,
			variantName: null,
			unitPricePence: price(p),
			imageUrl: p.images[0]?.url ?? null
		});
		justAdded = p.id;
		announcement = `${p.name} added to your cart.`;
		setTimeout(() => {
			if (justAdded === p.id) justAdded = null;
		}, 1800);
	}
</script>

<SeoHead
	title="All bakes at a glance — Smashin' Bakes"
	description="Every bake from Smashin' Bakes in one simple list, with quick add to cart."
	noindex
/>

<ShopWindow openingHours={data.openingHours}>
	<ShopHeader
		eyebrow="Quick order"
		title="All the bakes"
		intro="Everything in one list. Tap Add to cart to order straight away, or Details to see a bake up close."
		categories={data.categories}
	>
		{#snippet help()}
			{#if data.staff}
				<HelpLink
					section="products"
					title="Staff only: how to manage products"
					task="edit-product"
					label="Staff help"
					staff
				/>
			{/if}
		{/snippet}
	</ShopHeader>

	<div class="mx-auto mt-8 flex max-w-xl items-center gap-3">
		<label for="bake-search" class="sr-only">Search the bakes</label>
		<input
			id="bake-search"
			type="search"
			bind:value={search}
			placeholder="Search the bakes, e.g. &ldquo;Oreo&rdquo;&hellip;"
			class="w-full rounded-full border border-ink/15 bg-white px-5 py-3 text-base outline-none focus:ring-2 focus:ring-pink/40"
		/>
	</div>
	<p class="mt-2 text-center text-sm text-ink-soft" aria-live="polite">
		{shown.length}
		{shown.length === 1 ? 'bake' : 'bakes'}{search.trim() ? ' match' : ''}
	</p>
	<p class="sr-only" aria-live="polite">{announcement}</p>

	{#if shown.length === 0}
		<p class="py-16 text-center text-ink-soft">Nothing matches that search.</p>
	{:else}
		<ul class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
			{#each shown as p (p.id)}
				{@const image = p.images[0]}
				{@const count = inCart(p.id)}
				<li class="flex">
					<article
						class="flex w-full flex-col overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white/80 shadow-soft"
					>
						<a href={`/product/${p.slug}`} class="relative block" tabindex="-1" aria-hidden="true">
							{#if image}
								<PhotoFrame
									src={image.url}
									alt=""
									sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
									widths={[320, 480, 640]}
									defaultWidth={320}
									zoom={image.zoom ?? 100}
									focal={image.focalPoint ?? 'center'}
									class="aspect-square w-full"
								/>
							{:else}
								<div class="aspect-square w-full bg-blush"></div>
							{/if}
							{#if p.badge !== 'none'}
								<Badge kind={p.badge} />
							{/if}
						</a>

						<div class="flex flex-1 flex-col p-3 sm:p-4">
							<h2 class="font-display text-base leading-tight text-ink sm:text-lg">
								<a href={`/product/${p.slug}`} class="hover:text-pink-deep">{p.name}</a>
							</h2>
							<p class="mt-1 flex items-baseline gap-2 text-sm">
								<span class="font-semibold {onSale(p) ? 'text-pink-deep' : 'text-ink'}"
									>{formatPence(price(p))}</span
								>
								{#if onSale(p)}
									<span class="text-xs text-ink-soft line-through"
										>{formatPence(p.basePricePence)}</span
									>
								{/if}
							</p>

							<div class="mt-3 flex flex-1 flex-col justify-end gap-2">
								{#if hasOptions.has(p.id)}
									<a
										href={`/product/${p.slug}`}
										class="rounded-full bg-pink-deep px-3 py-2 text-center text-sm font-semibold text-cream transition-colors hover:bg-pink-darker"
									>
										Choose options<span class="sr-only"> for {p.name}</span>
									</a>
								{:else}
									<button
										type="button"
										onclick={() => add(p)}
										class="rounded-full px-3 py-2 text-sm font-semibold transition-colors {justAdded ===
										p.id
											? 'bg-green-700 text-white'
											: 'bg-pink-deep text-cream hover:bg-pink-darker'}"
									>
										{justAdded === p.id ? 'Added ✓' : 'Add to cart'}<span class="sr-only">
											— {p.name}</span
										>
									</button>
									<a
										href={`/product/${p.slug}`}
										class="rounded-full border border-ink/15 px-3 py-1.5 text-center text-sm font-semibold text-ink transition-colors hover:border-pink hover:text-pink-deep"
									>
										Details<span class="sr-only"> of {p.name}</span>
									</a>
								{/if}
								{#if count > 0}
									<p class="text-center text-xs font-semibold text-ink-soft">
										{count} in your cart
									</p>
								{/if}
							</div>
						</div>
					</article>
				</li>
			{/each}
		</ul>
	{/if}
</ShopWindow>

{#if cart.count > 0}
	<div
		class="fixed inset-x-0 bottom-4 z-30 mx-auto flex w-[min(34rem,calc(100%-2rem))] items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-cream shadow-soft"
		role="region"
		aria-label="Your cart"
	>
		<p class="text-sm font-semibold">
			{cart.count} in your cart
			<span class="font-normal text-cream/90">· {formatPence(cart.subtotalPence)}</span>
		</p>
		<div class="flex items-center gap-3">
			<a
				href="/cart"
				class="text-sm font-semibold underline decoration-cream/40 underline-offset-4 hover:decoration-cream"
				>View cart</a
			>
			<a
				href="/checkout"
				class="rounded-full bg-pink-deep px-4 py-1.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker"
				>Checkout</a
			>
		</div>
	</div>
{/if}
