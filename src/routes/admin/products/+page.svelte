<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPence } from '$lib/utils/money';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let categoryId = $state<number | 'all'>('all');
	let status = $state<'all' | 'active' | 'hidden'>('all');

	const filteredProducts = $derived(
		data.products.filter((product) => {
			if (categoryId !== 'all' && product.categoryId !== categoryId) return false;
			if (status === 'active' && !product.isActive) return false;
			if (status === 'hidden' && product.isActive) return false;
			const query = search.trim().toLowerCase();
			if (query) {
				const haystack = `${product.name} ${product.description ?? ''}`.toLowerCase();
				if (!haystack.includes(query)) return false;
			}
			return true;
		})
	);

	const hasFilters = $derived(search.trim() !== '' || categoryId !== 'all' || status !== 'all');

	function clearFilters() {
		search = '';
		categoryId = 'all';
		status = 'all';
	}

	function confirmDelete(event: SubmitEvent, name: string) {
		if (!confirm(`Delete "${name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Products — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<h1 class="font-display text-3xl text-ink">Products</h1>
	<div class="flex items-center gap-3">
		<a href="/admin/categories" class="text-ink-soft hover:text-ink text-sm font-semibold">Manage categories</a>
		<a
			href="/admin/products/new"
			class="bg-pink hover:bg-pink-deep rounded-full px-4 py-2 text-sm font-semibold text-cream transition-colors"
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
			class="text-ink-soft/60 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
			aria-hidden="true"
		>
			<circle cx="8.5" cy="8.5" r="6" />
			<path d="M13 13l4.5 4.5" />
		</svg>
		<input
			type="text"
			bind:value={search}
			placeholder="Search products…"
			class="border-ink/15 focus:ring-pink/40 w-full rounded-full border bg-white py-2 pr-3 pl-9 text-sm outline-none focus:ring-2"
		/>
	</div>

	<select
		bind:value={categoryId}
		class="border-ink/15 focus:ring-pink/40 rounded-full border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
	>
		<option value="all">All categories</option>
		{#each data.categories as category (category.id)}
			<option value={category.id}>{category.name}</option>
		{/each}
	</select>

	<select
		bind:value={status}
		class="border-ink/15 focus:ring-pink/40 rounded-full border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
	>
		<option value="all">All statuses</option>
		<option value="active">Active only</option>
		<option value="hidden">Hidden only</option>
	</select>

	{#if hasFilters}
		<button type="button" onclick={clearFilters} class="text-ink-soft hover:text-ink text-sm font-medium underline underline-offset-2">
			Clear filters
		</button>
	{/if}
</div>

<p class="text-ink-soft mt-3 text-xs">
	{filteredProducts.length} of {data.products.length} product{data.products.length === 1 ? '' : 's'}
</p>

<div class="border-ink/10 mt-3 divide-y divide-ink/10 rounded-xl border bg-white/60">
	{#if filteredProducts.length === 0}
		<p class="text-ink-soft px-4 py-8 text-center text-sm">No products match your filters.</p>
	{/if}
	{#each filteredProducts as product (product.id)}
		<div class="flex items-center gap-4 px-4 py-3">
			<img
				src={product.images[0]?.url}
				alt=""
				class="bg-cream-dim h-12 w-12 shrink-0 rounded-lg object-cover"
			/>

			<a href={`/admin/products/${product.id}/edit`} class="min-w-0 flex-1">
				<p class="text-ink truncate text-sm font-medium">{product.name}</p>
				<p class="text-ink-soft text-xs">{product.category.name} &middot; {formatPence(product.basePricePence)}</p>
			</a>

			{#if product.badge !== 'none'}
				<span class="text-ink-soft hidden text-xs uppercase sm:inline">{product.badge}</span>
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

			<a href={`/admin/products/${product.id}/edit`} class="text-ink-soft hover:text-ink text-sm">Edit</a>

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
	{/each}
</div>
