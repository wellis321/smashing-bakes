<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPence } from '$lib/utils/money';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let categoryId = $state<number | 'all'>('all');
	let status = $state<'all' | 'active' | 'hidden'>('all');
	let badgeFilter = $state<'all' | 'sale' | 'new' | 'none'>('all');
	let sortBy = $state<'category' | 'name' | 'price-asc' | 'price-desc' | 'newest'>('category');

	// A product only actually counts as "on sale" once both the badge is set
	// to sale *and* a sale price exists — matches how the public product page
	// decides whether to show a struck-through price, so this list and the
	// storefront never disagree about what's genuinely on sale.
	function isOnSale(product: (typeof data.products)[number]) {
		return product.badge === 'sale' && product.salePricePence != null;
	}

	const filteredProducts = $derived(
		data.products.filter((product) => {
			if (categoryId !== 'all' && product.categoryId !== categoryId) return false;
			if (status === 'active' && !product.isActive) return false;
			if (status === 'hidden' && product.isActive) return false;
			if (badgeFilter === 'sale' && !isOnSale(product)) return false;
			if (badgeFilter === 'new' && product.badge !== 'new') return false;
			if (badgeFilter === 'none' && product.badge !== 'none') return false;
			const query = search.trim().toLowerCase();
			if (query) {
				const haystack = `${product.name} ${product.description ?? ''}`.toLowerCase();
				if (!haystack.includes(query)) return false;
			}
			return true;
		})
	);

	// Grouped view (sortBy === 'category') keeps each category's own curated
	// sortOrder — that's the same order customers see on the public shop page,
	// so this list should read the same way. Every other sort is a flat list
	// across categories, since grouping wouldn't mean anything for those.
	const groupedByCategory = $derived.by(() => {
		const groups = new Map<number, typeof filteredProducts>();
		for (const product of filteredProducts) {
			const list = groups.get(product.categoryId);
			if (list) list.push(product);
			else groups.set(product.categoryId, [product]);
		}
		return data.categories
			.filter((c) => groups.has(c.id))
			.map((category) => ({
				category,
				products: [...groups.get(category.id)!].sort((a, b) => a.sortOrder - b.sortOrder)
			}));
	});

	// The price actually being charged today — the sale price when a product
	// is genuinely on sale, otherwise the regular price. Sorting "by price"
	// should reflect what a customer pays, not the pre-discount figure.
	function effectivePrice(product: (typeof data.products)[number]) {
		return isOnSale(product) ? product.salePricePence! : product.basePricePence;
	}

	const sortedFlat = $derived.by(() => {
		const list = [...filteredProducts];
		switch (sortBy) {
			case 'name':
				return list.sort((a, b) => a.name.localeCompare(b.name));
			case 'price-asc':
				return list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
			case 'price-desc':
				return list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
			case 'newest':
				return list.sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			default:
				return list;
		}
	});

	const hasFilters = $derived(
		search.trim() !== '' || categoryId !== 'all' || status !== 'all' || badgeFilter !== 'all'
	);

	function clearFilters() {
		search = '';
		categoryId = 'all';
		status = 'all';
		badgeFilter = 'all';
	}

	function confirmDelete(event: SubmitEvent, name: string) {
		if (!confirm(`Delete "${name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

{#snippet productRow(product: (typeof filteredProducts)[number])}
	<div class="flex items-center gap-4 px-4 py-3">
		{#if product.images[0]?.url}
			<img
				src={product.images[0].url}
				alt=""
				class="h-12 w-12 shrink-0 rounded-lg bg-cream-dim object-cover"
			/>
		{:else}
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cream-dim text-ink-soft/50"
				title="No photo yet"
			>
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
					<rect
						x="2.5"
						y="4.5"
						width="15"
						height="11"
						rx="1.5"
						stroke="currentColor"
						stroke-width="1.3"
					/>
					<circle cx="7" cy="8.5" r="1.3" stroke="currentColor" stroke-width="1.3" />
					<path
						d="M3 13.5l4-4 3 3 2.5-2.5L17 13.5"
						stroke="currentColor"
						stroke-width="1.3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
		{/if}

		<a href={`/admin/products/${product.id}/edit`} class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium text-ink">{product.name}</p>
			<p class="text-xs text-ink-soft">
				{product.category.name} &middot;
				{#if isOnSale(product)}
					<span class="font-semibold text-pink-deep">{formatPence(product.salePricePence!)}</span>
					<span class="line-through opacity-60">{formatPence(product.basePricePence)}</span>
				{:else}
					{formatPence(product.basePricePence)}
				{/if}
			</p>
		</a>

		{#if product.badge !== 'none'}
			<span
				class={`hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold uppercase sm:inline ${
					product.badge === 'sale' ? 'bg-pink/10 text-pink-deep' : 'bg-gold/15 text-gold-deep'
				}`}
			>
				{product.badge === 'sale' ? 'Sale' : 'New'}
			</span>
		{/if}

		<form method="POST" action="?/toggleActive" use:enhance>
			<input type="hidden" name="id" value={product.id} />
			<input type="hidden" name="nextValue" value={(!product.isActive).toString()} />
			<button
				type="submit"
				class={`rounded-full px-3 py-1 text-xs font-semibold ${
					product.isActive ? 'bg-ink/5 text-ink-soft' : 'bg-pink/10 text-pink-deep'
				}`}
			>
				{product.isActive ? 'Active' : 'Hidden'}
			</button>
		</form>

		<a href={`/admin/products/${product.id}/edit`} class="text-sm text-ink-soft hover:text-ink"
			>Edit</a
		>

		<form
			method="POST"
			action="?/delete"
			use:enhance
			onsubmit={(e) => confirmDelete(e, product.name)}
		>
			<input type="hidden" name="id" value={product.id} />
			<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
		</form>
	</div>
{/snippet}

<svelte:head>
	<title>Products — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<h1 class="font-display text-3xl text-ink">Products</h1>
	<div class="flex items-center gap-3">
		<a href="/admin/categories" class="text-sm font-semibold text-ink-soft hover:text-ink"
			>Manage categories</a
		>
		<a
			href="/admin/products/new"
			class="rounded-full bg-pink px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep"
		>
			+ Add product
		</a>
	</div>
</div>

<div class="mt-6 flex flex-wrap items-center gap-3">
	<div class="relative min-w-[220px] flex-1">
		<svg
			width="15"
			height="15"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft/60"
			aria-hidden="true"
		>
			<circle cx="8.5" cy="8.5" r="6" />
			<path d="M13 13l4.5 4.5" />
		</svg>
		<input
			type="text"
			bind:value={search}
			placeholder="Search products…"
			class="w-full rounded-full border border-ink/15 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-pink/40"
		/>
	</div>

	<select
		bind:value={categoryId}
		class="rounded-full border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
	>
		<option value="all">All categories</option>
		{#each data.categories as category (category.id)}
			<option value={category.id}>{category.name}</option>
		{/each}
	</select>

	<select
		bind:value={status}
		class="rounded-full border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
	>
		<option value="all">All statuses</option>
		<option value="active">Active only</option>
		<option value="hidden">Hidden only</option>
	</select>

	<select
		bind:value={badgeFilter}
		class="rounded-full border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
	>
		<option value="all">Any badge</option>
		<option value="sale">On sale only</option>
		<option value="new">New bakes only</option>
		<option value="none">No badge</option>
	</select>

	<label class="flex items-center gap-2 text-sm">
		<span class="text-ink-soft">Sort</span>
		<select
			bind:value={sortBy}
			class="rounded-full border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
		>
			<option value="category">By category</option>
			<option value="name">Name (A–Z)</option>
			<option value="price-asc">Price (low to high)</option>
			<option value="price-desc">Price (high to low)</option>
			<option value="newest">Newest first</option>
		</select>
	</label>

	{#if hasFilters}
		<button
			type="button"
			onclick={clearFilters}
			class="text-sm font-medium text-ink-soft underline underline-offset-2 hover:text-ink"
		>
			Clear filters
		</button>
	{/if}
</div>

<p class="mt-3 text-xs text-ink-soft">
	{filteredProducts.length} of {data.products.length} product{data.products.length === 1 ? '' : 's'}
</p>

{#if filteredProducts.length === 0}
	<div class="mt-3 rounded-xl border border-ink/10 bg-white/60">
		<p class="px-4 py-8 text-center text-sm text-ink-soft">No products match your filters.</p>
	</div>
{:else if sortBy === 'category'}
	<div class="mt-3 space-y-6">
		{#each groupedByCategory as group (group.category.id)}
			<div>
				<div class="mb-2 flex items-baseline gap-2 px-1">
					<h2 class="text-sm font-semibold text-ink">{group.category.name}</h2>
					<span class="text-xs text-ink-soft/70">({group.products.length})</span>
				</div>
				<div class="divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white/60">
					{#each group.products as product (product.id)}
						{@render productRow(product)}
					{/each}
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="mt-3 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white/60">
		{#each sortedFlat as product (product.id)}
			{@render productRow(product)}
		{/each}
	</div>
{/if}
