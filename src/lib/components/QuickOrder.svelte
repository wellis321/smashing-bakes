<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { cart } from '$lib/stores/cart.svelte';
	import { formatPence } from '$lib/utils/money';
	import PhotoFrame from '$lib/components/PhotoFrame.svelte';
	import { scale } from 'svelte/transition';

	// A "Quick order" tab fixed to the corner of every page. It opens a panel with
	// every available bake, so a customer can add what they want without leaving
	// the page they're on.
	type Item = {
		id: number;
		slug: string;
		name: string;
		category: string;
		pricePence: number;
		wasPence: number | null;
		badge: 'none' | 'sale' | 'new';
		imageUrl: string | null;
		zoom: number;
		focal: string;
		hasOptions: boolean;
	};

	let open = $state(false);
	let items = $state<Item[] | null>(null);
	let loading = $state(false);
	let failed = $state(false);
	let search = $state('');
	let justAdded = $state<number | null>(null);
	let announcement = $state('');
	let closeButton: HTMLButtonElement | undefined = $state();
	let launcher: HTMLButtonElement | undefined = $state();
	// The bake whose photo is being hovered, shown big beside the panel.
	let preview = $state<Item | null>(null);

	function peek(item: Item | null) {
		// Hovering only exists with a mouse; touch screens just open the bake.
		if (item && !window.matchMedia('(hover: hover)').matches) return;
		preview = item;
	}

	// The cart and checkout pages already are the ordering step.
	const hidden = $derived(
		page.url.pathname.startsWith('/cart') || page.url.pathname.startsWith('/checkout')
	);

	const shown = $derived(
		(items ?? []).filter((i) => {
			const q = search.trim().toLowerCase();
			return q === '' || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
		})
	);

	const inCart = (id: number) =>
		cart.items
			.filter((i) => i.productId === id && i.variantId === null)
			.reduce((n, i) => n + i.quantity, 0);

	async function load() {
		if (items || loading) return;
		loading = true;
		failed = false;
		try {
			const res = await fetch('/api/quick-order');
			if (!res.ok) throw new Error('bad response');
			items = (await res.json()).items;
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	}

	async function openPanel() {
		open = true;
		void load();
		await tick();
		closeButton?.focus();
	}

	function closePanel() {
		open = false;
		preview = null;
		launcher?.focus();
	}

	function add(i: Item) {
		cart.add({
			productId: i.id,
			variantId: null,
			slug: i.slug,
			name: i.name,
			variantName: null,
			unitPricePence: i.pricePence,
			imageUrl: i.imageUrl
		});
		justAdded = i.id;
		announcement = `${i.name} added to your cart.`;
		setTimeout(() => {
			if (justAdded === i.id) justAdded = null;
		}, 1500);
	}

	function onKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') closePanel();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if !hidden}
	<button
		bind:this={launcher}
		type="button"
		onclick={openPanel}
		aria-haspopup="dialog"
		class="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-pink-deep px-5 py-3 text-sm font-semibold text-cream shadow-soft transition-colors hover:bg-pink-darker print:hidden"
	>
		<svg
			width="18"
			height="18"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			aria-hidden="true"
		>
			<path d="M3 4h2l1.6 8h8.2l1.4-6H6" stroke-linecap="round" stroke-linejoin="round" />
			<circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
			<circle cx="14" cy="16" r="1.2" fill="currentColor" stroke="none" />
		</svg>
		Quick order
		{#if cart.count > 0}
			<span class="rounded-full bg-cream px-2 py-0.5 text-xs font-bold text-pink-deep"
				>{cart.count}</span
			>
		{/if}
	</button>
{/if}

{#if open}
	<div class="fixed inset-0 z-50 print:hidden">
		<button
			type="button"
			class="absolute inset-0 bg-ink/50"
			aria-label="Close the quick order panel"
			tabindex="-1"
			onclick={closePanel}
		></button>

		<div
			role="dialog"
			aria-modal="true"
			aria-label="Quick order: every bake"
			class="absolute inset-x-0 right-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl bg-cream shadow-soft sm:inset-y-0 sm:left-auto sm:max-h-none sm:w-[26rem] sm:rounded-none sm:rounded-l-3xl"
		>
			<div class="flex items-center justify-between gap-3 px-4 pt-3">
				<h2 class="font-display text-xl text-ink">Quick order</h2>
				<button
					bind:this={closeButton}
					type="button"
					onclick={closePanel}
					class="grid h-10 w-10 place-items-center rounded-full text-2xl text-ink-soft hover:bg-blush hover:text-ink"
				>
					<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>
				</button>
			</div>

			<div class="px-4 pt-1">
				<label for="quick-search" class="sr-only">Search the bakes</label>
				<input
					id="quick-search"
					type="search"
					bind:value={search}
					placeholder="Search the bakes…"
					class="w-full rounded-full border border-ink/15 bg-white px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-pink/40"
				/>
			</div>
			<p class="sr-only" aria-live="polite">{announcement}</p>

			<div class="mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-3">
				{#if loading}
					<p class="px-3 py-10 text-center text-ink-soft">Fetching the bakes…</p>
				{:else if failed}
					<p class="px-3 py-10 text-center text-ink-soft">
						Sorry, the list didn&rsquo;t load.
						<button type="button" onclick={load} class="font-semibold text-pink-deep underline"
							>Try again</button
						>
					</p>
				{:else if shown.length === 0}
					<p class="px-3 py-10 text-center text-ink-soft">Nothing matches that search.</p>
				{:else}
					<ul>
						{#each shown as i (i.id)}
							{@const n = inCart(i.id)}
							<li class="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-blush/50">
								<a
									href={`/product/${i.slug}`}
									onclick={closePanel}
									onpointerenter={() => peek(i)}
									onpointerleave={() => peek(null)}
									class="shrink-0"
									tabindex="-1"
									aria-hidden="true"
								>
									<span
										class="block h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-soft"
									>
										{#if i.imageUrl}
											<PhotoFrame
												src={i.imageUrl}
												alt=""
												sizes="56px"
												widths={[160, 320]}
												defaultWidth={160}
												zoom={i.zoom}
												focal={i.focal}
												class="h-full w-full rounded-full"
											/>
										{:else}
											<span class="block h-full w-full bg-blush"></span>
										{/if}
									</span>
								</a>

								<div class="min-w-0 flex-1">
									<a
										href={`/product/${i.slug}`}
										onclick={closePanel}
										class="block font-display text-base leading-tight text-ink hover:text-pink-deep"
										>{i.name}</a
									>
									<p class="mt-0.5 flex items-baseline gap-2 text-sm">
										<span class="font-semibold {i.wasPence ? 'text-pink-deep' : 'text-ink'}"
											>{formatPence(i.pricePence)}</span
										>
										{#if i.wasPence}
											<span class="text-xs text-ink-soft line-through"
												>{formatPence(i.wasPence)}</span
											>
										{/if}
										{#if i.badge === 'new'}
											<span
												class="rounded-full bg-gold px-1.5 text-[0.65rem] font-bold text-ink uppercase"
												>New</span
											>
										{/if}
									</p>
								</div>

								{#if i.hasOptions}
									<a
										href={`/product/${i.slug}`}
										onclick={closePanel}
										class="shrink-0 rounded-full border border-pink-deep px-3 py-1.5 text-sm font-semibold text-pink-deep hover:bg-pink-deep hover:text-cream"
									>
										Options<span class="sr-only"> for {i.name}</span>
									</a>
								{:else if n > 0}
									<div
										class="flex shrink-0 items-center gap-1 rounded-full bg-white px-1 py-1 shadow-soft"
									>
										<button
											type="button"
											onclick={() => cart.setQuantity(i.id, null, n - 1)}
											class="grid h-8 w-8 place-items-center rounded-full text-lg font-bold text-ink hover:bg-blush"
										>
											<span aria-hidden="true">−</span><span class="sr-only"
												>One fewer {i.name}</span
											>
										</button>
										<span class="w-6 text-center text-sm font-bold text-ink"
											>{n}<span class="sr-only"> in your cart</span></span
										>
										<button
											type="button"
											onclick={() => add(i)}
											class="grid h-8 w-8 place-items-center rounded-full bg-pink-deep text-lg font-bold text-cream hover:bg-pink-darker"
										>
											<span aria-hidden="true">+</span><span class="sr-only">One more {i.name}</span
											>
										</button>
									</div>
								{:else}
									<button
										type="button"
										onclick={() => add(i)}
										class="shrink-0 rounded-full bg-pink-deep px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker"
									>
										Add<span class="sr-only"> {i.name} to cart</span>
									</button>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="border-t border-ink/10 bg-white/70 px-5 py-4">
				{#if cart.count > 0}
					<div class="flex items-center justify-between gap-3">
						<p class="text-sm font-semibold text-ink">
							{cart.count} in your cart
							<span class="font-normal text-ink-soft">· {formatPence(cart.subtotalPence)}</span>
						</p>
						<div class="flex items-center gap-3">
							<a
								href="/cart"
								onclick={() => (open = false)}
								class="text-sm font-semibold text-ink-soft underline decoration-ink/20 underline-offset-4 hover:text-ink"
								>View cart</a
							>
							<a
								href="/checkout"
								onclick={() => (open = false)}
								class="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-ink-soft"
							>
								Checkout
							</a>
						</div>
					</div>
				{:else}
					<p class="text-center text-sm text-ink-soft">
						Add a bake and it appears here, ready to check out.
					</p>
				{/if}
			</div>
		</div>

		{#if preview?.imageUrl}
			<div
				class="pointer-events-none fixed top-1/2 right-[27.5rem] z-[60] hidden w-72 -translate-y-1/2 sm:block"
				transition:scale={{ start: 0.55, duration: 200 }}
				aria-hidden="true"
			>
				<div class="overflow-hidden rounded-full border-8 border-white bg-cream-dim shadow-soft">
					<PhotoFrame
						src={preview.imageUrl}
						alt=""
						sizes="288px"
						widths={[480, 640, 960]}
						defaultWidth={480}
						zoom={preview.zoom}
						focal={preview.focal}
						class="aspect-square w-full rounded-full"
					/>
				</div>
				<p class="mt-3 text-center font-display text-xl text-cream drop-shadow">{preview.name}</p>
			</div>
		{/if}
	</div>
{/if}
