<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ShopWindow from '$lib/components/shop/ShopWindow.svelte';
	import SignBoard from '$lib/components/shop/SignBoard.svelte';
	import Framed from '$lib/components/shop/Framed.svelte';
	import ChalkCard from '$lib/components/shop/ChalkCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	title="About us — Smashin' Bakes"
	description="Smashin' Bakes is a small-batch, independent bakery in Barrhead run by baker Alanah Collier — here's our story."
	image="/images/shop/counter.jpg"
/>

<ShopWindow openingHours={data.openingHours}>
	<header class="mx-auto max-w-2xl text-center">
		<SignBoard eyebrow="Our story" title="Small batches, big flavour." />
		<p class="mt-5 font-display text-xl text-pink italic">Taste the extraordinary.</p>
		<p class="mt-5 text-lg leading-relaxed text-ink-soft">
			Smashin&rsquo; Bakes is a small independent bakery on Paisley Road in Barrhead. Our
			Smashin&rsquo; Baker, Alanah Collier, bakes everything in the shop through the week, then
			opens the doors Friday &amp; Saturday &mdash; from 10am until we sell out &mdash; to share it
			all with you over cake and coffee.
		</p>
	</header>

	<Framed class="mx-auto mt-10 max-w-3xl">
		<img
			src="/images/shop/exterior.jpg"
			alt="The Smashin' Bakes shopfront on Paisley Road, Barrhead, with customers queuing outside"
			class="aspect-[16/9] w-full object-cover"
		/>
	</Framed>

	<div class="mt-14 grid gap-6 sm:grid-cols-3">
		<ChalkCard title="Small batch" tilt={-1}>
			We bake in small runs, not mass-produced trays &mdash; it&rsquo;s the only way we know to keep
			everything tasting properly homemade.
		</ChalkCard>
		<ChalkCard title="Weekly & rotating" tilt={0.8}>
			Our <a href="/menus">weekly menu</a> changes most weeks &mdash; old favourites alongside whatever
			we&rsquo;re currently obsessed with.
		</ChalkCard>
		<ChalkCard title="Until we sell out" tilt={-0.6}>
			Pre-order and collect from the shop, Friday &amp; Saturday from 10am &mdash; once we&rsquo;re
			sold out, that&rsquo;s us done for the week.
		</ChalkCard>
	</div>
</ShopWindow>

<section class="mx-auto max-w-5xl px-5 py-8 sm:px-8">
	<div class="grid items-center gap-10 sm:grid-cols-2">
		<div class="order-2 sm:order-1">
			<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">The bakery</p>
			<h2 class="mt-2 font-display text-3xl text-ink">Meet the Smashin&rsquo; Baker</h2>
			<p class="mt-4 leading-relaxed text-ink-soft">
				Alanah bakes everything in-house, then opens the counter Friday &amp; Saturday to sell it
				&mdash; cakes, brownies, blondies, stuffed cookies and empire biscuits, plus seasonal
				specials. Alanah&rsquo;s Old School Cake is our mouth-watering bestseller &mdash; consider
				it the house classic.
			</p>
			<a
				href="/menus"
				class="mt-4 inline-flex text-sm font-semibold text-pink-deep hover:underline"
			>
				See what&rsquo;s on this week &rarr;
			</a>
		</div>
		<Framed class="order-1 sm:order-2">
			<img
				src="/images/shop/counter.jpg"
				alt="The bakery counter at Smashin' Bakes, with cookies, brownies and cakes on display"
				class="aspect-[4/3] w-full object-cover"
			/>
		</Framed>
	</div>
</section>

<section class="mx-auto max-w-5xl px-5 py-8 sm:px-8">
	<div
		class="grid gap-10 rounded-[2rem] bg-pink-deep px-6 py-12 text-cream sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center"
	>
		<div class="max-w-xl">
			<h2 class="font-display text-3xl sm:text-4xl">Rooted in Barrhead</h2>
			<p class="mt-4 leading-relaxed text-cream/90">
				We love giving back to the community we bake for &mdash; from school fundraisers to local
				events and the odd giveaway for businesses doing good work nearby. If you&rsquo;re local,
				chances are we&rsquo;ve crossed paths already.
			</p>
			<a
				href="/promotions"
				class="mt-6 inline-flex text-sm font-semibold underline decoration-cream/40 underline-offset-4 hover:decoration-cream"
			>
				See what we&rsquo;re running at the moment &rarr;
			</a>
		</div>
	</div>
</section>

<section class="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8">
	<h2 class="font-display text-3xl text-ink sm:text-4xl">Come and say hello</h2>
	<p class="mx-auto mt-4 max-w-md leading-relaxed text-ink-soft">
		Follow along for weekly menus and drops, or come find us in person at 9&ndash;11 Paisley Road.
	</p>
	<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
		<a
			href="/shop"
			class="inline-flex rounded-full bg-pink-deep px-7 py-3.5 font-semibold text-cream shadow-soft transition-colors hover:bg-pink-darker"
		>
			Shop the menu
		</a>
		<a
			href="/contact"
			class="text-sm font-semibold text-ink-soft underline decoration-ink/20 underline-offset-4 hover:text-ink"
		>
			Get in touch
		</a>
	</div>
</section>
