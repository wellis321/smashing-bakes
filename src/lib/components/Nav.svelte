<script lang="ts">
	import { page } from '$app/state';
	import type { CategorySummary } from '$lib/types';
	import type { CustomerSessionUser } from '$lib/server/auth/customer-auth';
	import Logo from './Logo.svelte';

	let { categories, customer }: { categories: CategorySummary[]; customer: CustomerSessionUser | null } = $props();

	let menuOpen = $state(false);
	let shopOpen = $state(false);
	let shopWrapper: HTMLDivElement | undefined = $state();
	let accountOpen = $state(false);
	let accountWrapper: HTMLDivElement | undefined = $state();

	const isShopActive = $derived(page.url.pathname.startsWith('/shop') || page.url.pathname.startsWith('/product'));
	const isMenusActive = $derived(page.url.pathname.startsWith('/menus'));
	const isVoteActive = $derived(page.url.pathname.startsWith('/vote'));
	const isAboutActive = $derived(page.url.pathname === '/about');
	const isContactActive = $derived(page.url.pathname === '/contact');
	const isAccountActive = $derived(page.url.pathname.startsWith('/account'));

	const linkBase =
		'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream';
	const linkInactive = 'text-ink-soft hover:bg-blush hover:text-ink';
	const linkActive = 'bg-pink text-cream shadow-soft';

	function linkClass(active: boolean) {
		return `${linkBase} ${active ? linkActive : linkInactive}`;
	}

	function closeMenusOnOutsideClick(event: MouseEvent) {
		if (shopOpen && shopWrapper && !shopWrapper.contains(event.target as Node)) {
			shopOpen = false;
		}
		if (accountOpen && accountWrapper && !accountWrapper.contains(event.target as Node)) {
			accountOpen = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			shopOpen = false;
			accountOpen = false;
			menuOpen = false;
		}
	}
</script>

<svelte:window onclick={closeMenusOnOutsideClick} onkeydown={handleKeydown} />

<div class="bg-blush-deep text-ink px-4 py-2 text-center text-xs font-medium tracking-wide sm:text-sm">
	Pre-order now for Friday &amp; Saturday pickup · 9&ndash;11 Paisley Road, Barrhead
</div>

