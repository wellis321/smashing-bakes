<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import NewsletterPopup from '$lib/components/NewsletterPopup.svelte';
	import { page } from '$app/state';
	import { safeJsonLd } from '$lib/utils/json-ld';

	let { data, children } = $props();

	const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));
	// Both pages already are the newsletter signup — a popup on top of it would
	// be redundant at best, comical at worst.
	const hidePopup = $derived(page.url.pathname === '/newsletter' || page.url.pathname === '/unsubscribe');

	// Same facts everywhere (site, Google Business Profile, social bios) is
	// what local search and AI answer engines actually cross-reference — keep
	// this in sync with whatever's set up there.
	const localBusinessJsonLd = safeJsonLd({
		'@context': 'https://schema.org',
		'@type': 'Bakery',
		name: "Smashin' Bakes",
		image: `${page.url.origin}/images/shop/exterior.jpg`,
		url: page.url.origin,
		address: {
			'@type': 'PostalAddress',
			streetAddress: '9-11 Paisley Road',
			addressLocality: 'Barrhead',
			postalCode: 'G78 1HG',
			addressCountry: 'GB'
		},
		openingHoursSpecification: [
			{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday', 'Saturday'], opens: '10:00', closes: '16:00' }
		],
		servesCuisine: 'Bakery',
		priceRange: '££',
		sameAs: [
			'https://www.instagram.com/smashinbakes',
			'https://www.facebook.com/p/Smashin-Bakes-61588572510001/?locale=en_GB',
			'https://www.tiktok.com/@smashinbakesbarrhead'
		]
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if !isAdminRoute}
		{@html `<script type="application/ld+json">${localBusinessJsonLd}<\/script>`}
	{/if}
</svelte:head>

{#if isAdminRoute}
	{@render children()}
{:else}
	<a
		href="#main-content"
		class="bg-pink focus:ring-pink/50 sr-only text-cream fixed top-3 left-3 z-50 rounded-full px-4 py-2 text-sm font-semibold focus:not-sr-only focus:ring-2 focus:outline-none"
	>
		Skip to content
	</a>
	<div class="flex min-h-dvh flex-col">
		<Nav categories={data.categories} customer={data.customer} />
		<main id="main-content" class="flex-1">
			{@render children()}
		</main>
		<Footer categories={data.categories} welcomeOffer={data.welcomeOffer} />
	</div>
	{#if !hidePopup}
		<NewsletterPopup welcomeOffer={data.welcomeOffer} />
	{/if}
{/if}
