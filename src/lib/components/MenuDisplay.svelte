<script lang="ts">
	import PhotoFrame from '$lib/components/PhotoFrame.svelte';
	import { formatPence } from '$lib/utils/money';
	import type { MenuArt, MenuProduct } from '$lib/server/menu-photos';

	type Item = { id: number; name: string; product?: MenuProduct | null; art?: MenuArt | null };
	type Section = { id: number; title: string; items: Item[] };
	type Menu = {
		menuDate: string;
		title: string | null;
		openingHoursText: string | null;
		noteText: string | null;
		sections: Section[];
		star?: MenuProduct | null;
	};

	let {
		menu,
		eyebrow,
		viewHref,
		headingLevel = 'h1',
		showOrder = true
	}: {
		menu: Menu;
		eyebrow?: string;
		viewHref?: string;
		// The /menus page already has its own main heading, so it uses h2 here.
		headingLevel?: 'h1' | 'h2';
		showOrder?: boolean;
	} = $props();

	function formatDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(`${dateStr}T00:00:00`));
	}

	// Each section card gets its own colour ribbon and a slight tilt, so the board
	// feels hand-made, while the rows inside stay perfectly regular and easy to scan.
	const ribbons = ['ribbon-pink', 'ribbon-gold', 'ribbon-ink'];
	const dots = ['#e98095', '#e8a64a', '#8fc7a4', '#7fb2e5', '#c795d8'];
</script>

