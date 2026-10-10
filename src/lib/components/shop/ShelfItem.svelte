<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import type { ProductCardData } from '$lib/types';

	// `plain` drops the price tag and stickers and links to `href` instead, so the
	// same plate-on-a-shelf look can show categories as well as bakes.
	let {
		product,
		index = 0,
		fallbackSrc = null,
		plain = false,
		href = undefined
	}: {
		product: ProductCardData;
		index?: number;
		fallbackSrc?: string | null;
		plain?: boolean;
		href?: string;
	} = $props();

	const image = $derived(product.images[0]);
	// No photo yet: show the category's own picture rather than an empty plate.
	const shownSrc = $derived(image?.url ?? fallbackSrc);
	const onSale = $derived(product.badge === 'sale' && product.salePricePence != null);
	const price = $derived(onSale ? product.salePricePence! : product.basePricePence);
</script>

<!--
	One bake sitting on a shelf: round "plate" photo, a hanging price tag and a
	wooden ledge. The ledge's width is set by the shelf grid (see the shop page)
	so neighbouring ledges join up into one long board.
-->
<a
	href={href ?? `/product/${product.slug}`}
	class="shelf-tile group"
	style:--i={index}
	aria-label={plain
		? product.name
		: `${product.name}, ${formatPence(price)}${onSale ? ' (on sale)' : ''}`}
