<script lang="ts">
	import type { Snippet } from 'svelte';
	import ShelfItem from './ShelfItem.svelte';
	import type { ProductCardData } from '$lib/types';

	// One wooden shelf of bakes, with an optional chalkboard sign. Boards run edge
	// to edge across the window (the grid is sized against the window's glass
	// padding, which ShopWindow provides).
	let {
		label = null,
		labelId = 'shelf',
		alt = false,
		showCount = true,
		dense = false,
		products = [],
		fallbackSrc = null,
		help,
		children
	}: {
		label?: string | null;
		labelId?: string;
		alt?: boolean;
		showCount?: boolean;
		// Up to six plates across on wide screens (for short rows like categories).
		dense?: boolean;
		products?: ProductCardData[];
		fallbackSrc?: string | null;
		help?: Snippet;
		// Custom plates (e.g. categories) instead of products.
		children?: Snippet;
	} = $props();
</script>

<section class="shelf-block" aria-labelledby={label ? labelId : undefined}>
	{#if label}
		<div class="chalk-row">
			<div class="chalk" class:chalk-alt={alt}>
				<h2 id={labelId}>{label}</h2>
				{#if showCount && !children}
					<span>{products.length} {products.length === 1 ? 'bake' : 'bakes'}</span>
				{/if}
			</div>
			{@render help?.()}
		</div>
	{/if}

	<div class="shelf-grid" class:dense>
		{#if children}
			{@render children()}
		{:else}
			{#each products as product, i (product.slug)}
				<ShelfItem {product} index={i} {fallbackSrc} />
			{/each}
		{/if}
	</div>
</section>

<style>
	/* ---- Shelves ---- */
	.shelf-block {
		--gap: 1rem;
		margin-top: 2.75rem;
	}

	.shelf-block:first-child {
		margin-top: 0;
	}

	.chalk-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.9rem;
		margin-bottom: 2.4rem;
	}

	@media (min-width: 640px) {
		.shelf-block {
			--gap: 1.5rem;
			margin-top: 3.75rem;
		}
	}

	.chalk {
		display: inline-flex;
		align-items: baseline;
		gap: 0.85rem;
		padding: 0.6rem 1.3rem 0.65rem;
		border-radius: 0.5rem;
		border: 4px solid oklch(54% 0.08 60);
		background: linear-gradient(150deg, oklch(30% 0.04 50), oklch(24% 0.035 50));
		box-shadow:
			0 12px 16px -10px oklch(24% 0.035 50 / 0.55),
			inset 0 0 0 1px oklch(40% 0.04 52);
		transform: rotate(-1.2deg);
	}

	.chalk-alt {
		transform: rotate(0.9deg);
	}

	.chalk h2 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.15rem, 3.4vw, 1.6rem);
		letter-spacing: 0.06em;
		line-height: 1;
		text-transform: uppercase;
		color: oklch(97.5% 0.014 80);
	}

	.chalk span {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--color-gold);
	}

	.shelf-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: var(--gap);
		row-gap: 2.75rem;
		/* Boards (ledges) may run out to the edge of the glass, no further. */
		margin-inline: calc(var(--glass-pad, 0px) * -1);
		padding-inline: var(--glass-pad, 0px);
		overflow-x: clip;
	}

	@media (min-width: 640px) {
		.shelf-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.shelf-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.shelf-grid.dense {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}

	/* Make each row's board reach the glass edge on both sides: the first and last
	   tile in a row, and the very last tile (which may sit in a short final row,
	   so it reaches as far as the clipped grid edge allows). */
	.shelf-grid :global(.shelf-tile:last-child .ledge) {
		margin-right: -100vw;
	}

	@media (max-width: 639px) {
		.shelf-grid :global(.shelf-tile:nth-child(2n + 1) .ledge) {
			margin-left: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
		.shelf-grid :global(.shelf-tile:nth-child(2n) .ledge) {
			margin-right: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
	}

	@media (min-width: 640px) and (max-width: 1023px) {
		.shelf-grid :global(.shelf-tile:nth-child(3n + 1) .ledge) {
			margin-left: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
		.shelf-grid :global(.shelf-tile:nth-child(3n) .ledge) {
			margin-right: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
	}

	@media (min-width: 1024px) {
		.shelf-grid:not(.dense) :global(.shelf-tile:nth-child(4n + 1) .ledge) {
			margin-left: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
		.shelf-grid:not(.dense) :global(.shelf-tile:nth-child(4n) .ledge) {
			margin-right: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
	}
	@media (min-width: 1024px) {
		.shelf-grid.dense :global(.shelf-tile:nth-child(6n + 1) .ledge) {
			margin-left: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
		.shelf-grid.dense :global(.shelf-tile:nth-child(6n) .ledge) {
			margin-right: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
	}
</style>
