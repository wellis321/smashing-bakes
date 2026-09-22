<script lang="ts">
	// Surfaces the same two facts that used to only appear on the checkout
	// form itself — reserving costs nothing up front, and delivery is a real
	// (free) option, not just pickup — as an actual selling point earlier in
	// the funnel, where it can still influence whether someone buys at all.
	// Styled as bold badge-style callouts rather than plain text — a benefit
	// that reads like a stray sentence gets skipped over entirely.
	let { variant = 'full' }: { variant?: 'full' | 'compact' } = $props();

	const items = [
		{
			icon: 'reserve',
			text: 'Reserve online — nothing to pay until you collect or it arrives'
		},
		{
			icon: 'delivery',
			text: 'Pickup in-store Fri/Sat, or free delivery to Barrhead & Neilston'
		}
	] as const;
</script>

{#snippet icon(kind: (typeof items)[number]['icon'])}
	{#if kind === 'reserve'}
		<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
			<path
				d="M4 10.2l3.6 3.6L16 5.4"
				stroke="currentColor"
				stroke-width="2.4"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	{:else}
		<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
			<circle cx="6" cy="15.5" r="1.8" stroke="currentColor" stroke-width="1.6" />
			<circle cx="15" cy="15.5" r="1.8" stroke="currentColor" stroke-width="1.6" />
			<path
				d="M3 4h2l1.4 9.3M7.8 13.5h8.2l1.5-6.2H8.2M13 4v3.3M11 5.7h4"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	{/if}
{/snippet}

{#if variant === 'compact'}
	<div class="flex flex-wrap items-center gap-2">
		{#each items as item (item.icon)}
			<span
				class="inline-flex items-center gap-1.5 rounded-full bg-pink/10 py-1.5 pr-3.5 pl-2.5 text-xs font-bold text-pink-deep"
			>
				<span class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pink text-cream">
					{@render icon(item.icon)}
				</span>
				{item.text}
			</span>
		{/each}
	</div>
{:else}
	<div class="grid gap-3 sm:grid-cols-2">
		{#each items as item (item.icon)}
			<div
				class="flex items-center gap-3 rounded-2xl border-2 border-pink/25 bg-blush px-4 py-3.5 shadow-soft"
			>
				<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink text-cream">
					{@render icon(item.icon)}
				</span>
				<p class="text-sm leading-snug font-bold text-ink">{item.text}</p>
			</div>
		{/each}
	</div>
{/if}
