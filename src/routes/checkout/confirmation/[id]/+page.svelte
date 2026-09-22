<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		}).format(new Date(`${dateStr}T00:00:00`));
	}
</script>

<SeoHead title="Order placed — Smashin' Bakes" noindex={true} />

<section class="mx-auto max-w-2xl px-5 pt-14 pb-24 text-center sm:px-8">
	<div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blush">
		<svg width="28" height="28" viewBox="0 0 20 20" fill="none" aria-hidden="true">
			<path
				d="M4 10.5l4 4 8-9"
				stroke="var(--color-pink-deep)"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>

	<h1 class="mt-6 font-display text-4xl text-ink sm:text-5xl">
		You&rsquo;re all set, {data.order.guestName.split(' ')[0]}.
	</h1>
	{#if data.order.fulfilmentMethod === 'delivery'}
		<p class="mt-4 text-ink-soft">
			We&rsquo;ve got order <strong class="text-ink">#{data.order.id}</strong> reserved for free
			delivery on
			<strong class="text-ink">{formatDate(data.order.pickupDate)}</strong> to {data.order
				.deliveryAddress}.
		</p>
	{:else}
		<p class="mt-4 text-ink-soft">
			We&rsquo;ve got order <strong class="text-ink">#{data.order.id}</strong> reserved for pickup
			on
			<strong class="text-ink">{formatDate(data.order.pickupDate)}</strong>.
		</p>
	{/if}

	<div class="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 text-left">
		<ul class="divide-y divide-ink/10">
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
	</div>

	<div class="mt-6 rounded-2xl bg-blush p-6 text-left">
		<p class="font-display text-lg text-ink">
			{data.order.fulfilmentMethod === 'delivery' ? 'Pay when it arrives' : 'Pay when you collect'}
		</p>
		<p class="mt-2 text-sm leading-relaxed text-ink-soft">
			Online payment is coming soon — for now, just have this order number ready and pay in person
			{data.order.fulfilmentMethod === 'delivery' ? 'on delivery' : 'at pickup'}. We&rsquo;ll have a
			confirmation email on its way to {data.order.guestEmail} too.
		</p>
	</div>

	<a
		href="/shop"
		class="mt-8 inline-block text-sm font-semibold text-ink-soft underline decoration-ink/20 underline-offset-4 hover:text-ink"
	>
		&larr; Back to shop
	</a>
</section>
