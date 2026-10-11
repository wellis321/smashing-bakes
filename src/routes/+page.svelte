<script lang="ts">
	import ResponsiveImg from '$lib/components/ResponsiveImg.svelte';
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import PosterBanner from '$lib/components/PosterBanner.svelte';
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ShopWindow from '$lib/components/shop/ShopWindow.svelte';
	import HeroDisplay from '$lib/components/shop/HeroDisplay.svelte';
	import Shelf from '$lib/components/shop/Shelf.svelte';
	import ShelfItem from '$lib/components/shop/ShelfItem.svelte';
	import type { ProductCardData } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// A category shown as a plate on a shelf reuses the product plate, minus the
	// price tag and stickers.
	function categoryPlate(category: {
		id: number;
		slug: string;
		name: string;
		imageUrl: string | null;
	}): ProductCardData {
		const photo = category.imageUrl ?? data.categoryPhotos[category.id] ?? null;
		return {
			slug: category.slug,
			name: category.name,
			description: null,
			basePricePence: 0,
			salePricePence: null,
			badge: 'none',
			images: photo ? [{ url: photo, altText: null }] : []
		};
	}
</script>

<SeoHead
	title="Smashin' Bakes — Small-batch cakes, cupcakes & bakes in Barrhead"
	description="Independent bakery in Barrhead. Pre-order cupcakes, brownies, cookies, pies and cakes for weekend pickup."
/>

