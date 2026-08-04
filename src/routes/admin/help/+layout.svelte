<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const tabs = [
		{ href: '/admin/help', label: 'Guide' },
		{ href: '/admin/help/security', label: 'Security' },
		{ href: '/admin/help/roadmap', label: "What's next" }
	];

	function isActive(href: string) {
		return href === '/admin/help' ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}
</script>

<h1 class="font-display text-3xl text-ink">Help</h1>
<p class="text-ink-soft mt-1 text-sm">How to use the site, what's protecting it, and what's still on the list.</p>

<div class="mt-6 flex gap-2">
	{#each tabs as tab (tab.href)}
		<a
			href={tab.href}
			class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
				isActive(tab.href) ? 'bg-ink text-cream' : 'border border-ink/10 text-ink-soft hover:border-ink/20 hover:text-ink'
			}`}
		>
			{tab.label}
		</a>
	{/each}
</div>

<div class="mt-8">
	{@render children()}
</div>
