<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import { cart } from '$lib/stores/cart.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
</script>

<SeoHead title="Your cart — Smashin' Bakes" noindex={true} />

<section class="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8">
	<h1 class="font-display text-4xl text-ink sm:text-5xl">Your cart</h1>

	{#if cart.items.length === 0}
		<p class="text-ink-soft mt-6">Your cart is empty.</p>
		<a href="/shop" class="bg-pink hover:bg-pink-deep mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors">
			Browse the shop
		</a>
	{:else}
		<ul class="border-ink/10 divide-ink/10 mt-8 divide-y rounded-2xl border">
			{#each cart.items as item (`${item.productId}-${item.variantId}`)}
				<li class="flex items-center gap-4 p-4 sm:p-5">
					<div class="bg-cream-dim h-16 w-16 shrink-0 overflow-hidden rounded-xl">
						{#if item.imageUrl}
							<img src={item.imageUrl} alt="" class="h-full w-full object-cover" />
						{/if}
					</div>
					<div class="min-w-0 flex-1">
						<a href={`/product/${item.slug}`} class="text-ink hover:underline font-semibold">{item.name}</a>
						{#if item.variantName}
							<p class="text-ink-soft text-sm">{item.variantName}</p>
						{/if}
						<p class="text-ink-soft mt-0.5 text-sm">{formatPence(item.unitPricePence)} each</p>
					</div>

					<div class="border-ink/15 flex items-center rounded-full border bg-white">
						<button
							type="button"
							onclick={() => cart.setQuantity(item.productId, item.variantId, item.quantity - 1)}
							class="text-ink hover:text-pink-deep grid h-8 w-8 place-items-center text-lg font-semibold"
							aria-label={`Decrease quantity of ${item.name}`}
						>
							&minus;
						</button>
						<span class="w-5 text-center text-sm font-semibold text-ink">{item.quantity}</span>
						<button
							type="button"
							onclick={() => cart.setQuantity(item.productId, item.variantId, item.quantity + 1)}
							class="text-ink hover:text-pink-deep grid h-8 w-8 place-items-center text-lg font-semibold"
							aria-label={`Increase quantity of ${item.name}`}
						>
							+
						</button>
					</div>

					<p class="text-ink w-20 shrink-0 text-right font-semibold">{formatPence(item.unitPricePence * item.quantity)}</p>

					<button
						type="button"
						onclick={() => cart.remove(item.productId, item.variantId)}
						class="text-ink-soft/60 hover:text-pink-deep shrink-0 text-sm"
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

		<div class="mt-6 flex flex-wrap items-center gap-4">
			<a
				href="/checkout"
				class="bg-pink hover:bg-pink-deep rounded-full px-7 py-3 text-sm font-semibold text-cream shadow-soft transition-colors"
			>
				Continue to checkout
			</a>
			<a href="/shop" class="text-ink-soft hover:text-ink text-sm font-semibold">Keep browsing</a>
		</div>
	{/if}
</section>
