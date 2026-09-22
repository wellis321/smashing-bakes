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
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	}

	function formatPickupDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		}).format(new Date(`${dateStr}T00:00:00`));
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

<a href="/admin/orders" class="text-sm font-semibold text-ink-soft hover:text-ink">&larr; Orders</a>
<h1 class="mt-2 font-display text-3xl text-ink">Order #{data.order.id}</h1>
<p class="mt-1 text-sm text-ink-soft">Placed {formatDate(data.order.createdAt)}</p>

<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
	<div class="rounded-2xl border border-ink/10 bg-white/60 p-6">
		<h2 class="text-lg font-semibold text-ink">Items</h2>
		<ul class="mt-4 divide-y divide-ink/10">
			{#each data.items as item (item.id)}
				<li class="flex items-center justify-between gap-4 py-3 text-sm">
					<span class="text-ink">
						{item.quantity}&times; {item.productName}{item.variantName
							? ` (${item.variantName})`
							: ''}
					</span>
					<span class="shrink-0 text-ink-soft">{formatPence(item.subtotalPence)}</span>
				</li>
			{/each}
		</ul>
		<div class="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
			<p class="text-sm font-semibold text-ink-soft">Total</p>
			<p class="font-semibold text-ink">{formatPence(data.order.totalPence)}</p>
		</div>

		{#if data.order.notes}
			<div class="mt-5 rounded-xl bg-blush p-4">
				<p class="text-xs font-semibold tracking-widest text-ink-soft uppercase">Notes</p>
				<p class="mt-1 text-sm whitespace-pre-line text-ink">{data.order.notes}</p>
			</div>
		{/if}
	</div>

	<div class="space-y-6">
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-6">
			<h2 class="text-lg font-semibold text-ink">Customer</h2>
			<p class="mt-3 text-sm font-medium text-ink">{data.order.guestName}</p>
			<a
				href={`mailto:${data.order.guestEmail}`}
				class="mt-1 block text-sm text-pink-deep hover:underline">{data.order.guestEmail}</a
			>
			{#if data.order.guestPhone}
				<a
					href={`tel:${data.order.guestPhone}`}
					class="mt-1 block text-sm text-pink-deep hover:underline">{data.order.guestPhone}</a
				>
			{/if}
			<p class="mt-3 text-sm text-ink-soft">
				{data.order.fulfilmentMethod === 'delivery' ? 'Delivery' : 'Pickup'}:
				<span class="font-medium text-ink">{formatPickupDate(data.order.pickupDate)}</span>
			</p>
			{#if data.order.fulfilmentMethod === 'delivery' && data.order.deliveryAddress}
				<div class="mt-3 rounded-xl bg-gold/10 p-3">
					<p class="text-xs font-semibold tracking-widest text-gold-deep uppercase">
						Delivery address
					</p>
					<p class="mt-1 text-sm whitespace-pre-line text-ink">{data.order.deliveryAddress}</p>
				</div>
			{/if}
		</div>

		<form
			method="POST"
			action="?/update"
			class="rounded-2xl border border-ink/10 bg-white/60 p-6"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<h2 class="text-lg font-semibold text-ink">Status</h2>

			{#if form?.message}
				<p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
			{/if}
			{#if form?.success}
				<p class="mt-3 rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
			{/if}

			<div class="mt-4">
				<label for="status" class="text-sm font-medium text-ink-soft">Order status</label>
				<select
					id="status"
					name="status"
					bind:value={status}
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				>
					<option value="pending">Pending</option>
					<option value="ready">Ready for pickup</option>
					<option value="collected">Collected</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>

			<div class="mt-4">
				<label for="paymentStatus" class="text-sm font-medium text-ink-soft">Payment</label>
				<select
					id="paymentStatus"
					name="paymentStatus"
					bind:value={paymentStatus}
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				>
					<option value="unpaid">Unpaid</option>
					<option value="paid">Paid (in person)</option>
				</select>
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="mt-4 w-full rounded-full bg-pink py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
			>
				{submitting ? 'Saving…' : 'Save changes'}
			</button>
		</form>

		<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete}>
			<button type="submit" class="text-sm text-red-600/70 hover:text-red-600"
				>Delete this order</button
			>
		</form>
	</div>
</div>
