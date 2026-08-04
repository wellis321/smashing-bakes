<script lang="ts">
	import '../layout.css';
	import { page } from '$app/state';
	import Logo from '$lib/components/Logo.svelte';

	let { data, children } = $props();

	const isLoginPage = $derived(page.url.pathname === '/admin/login');

	const navItems = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/products', label: 'Products' },
		{ href: '/admin/categories', label: 'Categories' },
		{ href: '/admin/menus', label: 'Weekly menus' },
		{ href: '/admin/promotions', label: 'Promotions' },
		{ href: '/admin/businesses', label: 'Local businesses' },
		{ href: '/admin/polls', label: 'Polls' },
		{ href: '/admin/posters', label: 'Posters' },
		{ href: '/admin/enquiries', label: 'Enquiries' }
	];

	function isActiveNavItem(href: string) {
		return href === '/admin' ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}
</script>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="bg-cream-dim min-h-dvh">
		<header class="border-ink/10 bg-cream border-b">
			<div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
				<a href="/admin" class="flex shrink-0 items-center gap-2" aria-label="Smashin' Bakes admin home">
					<Logo class="h-6 w-auto" />
					<span class="text-ink-soft text-xs">admin</span>
				</a>
				<div class="flex min-w-0 items-center gap-3 sm:gap-4">
					<a
						href="/"
						target="_blank"
						rel="noreferrer"
						class="text-ink-soft hidden text-sm hover:text-ink sm:inline"
					>
						View site &#8599;
					</a>
					<span class="text-ink-soft hidden truncate text-sm sm:inline">{data.staff?.name}</span>
					<form method="POST" action="/admin/logout">
						<button type="submit" class="text-ink-soft shrink-0 rounded-lg border border-ink/10 px-3 py-1.5 text-sm hover:text-ink">
							Sign out
						</button>
					</form>
				</div>
			</div>
			<nav class="border-ink/10 mx-auto flex max-w-5xl items-center gap-5 overflow-x-auto border-t px-5 py-2.5">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class={`shrink-0 text-sm font-medium ${isActiveNavItem(item.href) ? 'text-ink' : 'text-ink-soft hover:text-ink'}`}
					>
						{item.label}
					</a>
				{/each}
				<a href="/" target="_blank" rel="noreferrer" class="text-ink-soft ml-auto shrink-0 text-sm hover:text-ink sm:hidden">
					View site &#8599;
				</a>
			</nav>
		</header>

		<main class="mx-auto max-w-5xl px-5 py-10">
			{@render children()}
		</main>
	</div>
{/if}
