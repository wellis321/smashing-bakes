<script lang="ts">
	import '../layout.css';
	import { page } from '$app/state';
	import Logo from '$lib/components/Logo.svelte';

	let { data, children } = $props();

	// These render their own full-bleed centered layout (same as the login
	// page) rather than the authenticated header/sidebar chrome — they're
	// reachable by a logged-out visitor, so there's no staff session to build
	// that chrome around anyway.
	const isBareLayoutPage = $derived(
		page.url.pathname === '/admin/login' ||
			page.url.pathname === '/admin/forgot-password' ||
			page.url.pathname.startsWith('/admin/reset-password/')
	);

	type NavLink = { href: string; label: string };
	type NavEntry =
		| { type: 'link'; href: string; label: string }
		| { type: 'group'; label: string; items: NavLink[] };

	const navEntries = $derived<NavEntry[]>([
		{ type: 'link', href: '/admin', label: 'Dashboard' },
		{ type: 'link', href: '/admin/orders', label: 'Orders' },
		{
			type: 'group',
			label: 'Shop',
			items: [
				{ href: '/admin/products', label: 'Products' },
				{ href: '/admin/categories', label: 'Categories' },
				{ href: '/admin/menus', label: 'Weekly menus' }
			]
		},
		{
			type: 'group',
			label: 'Marketing',
			items: [
				{ href: '/admin/promotions', label: 'Promotions' },
				{ href: '/admin/businesses', label: 'Local businesses' },
				{ href: '/admin/polls', label: 'Polls' },
				{ href: '/admin/posters', label: 'Posters' },
				{ href: '/admin/newsletters', label: 'Newsletters' },
				{ href: '/admin/media', label: 'Media' }
			]
		},
		{
			type: 'group',
			label: 'People',
			items: [
				{ href: '/admin/enquiries', label: 'Enquiries' },
				{ href: '/admin/subscribers', label: 'Subscribers' },
				{ href: '/admin/customers', label: 'Customers' },
				...(data.staff?.role === 'admin'
					? [
							{ href: '/admin/staff', label: 'Staff' },
							{ href: '/admin/activity', label: 'Activity log' }
						]
					: [])
			]
		},
		{ type: 'link', href: '/admin/settings', label: 'Settings' },
		{ type: 'link', href: '/admin/help', label: 'Help' }
	]);

	let openGroup = $state<string | null>(null);
	let wrapperEls: Record<string, HTMLDivElement | undefined> = $state({});

	function isActiveHref(href: string) {
		return href === '/admin' ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}

	function isGroupActive(items: NavLink[]) {
		return items.some((item) => isActiveHref(item.href));
	}

	function closeMenusOnOutsideClick(event: MouseEvent) {
		if (!openGroup) return;
		const wrapper = wrapperEls[openGroup];
		if (wrapper && !wrapper.contains(event.target as Node)) {
			openGroup = null;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') openGroup = null;
	}
</script>

<svelte:window onclick={closeMenusOnOutsideClick} onkeydown={handleKeydown} />

{#if isBareLayoutPage}
	{@render children()}
{:else}
	<div class="min-h-dvh bg-cream-dim">
		<header class="border-b border-ink/10 bg-cream">
			<div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
				<a href="/admin" class="flex shrink-0 items-center" aria-label="Smashin' Bakes admin home">
					<Logo class="h-9 w-auto" />
				</a>
				<div class="flex min-w-0 items-center gap-3 sm:gap-4">
					<a
						href="/"
						target="_blank"
						rel="noreferrer"
						class="hidden text-sm text-ink-soft hover:text-ink sm:inline"
					>
						View site &#8599;
					</a>
					<a
						href="/admin/account"
						class="hidden truncate text-sm text-ink-soft hover:text-ink sm:inline"
					>
						{data.staff?.name}
					</a>
					<form method="POST" action="/admin/logout">
						<button
							type="submit"
							class="shrink-0 rounded-lg border border-ink/10 px-3 py-1.5 text-sm text-ink-soft hover:text-ink"
						>
							Sign out
						</button>
					</form>
				</div>
			</div>
			<nav class="mx-auto flex max-w-5xl items-center gap-1 border-t border-ink/10 px-5 py-2.5">
				{#each navEntries as entry (entry.label)}
					{#if entry.type === 'link'}
						<a
							href={entry.href}
							class={`shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
								isActiveHref(entry.href) ? 'text-ink' : 'text-ink-soft hover:text-ink'
							}`}
						>
							{entry.label}
						</a>
					{:else}
						<div class="relative" bind:this={wrapperEls[entry.label]}>
							<button
								type="button"
								aria-haspopup="menu"
								aria-expanded={openGroup === entry.label}
								onclick={() => (openGroup = openGroup === entry.label ? null : entry.label)}
								class={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
									isGroupActive(entry.items) ? 'text-ink' : 'text-ink-soft hover:text-ink'
								}`}
							>
								{entry.label}
								<svg
									width="10"
									height="10"
									viewBox="0 0 12 12"
									fill="none"
									class={`transition-transform duration-200 ${openGroup === entry.label ? 'rotate-180' : ''}`}
									aria-hidden="true"
								>
									<path
										d="M2.5 4.5L6 8L9.5 4.5"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>

							{#if openGroup === entry.label}
								<div
									role="menu"
									class="absolute top-full left-0 z-10 mt-2 w-52 rounded-2xl border border-ink/10 bg-cream p-2 shadow-soft"
								>
									{#each entry.items as item (item.href)}
										<a
											href={item.href}
											role="menuitem"
											onclick={() => (openGroup = null)}
											class={`block rounded-lg px-3 py-2 text-sm transition-colors ${
												isActiveHref(item.href)
													? 'bg-blush font-semibold text-ink'
													: 'text-ink-soft hover:bg-blush hover:text-ink'
											}`}
										>
											{item.label}
										</a>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				{/each}
				<a
					href="/"
					target="_blank"
					rel="noreferrer"
					class="ml-auto shrink-0 text-sm text-ink-soft hover:text-ink sm:hidden"
				>
					View site &#8599;
				</a>
			</nav>
		</header>

		<main class="mx-auto max-w-5xl px-5 py-10">
			{@render children()}
		</main>
	</div>
{/if}
