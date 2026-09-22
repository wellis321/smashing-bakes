<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { formatPence } from '$lib/utils/money';
	import { cart } from '$lib/stores/cart.svelte';
	import { getNextPickupDates } from '$lib/utils/pickup-dates';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const pickupDates = getNextPickupDates();

	let name = $state(page.data.customer?.name ?? '');
	let email = $state(page.data.customer?.email ?? '');
	let phone = $state('');
	let pickupDate = $state(pickupDates[0]?.date ?? '');
	let notes = $state('');
	let fulfilmentMethod = $state<'pickup' | 'delivery'>('pickup');
	let deliveryAddress = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (cart.items.length === 0 && !submitting) goto('/cart');
	});
</script>

<SeoHead title="Checkout — Smashin' Bakes" noindex={true} />

<section class="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8">
	<h1 class="font-display text-4xl text-ink sm:text-5xl">Checkout</h1>

	{#if cart.items.length > 0}
		<div class="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6">
			<h2 class="text-lg font-semibold text-ink">Your order</h2>
			<ul class="mt-4 divide-y divide-ink/10">
				{#each cart.items as item (`${item.productId}-${item.variantId}`)}
					<li class="flex items-center justify-between gap-4 py-3 text-sm">
						<span class="text-ink">
							{item.quantity}&times; {item.name}{item.variantName ? ` (${item.variantName})` : ''}
						</span>
						<span class="shrink-0 text-ink-soft"
							>{formatPence(item.unitPricePence * item.quantity)}</span
						>
					</li>
				{/each}
			</ul>
			<div class="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
				<p class="text-sm font-semibold text-ink-soft">Subtotal</p>
				<p class="font-semibold text-ink">{formatPence(cart.subtotalPence)}</p>
			</div>
		</div>

		<form
			method="POST"
			class="mt-6 space-y-5 rounded-2xl border border-ink/10 bg-white/60 p-6"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					if (result.type === 'redirect') cart.clear();
					await update();
					submitting = false;
				};
			}}
		>
			<input type="hidden" name="items" value={JSON.stringify(cart.items)} />

			{#if form?.message}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
			{/if}

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="name" class="text-sm font-medium text-ink-soft">Name</label>
					<input
						id="name"
						name="name"
						required
						bind:value={name}
						class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					/>
				</div>
				<div>
					<label for="email" class="text-sm font-medium text-ink-soft">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						bind:value={email}
						class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					/>
				</div>
			</div>

			<div>
				<label for="phone" class="text-sm font-medium text-ink-soft">Phone (optional)</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					bind:value={phone}
					class="mt-1 w-full max-w-xs rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
			</div>

			<fieldset>
				<legend class="text-sm font-medium text-ink-soft">How would you like it?</legend>
				<div class="mt-2 flex flex-wrap gap-3">
					<label
						class={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
							fulfilmentMethod === 'pickup'
								? 'border-pink bg-pink text-cream'
								: 'border-ink/15 bg-white text-ink hover:border-ink/30'
						}`}
					>
						<input
							type="radio"
							name="fulfilmentMethod"
							value="pickup"
							bind:group={fulfilmentMethod}
							class="sr-only"
						/>
						Pickup in store
					</label>
					<label
						class={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
							fulfilmentMethod === 'delivery'
								? 'border-pink bg-pink text-cream'
								: 'border-ink/15 bg-white text-ink hover:border-ink/30'
						}`}
					>
						<input
							type="radio"
							name="fulfilmentMethod"
							value="delivery"
							bind:group={fulfilmentMethod}
							class="sr-only"
						/>
						Free delivery
					</label>
				</div>
				<p class="mt-1.5 text-xs text-ink-soft/70">
					Free delivery is only available in Barrhead and Neilston.
				</p>
			</fieldset>

			{#if fulfilmentMethod === 'delivery'}
				<div>
					<label for="deliveryAddress" class="text-sm font-medium text-ink-soft"
						>Delivery address</label
					>
					<textarea
						id="deliveryAddress"
						name="deliveryAddress"
						rows="2"
						required
						bind:value={deliveryAddress}
						placeholder="Address, including postcode"
						class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					></textarea>
				</div>
			{/if}

			<fieldset>
				<legend class="text-sm font-medium text-ink-soft"
					>{fulfilmentMethod === 'delivery' ? 'Delivery day' : 'Pickup day'}</legend
				>
				<div class="mt-2 flex flex-wrap gap-3">
					{#each pickupDates as option (option.date)}
						<label
							class={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
								pickupDate === option.date
									? 'border-pink bg-pink text-cream'
									: 'border-ink/15 bg-white text-ink hover:border-ink/30'
							}`}
						>
							<input
								type="radio"
								name="pickupDate"
								value={option.date}
								bind:group={pickupDate}
								class="sr-only"
							/>
							{option.label}
						</label>
					{/each}
				</div>
			</fieldset>

			<div>
				<label for="notes" class="text-sm font-medium text-ink-soft">Notes (optional)</label>
				<textarea
					id="notes"
					name="notes"
					rows="2"
					bind:value={notes}
					placeholder="Allergies, a message to include, anything else we should know."
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				></textarea>
			</div>

			<div class="border-t border-ink/10 pt-5">
				<p class="text-xs text-ink-soft">
					Online payment is coming soon — for now, placing an order reserves it and you pay in
					person
					{fulfilmentMethod === 'delivery' ? 'when it arrives' : 'when you collect'}.
				</p>
				<button
					type="submit"
					disabled={submitting}
					class="mt-4 w-full rounded-full bg-pink py-3 text-sm font-semibold text-cream shadow-soft transition-colors hover:bg-pink-deep disabled:opacity-60 sm:w-auto sm:px-8"
				>
					{submitting ? 'Placing order…' : `Place order — ${formatPence(cart.subtotalPence)}`}
				</button>
			</div>
		</form>
	{/if}
</section>
