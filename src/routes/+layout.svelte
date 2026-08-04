<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/state';

	let { data, children } = $props();

	const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isAdminRoute}
	{@render children()}
{:else}
	<div class="flex min-h-dvh flex-col">
		<Nav categories={data.categories} customer={data.customer} />
		<main class="flex-1">
			{@render children()}
		</main>
		<Footer categories={data.categories} />
	</div>
{/if}
