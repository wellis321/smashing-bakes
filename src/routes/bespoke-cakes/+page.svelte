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
</script>

<SeoHead
	title="Bespoke cakes — Smashin' Bakes"
	description="Bespoke, made-to-order cakes from Smashin' Bakes in Barrhead — tell us the occasion and we'll help bring it to life."
	image={data.imageUrl ?? undefined}
/>

<section class="mx-auto max-w-5xl px-5 pt-14 pb-8 sm:px-8">
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
			class="mt-8 flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto px-5 pb-4 sm:px-8 [&::-webkit-scrollbar]:hidden"
		>
			{#each data.galleryItems as item (item.id)}
				<figure class="w-[78vw] shrink-0 snap-center sm:w-[420px]">
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
			{/each}
		</div>
	</section>
{/if}

{#if secondQuote}
	<section class="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
		<TestimonialQuote quote={secondQuote.quote} authorName={secondQuote.authorName} />
	</section>
{/if}

<section class="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
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
