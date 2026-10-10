<script lang="ts">
	import type { Snippet } from 'svelte';
	import FulfilmentBenefits from '$lib/components/FulfilmentBenefits.svelte';
	import SignBoard from './SignBoard.svelte';

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
	<SignBoard {eyebrow} {title} {help} />
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