>
	<div class="plate-wrap">
		{#if plain}
			<!-- no stickers on a category plate -->
		{:else if product.badge === 'new'}
			<span class="sticker sticker-new" aria-hidden="true">New</span>
		{:else if onSale}
			<span class="sticker sticker-sale" aria-hidden="true">Sale</span>
		{/if}

		<span class="contact-shadow" aria-hidden="true"></span>
		<div class="plate">
			{#if shownSrc}
				<img
					src={shownSrc}
					alt={image ? (image.altText ?? product.name) : ''}
					loading="lazy"
					class="h-full w-full rounded-full object-cover"
					onerror={(event) => ((event.currentTarget as HTMLImageElement).style.display = 'none')}
				/>
			{/if}
		</div>

		{#if !plain}
			<span class="tag" class:tag-sale={onSale} aria-hidden="true">
				<span class="tag-price">{formatPence(price)}</span>
				{#if onSale}
					<span class="tag-was">{formatPence(product.basePricePence)}</span>
				{/if}
			</span>
		{/if}
	</div>

	<span class="ledge" aria-hidden="true"></span>
	<h3 class="name">{product.name}</h3>
</a>

<style>
	.shelf-tile {
		position: relative;
		display: block;
		padding-top: 0.5rem;
		outline: none;
	}

	.plate-wrap {
		position: relative;
		z-index: 2;
		width: min(100%, var(--plate-max, 15rem));
		margin: 0 auto -0.55rem;
	}

	.plate {
		aspect-ratio: 1;
		border-radius: 50%;
		border: clamp(5px, 1.3vw, 8px) solid oklch(99% 0.008 80);
		background: var(--color-cream-dim);
		box-shadow:
			0 0 0 1px oklch(85% 0.025 70),
			inset 0 0 0 1px oklch(88% 0.02 70),
			0 18px 22px -14px oklch(30% 0.05 45 / 0.55);
		transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.contact-shadow {
		position: absolute;
		z-index: -1;
		left: 10%;
		right: 10%;
		bottom: -0.35rem;
		height: 0.9rem;
		border-radius: 50%;
		background: radial-gradient(closest-side, oklch(25% 0.05 45 / 0.5), transparent);
		filter: blur(2px);
	}

	/* The shelf board. Its side margins are overridden by the shelf grid so boards
	   run edge to edge across the whole window. */
	.ledge {
		position: relative;
		z-index: 1;
		display: block;
		height: 1.1rem;
		margin: 0 calc(var(--gap, 1.5rem) / -2);
		border-radius: 0;
		background:
			linear-gradient(180deg, oklch(80% 0.07 70) 0 2px, transparent 2px),
			linear-gradient(180deg, oklch(60% 0.08 62), oklch(43% 0.07 50));
		box-shadow:
			0 12px 14px -8px oklch(25% 0.05 45 / 0.45),
			inset 0 -2px 0 oklch(35% 0.06 48 / 0.6);
	}

	.name {
		margin-top: 0.95rem;
		text-align: center;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: clamp(0.95rem, 2.4vw, 1.1rem);
		line-height: 1.15;
		min-height: 2.3em;
		color: var(--color-ink);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-wrap: balance;
	}

	/* Hanging price tag */
	.tag {
		position: absolute;
		z-index: 3;
		top: 4%;
		right: -3%;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 0.4rem 0.7rem 0.35rem;
		border-radius: 0.35rem 0.35rem 0.5rem 0.5rem;
		background: oklch(98.5% 0.014 85);
		border: 1.5px solid var(--color-gold-deep);
		box-shadow: 0 6px 10px -4px oklch(25% 0.05 45 / 0.4);
		transform: rotate(7deg);
		transform-origin: 50% -14px;
		transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.tag::before {
		/* the string */
		content: '';
		position: absolute;
		left: 50%;
		bottom: 100%;
		width: 1.5px;
		height: 14px;
		background: var(--color-gold-deep);
		transform: translateX(-50%);
	}

	.tag::after {
		/* the punched hole */
		content: '';
		position: absolute;
		top: 0.3rem;
		left: 50%;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--color-cream-dim);
		box-shadow: inset 0 0 0 1px var(--color-gold-deep);
		transform: translateX(-50%);
	}

	.tag-price {
		margin-top: 0.55rem;
		font-family: var(--font-brand);
		font-size: clamp(0.85rem, 2.2vw, 1.05rem);
		line-height: 1;
		color: var(--color-ink);
	}

	.tag-was {
		margin-top: 0.15rem;
		font-size: 0.7rem;
		line-height: 1;
		color: oklch(38% 0.03 50);
		text-decoration: line-through;
	}

	.tag-sale {
		background: var(--color-pink-deep);
		border-color: oklch(45% 0.13 8);
	}

	.tag-sale .tag-price {
		color: oklch(98% 0.01 85);
	}

	.tag-sale .tag-was {
		color: oklch(92% 0.04 8);
	}

	.sticker {
		position: absolute;
		z-index: 3;
		top: -2%;
		left: -2%;
		display: grid;
		place-items: center;
		width: clamp(2.6rem, 7vw, 3.4rem);
		aspect-ratio: 1;
		border-radius: 50%;
		font-family: var(--font-brand);
		font-size: clamp(0.6rem, 1.8vw, 0.78rem);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transform: rotate(-14deg);
		box-shadow:
			0 6px 10px -4px oklch(25% 0.05 45 / 0.45),
			inset 0 0 0 2px oklch(99% 0.01 85 / 0.7);
	}

	.sticker-new {
		background: var(--color-gold);
		color: oklch(28% 0.05 55);
	}

	.sticker-sale {
		background: var(--color-pink-deep);
		color: oklch(98% 0.01 85);
	}

	.shelf-tile:focus-visible .plate {
		outline: 3px solid var(--color-pink-deep);
		outline-offset: 4px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.shelf-tile {
			animation: tile-in 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
			animation-delay: calc(min(var(--i, 0), 11) * 55ms + 80ms);
		}

		.shelf-tile:hover .plate,
		.shelf-tile:focus-visible .plate {
			transform: translateY(-7px) rotate(-1.2deg);
		}

		.shelf-tile:hover .tag,
		.shelf-tile:focus-visible .tag {
			animation: tag-swing 0.9s ease-out;
		}

		.shelf-tile:hover .contact-shadow {
			transform: scale(0.92);
			opacity: 0.8;
		}
	}

	@keyframes tile-in {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
	}

	@keyframes tag-swing {
		0% {
			transform: rotate(7deg);
		}
		25% {
			transform: rotate(-9deg);
		}
		55% {
			transform: rotate(13deg);
		}
		80% {
			transform: rotate(3deg);
		}
		100% {
			transform: rotate(7deg);
		}
	}
</style>
