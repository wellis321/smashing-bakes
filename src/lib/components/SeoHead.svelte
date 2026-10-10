<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import { SITE_URL } from '$lib/site';
	import { safeJsonLd } from '$lib/utils/json-ld';

	let {
		title,
		description,
		image = '/images/shop/exterior.jpg',
		type = 'website',
		noindex = false,
		breadcrumbs = []
	}: {
		title: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article' | 'product';
		noindex?: boolean;
		// Trail shown in Google results, e.g. Home > Shop > Cupcakes > Nutella Cupcake.
		breadcrumbs?: { name: string; path: string }[];
	} = $props();

	const canonicalUrl = $derived(`${SITE_URL}${page.url.pathname}`);
	const absoluteImage = $derived(/^https?:\/\//.test(image) ? image : `${SITE_URL}${image}`);

	// The site is live: indexed unless explicitly switched off with
	// PUBLIC_SITE_LIVE=false (handy for a staging copy). The free hostingersite.com
	// address is always kept out of search by the server (see hooks.server.ts).
	const siteIsLive = env.PUBLIC_SITE_LIVE !== 'false';
	const effectiveNoindex = $derived(noindex || !siteIsLive);

	const breadcrumbJsonLd = $derived(
		breadcrumbs.length > 0
			? safeJsonLd({
					'@context': 'https://schema.org',
					'@type': 'BreadcrumbList',
					itemListElement: breadcrumbs.map((b, i) => ({
						'@type': 'ListItem',
						position: i + 1,
						name: b.name,
						item: `${SITE_URL}${b.path}`
					}))
				})
			: ''
	);
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}<meta name="description" content={description} />{/if}
	<link rel="canonical" href={canonicalUrl} />
	{#if effectiveNoindex}<meta name="robots" content="noindex, nofollow" />{/if}

	<meta property="og:site_name" content="Smashin' Bakes" />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
	{#if description}<meta property="og:description" content={description} />{/if}
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={absoluteImage} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	{#if description}<meta name="twitter:description" content={description} />{/if}
	<meta name="twitter:image" content={absoluteImage} />
	<meta property="og:locale" content="en_GB" />
	{#if breadcrumbJsonLd}
		{@html `<script type="application/ld+json">${breadcrumbJsonLd}<\/script>`}
	{/if}
</svelte:head>
