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
		fit = 0,
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
		// Number of plates to fit across the full width: 3 bakes take a third each,
		// 4 a quarter each, and so on (6 become two rows of 3, more wrap in fours).
		// Leave out for the standard 2 / 3 / 4-across grid.
		fit?: number;
		products?: ProductCardData[];
		fallbackSrc?: string | null;
		help?: Snippet;
		// Custom plates (e.g. categories) instead of products.
		children?: Snippet;
	} = $props();

	const lgCols = $derived(fit > 0 ? (fit <= 5 ? fit : fit === 6 ? 3 : 4) : dense ? 6 : 4);
	const mdCols = $derived(fit > 0 ? Math.min(fit, 3) : 3);
	const smCols = $derived(fit > 0 ? Math.min(fit, 2) : 2);
</script>

<section
	class="shelf-block"
	style:--plate-max={fit > 0 ? '24rem' : undefined}
	aria-labelledby={label ? labelId : undefined}
>
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

	<div class={`shelf-grid lg-${lgCols} md-${mdCols} sm-${smCols}`}>
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

	/* ---- Column counts per screen size (phone, tablet, desktop) ---- */
	.shelf-grid.sm-1 {
		grid-template-columns: minmax(0, 1fr);
	}

	@media (min-width: 640px) {
		.shelf-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.shelf-grid.md-1 {
			grid-template-columns: minmax(0, 1fr);
		}
		.shelf-grid.md-2 {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.shelf-grid.lg-1 {
			grid-template-columns: minmax(0, 1fr);
		}
		.shelf-grid.lg-2 {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.shelf-grid.lg-3 {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.shelf-grid.lg-4 {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.shelf-grid.lg-5 {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
		.shelf-grid.lg-6 {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}

	/* ---- Boards run to the glass edge on both sides of every row ----
	   The first/last tile of the shelf, plus the first/last tile of each row for
	   the column counts that can wrap (phone 2, tablet 3, desktop 3 or 4+). */
	.shelf-grid :global(.shelf-tile:first-child .ledge) {
		margin-left: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
	}

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
		.shelf-grid.lg-3 :global(.shelf-tile:nth-child(3n + 1) .ledge),
		.shelf-grid.lg-4 :global(.shelf-tile:nth-child(4n + 1) .ledge),
		.shelf-grid.lg-5 :global(.shelf-tile:nth-child(5n + 1) .ledge),
		.shelf-grid.lg-6 :global(.shelf-tile:nth-child(6n + 1) .ledge) {
			margin-left: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
		.shelf-grid.lg-3 :global(.shelf-tile:nth-child(3n) .ledge),
		.shelf-grid.lg-4 :global(.shelf-tile:nth-child(4n) .ledge),
		.shelf-grid.lg-5 :global(.shelf-tile:nth-child(5n) .ledge),
		.shelf-grid.lg-6 :global(.shelf-tile:nth-child(6n) .ledge) {
			margin-right: calc((var(--glass-pad, 0px) + var(--gap) / 2) * -1);
		}
	}
</style>
