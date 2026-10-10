<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard — Admin</title>
</svelte:head>

<div class="flex items-center gap-2">
	<h1 class="font-display text-3xl text-ink">Dashboard</h1>
	<HelpLink section="getting-started" />
</div>

<div class="mt-8 flex flex-wrap gap-10">
	<div>
		<p class="text-sm text-ink-soft">Active products</p>
		<p class="font-display text-3xl text-ink">{data.productCount}</p>
	</div>
	<div>
		<p class="text-sm text-ink-soft">Categories</p>
		<p class="font-display text-3xl text-ink">{data.categoryCount}</p>
	</div>
	<a href="/admin/enquiries" class="hover:opacity-80">
		<p class="text-sm text-ink-soft">New enquiries</p>
		<p class={`font-display text-3xl ${data.newEnquiryCount > 0 ? 'text-pink-deep' : 'text-ink'}`}>
			{data.newEnquiryCount}
		</p>
	</a>
	<a href="/admin/subscribers" class="hover:opacity-80">
		<p class="text-sm text-ink-soft">Subscribers</p>
		<p class="font-display text-3xl text-ink">{data.subscriberCount}</p>
	</a>
	<a href="/admin/customers" class="hover:opacity-80">
		<p class="text-sm text-ink-soft">Customer accounts</p>
		<p class="font-display text-3xl text-ink">{data.customerCount}</p>
	</a>
</div>

<div class="mt-10 flex items-center justify-between">
	<h2 class="text-lg font-semibold text-ink">Recently updated</h2>
	<a
		href="/admin/products/new"
		class="rounded-full bg-pink-deep px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker"
	>
		+ Add product
	</a>
</div>

<div class="mt-4 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white/60">
	{#each data.recentProducts as product (product.id)}
		<a
			href={`/admin/products/${product.id}/edit`}
			class="flex items-center justify-between px-4 py-3 hover:bg-white"
		>
			<div>
				<p class="text-sm font-medium text-ink">{product.name}</p>
				<p class="text-xs text-ink-soft">{product.category.name}</p>
			</div>
			<div class="flex items-center gap-3">
				{#if product.badge !== 'none'}
					<span class="text-xs text-ink-soft uppercase">{product.badge}</span>
				{/if}
				<span class="text-sm text-ink-soft">{formatPence(product.basePricePence)}</span>
			</div>
		</a>
	{/each}
</div>
