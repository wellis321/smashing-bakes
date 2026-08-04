<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Promotions &amp; giveaways — Smashin&rsquo; Bakes</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-14 pb-8 sm:px-8">
	<p class="text-pink-deep text-sm font-semibold tracking-widest uppercase">Community</p>
	<h1 class="font-display mt-2 text-4xl text-ink sm:text-5xl">Promotions &amp; giveaways</h1>
	<p class="text-ink-soft mt-4 max-w-lg leading-relaxed">
		Giveaways, shout-outs and the odd surprise for our community &mdash; all in one place.
	</p>
</section>

<section class="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
	{#if data.promotions.length === 0}
		<p class="text-ink-soft py-16 text-center">Nothing running right now &mdash; check back soon.</p>
	{:else}
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.promotions as promo (promo.id)}
				<a href={`/promotions/${promo.slug}`} class="group block">
					<div class="bg-cream-dim relative overflow-hidden rounded-[1.75rem]">
						{#if promo.heroImageUrl}
							<img
								src={promo.heroImageUrl}
								alt={promo.title}
								class="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
							/>
						{:else}
							<div class="bg-blush flex aspect-[4/3] w-full items-center justify-center p-10">
								<Logo variant="stacked" class="h-full w-auto" />
							</div>
						{/if}
					</div>
					<h2 class="font-display mt-4 text-xl text-ink">{promo.title}</h2>
					{#if promo.tagline}
						<p class="text-ink-soft mt-1 text-sm">{promo.tagline}</p>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</section>
