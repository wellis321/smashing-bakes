<script lang="ts">
	import { page } from '$app/state';
	let { data, children } = $props();

	const tabs = $derived([
		{ href: '/admin/health', label: 'Overview' },
		{ href: '/admin/health/quality', label: 'Speed & quality' },
		{ href: '/admin/health/plan', label: 'To-do list', badge: data.openTasks },
		{ href: '/admin/health/visitors', label: 'Visitors' },
		{ href: '/admin/health/orders', label: 'Orders' }
	]);
	const active = (href: string) =>
		href === '/admin/health' ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<title>Site health — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Site health</h1>
<p class="mt-2 max-w-2xl text-base text-ink-soft">
	Check how fast, accessible and findable the website is, and see how visitors and orders are going.
	Every test is saved, so you can watch the scores improve over time.
</p>

<nav class="mt-6 flex flex-wrap gap-2" aria-label="Site health sections">
	{#each tabs as tab (tab.href)}
		<a
			href={tab.href}
			aria-current={active(tab.href) ? 'page' : undefined}
			class="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors {active(tab.href)
				? 'bg-ink text-cream'
				: 'bg-white/70 text-ink-soft hover:text-ink'}"
		>
			{tab.label}
			{#if tab.badge}
				<span class="ml-1 rounded-full bg-pink-deep px-1.5 py-0.5 text-xs font-bold text-cream"
					>{tab.badge}</span
				>
			{/if}
		</a>
	{/each}
</nav>

<div class="mt-2">
	{@render children()}
</div>
