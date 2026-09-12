<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPence } from '$lib/utils/money';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let filter = $state<'active' | 'all'>('active');

	const filteredOrders = $derived(
		filter === 'active' ? data.orders.filter((o) => o.status !== 'collected' && o.status !== 'cancelled') : data.orders
	);

	function formatDate(date: string | Date) {
		return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
			new Date(date)
		);
	}

	function formatPickupDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${dateStr}T00:00:00`));
	}

	const statusLabels = { pending: 'Pending', ready: 'Ready', collected: 'Collected', cancelled: 'Cancelled' } as const;
	const statusClasses: Record<string, string> = {
		pending: 'bg-gold/20 text-gold-deep',
		ready: 'bg-pink/15 text-pink-deep',
		collected: 'bg-ink/10 text-ink',
		cancelled: 'bg-ink/5 text-ink-soft'
	};
</script>

<svelte:head>
	<title>Orders — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<h1 class="font-display text-3xl text-ink">Orders</h1>
</div>
<p class="text-ink-soft mt-2 max-w-lg text-sm">
	Quick-buy orders placed on the site. No online payment yet — these are paid in person at pickup.
</p>

<div class="mt-6 flex gap-2">
	<button
		type="button"
		onclick={() => (filter = 'active')}
		class={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${filter === 'active' ? 'bg-pink text-cream' : 'bg-white/60 text-ink-soft hover:text-ink'}`}
	>
		Active
	</button>
	<button
		type="button"
		onclick={() => (filter = 'all')}
		class={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-pink text-cream' : 'bg-white/60 text-ink-soft hover:text-ink'}`}
	>
		All ({data.orders.length})
	</button>
</div>

{#if filteredOrders.length === 0}
	<p class="text-ink-soft mt-10">No orders here.</p>
{:else}
	<div class="mt-6 space-y-3">
		{#each filteredOrders as order (order.id)}
			<a href={`/admin/orders/${order.id}`} class="border-ink/10 block rounded-xl border bg-white/60 p-4 transition-colors hover:bg-white">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="text-ink font-medium">
							#{order.id} &middot; {order.guestName}
							<span class="text-ink-soft ml-1 text-xs">{formatDate(order.createdAt)}</span>
						</p>
						<p class="text-ink-soft mt-0.5 text-xs">
							Pickup {formatPickupDate(order.pickupDate)} &middot;
							{order.items.reduce((sum, i) => sum + i.quantity, 0)} item{order.items.reduce((sum, i) => sum + i.quantity, 0) === 1 ? '' : 's'}
						</p>
					</div>
					<div class="flex items-center gap-2">
						<span class={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.paymentStatus === 'paid' ? 'bg-gold/20 text-gold-deep' : 'bg-ink/5 text-ink-soft'}`}>
							{order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
						</span>
						<span class={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[order.status]}`}>
							{statusLabels[order.status]}
						</span>
						<p class="text-ink w-16 shrink-0 text-right font-semibold">{formatPence(order.totalPence)}</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
{/if}
