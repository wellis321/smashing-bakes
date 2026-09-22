<script lang="ts">
	import { page } from '$app/state';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import BespokeOrderForm from '$lib/components/BespokeOrderForm.svelte';
	import TestimonialQuote from '$lib/components/TestimonialQuote.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// This page has no actions of its own — the embedded form posts to
	// /contact, whose action does the actual insert/notify. `page.form` is
	// shared app state (not scoped to the route that owns the action), so it
	// still reflects that result here once submitted — hence reading it via
	// $app/state rather than this route's own (actionless) generated types.
	const form = $derived(
		page.form as {
			success?: boolean;
			message?: string;
			values?: { name: string; email: string; phone: string; details: string };
		} | null
	);

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

{#snippet galleryFigure(item: (typeof data.galleryItems)[number])}
	<figure class="w-[78vw] shrink-0 sm:w-[420px]">
		<div class="aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-cream-dim">
			<img
				src={item.imageUrl}
				alt={item.caption ?? "A bespoke Smashin' Bakes cake design"}
				class="h-full w-full object-cover"
				style:object-position={item.focalPoint}
				style:transform={`scale(${item.imageZoom / 100})`}
			/>
		</div>
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

<section class="mx-auto max-w-5xl px-5 pt-10 pb-8 sm:px-8">
	<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">Bespoke cakes</p>
	<h1 class="mt-2 font-display text-4xl text-ink sm:text-5xl">{data.heading}</h1>
	<p class="mt-4 max-w-xl leading-relaxed text-ink-soft">{data.intro}</p>
</section>

{#if data.imageUrl}
	<section class="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
		<div class="aspect-[16/9] w-full overflow-hidden rounded-[2rem] bg-cream-dim sm:aspect-[21/9]">
			<img
				src={data.imageUrl}
				alt="A bespoke Smashin' Bakes cake"
				class="h-full w-full object-cover"
				style:object-position={data.imageFocalPoint}
				style:transform={`scale(${data.imageZoom / 100})`}
			/>
		</div>
	</section>
{/if}

{#if firstQuote}
	<section class="mx-auto max-w-5xl px-5 pb-14 sm:px-8">
		<TestimonialQuote quote={firstQuote.quote} authorName={firstQuote.authorName} />
	</section>
{/if}

{#if data.galleryItems.length > 0}
	<section class="pb-16">
		<div class="mx-auto max-w-5xl px-5 sm:px-8">
			<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">Some of our work</p>
			<h2 class="mt-2 font-display text-3xl text-ink sm:text-4xl">Past designs</h2>
		</div>

		<div
			class="gallery-track-wrap mt-8 px-5 pb-4 sm:px-8"
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
	</section>
{/if}

{#if secondQuote}
	<section class="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
		<TestimonialQuote quote={secondQuote.quote} authorName={secondQuote.authorName} />
	</section>
{/if}

<section id="enquiry-form" class="mx-auto max-w-3xl scroll-mt-24 px-5 pb-16 sm:px-8">
	<BespokeOrderForm {form} action="/contact" />
</section>

{#if moreQuotes.length > 0}
	<section class="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
		<h2 class="text-center font-display text-2xl text-ink">More kind words</h2>
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
	</section>
{/if}

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
