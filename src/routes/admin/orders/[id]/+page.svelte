<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPence } from '$lib/utils/money';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let status = $state(data.order.status);
	let paymentStatus = $state(data.order.paymentStatus);
	let submitting = $state(false);

	// Re-sync after a save — otherwise the dropdowns keep showing whatever was
	// selected before submit, even though the database (and `data`) has moved
	// on, which reads as "my change didn't save" even when it did.
	$effect(() => {
		status = data.order.status;
		paymentStatus = data.order.paymentStatus;
	});

	function formatDate(date: string | Date) {
		return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
			new Date(date)
		);
	}

	function formatPickupDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${dateStr}T00:00:00`));
	}

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete order #${data.order.id}? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Order #{data.order.id} — Admin</title>
</svelte:head>

<a href="/admin/orders" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Orders</a>
<h1 class="font-display mt-2 text-3xl text-ink">Order #{data.order.id}</h1>
<p class="text-ink-soft mt-1 text-sm">Placed {formatDate(data.order.createdAt)}</p>

<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
	<div class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Items</h2>
		<ul class="divide-ink/10 mt-4 divide-y">
			{#each data.items as item (item.id)}
				<li class="flex items-center justify-between gap-4 py-3 text-sm">
					<span class="text-ink">
						{item.quantity}&times; {item.productName}{item.variantName ? ` (${item.variantName})` : ''}
					</span>
					<span class="text-ink-soft shrink-0">{formatPence(item.subtotalPence)}</span>
				</li>
			{/each}
		</ul>
		<div class="border-ink/10 mt-3 flex items-center justify-between border-t pt-3">
			<p class="text-ink-soft text-sm font-semibold">Total</p>
			<p class="text-ink font-semibold">{formatPence(data.order.totalPence)}</p>
		</div>

		{#if data.order.notes}
			<div class="bg-blush mt-5 rounded-xl p-4">
				<p class="text-ink-soft text-xs font-semibold tracking-widest uppercase">Notes</p>
				<p class="text-ink mt-1 text-sm whitespace-pre-line">{data.order.notes}</p>
			</div>
		{/if}
	</div>

	<div class="space-y-6">
		<div class="border-ink/10 rounded-2xl border bg-white/60 p-6">
			<h2 class="text-ink text-lg font-semibold">Customer</h2>
			<p class="text-ink mt-3 text-sm font-medium">{data.order.guestName}</p>
			<a href={`mailto:${data.order.guestEmail}`} class="text-pink-deep mt-1 block text-sm hover:underline">{data.order.guestEmail}</a>
			{#if data.order.guestPhone}
				<a href={`tel:${data.order.guestPhone}`} class="text-pink-deep mt-1 block text-sm hover:underline">{data.order.guestPhone}</a>
			{/if}
			<p class="text-ink-soft mt-3 text-sm">Pickup: <span class="text-ink font-medium">{formatPickupDate(data.order.pickupDate)}</span></p>
		</div>

		<form
			method="POST"
			action="?/update"
			class="border-ink/10 rounded-2xl border bg-white/60 p-6"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<h2 class="text-ink text-lg font-semibold">Status</h2>

			{#if form?.message}
				<p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
			{/if}
			{#if form?.success}
				<p class="bg-blush text-ink mt-3 rounded-lg px-3 py-2 text-sm">Saved.</p>
			{/if}

			<div class="mt-4">
				<label for="status" class="text-ink-soft text-sm font-medium">Order status</label>
				<select
					id="status"
					name="status"
					bind:value={status}
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				>
					<option value="pending">Pending</option>
					<option value="ready">Ready for pickup</option>
					<option value="collected">Collected</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>

			<div class="mt-4">
				<label for="paymentStatus" class="text-ink-soft text-sm font-medium">Payment</label>
				<select
					id="paymentStatus"
					name="paymentStatus"
					bind:value={paymentStatus}
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				>
					<option value="unpaid">Unpaid</option>
					<option value="paid">Paid (in person)</option>
				</select>
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="bg-pink hover:bg-pink-deep mt-4 w-full rounded-full py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
			>
				{submitting ? 'Saving…' : 'Save changes'}
			</button>
		</form>

		<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete}>
			<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this order</button>
		</form>
	</div>
</div>