<!-- Hero: the shopfront -->
<ShopWindow openingHours={data.openingHours}>
	<div class="grid items-center gap-10 lg:grid-cols-[minmax(21.5rem,0.78fr)_1.22fr] lg:gap-6">
		<div class="mx-auto max-w-xl sm:text-center lg:mx-0 lg:max-w-none lg:text-left">
			<p
				class="hero-in text-sm font-semibold tracking-widest text-pink-deep uppercase"
				style:--hero-delay="0ms"
			>
				Independent bakery &middot; Barrhead
			</p>
			<h1
				class="hero-in mt-4 font-display text-5xl text-balance text-ink sm:text-6xl lg:text-[3.2rem] lg:leading-[1.02] xl:text-[3.5rem]"
				style:--hero-delay="90ms"
			>
				Cakes worth <span class="text-pink italic">queuing</span> for.
			</h1>
			<p
				class="hero-in mx-auto mt-6 max-w-md text-lg leading-relaxed text-ink-soft lg:mx-0"
				style:--hero-delay="180ms"
			>
				Small-batch cupcakes, brownies, cookies and cakes, baked fresh every week and ready for
				pickup Friday &amp; Saturday. No two bakes are ever quite the same.
			</p>
			<div
				class="hero-in mt-8 flex flex-wrap items-center gap-4 sm:justify-center lg:justify-start"
				style:--hero-delay="270ms"
			>
				<a
					href="/shop"
					class="inline-flex rounded-full bg-pink-deep px-7 py-3.5 font-semibold text-cream shadow-soft transition-colors hover:bg-pink-darker"
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

		<HeroDisplay images={data.heroImages}>
			{#snippet help()}
				{#if data.staff}
					<HelpLink
						section="settings"
						title="Staff only: how to change these three photos"
						task="hero-photos"
						label="Staff help"
						staff
					/>
				{/if}
			{/snippet}
		</HeroDisplay>
	</div>
</ShopWindow>

{#if data.poster}
	<div class="relative">
		<PosterBanner poster={data.poster} />
		{#if data.staff}
			<div class="absolute top-2 right-2 z-10 rounded-full bg-cream/90 p-1">
				<HelpLink
					section="posters"
					title="Staff only: how to edit this banner"
					task="banner"
					label="Staff help"
					staff
				/>
			</div>
		{/if}
	</div>
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
				<p class="text-sm font-semibold tracking-widest text-cream/90 uppercase">
					Celebrating something?
				</p>
				<h2 class="mt-2 font-display text-2xl sm:text-3xl">Bespoke cakes, made to order</h2>
				<p class="mt-3 max-w-sm leading-relaxed text-cream/90">
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

<!-- This week's bakes: the display case -->
{#if data.featured.length > 0}
	<ShopWindow openingHours={data.openingHours} awning={false} id="this-weeks-bakes">
		<Shelf
			label="This week’s bakes"
			labelId="this-weeks-bakes-title"
			showCount={false}
			products={data.featured}
			fit={data.featured.length}
		>
			{#snippet help()}
				{#if data.staff}
					<HelpLink
						section="products"
						title="Staff only: how to choose which bakes appear here"
						task="this-weeks-bakes"
						label="Staff help"
						staff
					/>
				{/if}
			{/snippet}
		</Shelf>
		<div class="mt-12 flex justify-center">
			<a
				href="/shop"
				class="inline-flex rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep"
			>
				Shop all bakes &rarr;
			</a>
		</div>
	</ShopWindow>
{:else if data.staff}
	<section id="this-weeks-bakes" class="mx-auto max-w-6xl scroll-mt-24 px-5 py-10 sm:px-8">
		<div class="rounded-2xl border-2 border-dashed border-pink/40 p-6 text-center">
			<p class="text-sm text-ink-soft">
				Staff only: no bakes are marked as This week&rsquo;s bake yet, so this section is hidden
				from visitors.
			</p>
			<div class="mt-3 flex justify-center">
				<HelpLink
					section="products"
					title="Staff only: how to choose which bakes appear here"
					task="this-weeks-bakes"
					label="Staff help"
					staff
				/>
			</div>
		</div>
	</section>
{/if}

{#if data.promotion}
	<!-- Current promotion -->
	<section class="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
		{#if data.staff}
			<div class="mb-3 flex justify-end">
				<HelpLink
					section="promotions"
					title="Staff only: how to manage this promotion"
					task="edit-promotion"
					label="Staff help"
					staff
				/>
			</div>
		{/if}
		<a
			href={`/promotions/${data.promotion.slug}`}
			class="group grid overflow-hidden rounded-[2rem] bg-pink-deep text-cream sm:grid-cols-[0.9fr_1.1fr]"
		>
			{#if data.promotion.heroImageUrl}
				<ResponsiveImg
					src={data.promotion.heroImageUrl}
					sizes="(min-width: 640px) 45vw, 100vw"
					class="aspect-[16/9] w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] sm:aspect-auto sm:h-full"
				/>
			{/if}
			<div class="relative flex flex-col justify-center overflow-hidden px-10 py-12 sm:px-12">
				<div
					class="pointer-events-none absolute top-6 right-6 flex h-16 w-16 shrink-0 rotate-6 items-center justify-center rounded-full border-2 border-cream/70 px-2 text-center text-[9px] leading-tight font-bold tracking-[0.1em] text-cream uppercase"
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

				<p class="text-base font-semibold tracking-widest text-cream/90 uppercase">Happening now</p>
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

<!-- Browse by bake: category plates along the wall -->
<section class="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:px-8">
	<Shelf label="Browse by bake" labelId="browse-by-bake" fit={data.categories.length} maxAcross={6}>
		{#snippet help()}
			{#if data.staff}
				<HelpLink
					section="categories"
					title="Staff only: how to change these category tiles"
					task="category-photos"
					label="Staff help"
					staff
				/>
			{/if}
		{/snippet}
		{#each data.categories as category, i (category.id)}
			<ShelfItem
				product={categoryPlate(category)}
				index={i}
				plain
				sizes="(min-width: 1024px) 24rem, (min-width: 640px) 33vw, 46vw"
				href={`/shop/${category.slug}`}
				fallbackSrc={`/images/placeholder/${category.slug}.svg`}
			/>
		{/each}
	</Shelf>
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
			<p
				class="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-widest text-ink-soft uppercase lg:justify-end"
			>
				Opening hours
				{#if data.staff}
					<HelpLink
						section="settings"
						title="Staff only: how to change opening hours"
						task="opening-hours"
						label="Staff help"
						staff
					/>
				{/if}
			</p>
			{#each data.openingHours as line (line)}
				<p class="text-ink-soft">{line}</p>
			{/each}
			<p class="mt-2 text-sm text-ink-soft">Pre-order for pickup</p>
		</div>
	</div>
</section>

<!-- Newsletter -->
<section class="mx-auto max-w-6xl px-5 py-16 sm:px-8">
	<div class="grid gap-8 rounded-[2rem] bg-pink-deep px-6 py-14 text-center text-cream sm:px-12">
		<div class="mx-auto max-w-lg">
			<p class="text-sm font-semibold tracking-widest text-cream/90 uppercase">Join the list</p>
			<h2 class="mt-2 font-display text-3xl sm:text-4xl">Get the inside scoop</h2>
			{#if data.staff}
				<div class="mt-3">
					<HelpLink
						section="settings"
						title="Staff only: how to change the welcome offer"
						task="welcome-offer"
						label="Staff help"
						staff
					/>
				</div>
			{/if}
			<p class="mt-4 leading-relaxed text-cream/90">
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
	@media (prefers-reduced-motion: no-preference) {
		.hero-in {
			animation: hero-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
			animation-delay: var(--hero-delay, 0ms);
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
</style>
