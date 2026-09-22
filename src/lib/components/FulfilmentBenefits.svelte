<script lang="ts">
	// Surfaces the same two facts that used to only appear on the checkout
	// form itself — reserving costs nothing up front, and delivery is a real
	// (free) option, not just pickup — as an actual selling point earlier in
	// the funnel, where it can still influence whether someone buys at all.
	let { variant = 'full' }: { variant?: 'full' | 'compact' } = $props();

	const items = [
		{
			icon: 'reserve',
			text: 'Reserve online — nothing to pay until you collect or it arrives'
		},
		{
			icon: 'pickup',
			text: 'Pickup in-store Fri/Sat, or free delivery to Barrhead & Neilston'
		}
	] as const;
</script>

{#if variant === 'compact'}
	<p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
		{#each items as item (item.icon)}
			<span class="inline-flex items-center gap-1.5">
				<svg
					width="13"
					height="13"
					viewBox="0 0 20 20"
					fill="none"
					class="shrink-0 text-pink-deep"
					aria-hidden="true"
				>
					<path
						d="M4 10.5l4 4 8-9"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				{item.text}
			</span>
		{/each}
	</p>
{:else}
	<div class="flex flex-col gap-2.5 sm:flex-row sm:gap-6">
		{#each items as item (item.icon)}
			<p class="flex items-start gap-2 text-sm text-ink-soft">
				<svg
					width="15"
					height="15"
					viewBox="0 0 20 20"
					fill="none"
					class="mt-0.5 shrink-0 text-pink-deep"
					aria-hidden="true"
				>
					<path
						d="M4 10.5l4 4 8-9"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				{item.text}
			</p>
		{/each}
	</div>
{/if}