<header class="bg-cream/90 sticky top-0 z-30 border-b border-ink/[0.06] backdrop-blur">
	<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
		<a href="/" class="shrink-0" aria-label="Smashin' Bakes home">
			<Logo class="h-11 w-auto sm:h-14" />
		</a>

		<nav class="hidden items-center gap-1 xl:flex">
			<div class="relative" bind:this={shopWrapper}>
				<button
					type="button"
					class={linkClass(isShopActive)}
					aria-haspopup="menu"
					aria-expanded={shopOpen}
					onclick={() => (shopOpen = !shopOpen)}
				>
					Shop
					<svg
						width="11"
						height="11"
						viewBox="0 0 12 12"
						fill="none"
						class={`transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`}
						aria-hidden="true"
					>
						<path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>

				{#if shopOpen}
					<div
						role="menu"
						class="border-ink/10 shadow-soft absolute top-full left-0 mt-2 w-60 rounded-2xl border bg-cream p-2"
					>
						<a
							href="/shop"
							role="menuitem"
							class="text-ink hover:bg-blush block rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
							onclick={() => (shopOpen = false)}
						>
							Shop all
						</a>
						<div class="bg-ink/10 my-1.5 h-px"></div>
						{#each categories as category (category.id)}
							<a
								href={`/shop/${category.slug}`}
								role="menuitem"
								class="text-ink-soft hover:bg-blush hover:text-ink block rounded-lg px-3 py-2 text-sm transition-colors"
								onclick={() => (shopOpen = false)}
							>
								{category.name}
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<a href="/menus" class={linkClass(isMenusActive)}>Weekly menus</a>
			<a href="/vote" class={linkClass(isVoteActive)}>Vote</a>
			<a href="/about" class={linkClass(isAboutActive)}>About</a>
			<a href="/contact" class={linkClass(isContactActive)}>Contact</a>
		</nav>

		<div class="flex items-center gap-3">
			<div class="relative hidden xl:block" bind:this={accountWrapper}>
				{#if customer}
					<button
						type="button"
						class={linkClass(isAccountActive)}
						aria-haspopup="menu"
						aria-expanded={accountOpen}
						onclick={() => (accountOpen = !accountOpen)}
					>
						{customer.name.split(' ')[0]}
						<svg
							width="11"
							height="11"
							viewBox="0 0 12 12"
							fill="none"
							class={`transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
							aria-hidden="true"
						>
							<path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
					{#if accountOpen}
						<div role="menu" class="border-ink/10 shadow-soft absolute top-full right-0 mt-2 w-48 rounded-2xl border bg-cream p-2">
							<a
								href="/account"
								role="menuitem"
								class="text-ink hover:bg-blush block rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
								onclick={() => (accountOpen = false)}
							>
								My account
							</a>
							<form method="POST" action="/account/logout">
								<button type="submit" role="menuitem" class="text-ink-soft hover:bg-blush block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors">
									Sign out
								</button>
							</form>
						</div>
					{/if}
				{:else}
					<a href="/account/login" class={linkClass(isAccountActive)}>Log in</a>
				{/if}
			</div>
			<a
				href="/shop"
				class="bg-pink hover:bg-pink-deep hidden rounded-full px-5 py-2.5 text-sm font-semibold text-cream shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:inline-flex"
			>
				Order for pickup
			</a>
			<button
				type="button"
				class="text-ink -mr-2 grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50 xl:hidden"
				aria-expanded={menuOpen}
				aria-label="Toggle menu"
				onclick={() => (menuOpen = !menuOpen)}
			>
				{#if menuOpen}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path d="M4 4L16 16M16 4L4 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path d="M3 5.5H17M3 10H17M3 14.5H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<div
		class="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] xl:hidden"
		style:grid-template-rows={menuOpen ? '1fr' : '0fr'}
	>
		<div class="overflow-hidden">
			<nav class="flex flex-col gap-1 px-5 pb-5">
				<p class="text-ink-soft/70 mt-1 mb-1 px-2 text-xs font-semibold tracking-widest uppercase">Shop</p>
				<a
					href="/shop"
					class={`rounded-lg px-2 py-2.5 text-sm font-semibold transition-colors ${isShopActive ? 'bg-pink text-cream' : 'text-ink hover:bg-blush'}`}
					onclick={() => (menuOpen = false)}
				>
					Shop all
				</a>
				{#each categories as category (category.id)}
					<a
						href={`/shop/${category.slug}`}
						class="text-ink-soft hover:bg-blush hover:text-ink rounded-lg px-2 py-2.5 text-sm font-medium transition-colors"
						onclick={() => (menuOpen = false)}
					>
						{category.name}
					</a>
				{/each}

				<p class="text-ink-soft/70 mt-4 mb-1 px-2 text-xs font-semibold tracking-widest uppercase">More</p>
				<a
					href="/menus"
					class={`rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${isMenusActive ? 'bg-pink text-cream' : 'text-ink-soft hover:bg-blush hover:text-ink'}`}
					onclick={() => (menuOpen = false)}
				>
					Weekly menus
				</a>
				<a
					href="/vote"
					class={`rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${isVoteActive ? 'bg-pink text-cream' : 'text-ink-soft hover:bg-blush hover:text-ink'}`}
					onclick={() => (menuOpen = false)}
				>
					Vote
				</a>
				<a
					href="/about"
					class={`rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${isAboutActive ? 'bg-pink text-cream' : 'text-ink-soft hover:bg-blush hover:text-ink'}`}
					onclick={() => (menuOpen = false)}
				>
					About
				</a>
				<a
					href="/contact"
					class={`rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${isContactActive ? 'bg-pink text-cream' : 'text-ink-soft hover:bg-blush hover:text-ink'}`}
					onclick={() => (menuOpen = false)}
				>
					Contact
				</a>

				<p class="text-ink-soft/70 mt-4 mb-1 px-2 text-xs font-semibold tracking-widest uppercase">Account</p>
				{#if customer}
					<a
						href="/account"
						class={`rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${isAccountActive ? 'bg-pink text-cream' : 'text-ink-soft hover:bg-blush hover:text-ink'}`}
						onclick={() => (menuOpen = false)}
					>
						My account ({customer.name.split(' ')[0]})
					</a>
					<form method="POST" action="/account/logout">
						<button
							type="submit"
							class="text-ink-soft hover:bg-blush hover:text-ink w-full rounded-lg px-2 py-2.5 text-left text-sm font-medium transition-colors"
						>
							Sign out
						</button>
					</form>
				{:else}
					<a
						href="/account/login"
						class="text-ink-soft hover:bg-blush hover:text-ink rounded-lg px-2 py-2.5 text-sm font-medium transition-colors"
						onclick={() => (menuOpen = false)}
					>
						Log in
					</a>
				{/if}

				<a
					href="/shop"
					class="bg-pink mt-3 rounded-full px-5 py-2.5 text-center text-sm font-semibold text-cream"
					onclick={() => (menuOpen = false)}
				>
					Order for pickup
				</a>
			</nav>
		</div>
	</div>
</header>
