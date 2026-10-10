<script lang="ts">
	import type { Snippet } from 'svelte';
	import ShelfItem from './ShelfItem.svelte';
	import ChalkSign from './ChalkSign.svelte';
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
		maxAcross = 5,
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
		// Most plates allowed in one row when fitting (default 5; categories use 6).
		maxAcross?: number;
		products?: ProductCardData[];
		fallbackSrc?: string | null;
		help?: Snippet;
		// Custom plates (e.g. categories) instead of products.
		children?: Snippet;
	} = $props();

	// How many plates are being laid out (0 = unknown, e.g. custom children).
	const count = $derived(fit > 0 ? fit : children ? 0 : products.length);

	// Up to `max` plates share a row. Beyond that, pick the row length (in order of
	// preference) whose last row is fullest, so 6 become 3 + 3 rather than 4 + 2.
	function balanced(n: number, max: number, prefer: number[]) {
		if (n <= max) return n;
		let best = prefer[0];
		let bestFill = 0;
		for (const cols of prefer) {
			const fill = (n % cols === 0 ? cols : n % cols) / cols;
			if (fill > bestFill) {
				best = cols;
				bestFill = fill;
			}
		}
		return best;
	}

	const lgCols = $derived(
		count > 0
			? balanced(count, maxAcross, maxAcross >= 6 ? [4, 3, 5, 6] : [4, 3, 5])
			: dense
				? 6
				: 4
	);
	// Plates are shown larger when only a few sit across the shelf.
	const plateSizes = $derived(
		fit > 0
			? '(min-width: 1024px) 24rem, (min-width: 640px) 33vw, 46vw'
			: '(min-width: 1024px) 15rem, (min-width: 640px) 26vw, 44vw'
	);
	const mdCols = $derived(count > 0 ? Math.min(count, 3) : 3);
	const smCols = $derived(count > 0 ? Math.min(count, 2) : 2);
</script>

<section
	class="shelf-block"
	style:--plate-max={fit > 0 ? '24rem' : undefined}
	aria-labelledby={label ? labelId : undefined}
>
	{#if label}
		<div class="chalk-row">
			<ChalkSign
				title={label}
				id={labelId}
				{alt}
				count={showCount && !children
					? `${products.length} ${products.length === 1 ? 'bake' : 'bakes'}`
					: null}
			/>
			{@render help?.()}
		</div>
	{/if}

	<div class={`shelf-grid lg-${lgCols} md-${mdCols} sm-${smCols}`}>
		{#if children}
			{@render children()}
		{:else}
			{#each products as product, i (product.slug)}
				<ShelfItem {product} index={i} {fallbackSrc} sizes={plateSizes} />
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
