<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import { cart } from '$lib/stores/cart.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FulfilmentBenefits from '$lib/components/FulfilmentBenefits.svelte';
</script>

<SeoHead title="Your cart — Smashin' Bakes" noindex={true} />

<section class="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8">
	<h1 class="font-display text-4xl text-ink sm:text-5xl">Your cart</h1>

	{#if cart.items.length === 0}
		<p class="mt-6 text-ink-soft">Your cart is empty.</p>
		<a
			href="/shop"
			class="mt-6 inline-flex rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep"
		>
			Browse the shop
		</a>
	{:else}
		<ul class="mt-8 divide-y divide-ink/10 rounded-2xl border border-ink/10">
			{#each cart.items as item (`${item.productId}-${item.variantId}`)}
				<li class="flex items-center gap-4 p-4 sm:p-5">
					<div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-dim">
						{#if item.imageUrl}
							<img src={item.imageUrl} alt="" class="h-full w-full object-cover" />
						{/if}
					</div>
					<div class="min-w-0 flex-1">
						<a href={`/product/${item.slug}`} class="font-semibold text-ink hover:underline"
							>{item.name}</a
						>
						{#if item.variantName}
							<p class="text-sm text-ink-soft">{item.variantName}</p>
						{/if}
						<p class="mt-0.5 text-sm text-ink-soft">{formatPence(item.unitPricePence)} each</p>
					</div>

					<div class="flex items-center rounded-full border border-ink/15 bg-white">
						<button
							type="button"
							onclick={() => cart.setQuantity(item.productId, item.variantId, item.quantity - 1)}
							class="grid h-8 w-8 place-items-center text-lg font-semibold text-ink hover:text-pink-deep"
							aria-label={`Decrease quantity of ${item.name}`}
						>
							&minus;
						</button>
						<span class="w-5 text-center text-sm font-semibold text-ink">{item.quantity}</span>
						<button
							type="button"
							onclick={() => cart.setQuantity(item.productId, item.variantId, item.quantity + 1)}
							class="grid h-8 w-8 place-items-center text-lg font-semibold text-ink hover:text-pink-deep"
							aria-label={`Increase quantity of ${item.name}`}
						>
							+
						</button>
					</div>

					<p class="w-20 shrink-0 text-right font-semibold text-ink">
						{formatPence(item.unitPricePence * item.quantity)}
					</p>

					<button
						type="button"
						onclick={() => cart.remove(item.productId, item.variantId)}
						class="shrink-0 text-sm text-ink-soft/60 hover:text-pink-deep"
						aria-label={`Remove ${item.name} from cart`}
					>
						Remove
					</button>
				</li>
			{/each}
		</ul>

		<div class="mt-6 flex items-center justify-between border-t border-ink/10 pt-6">
			<p class="text-ink-soft">Subtotal</p>
			<p class="font-display text-2xl text-ink">{formatPence(cart.subtotalPence)}</p>
		</div>

		<div class="mt-4">
			<FulfilmentBenefits variant="compact" />
		</div>

		<div class="mt-6 flex flex-wrap items-center gap-4">
			<a
				href="/checkout"
				class="rounded-full bg-pink px-7 py-3 text-sm font-semibold text-cream shadow-soft transition-colors hover:bg-pink-deep"
			>
				Continue to checkout
			</a>
			<a href="/shop" class="text-sm font-semibold text-ink-soft hover:text-ink">Keep browsing</a>
		</div>
	{/if}
</section>
