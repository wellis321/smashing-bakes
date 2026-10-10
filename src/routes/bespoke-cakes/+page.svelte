<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import BespokeOrderForm from '$lib/components/BespokeOrderForm.svelte';
	import TestimonialQuote from '$lib/components/TestimonialQuote.svelte';
	import PhotoFrame from '$lib/components/PhotoFrame.svelte';
	import ShopWindow from '$lib/components/shop/ShopWindow.svelte';
	import SignBoard from '$lib/components/shop/SignBoard.svelte';
	import Framed from '$lib/components/shop/Framed.svelte';
	import ChalkSign from '$lib/components/shop/ChalkSign.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Quotes are meant to be dotted throughout the page rather than bunched
	// into one testimonials block — the first goes between the hero and the
	// gallery, the second between the gallery and the form, and anything
	// beyond that shows as a small grid near the bottom.
	const firstQuote = $derived(data.testimonials[0] ?? null);
	const secondQuote = $derived(data.testimonials[1] ?? null);
	const moreQuotes = $derived(data.testimonials.slice(2));

	// Pace the auto-scroll to the number of photos so it never feels rushed
	// with only a couple of designs, or sluggish with a lot of them.
	const galleryDurationSeconds = $derived(Math.max(20, data.galleryItems.length * 6));
</script>

<SeoHead
	title="Bespoke cakes — Smashin' Bakes"
	description="Bespoke, made-to-order cakes from Smashin' Bakes in Barrhead — tell us the occasion and we'll help bring it to life."
	image={data.imageUrl ?? undefined}
/>

