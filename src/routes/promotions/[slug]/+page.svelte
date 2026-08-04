<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const promo = $derived(data.promotion);
</script>

<svelte:head>
	<title>{promo.title} — Smashin&rsquo; Bakes</title>
	{#if promo.tagline}<meta name="description" content={promo.tagline} />{/if}
</svelte:head>

<section class="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
	<a href="/promotions" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Promotions</a>

	{#if promo.heroImageUrl}
		<div class="mt-6 overflow-hidden rounded-[2rem]">
			<img src={promo.heroImageUrl} alt={promo.title} class="aspect-[16/9] w-full object-cover" />
		</div>
	{/if}

	<div class="mx-auto mt-10 max-w-2xl text-center">
		<h1 class="font-display text-4xl text-ink sm:text-5xl">{promo.title}</h1>
		{#if promo.tagline}
			<p class="text-pink font-display mt-3 text-2xl italic">{promo.tagline}</p>
		{/if}
		{#if promo.introText}
			<p class="text-ink-soft mt-6 leading-relaxed">{promo.introText}</p>
		{/if}
	</div>

	{#if promo.prizeDescription}
		<div class="bg-blush mx-auto mt-10 max-w-xl rounded-2xl p-6 text-center">
			<p class="text-ink leading-relaxed">{promo.prizeDescription}</p>
		</div>
	{/if}

	{#if promo.steps.length > 0}
		<div class="mt-14 grid gap-8 sm:grid-cols-3">
			{#each promo.steps as step, index (step.id)}
				<div class="text-center">
					<div class="bg-pink/10 text-pink-deep font-display mx-auto grid h-14 w-14 place-items-center rounded-full text-xl italic">
						{index + 1}
					</div>
					<p class="text-ink mt-3 text-sm font-semibold uppercase tracking-wide">{step.label}</p>
					<p class="text-ink-soft mt-1 text-sm">{step.description}</p>
				</div>
			{/each}
		</div>
	{/if}

	{#if promo.ctaLabel && promo.ctaUrl}
		<div class="mt-12 text-center">
			<a
				href={promo.ctaUrl}
				target="_blank"
				rel="noreferrer"
				class="bg-pink hover:bg-pink-deep inline-flex rounded-full px-7 py-3.5 font-semibold text-cream shadow-soft transition-colors"
			>
				{promo.ctaLabel}
			</a>
		</div>
	{/if}
</section>

{#if promo.areaText || promo.deadlineText}
	<section class="bg-ink text-cream mt-16 py-8">
		<div class="mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 px-5 text-center text-sm sm:flex-row sm:gap-10 sm:px-8">
			{#if promo.areaText}
				<p>{promo.areaText}</p>
			{/if}
			{#if promo.areaText && promo.deadlineText}
				<span class="hidden text-cream/30 sm:inline">&middot;</span>
			{/if}
			{#if promo.deadlineText}
				<p>{promo.deadlineText}</p>
			{/if}
		</div>
	</section>
{/if}
