<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import NewsletterPopup from '$lib/components/NewsletterPopup.svelte';
	import { page } from '$app/state';
	import { safeJsonLd } from '$lib/utils/json-ld';
	import { SITE_URL } from '$lib/site';

	let { data, children } = $props();

	const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));
	// Both pages already are the newsletter signup — a popup on top of it would
	// be redundant at best, comical at worst.
	const hidePopup = $derived(
		page.url.pathname === '/newsletter' || page.url.pathname === '/unsubscribe'
	);

	// Same facts everywhere (site, Google Business Profile, social bios) is
	// what local search and AI answer engines actually cross-reference — keep
	// this in sync with whatever's set up there.
	const localBusinessJsonLd = safeJsonLd({
		'@context': 'https://schema.org',
		'@type': 'Bakery',
		name: "Smashin' Bakes",
		'@id': `${SITE_URL}/#bakery`,
		description:
			'Independent small-batch bakery in Barrhead, Scotland. Cupcakes, brownies, cookies, pies and cakes, baked fresh and ready for Friday and Saturday pickup, with bespoke celebration cakes made to order.',
		image: `${SITE_URL}/images/shop/exterior.jpg`,
		url: SITE_URL,
		menu: `${SITE_URL}/menus`,
		hasMap:
			'https://www.google.com/maps/search/?api=1&query=Smashin+Bakes+9-11+Paisley+Road+Barrhead+G78+1HG',
		areaServed: { '@type': 'City', name: 'Barrhead' },
		currenciesAccepted: 'GBP',
		potentialAction: {
			'@type': 'OrderAction',
			target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop` },
			deliveryMethod: [
				'http://purl.org/goodrelations/v1#DeliveryModePickUp',
				'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet'
			]
		},
		address: {
			'@type': 'PostalAddress',
			streetAddress: '9-11 Paisley Road',
			addressLocality: 'Barrhead',
			postalCode: 'G78 1HG',
			addressCountry: 'GB'
		},
		openingHoursSpecification: [
			{
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: ['Friday', 'Saturday'],
				opens: '10:00',
				closes: '16:00'
			}
		],
		servesCuisine: 'Bakery',
		priceRange: '££',
		sameAs: [
			'https://www.instagram.com/smashinbakes',
			'https://www.facebook.com/p/Smashin-Bakes-61588572510001/?locale=en_GB',
			'https://www.tiktok.com/@smashinbakesbarrhead'
		]
	});

	const websiteJsonLd = safeJsonLd({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: "Smashin' Bakes",
		url: SITE_URL,
		inLanguage: 'en-GB',
		publisher: { '@id': `${SITE_URL}/#bakery` }
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if !isAdminRoute}
		{@html `<script type="application/ld+json">${localBusinessJsonLd}<\/script>`}
		{@html `<script type="application/ld+json">${websiteJsonLd}<\/script>`}
	{/if}
</svelte:head>

{#if isAdminRoute}
	{@render children()}
{:else}
	<a
		href="#main-content"
		class="sr-only fixed top-3 left-3 z-50 rounded-full bg-pink px-4 py-2 text-sm font-semibold text-cream focus:not-sr-only focus:ring-2 focus:ring-pink/50 focus:outline-none"
	>
		Skip to content
	</a>
	<div class="flex min-h-dvh flex-col">
		<Nav
			categories={data.categories}
			customer={data.customer}
			navVisibility={data.navVisibility}
			openingHours={data.openingHours}
		/>
		<main id="main-content" class="flex-1">
			{@render children()}
		</main>
		<Footer
			categories={data.categories}
			welcomeOffer={data.welcomeOffer}
			navVisibility={data.navVisibility}
			openingHours={data.openingHours}
		/>
	</div>
	{#if !hidePopup}
		<NewsletterPopup welcomeOffer={data.welcomeOffer} />
	{/if}
{/if}