{#snippet skipArrow()}
	<svg
		width="15"
		height="15"
		viewBox="0 0 20 20"
		fill="none"
		class="shrink-0 transition-transform duration-200 group-hover:translate-y-0.5"
		aria-hidden="true"
	>
		<path
			d="M10 4v12M5 11l5 5 5-5"
			stroke="currentColor"
			stroke-width="2.2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{/snippet}

{#snippet quotesHelp()}
	{#if data.staff}
		<HelpLink
			section="bespoke-cakes"
			task="bespoke-quotes"
			title="Staff only: how to add, change or remove customer quotes"
			label="Staff help"
			staff
		/>
	{/if}
{/snippet}

{#snippet galleryHelp()}
	{#if data.staff}
		<HelpLink
			section="bespoke-cakes"
			task="bespoke-gallery"
			title="Staff only: how to add or remove cakes in this gallery"
			label="Staff help"
			staff
		/>
	{/if}
{/snippet}

{#snippet galleryFigure(item: (typeof data.galleryItems)[number])}
	<figure class="w-[78vw] shrink-0 sm:w-[420px]">
		<PhotoFrame
			src={item.imageUrl}
			alt={item.caption ?? "A bespoke Smashin' Bakes cake design"}
			sizes="(min-width: 640px) 420px, 78vw"
			zoom={item.imageZoom}
			focal={item.focalPoint}
			class="aspect-[4/5] w-full rounded-[1.75rem]"
		/>
		{#if item.caption}
			<figcaption class="mt-2.5 text-sm text-ink-soft">{item.caption}</figcaption>
		{/if}
	</figure>
{/snippet}

<div class="mx-auto max-w-5xl px-5 pt-8 text-center sm:px-8">
	<a
		href="#enquiry-form"
		class="group inline-flex items-center gap-2.5 rounded-full bg-pink-deep px-6 py-3.5 text-sm font-bold text-cream shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink hover:shadow-lg sm:text-base"
	>
		{@render skipArrow()}
		Already know what you want? Skip straight to the form
		{@render skipArrow()}
	</a>
</div>

{#snippet heroText()}
	<SignBoard eyebrow="Bespoke cakes" title={data.heading}>
		{#snippet help()}
			{#if data.staff}
				<HelpLink
					section="bespoke-cakes"
					title="Staff only: how to edit this page"
					task="bespoke-page"
					label="Staff help"
					staff
				/>
			{/if}
		{/snippet}
	</SignBoard>
	<p class="mt-6 max-w-xl leading-relaxed text-ink-soft">{data.intro}</p>
{/snippet}

<ShopWindow openingHours={data.openingHours}>
	{#if data.imageUrl && data.imageShape === 'tall'}
		<div class="pt-10 pb-10">
			<div class="grid items-center gap-8 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-12">
				<div>{@render heroText()}</div>
				<Framed class="mx-auto w-full max-w-sm md:max-w-none">
					<PhotoFrame
						src={data.imageUrl}
						alt="A bespoke Smashin' Bakes cake"
						sizes="(min-width: 768px) 50vw, 24rem"
						widths={[480, 640, 960, 1280]}
						eager
						zoom={data.imageZoom}
						focal={data.imageFocalPoint}
						class="aspect-[4/5] w-full"
					/>
				</Framed>
			</div>
		</div>
	{:else}
		<div class="mx-auto max-w-2xl pb-8 text-center [&>p]:mx-auto">
			{@render heroText()}
		</div>

		{#if data.imageUrl}
			<div class="pb-8">
				<Framed>
					<PhotoFrame
						src={data.imageUrl}
						alt="A bespoke Smashin' Bakes cake"
						sizes="(min-width: 1024px) 1024px, 100vw"
						widths={[640, 960, 1280, 1600]}
						eager
						zoom={data.imageZoom}
						focal={data.imageFocalPoint}
						class="aspect-[16/9] w-full sm:aspect-[21/9]"
					/>
				</Framed>
			</div>
		{/if}
	{/if}

	{#if data.staff && data.testimonials.length === 0}
		<div class="pb-14">
			<div class="rounded-2xl border-2 border-dashed border-pink/40 p-6 text-center">
				<p class="text-sm text-ink-soft">
					Staff only: there are no customer quotes yet, so quotes aren't shown to visitors.
				</p>
				<div class="mt-3 flex justify-center">{@render quotesHelp()}</div>
			</div>
		</div>
	{/if}

	{#if firstQuote}
		<div class="pb-14">
			<div class="mb-3 flex justify-end">{@render quotesHelp()}</div>
			<TestimonialQuote quote={firstQuote.quote} authorName={firstQuote.authorName} />
		</div>
	{/if}

	{#if data.staff && data.galleryItems.length === 0}
		<div class="pb-16">
			<div class="rounded-2xl border-2 border-dashed border-pink/40 p-6 text-center">
				<p class="text-sm text-ink-soft">
					Staff only: there are no cake photos in “Past designs” yet, so the gallery isn't shown to
					visitors.
				</p>
				<div class="mt-3 flex justify-center">{@render galleryHelp()}</div>
			</div>
		</div>
	{/if}

	{#if data.galleryItems.length > 0}
		<div class="pb-16">
			<div class="flex flex-wrap items-center gap-3">
				<ChalkSign title="Past designs" id="past-designs" />
				{@render galleryHelp()}
			</div>

			<div
				class="gallery-track-wrap mt-10 pb-4"
				style:margin-inline="calc(var(--glass-pad, 1.25rem) * -1)"
				style:padding-inline="var(--glass-pad, 1.25rem)"
				style:--gallery-duration={`${galleryDurationSeconds}s`}
			>
				<div class="gallery-track">
					{#each data.galleryItems as item (item.id)}
						{@render galleryFigure(item)}
					{/each}
					<div class="gallery-duplicate" aria-hidden="true">
						{#each data.galleryItems as item (`dup-${item.id}`)}
							{@render galleryFigure(item)}
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if secondQuote}
		<div class="pb-16">
			<div class="mb-3 flex justify-end">{@render quotesHelp()}</div>
			<TestimonialQuote quote={secondQuote.quote} authorName={secondQuote.authorName} />
		</div>
	{/if}

	<div id="enquiry-form" class="mx-auto max-w-3xl scroll-mt-24 pb-16">
		<BespokeOrderForm action="/contact" />
	</div>

	{#if moreQuotes.length > 0}
		<div class="pb-20">
			<div class="flex flex-wrap items-center justify-center gap-3">
				<h2 class="font-display text-2xl text-ink">More kind words</h2>
				{@render quotesHelp()}
			</div>
			<div class="mt-8 grid gap-5 sm:grid-cols-2">
				{#each moreQuotes as item (item.id)}
					<div class="rounded-2xl bg-blush p-6">
						<p class="text-sm leading-relaxed text-ink italic">&ldquo;{item.quote}&rdquo;</p>
						{#if item.authorName}
							<p class="mt-3 text-xs font-semibold tracking-wide text-pink-deep uppercase">
								{item.authorName}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</ShopWindow>

<style>
	/* Base (and prefers-reduced-motion: reduce) state: the original manual
	   horizontal scroller — swipe/drag through the photos once, no movement
	   forced on anyone who's told their OS they'd rather not have it. */
	.gallery-track-wrap {
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
	}
	.gallery-track-wrap::-webkit-scrollbar {
		display: none;
	}
	.gallery-track-wrap :global(figure) {
		scroll-snap-align: center;
	}
	.gallery-track {
		display: flex;
		gap: 1.25rem;
	}
	/* The duplicated set only exists to make the loop below seamless — kept
	   out of the accessibility tree and out of the layout entirely here. */
	.gallery-duplicate {
		display: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		.gallery-track-wrap {
			overflow: hidden;
			scroll-snap-type: none;
		}
		.gallery-track {
			width: max-content;
			animation: gallery-scroll var(--gallery-duration, 32s) linear infinite;
		}
		.gallery-track-wrap:hover .gallery-track {
			animation-play-state: paused;
		}
		.gallery-duplicate {
			display: flex;
			gap: 1.25rem;
		}
	}

	@keyframes gallery-scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
</style>