<div class="board rounded-[2rem] p-6 sm:p-10">
	<div class="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
		{#if menu.star?.imageUrl}
			{@const star = menu.star}
			<a
				href={`/product/${star.slug}`}
				class="star group order-first mx-auto sm:order-last sm:mx-0"
			>
				<span class="star-plate">
					<PhotoFrame
						src={star.imageUrl!}
						alt=""
						sizes="(min-width: 640px) 200px, 170px"
						widths={[320, 480, 640]}
						defaultWidth={480}
						zoom={star.zoom}
						focal={star.focal}
						class="aspect-square w-full rounded-full"
					/>
					<span class="star-sticker" aria-hidden="true">Star<br />bake</span>
				</span>
				<span
					class="mt-3 block text-center font-display text-lg leading-tight text-ink group-hover:text-pink-deep"
					>{star.name}</span
				>
			</a>
		{/if}

		<div>
			<div class="flex flex-wrap items-start justify-between gap-3">
				<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">
					{eyebrow ?? formatDate(menu.menuDate)}
				</p>
				{#if viewHref}
					<a href={viewHref} class="text-sm font-semibold text-pink-deep hover:underline"
						>View full page &rarr;</a
					>
				{/if}
			</div>
			<svelte:element this={headingLevel} class="mt-2 font-display text-4xl text-ink sm:text-5xl"
				>{menu.title || 'Menu for the weekend'}</svelte:element
			>
			{#if eyebrow}
				<p class="mt-1 text-base font-semibold text-ink-soft">{formatDate(menu.menuDate)}</p>
			{/if}

			<div class="mt-4 flex flex-wrap items-center gap-3">
				{#if menu.openingHoursText}
					<p class="inline-block rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-cream">
						{menu.openingHoursText}
					</p>
				{/if}
				{#if showOrder}
					<a
						href="/shop"
						class="inline-flex rounded-full bg-pink-deep px-5 py-2 text-sm font-semibold text-cream shadow-soft transition-colors hover:bg-pink-darker"
					>
						Order for pickup
					</a>
				{/if}
			</div>
		</div>
	</div>

	{#if menu.noteText}
		<p class="mt-5 max-w-2xl leading-relaxed text-ink-soft italic">{menu.noteText}</p>
	{/if}

	<div class="mt-10 grid items-start gap-7 md:grid-cols-2">
		{#each menu.sections as section, si (section.id)}
			<section class="paper {si % 2 === 0 ? 'tilt-left' : 'tilt-right'}">
				<svelte:element
					this={headingLevel === 'h1' ? 'h2' : 'h3'}
					class="ribbon {ribbons[si % ribbons.length]}"
				>
					{section.title}
				</svelte:element>

				<ul class="rows">
					{#each section.items as item, ii (item.id)}
						{@const p = item.product}
						<li class="row">
							<svelte:element
								this={p ? 'a' : 'div'}
								href={p ? `/product/${p.slug}` : undefined}
								class="line group"
							>
								<span class="thumb" aria-hidden="true">
									<span class="thumb-img">
										{#if p?.imageUrl}
											<PhotoFrame
												src={p.imageUrl}
												alt=""
												sizes="176px"
												widths={[320, 480, 640]}
												defaultWidth={320}
												zoom={p.zoom}
												focal={p.focal}
												class="h-full w-full rounded-full"
											/>
										{:else if item.art}
											<img
												src={`/images/placeholder/${item.art.file}.svg`}
												alt=""
												loading="lazy"
												decoding="async"
												class="h-full w-full object-cover"
											/>
										{:else}
											<span class="sprinkle" style:--dot={dots[(si + ii) % dots.length]}></span>
										{/if}
									</span>
									{#if !p?.imageUrl && item.art?.badge}
										<span class="badge">{item.art.badge}</span>
									{/if}
								</span>
								<span class="name">{item.name}</span>
								{#if p}
									<span class="leader" aria-hidden="true"></span>
									<span class="price" class:price-sale={p.onSale}>{formatPence(p.pricePence)}</span>
								{/if}
							</svelte:element>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</div>

<style>
	.board {
		background:
			radial-gradient(60rem 22rem at 100% -10%, oklch(95% 0.05 85 / 0.7), transparent 60%),
			var(--color-blush);
	}

	/* A paper menu card for each section */
	.paper {
		position: relative;
		padding: 2.6rem 1.1rem 0.9rem;
		border-radius: 1.5rem;
		background: oklch(99% 0.01 85);
		border: 1px solid oklch(88% 0.03 70);
		box-shadow: 0 14px 22px -16px oklch(30% 0.05 45 / 0.5);
	}

	@media (min-width: 768px) {
		.tilt-left {
			transform: rotate(-0.5deg);
		}
		.tilt-right {
			transform: rotate(0.5deg);
			margin-top: 0.75rem;
		}
	}

	/* The title ribbon sitting across the top of the card */
	.ribbon {
		position: absolute;
		top: -0.95rem;
		left: 1.1rem;
		padding: 0.4rem 1.1rem;
		border-radius: 0.55rem;
		font-family: var(--font-brand);
		font-size: 1.15rem;
		line-height: 1.1;
		letter-spacing: 0.03em;
		color: var(--color-cream);
		box-shadow: 0 6px 10px -5px oklch(25% 0.05 45 / 0.5);
		transform: rotate(-1.5deg);
	}
	.ribbon-pink {
		background: var(--color-pink-deep);
	}
	.ribbon-gold {
		background: oklch(45% 0.1 62);
	}
	.ribbon-ink {
		background: var(--color-ink);
	}

	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.row + .row {
		border-top: 1px dashed oklch(88% 0.03 70);
	}

	.line {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 0.25rem;
		text-decoration: none;
		color: var(--color-ink);
		border-radius: 0.75rem;
	}

	a.line {
		transition: background 0.2s;
	}
	a.line:hover,
	a.line:focus-visible {
		background: oklch(96% 0.03 8);
		outline: none;
	}
	a.line:focus-visible {
		box-shadow: 0 0 0 3px var(--color-pink-deep);
	}

	.thumb {
		position: relative;
		flex: none;
		width: 3.25rem;
		height: 3.25rem;
		transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.thumb-img {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		overflow: hidden;
		border: 3px solid oklch(99% 0.008 80);
		background: var(--color-cream-dim);
		box-shadow:
			0 0 0 1px oklch(85% 0.025 70),
			0 6px 8px -5px oklch(30% 0.05 45 / 0.5);
	}
	/* Rows lift slightly when hovered... */
	a.line:hover .thumb {
		transform: scale(1.1) rotate(-3deg);
	}

	/* ...and a photo grows big enough to see properly when the pointer is on it
	   (or when its row has keyboard focus), then settles back when it leaves. */
	@media (hover: hover) {
		.row:hover {
			position: relative;
			z-index: 30;
		}
		.thumb {
			transform-origin: left center;
		}
		.thumb:hover,
		a.line:hover .thumb:hover,
		a.line:focus-visible .thumb {
			z-index: 40;
			transform: scale(3.4) rotate(0deg);
			filter: drop-shadow(0 18px 18px oklch(25% 0.05 45 / 0.45));
		}
	}

	.thumb-img :global(img) {
		border-radius: 50%;
	}

	/* A small ingredient emoji tucked onto illustrated bakes */
	.badge {
		position: absolute;
		right: -0.3rem;
		bottom: -0.25rem;
		display: grid;
		place-items: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 50%;
		background: oklch(99% 0.01 85);
		border: 1px solid oklch(85% 0.025 70);
		font-size: 0.8rem;
		line-height: 1;
	}

	/* The star bake shown big at the top of the menu */
	.star {
		display: block;
		width: 10.5rem;
		text-decoration: none;
	}
	@media (min-width: 640px) {
		.star {
			width: 12.5rem;
		}
	}
	.star-plate {
		position: relative;
		display: block;
		border-radius: 50%;
		border: 6px solid oklch(99% 0.008 80);
		box-shadow:
			0 0 0 1px oklch(85% 0.025 70),
			0 18px 24px -14px oklch(30% 0.05 45 / 0.55);
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.star-plate :global(img) {
		border-radius: 50%;
	}
	.star:hover .star-plate,
	.star:focus-visible .star-plate {
		transform: rotate(-2deg) scale(1.03);
	}
	.star:focus-visible {
		outline: 3px solid var(--color-pink-deep);
		outline-offset: 4px;
		border-radius: 1rem;
	}
	.star-sticker {
		position: absolute;
		top: -0.4rem;
		left: -0.6rem;
		display: grid;
		place-items: center;
		width: 3.6rem;
		height: 3.6rem;
		border-radius: 50%;
		background: var(--color-gold);
		color: oklch(28% 0.05 55);
		font-family: var(--font-brand);
		font-size: 0.7rem;
		line-height: 1.1;
		text-align: center;
		text-transform: uppercase;
		transform: rotate(-14deg);
		box-shadow:
			0 6px 10px -4px oklch(25% 0.05 45 / 0.45),
			inset 0 0 0 2px oklch(99% 0.01 85 / 0.7);
	}

	/* Bakes with no photo get a little sprinkle instead */
	.sprinkle {
		display: block;
		width: 100%;
		height: 100%;
		background:
			radial-gradient(circle at 30% 35%, var(--dot) 0 12%, transparent 13%),
			radial-gradient(circle at 68% 30%, oklch(78% 0.12 72) 0 10%, transparent 11%),
			radial-gradient(circle at 55% 70%, var(--dot) 0 11%, transparent 12%),
			radial-gradient(circle at 25% 72%, oklch(70% 0.1 200) 0 9%, transparent 10%),
			var(--color-blush);
		opacity: 0.9;
	}

	.name {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.05rem;
		line-height: 1.2;
	}
	a.line:hover .name {
		color: var(--color-pink-deep);
	}

	.leader {
		flex: 1;
		min-width: 0.75rem;
		align-self: flex-end;
		margin-bottom: 0.45rem;
		border-bottom: 2px dotted oklch(75% 0.04 60);
	}

	.price {
		flex: none;
		padding: 0.1rem 0.6rem;
		border-radius: 999px;
		background: var(--color-ink);
		color: var(--color-cream);
		font-family: var(--font-brand);
		font-size: 0.85rem;
		line-height: 1.5;
	}
	.price-sale {
		background: var(--color-pink-deep);
	}

	@media (prefers-reduced-motion: reduce) {
		.thumb,
		.star-plate {
			transition: none;
		}
		.star:hover .star-plate {
			transform: none;
		}
		.tilt-left,
		.tilt-right {
			transform: none;
		}
	}
</style>
