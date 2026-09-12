<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';

	let {
		title,
		description,
		image = '/images/shop/exterior.jpg',
		type = 'website',
		noindex = false
	}: {
		title: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article' | 'product';
		noindex?: boolean;
	} = $props();

	const canonicalUrl = $derived(`${page.url.origin}${page.url.pathname}`);
	const absoluteImage = $derived(/^https?:\/\//.test(image) ? image : `${page.url.origin}${image}`);

	// Defaults to "not live" (blocked from indexing) unless explicitly told
	// otherwise — safer than accidentally indexing a staging site because
	// someone forgot to flip a flag. Set PUBLIC_SITE_LIVE=true when launching.
	const siteIsLive = env.PUBLIC_SITE_LIVE === 'true';
	const effectiveNoindex = $derived(noindex || !siteIsLive);
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
</svelte:head>
