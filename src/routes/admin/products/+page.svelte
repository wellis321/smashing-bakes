<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPence } from '$lib/utils/money';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

<div class="border-ink/10 mt-6 divide-y divide-ink/10 rounded-xl border bg-white/60">
	{#each data.products as product (product.id)}
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
