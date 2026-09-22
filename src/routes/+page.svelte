<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import PosterBanner from '$lib/components/PosterBanner.svelte';
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	title="Smashin' Bakes — Small-batch cakes, cupcakes & bakes in Barrhead"
	description="Independent bakery in Barrhead. Pre-order cupcakes, brownies, cookies, pies and cakes for weekend pickup."
/>

<!-- Hero -->
<section class="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-16 lg:pt-20">
	<div class="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
		<div class="max-w-xl">
			<p
				class="hero-in text-sm font-semibold tracking-widest text-pink-deep uppercase"
				style:--hero-delay="0ms"
			>
				Independent bakery &middot; Barrhead
			</p>
			<h1
				class="hero-in mt-4 font-display text-5xl text-ink sm:text-6xl lg:text-[4.25rem] lg:leading-[0.98]"
				style:--hero-delay="90ms"
			>
				Cakes worth <span class="text-pink italic">queuing</span> for.
			</h1>
			<p
				class="hero-in mt-6 max-w-md text-lg leading-relaxed text-ink-soft"
				style:--hero-delay="180ms"
			>
				Small-batch cupcakes, brownies, cookies and cakes, baked fresh every week and ready for
				pickup Friday &amp; Saturday. No two bakes are ever quite the same.
			</p>
			<div class="hero-in mt-8 flex flex-wrap items-center gap-4" style:--hero-delay="270ms">
				<a
					href="/shop"
					class="inline-flex rounded-full bg-pink px-7 py-3.5 font-semibold text-cream shadow-soft transition-colors hover:bg-pink-deep"
				>
					Order for pickup
				</a>
				<a
					href="#this-weeks-bakes"
					class="text-sm font-semibold text-ink-soft underline decoration-ink/20 underline-offset-4 hover:text-ink"
				>
					See this week&rsquo;s bakes
				</a>
			</div>
		</div>

		<div class="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
			<img
				src={data.heroImages[0]}
				alt=""
				class="hero-card-1 absolute top-[6%] left-[8%] aspect-square w-[58%] rounded-[2rem] object-cover shadow-soft"
			/>
			<img
				src={data.heroImages[1]}
				alt=""
				class="hero-card-2 absolute top-[2%] right-[4%] aspect-square w-[46%] rounded-[2rem] object-cover shadow-soft"
			/>
			<img
				src={data.heroImages[2]}
				alt=""
				class="hero-card-3 absolute bottom-[4%] left-[18%] aspect-square w-[50%] rounded-[2rem] object-cover shadow-soft"
			/>
		</div>
	</div>
</section>

