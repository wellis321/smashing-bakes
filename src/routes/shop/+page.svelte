<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FulfilmentBenefits from '$lib/components/FulfilmentBenefits.svelte';
	import ShopAwning from '$lib/components/shop/ShopAwning.svelte';
	import ShelfItem from '$lib/components/shop/ShelfItem.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// One shelf per category, in the shop's own category order.
	const shelves = $derived(
		data.categories
			.map((category) => ({
				category,
				products: data.products.filter((p) => p.categoryId === category.id)
			}))
			.filter((shelf) => shelf.products.length > 0)
	);
</script>

<SeoHead
	title="Shop all bakes — Smashin' Bakes"
	description="Cupcakes, brownies, cookies, pies and cakes, baked fresh in Barrhead. Order online for Friday & Saturday pickup or free delivery."
/>

<section class="mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-8 sm:pt-14">
	<div class="scene">
		<div class="awning-wrap">
			<ShopAwning />
		</div>

		<!-- Hanging sign: big screens only, where there's room beside the title board -->
		<div class="open-sign" aria-hidden="true">
			<span class="open-string open-string-l"></span>
			<span class="open-string open-string-r"></span>
			<p class="open-word">Open</p>
			{#each data.openingHours as line (line)}
				<p class="open-line">{line}</p>
			{/each}
		</div>

		<div class="window">
			<div class="glass">
				<header class="relative z-[1] mx-auto max-w-3xl text-center">
					<div class="sign">
						<p class="sign-eyebrow">The full menu</p>
						<div class="flex flex-wrap items-center justify-center gap-3">
							<h1 class="sign-title">Shop all bakes</h1>
							{#if data.staff}
								<HelpLink
									section="products"
									title="Staff only: how to manage products"
									task="edit-product"
									label="Staff help"
									staff
								/>
							{/if}
						</div>
					</div>
					<p
						class="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-ink-soft sm:mt-6 sm:text-base"
					>
						Everything we&rsquo;re baking this week. Pick your favourites and choose how to get them
						when you check out.
					</p>
					<div class="benefits mt-5">
						<FulfilmentBenefits variant="compact" />
					</div>

					<nav
						class="chips mt-6 flex gap-2.5 overflow-x-auto pb-2 sm:mt-7 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0"
						aria-label="Shop categories"
					>
						<span class="chip chip-active" aria-current="page">All</span>
						{#each data.categories as category (category.id)}
							<a href={`/shop/${category.slug}`} class="chip">{category.name}</a>
						{/each}
					</nav>
				</header>

				{#each shelves as shelf, shelfIndex (shelf.category.id)}
					<section
						class="shelf-block relative z-[1]"
						aria-labelledby={`shelf-${shelf.category.id}`}
					>
						<div class="chalk" class:chalk-alt={shelfIndex % 2 === 1}>
							<h2 id={`shelf-${shelf.category.id}`}>{shelf.category.name}</h2>
							<span>{shelf.products.length} {shelf.products.length === 1 ? 'bake' : 'bakes'}</span>
						</div>

						<div class="shelf-grid">
							{#each shelf.products as product, i (product.id)}
								<ShelfItem
									{product}
									index={i}
									fallbackSrc={shelf.category.imageUrl ??
										`/images/placeholder/${shelf.category.slug}.svg`}
								/>
							{/each}
						</div>
					</section>
				{:else}
					<p class="mt-12 text-center text-ink-soft">
						The window&rsquo;s being restocked &mdash; check back soon.
					</p>
				{/each}

				<div class="reflection" aria-hidden="true"></div>
			</div>
		</div>
		<div class="sill" aria-hidden="true"></div>
	</div>
</section>

<style>
	.scene {
		position: relative;
	}

	.awning-wrap {
		margin-inline: -0.75rem;
	}

	/* ---- The window itself ---- */
	.window {
		position: relative;
		margin-top: -0.35rem;
		padding: clamp(0.55rem, 1.6vw, 0.9rem);
		background: linear-gradient(180deg, oklch(30% 0.04 50), var(--color-ink));
		box-shadow: inset 0 0 0 1px oklch(40% 0.04 52);
	}

	.glass {
		--glass-pad: 1.25rem;
		--gap: 1rem;
		position: relative;
		overflow: hidden;
		padding: 2.75rem var(--glass-pad) 3.5rem;
		border-radius: 0.4rem;
		background: linear-gradient(
			180deg,
			oklch(97% 0.022 82) 0%,
			oklch(96.5% 0.03 62) 55%,
			oklch(93.5% 0.045 22) 100%
		);
		box-shadow:
			inset 0 18px 24px -12px oklch(24% 0.035 50 / 0.4),
			inset 0 0 0 3px oklch(62% 0.13 63 / 0.4);
	}

	@media (min-width: 640px) {
		.glass {
			--glass-pad: 2.5rem;
			--gap: 1.5rem;
			padding-top: 3.5rem;
		}
	}

	.reflection {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: linear-gradient(
			112deg,
			transparent 0 24%,
			oklch(100% 0 0 / 0.3) 24% 30%,
			transparent 30% 35%,
			oklch(100% 0 0 / 0.18) 35% 37%,
			transparent 37%
		);
	}

	.sill {
		margin: 0 -0.75rem;
		height: 1.15rem;
		border-radius: 0 0 0.7rem 0.7rem;
		background:
			linear-gradient(180deg, oklch(52% 0.05 52) 0 3px, transparent 3px),
			linear-gradient(180deg, oklch(34% 0.045 50), var(--color-ink));
		box-shadow: 0 20px 26px -14px oklch(24% 0.035 50 / 0.5);
	}

	/* ---- Title board, gold lettering like the real shop sign ---- */
	.sign {
		display: inline-block;
		max-width: 100%;
		padding: 1.1rem clamp(1.4rem, 5vw, 3rem) 1.2rem;
		border-radius: 2.75rem 2.75rem 1rem 1rem;
		background: linear-gradient(160deg, oklch(30% 0.04 50), var(--color-ink));
		border: 3px solid var(--color-gold-deep);
		box-shadow:
			inset 0 0 0 2px oklch(24% 0.035 50),
			inset 0 0 0 3px oklch(78% 0.12 72 / 0.45),
			0 14px 20px -12px oklch(24% 0.035 50 / 0.55);
	}

	.sign-eyebrow {
		font-family: var(--font-brand);
		font-size: 0.7rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--color-blush-deep);
	}

	.sign-title {
		margin-top: 0.35rem;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.9rem, 6.5vw, 3.1rem);
		letter-spacing: 0.01em;
		line-height: 1;
		text-transform: uppercase;
		color: var(--color-gold);
		text-shadow:
			1px 1px 0 var(--color-gold-deep),
			2px 2px 0 var(--color-gold-deep),
			3px 3px 0 var(--color-gold-deep),
			4px 4px 0 oklch(36% 0.06 52),
			5px 5px 0 oklch(36% 0.06 52);
	}

	.benefits :global(> div) {
		justify-content: center;
	}

	.chips {
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.chips::-webkit-scrollbar {
		display: none;
	}

	.chip {
		flex-shrink: 0;
		white-space: nowrap;
		border-radius: 999px;
		padding: 0.5rem 1.1rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-ink-soft);
		background: oklch(100% 0 0 / 0.65);
		border: 1px solid oklch(24% 0.035 50 / 0.12);
		transition:
			background-color 0.2s,
			color 0.2s,
			border-color 0.2s;
	}

	a.chip:hover {
		background: var(--color-blush);
		color: var(--color-ink);
		border-color: var(--color-pink);
	}

	.chip-active {
		background: var(--color-ink);
		color: var(--color-cream);
		border-color: var(--color-ink);
	}

	/* ---- Hanging OPEN sign ---- */
	.open-sign {
		display: none;
	}

	@media (min-width: 1024px) {
		.open-sign {
			display: block;
			position: absolute;
			z-index: 7;
			top: 4.4rem;
			right: 3.5rem;
			width: 10.25rem;
			padding: 0.9rem 0.6rem 0.95rem;
			text-align: center;
			border-radius: 0.9rem;
			background: var(--color-pink-deep);
			border: 3px solid oklch(98% 0.015 85);
			box-shadow:
				0 14px 18px -10px oklch(24% 0.035 50 / 0.6),
				inset 0 0 0 2px var(--color-pink-deep);
			transform: rotate(2.5deg);
			transform-origin: 50% -1.4rem;
		}
	}

	.open-string {
		position: absolute;
		bottom: 100%;
		width: 2px;
		height: 1.5rem;
		background: oklch(98% 0.015 85);
	}

	.open-string-l {
		left: 22%;
	}

	.open-string-r {
		right: 22%;
	}

	.open-word {
		font-family: var(--font-brand);
		font-size: 1.7rem;
		line-height: 1;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: oklch(98% 0.015 85);
		text-shadow: 2px 2px 0 oklch(40% 0.12 8);
	}

	.open-line {
		margin-top: 0.4rem;
		font-size: 0.76rem;
		line-height: 1.2;
		font-weight: 700;
		white-space: nowrap;
		color: oklch(96% 0.025 8);
	}

	.open-word + .open-line {
		margin-top: 0.65rem;
		padding-top: 0.6rem;
		border-top: 1.5px dashed oklch(98% 0.015 85 / 0.7);
	}

	/* ---- Shelves ---- */
	.shelf-block {
		margin-top: 2.75rem;
	}

	@media (min-width: 640px) {
		.shelf-block {
			margin-top: 3.75rem;
		}
	}

	.chalk {
		display: inline-flex;
		align-items: baseline;
		gap: 0.85rem;
		margin-bottom: 2.4rem;
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
		margin-inline: calc(var(--glass-pad) * -1);
		padding-inline: var(--glass-pad);
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
	}

	/* Make each row's board reach the glass edge on both sides: the first and last
	   tile in a row, and the very last tile (which may sit in a short final row,
	   so it reaches as far as the clipped grid edge allows). */
	.shelf-grid :global(.shelf-tile:last-child .ledge) {
		margin-right: -100vw;
	}

	@media (max-width: 639px) {
		.shelf-grid :global(.shelf-tile:nth-child(2n + 1) .ledge) {
			margin-left: calc((var(--glass-pad) + var(--gap) / 2) * -1);
		}
		.shelf-grid :global(.shelf-tile:nth-child(2n) .ledge) {
			margin-right: calc((var(--glass-pad) + var(--gap) / 2) * -1);
		}
	}

	@media (min-width: 640px) and (max-width: 1023px) {
		.shelf-grid :global(.shelf-tile:nth-child(3n + 1) .ledge) {
			margin-left: calc((var(--glass-pad) + var(--gap) / 2) * -1);
		}
		.shelf-grid :global(.shelf-tile:nth-child(3n) .ledge) {
			margin-right: calc((var(--glass-pad) + var(--gap) / 2) * -1);
		}
	}

	@media (min-width: 1024px) {
		.shelf-grid :global(.shelf-tile:nth-child(4n + 1) .ledge) {
			margin-left: calc((var(--glass-pad) + var(--gap) / 2) * -1);
		}
		.shelf-grid :global(.shelf-tile:nth-child(4n) .ledge) {
			margin-right: calc((var(--glass-pad) + var(--gap) / 2) * -1);
		}
	}
</style>
