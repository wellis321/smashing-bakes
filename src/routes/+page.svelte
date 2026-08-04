<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import PosterBanner from '$lib/components/PosterBanner.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Smashin&rsquo; Bakes — Small-batch cakes, cupcakes &amp; bakes in Barrhead</title>
	<meta
		name="description"
		content="Independent bakery in Barrhead. Pre-order cupcakes, brownies, cookies, pies and cakes for weekend pickup."
	/>
</svelte:head>

<!-- Hero -->
<section class="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-16 lg:pt-20">
	<div class="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
		<div class="max-w-xl">
			<p class="hero-in text-pink-deep text-sm font-semibold tracking-widest uppercase" style:--hero-delay="0ms">
				Independent bakery &middot; Barrhead
			</p>
			<h1
				class="hero-in font-display mt-4 text-5xl text-ink sm:text-6xl lg:text-[4.25rem] lg:leading-[0.98]"
				style:--hero-delay="90ms"
			>
				Cakes worth <span class="text-pink italic">queuing</span> for.
			</h1>
			<p class="hero-in text-ink-soft mt-6 max-w-md text-lg leading-relaxed" style:--hero-delay="180ms">
				Small-batch cupcakes, brownies, cookies and cakes, baked fresh every week and ready for
				pickup Friday &amp; Saturday. No two bakes are ever quite the same.
			</p>
			<div class="hero-in mt-8 flex flex-wrap items-center gap-4" style:--hero-delay="270ms">
				<a
					href="/shop"
					class="bg-pink hover:bg-pink-deep inline-flex rounded-full px-7 py-3.5 font-semibold text-cream shadow-soft transition-colors"
				>
					Order for pickup
				</a>
				<a href="#this-weeks-bakes" class="text-ink-soft hover:text-ink text-sm font-semibold underline decoration-ink/20 underline-offset-4">
					See this week&rsquo;s bakes
				</a>
			</div>
		</div>

		<div class="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
			<img
				src="/images/placeholder/cheesecakes.svg"
				alt=""
				class="hero-card-1 shadow-soft absolute top-[6%] left-[8%] aspect-square w-[58%] rounded-[2rem] object-cover"
			/>
			<img
				src="/images/placeholder/cupcakes.svg"
				alt=""
				class="hero-card-2 shadow-soft absolute top-[2%] right-[4%] aspect-square w-[46%] rounded-[2rem] object-cover"
			/>
			<img
				src="/images/placeholder/cake-slices.svg"
				alt=""
				class="hero-card-3 shadow-soft absolute bottom-[4%] left-[18%] aspect-square w-[50%] rounded-[2rem] object-cover"
			/>
		</div>
	</div>
</section>

{#if data.poster}
	<PosterBanner poster={data.poster} />
{/if}

<style>
	/* Resting transforms (always applied, independent of the entrance animation below —
	   this is what reduced-motion users and no-JS requests see immediately). */
	.hero-card-1 {
		transform: rotate(-6deg);
	}
	.hero-card-2 {
		transform: rotate(7deg);
	}
	.hero-card-3 {
		transform: rotate(4deg);
	}

	@media (prefers-reduced-motion: no-preference) {
		.hero-in {
			animation: hero-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
			animation-delay: var(--hero-delay, 0ms);
		}

		.hero-card-1 {
			animation: hero-card-in-1 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
		}
		.hero-card-2 {
			animation: hero-card-in-2 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.28s both;
		}
		.hero-card-3 {
			animation: hero-card-in-3 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
		}
	}

	@keyframes hero-rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes hero-card-in-1 {
		from {
			opacity: 0;
			transform: translate(-8%, -10%) rotate(-18deg) scale(0.88);
		}
		to {
			opacity: 1;
			transform: rotate(-6deg);
		}
	}
	@keyframes hero-card-in-2 {
		from {
			opacity: 0;
			transform: translate(9%, -9%) rotate(20deg) scale(0.88);
		}
		to {
			opacity: 1;
			transform: rotate(7deg);
		}
	}
	@keyframes hero-card-in-3 {
		from {
			opacity: 0;
			transform: translate(-6%, 10%) rotate(-8deg) scale(0.88);
		}
		to {
			opacity: 1;
			transform: rotate(4deg);
		}
	}
</style>

<!-- This week's bakes -->
<section id="this-weeks-bakes" class="mx-auto max-w-6xl px-5 py-16 sm:px-8">
	<div class="flex items-end justify-between gap-4">
		<div>
			<p class="text-pink-deep text-sm font-semibold tracking-widest uppercase">Fresh this week</p>
			<h2 class="font-display mt-2 text-3xl text-ink sm:text-4xl">This week&rsquo;s bakes</h2>
		</div>
		<a href="/shop" class="text-ink-soft hover:text-ink hidden text-sm font-semibold sm:block">Shop all &rarr;</a>
	</div>

	<div class="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
		{#each data.featured as product (product.id)}
			<ProductCard {product} />
		{/each}
	</div>
</section>

{#if data.promotion}
	<!-- Current promotion -->
	<section class="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
		<a
			href={`/promotions/${data.promotion.slug}`}
			class="group bg-pink-deep grid overflow-hidden rounded-[2rem] text-cream sm:grid-cols-[0.9fr_1.1fr]"
		>
			{#if data.promotion.heroImageUrl}
				<img
					src={data.promotion.heroImageUrl}
					alt=""
					class="aspect-[16/9] w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] sm:aspect-auto sm:h-full"
				/>
			{/if}
			<div class="flex flex-col justify-center px-8 py-10 sm:px-10">
				<p class="text-sm font-semibold tracking-widest text-cream/70 uppercase">Happening now</p>
				<h2 class="font-display mt-2 text-3xl sm:text-4xl">{data.promotion.title}</h2>
				{#if data.promotion.tagline}
					<p class="mt-3 text-cream/80 italic">{data.promotion.tagline}</p>
				{/if}
				<span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
					See how to enter &rarr;
				</span>
			</div>
		</a>
	</section>
{/if}

<!-- Category strip -->
<section class="mx-auto max-w-6xl px-5 py-16 sm:px-8">
	<h2 class="font-display text-3xl text-ink sm:text-4xl">Browse by bake</h2>
	<div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
		{#each data.categories as category (category.id)}
			<a href={`/shop/${category.slug}`} class="group relative block overflow-hidden rounded-2xl">
				<img
					src={`/images/placeholder/${category.slug}.svg`}
					alt=""
					class="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
				/>
				<div class="from-ink/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"></div>
				<span class="absolute bottom-3 left-3 text-sm font-semibold text-cream">{category.name}</span>
			</a>
		{/each}
	</div>
</section>

<!-- Community strip -->
<section class="mx-auto max-w-6xl px-5 py-16 sm:px-8">
	<div class="bg-blush grid gap-10 rounded-[2rem] px-6 py-12 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center">
		<div class="max-w-xl">
			<h2 class="font-display text-3xl text-ink sm:text-4xl">Rooted in Barrhead</h2>
			<p class="text-ink-soft mt-4 leading-relaxed">
				We&rsquo;re a small local bakery that loves giving back to the community we bake for &mdash;
				from school fundraisers to local events. Every order helps us do a little more of that.
			</p>
		</div>
		<div class="flex flex-col gap-1 lg:text-right">
			<p class="font-display text-xl text-ink">9&ndash;11 Paisley Road</p>
			<p class="text-ink-soft">Barrhead, G78 1HG</p>
			<p class="text-ink-soft mt-2 text-sm">Pickup Fridays &amp; Saturdays</p>
		</div>
	</div>
</section>
