<script lang="ts">
	import type { Snippet } from 'svelte';
	import FulfilmentBenefits from '$lib/components/FulfilmentBenefits.svelte';

	// The gold-lettered title board, intro, selling points and category chips.
	// `activeSlug` highlights the current category (null = "All").
	let {
		eyebrow,
		title,
		intro = null,
		categories,
		activeSlug = null,
		help
	}: {
		eyebrow: string;
		title: string;
		intro?: string | null;
		categories: { id: number; name: string; slug: string }[];
		activeSlug?: string | null;
		help?: Snippet;
	} = $props();
</script>

<header class="mx-auto max-w-3xl text-center">
	<div class="sign">
		<p class="sign-eyebrow">{eyebrow}</p>
		<div class="flex flex-wrap items-center justify-center gap-3">
			<h1 class="sign-title">{title}</h1>
			{@render help?.()}
		</div>
	</div>
	{#if intro}
		<p
			class="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-ink-soft sm:mt-6 sm:text-base"
		>
			{intro}
		</p>
	{/if}
	<div class="benefits mt-5">
		<FulfilmentBenefits variant="compact" />
	</div>

	<nav
		class="chips mt-6 flex gap-2.5 overflow-x-auto pb-2 sm:mt-7 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0"
		aria-label="Shop categories"
	>
		{#if activeSlug === null}
			<span class="chip chip-active" aria-current="page">All</span>
		{:else}
			<a href="/shop" class="chip">All</a>
		{/if}
		{#each categories as category (category.id)}
			{#if category.slug === activeSlug}
				<span class="chip chip-active" aria-current="page">{category.name}</span>
			{:else}
				<a href={`/shop/${category.slug}`} class="chip">{category.name}</a>
			{/if}
		{/each}
	</nav>
</header>

<style>
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
</style>
