<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const optedInCount = $derived(data.customers.filter((c) => c.marketingOptIn).length);

	function formatDate(iso: string | Date) {
		return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Customers — Admin</title>
</svelte:head>

<div class="flex flex-wrap items-start justify-between gap-4">
	<div>
		<h1 class="font-display text-3xl text-ink">Customers</h1>
		<p class="text-ink-soft mt-1 text-sm">
			Everyone with a full account (from voting or the local business picker) &mdash; separate from
			<a href="/admin/subscribers" class="hover:underline">newsletter subscribers</a>.
		</p>
	</div>
	<a
		href="/admin/customers/export"
		class="border-ink/10 text-ink-soft hover:text-ink shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
	>
		Export CSV
	</a>
</div>

<p class="text-ink mt-6 text-sm">
	<span class="font-semibold">{data.customers.length}</span> customer{data.customers.length === 1 ? '' : 's'}
	&middot;
	<span class="font-semibold">{optedInCount}</span> opted in to marketing
</p>

<div class="border-ink/10 mt-4 divide-y divide-ink/10 rounded-2xl border bg-white/60">
	{#if data.customers.length === 0}
		<p class="text-ink-soft px-4 py-8 text-center text-sm">No customer accounts yet.</p>
	{/if}
	{#each data.customers as customer (customer.id)}
		<div class="flex flex-wrap items-center gap-3 px-4 py-3">
			<div class="min-w-0 flex-1">
				<p class="text-ink truncate text-sm font-medium">{customer.name}</p>
				<p class="text-ink-soft truncate text-xs">{customer.email}</p>
			</div>
			<span
				class={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
					customer.marketingOptIn ? 'bg-pink/10 text-pink-deep' : 'bg-ink/5 text-ink-soft'
				}`}
			>
				{customer.marketingOptIn ? 'Marketing OK' : 'Not opted in'}
			</span>
			<span class="text-ink-soft shrink-0 text-xs">Joined {formatDate(customer.createdAt)}</span>
		</div>
	{/each}
</div>
