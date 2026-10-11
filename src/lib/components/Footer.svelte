<script lang="ts">
	import type { CategorySummary } from '$lib/types';
	import type { NavVisibility } from '$lib/server/db/queries';
	import Logo from './Logo.svelte';
	import NewsletterSignup from './NewsletterSignup.svelte';

	let {
		categories,
		welcomeOffer,
		navVisibility,
		openingHours
	}: {
		categories: CategorySummary[];
		welcomeOffer: { code: string; description: string };
		navVisibility: NavVisibility;
		openingHours: string[];
	} = $props();
</script>

<footer class="mt-16 bg-ink text-cream sm:mt-24">
	<div class="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
		<div
			class="flex flex-col justify-between gap-4 border-b border-cream/10 pb-8 sm:flex-row sm:items-end sm:gap-6 sm:pb-14"
		>
			<div>
				<p class="text-xs font-semibold tracking-widest text-cream/60 uppercase">Join the list</p>
				<h2 class="mt-2 font-display text-2xl text-cream sm:text-3xl">
					Specials, new bakes &amp; offers
				</h2>
			</div>
			<NewsletterSignup source="footer" variant="compact" offer={welcomeOffer} />
		</div>
	</div>

	<div class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
		<div class="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-12 lg:grid-cols-5">
			<div class="col-span-2 sm:col-span-1 lg:col-span-2">
				<Logo class="h-auto w-full max-w-[240px] sm:max-w-[557px]" />
				<p class="mt-3 max-w-sm text-sm leading-relaxed text-cream/90 sm:mt-4 sm:text-base">
					Small-batch cupcakes, brownies, cookies and cakes, baked fresh in Barrhead. Proudly
					independent, proudly part of the community.
				</p>
				<div class="mt-4 flex gap-5 text-sm font-semibold sm:mt-6">
					<a
						href="https://www.instagram.com/smashinbakes"
						class="underline decoration-cream/30 underline-offset-4 hover:decoration-cream"
						target="_blank"
						rel="noreferrer">Instagram</a
					>
					<a
						href="https://www.facebook.com/p/Smashin-Bakes-61588572510001/?locale=en_GB"
						class="underline decoration-cream/30 underline-offset-4 hover:decoration-cream"
						target="_blank"
						rel="noreferrer">Facebook</a
					>
					<a
						href="https://www.tiktok.com/@smashinbakesbarrhead"
						class="underline decoration-cream/30 underline-offset-4 hover:decoration-cream"
						target="_blank"
						rel="noreferrer">TikTok</a
					>
				</div>
			</div>

			<div>
				<p class="text-xs font-semibold tracking-widest text-cream/60 uppercase">Shop</p>
				<ul class="mt-3 space-y-2.5 text-[15px] font-medium text-cream/90 sm:mt-4 sm:space-y-3">
					<li><a href="/shop/all" class="hover:text-cream">All the bakes</a></li>
					{#each categories as category (category.id)}
						<li><a href={`/shop/${category.slug}`} class="hover:text-cream">{category.name}</a></li>
					{/each}
				</ul>
			</div>

			<div>
				<p class="text-xs font-semibold tracking-widest text-cream/60 uppercase">Company</p>
				<ul class="mt-3 space-y-2.5 text-[15px] font-medium text-cream/90 sm:mt-4 sm:space-y-3">
					{#if navVisibility.menus}
						<li><a href="/menus" class="hover:text-cream">Weekly menus</a></li>
					{/if}
					{#if navVisibility.promotions}
						<li><a href="/promotions" class="hover:text-cream">Promotions</a></li>
					{/if}
					{#if navVisibility.about}
						<li><a href="/about" class="hover:text-cream">About</a></li>
					{/if}
					{#if navVisibility.contact}
						<li><a href="/contact" class="hover:text-cream">Contact</a></li>
					{/if}
				</ul>
			</div>

			<div class="col-span-2 grid grid-cols-2 gap-x-6 sm:col-span-1 sm:block">
				<div>
					<p class="text-xs font-semibold tracking-widest text-cream/60 uppercase">Visit</p>
					<p class="mt-3 text-[15px] leading-relaxed font-medium text-cream/90 sm:mt-4">
						9&ndash;11 Paisley Road<br />
						Barrhead, G78 1HG
					</p>
					<p class="mt-3 hidden text-[15px] leading-relaxed font-medium text-cream/90 sm:block">
						Pre-order for pickup
					</p>
				</div>
				<div class="sm:mt-4">
					<p class="text-xs font-semibold tracking-widest text-cream/60 uppercase">Opening hours</p>
					<ul class="mt-3 space-y-1 text-[15px] leading-relaxed font-medium text-cream/90 sm:mt-2">
						{#each openingHours as line (line)}
							<li>{line}</li>
						{/each}
					</ul>
					<p class="mt-2 text-[15px] leading-relaxed font-medium text-cream/90 sm:hidden">
						Pre-order for pickup
					</p>
				</div>
			</div>
		</div>

		<div
			class="mt-8 flex flex-col-reverse items-start justify-between gap-3 border-t border-cream/10 pt-5 text-sm text-cream/60 sm:mt-14 sm:flex-row sm:items-center sm:gap-4 sm:pt-6"
		>
			<p>&copy; {new Date().getFullYear()} Smashin&rsquo; Bakes. All rights reserved.</p>
			<a href="/admin/login" class="hover:text-cream/90">Staff login</a>
		</div>
	</div>
</footer>
