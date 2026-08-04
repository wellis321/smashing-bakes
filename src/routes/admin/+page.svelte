<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Dashboard</h1>

<div class="mt-8 flex flex-wrap gap-10">
	<div>
		<p class="text-ink-soft text-sm">Active products</p>
		<p class="font-display text-3xl text-ink">{data.productCount}</p>
	</div>
	<div>
		<p class="text-ink-soft text-sm">Categories</p>
		<p class="font-display text-3xl text-ink">{data.categoryCount}</p>
	</div>
	<a href="/admin/enquiries" class="hover:opacity-80">
		<p class="text-ink-soft text-sm">New enquiries</p>
		<p class={`font-display text-3xl ${data.newEnquiryCount > 0 ? 'text-pink-deep' : 'text-ink'}`}>{data.newEnquiryCount}</p>
	</a>
</div>

<div class="mt-10 flex items-center justify-between">
	<h2 class="text-ink text-lg font-semibold">Recently updated</h2>
	<a
		href="/admin/products/new"
		class="bg-pink hover:bg-pink-deep rounded-full px-4 py-2 text-sm font-semibold text-cream transition-colors"
	>
		+ Add product
	</a>
</div>

<div class="border-ink/10 mt-4 divide-y divide-ink/10 rounded-xl border bg-white/60">
	{#each data.recentProducts as product (product.id)}
		<a href={`/admin/products/${product.id}/edit`} class="flex items-center justify-between px-4 py-3 hover:bg-white">
			<div>
				<p class="text-ink text-sm font-medium">{product.name}</p>
				<p class="text-ink-soft text-xs">{product.category.name}</p>
			</div>
			<div class="flex items-center gap-3">
				{#if product.badge !== 'none'}
					<span class="text-ink-soft text-xs uppercase">{product.badge}</span>
				{/if}
				<span class="text-ink-soft text-sm">{formatPence(product.basePricePence)}</span>
			</div>
		</a>
	{/each}
</div>