{#if data.poster}
	<PosterBanner poster={data.poster} />
{/if}

<!-- Feature callouts — kept to a single click straight into the flow that
     actually converts (shop / enquiry form), rather than an explainer page
     in between. -->
<section class="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
	<div class="grid gap-5 sm:grid-cols-2">
		<a
			href="/shop"
			class="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-blush p-8 transition-transform duration-300 hover:-translate-y-0.5"
		>
			<span
				class="pointer-events-none absolute -right-3 -bottom-6 text-8xl opacity-15 select-none"
				aria-hidden="true"
			>
				🚲
			</span>
			<div class="relative">
				<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">New</p>
				<h2 class="mt-2 font-display text-2xl text-ink sm:text-3xl">
					Free delivery to Barrhead &amp; Neilston
				</h2>
				<p class="mt-3 max-w-sm leading-relaxed text-ink-soft">
					Order online and get it brought straight to your door Friday or Saturday &mdash; no
					delivery charge, no trip to the shop needed.
				</p>
			</div>
			<span class="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">
				Shop now
				<svg
					width="14"
					height="14"
					viewBox="0 0 20 20"
					fill="none"
					class="transition-transform group-hover:translate-x-0.5"
					aria-hidden="true"
				>
					<path
						d="M4 10h12M11 5l5 5-5 5"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
		</a>

		<a
			href="/bespoke-cakes"
			class="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-pink-deep p-8 text-cream transition-transform duration-300 hover:-translate-y-0.5"
		>
			<span
				class="pointer-events-none absolute -right-3 -bottom-6 text-8xl opacity-15 select-none"
				aria-hidden="true"
			>
				🎂
			</span>
			<div class="relative">
				<p class="text-sm font-semibold tracking-widest text-cream/70 uppercase">
					Celebrating something?
				</p>
				<h2 class="mt-2 font-display text-2xl sm:text-3xl">Bespoke cakes, made to order</h2>
				<p class="mt-3 max-w-sm leading-relaxed text-cream/85">
					Birthdays, celebrations, anything worth marking &mdash; tell us what you have in mind and
					we&rsquo;ll help bring it to life.
				</p>
			</div>
			<span class="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold">
				Enquire now
				<svg
					width="14"
					height="14"
					viewBox="0 0 20 20"
					fill="none"
					class="transition-transform group-hover:translate-x-0.5"
					aria-hidden="true"
				>
					<path
						d="M4 10h12M11 5l5 5-5 5"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
		</a>
	</div>
</section>

<!-- This week's bakes -->
<section id="this-weeks-bakes" class="mx-auto max-w-6xl px-5 py-16 sm:px-8">
	<div class="flex items-end justify-between gap-4">
		<div>
			<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">Fresh this week</p>
			<h2 class="mt-2 font-display text-3xl text-ink sm:text-4xl">This week&rsquo;s bakes</h2>
		</div>
		<a href="/shop" class="hidden text-sm font-semibold text-ink-soft hover:text-ink sm:block"
			>Shop all &rarr;</a
		>
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
			class="group grid overflow-hidden rounded-[2rem] bg-pink-deep text-cream sm:grid-cols-[0.9fr_1.1fr]"
		>
			{#if data.promotion.heroImageUrl}
				<img
					src={data.promotion.heroImageUrl}
					alt=""
					class="aspect-[16/9] w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] sm:aspect-auto sm:h-full"
				/>
			{/if}
			<div class="relative flex flex-col justify-center overflow-hidden px-10 py-12 sm:px-12">
				<div
					class="pointer-events-none absolute top-6 right-6 flex h-16 w-16 shrink-0 rotate-6 items-center justify-center rounded-full border-2 border-gold/60 px-2 text-center text-[9px] leading-tight font-bold tracking-[0.1em] text-gold uppercase"
					aria-hidden="true"
				>
					Smashin<br />Bakes
				</div>
				<span
					class="pointer-events-none absolute -right-4 -bottom-10 rotate-[10deg] text-[9rem] opacity-10 select-none"
					aria-hidden="true"
				>
					🧁
				</span>
				<span
					class="pointer-events-none absolute right-24 bottom-6 -rotate-12 text-6xl opacity-10 select-none"
					aria-hidden="true"
				>
					🎂
				</span>

				<p class="text-base font-semibold tracking-widest text-cream/80 uppercase">Happening now</p>
				<h2 class="mt-2 font-display text-3xl sm:text-5xl">{data.promotion.title}</h2>
				{#if data.promotion.tagline}
					<p class="mt-3 text-xl text-cream/90 italic">{data.promotion.tagline}</p>
				{/if}
				<span class="relative mt-6 inline-flex items-center gap-2 text-lg font-semibold">
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
				<div
					class="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
				></div>
				<span class="absolute bottom-3 left-3 text-sm font-semibold text-cream"
					>{category.name}</span
				>
			</a>
		{/each}
	</div>
</section>

<!-- Community strip -->
<section class="mx-auto max-w-6xl px-5 py-16 sm:px-8">
	<div
		class="grid gap-10 rounded-[2rem] bg-blush px-6 py-12 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center"
	>
		<div class="max-w-xl">
			<h2 class="font-display text-3xl text-ink sm:text-4xl">Rooted in Barrhead</h2>
			<p class="mt-4 leading-relaxed text-ink-soft">
				We&rsquo;re a small local bakery that loves giving back to the community we bake for &mdash;
				from school fundraisers to local events. Every order helps us do a little more of that.
			</p>
		</div>
		<div class="flex flex-col gap-1 lg:text-right">
			<p class="font-display text-xl text-ink">9&ndash;11 Paisley Road</p>
			<p class="text-ink-soft">Barrhead, G78 1HG</p>
			<p class="mt-2 text-sm text-ink-soft">Pickup Fridays &amp; Saturdays</p>
		</div>
	</div>
</section>

<!-- Newsletter -->
<section class="mx-auto max-w-6xl px-5 py-16 sm:px-8">
	<div class="grid gap-8 rounded-[2rem] bg-pink-deep px-6 py-14 text-center text-cream sm:px-12">
		<div class="mx-auto max-w-lg">
			<p class="text-sm font-semibold tracking-widest text-cream/70 uppercase">Join the list</p>
			<h2 class="mt-2 font-display text-3xl sm:text-4xl">Get the inside scoop</h2>
			<p class="mt-4 leading-relaxed text-cream/80">
				First look at new bakes, weekly specials and the odd surprise offer. Sign up now and get
				<strong class="text-cream">{data.welcomeOffer.description}</strong>.
			</p>
		</div>
		<div class="mx-auto w-full max-w-md">
			<NewsletterSignup source="homepage" variant="compact" offer={data.welcomeOffer} />
		</div>
	</div>
</section>

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
