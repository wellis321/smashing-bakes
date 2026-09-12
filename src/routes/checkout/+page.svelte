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
	let submitting = $state(false);

	$effect(() => {
		if (cart.items.length === 0 && !submitting) goto('/cart');
	});
</script>

<SeoHead title="Checkout — Smashin' Bakes" noindex={true} />

<section class="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8">
	<h1 class="font-display text-4xl text-ink sm:text-5xl">Checkout</h1>

	{#if cart.items.length > 0}
		<div class="border-ink/10 mt-8 rounded-2xl border bg-white/60 p-6">
			<h2 class="text-ink text-lg font-semibold">Your order</h2>
			<ul class="divide-ink/10 mt-4 divide-y">
				{#each cart.items as item (`${item.productId}-${item.variantId}`)}
					<li class="flex items-center justify-between gap-4 py-3 text-sm">
						<span class="text-ink">
							{item.quantity}&times; {item.name}{item.variantName ? ` (${item.variantName})` : ''}
						</span>
						<span class="text-ink-soft shrink-0">{formatPence(item.unitPricePence * item.quantity)}</span>
					</li>
				{/each}
			</ul>
			<div class="border-ink/10 mt-3 flex items-center justify-between border-t pt-3">
				<p class="text-ink-soft text-sm font-semibold">Subtotal</p>
				<p class="text-ink font-semibold">{formatPence(cart.subtotalPence)}</p>
			</div>
		</div>

		<form
			method="POST"
			class="border-ink/10 mt-6 space-y-5 rounded-2xl border bg-white/60 p-6"
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
					<label for="name" class="text-ink-soft text-sm font-medium">Name</label>
					<input
						id="name"
						name="name"
						required
						bind:value={name}
						class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
					/>
				</div>
				<div>
					<label for="email" class="text-ink-soft text-sm font-medium">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						bind:value={email}
						class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
					/>
				</div>
			</div>

			<div>
				<label for="phone" class="text-ink-soft text-sm font-medium">Phone (optional)</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					bind:value={phone}
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full max-w-xs rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>

			<fieldset>
				<legend class="text-ink-soft text-sm font-medium">Pickup day</legend>
				<div class="mt-2 flex flex-wrap gap-3">
					{#each pickupDates as option (option.date)}
						<label
							class={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
								pickupDate === option.date ? 'border-pink bg-pink text-cream' : 'border-ink/15 bg-white text-ink hover:border-ink/30'
							}`}
						>
							<input type="radio" name="pickupDate" value={option.date} bind:group={pickupDate} class="sr-only" />
							{option.label}
						</label>
					{/each}
				</div>
			</fieldset>

			<div>
				<label for="notes" class="text-ink-soft text-sm font-medium">Notes (optional)</label>
				<textarea
					id="notes"
					name="notes"
					rows="2"
					bind:value={notes}
					placeholder="Allergies, a message to include, anything else we should know."
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				></textarea>
			</div>

			<div class="border-ink/10 border-t pt-5">
				<p class="text-ink-soft text-xs">
					Online payment is coming soon — for now, placing an order reserves it for pickup and you pay in
					person when you collect.
				</p>
				<button
					type="submit"
					disabled={submitting}
					class="bg-pink hover:bg-pink-deep mt-4 w-full rounded-full py-3 text-sm font-semibold text-cream shadow-soft transition-colors disabled:opacity-60 sm:w-auto sm:px-8"
				>
					{submitting ? 'Placing order…' : `Place order — ${formatPence(cart.subtotalPence)}`}
				</button>
			</div>
		</form>
	{/if}
</section>
