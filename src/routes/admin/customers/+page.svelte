<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const optedInCount = $derived(data.customers.filter((c) => c.marketingOptIn).length);

	function formatDate(iso: string | Date) {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Customers — Admin</title>
</svelte:head>

<div class="flex flex-wrap items-start justify-between gap-4">
	<div>
		<div class="flex items-center gap-2">
			<h1 class="font-display text-3xl text-ink">Customers</h1>
			<HelpLink section="customers" task="customers" />
		</div>
		<p class="mt-1 text-sm text-ink-soft">
			Everyone with a full account (from voting or the local business picker) &mdash; separate from
			<a href="/admin/subscribers" class="hover:underline">newsletter subscribers</a>.
		</p>
	</div>
	<a
		href="/admin/customers/export"
		class="shrink-0 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
	>
		Export CSV
	</a>
</div>

<p class="mt-6 text-sm text-ink">
	<span class="font-semibold">{data.customers.length}</span> customer{data.customers.length === 1
		? ''
		: 's'}
	&middot;
	<span class="font-semibold">{optedInCount}</span> opted in to marketing
</p>

<div class="mt-4 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/60">
	{#if data.customers.length === 0}
		<p class="px-4 py-8 text-center text-sm text-ink-soft">No customer accounts yet.</p>
	{/if}
	{#each data.customers as customer (customer.id)}
		<div class="flex flex-wrap items-center gap-3 px-4 py-3">
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium text-ink">{customer.name}</p>
				<p class="truncate text-xs text-ink-soft">{customer.email}</p>
			</div>
			<span
				class={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
					customer.marketingOptIn ? 'bg-pink/10 text-pink-deep' : 'bg-ink/5 text-ink-soft'
				}`}
			>
				{customer.marketingOptIn ? 'Marketing OK' : 'Not opted in'}
			</span>
			<span class="shrink-0 text-xs text-ink-soft">Joined {formatDate(customer.createdAt)}</span>
		</div>
	{/each}
</div>
