<script lang="ts">
	import type { CategorySummary } from '$lib/types';
	import Logo from './Logo.svelte';

	let { categories }: { categories: CategorySummary[] } = $props();
</script>

<footer class="bg-ink text-cream mt-24">
	<div class="mx-auto max-w-6xl px-5 py-16 sm:px-8">
		<div class="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
			<div class="lg:col-span-2">
				<Logo class="h-16 w-auto sm:h-20" />
				<p class="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
					Small-batch cupcakes, brownies, cookies and cakes, baked fresh in Barrhead. Proudly
					independent, proudly part of the community.
				</p>
				<div class="mt-6 flex gap-4 text-sm">
					<a href="https://www.instagram.com/smashinbakes" class="underline decoration-cream/30 underline-offset-4 hover:decoration-cream" target="_blank" rel="noreferrer">Instagram</a>
					<a href="https://www.facebook.com/p/Smashin-Bakes-61588572510001/?locale=en_GB" class="underline decoration-cream/30 underline-offset-4 hover:decoration-cream" target="_blank" rel="noreferrer">Facebook</a>
				</div>
			</div>

			<div>
				<p class="text-xs font-semibold tracking-widest text-cream/50 uppercase">Shop</p>
				<ul class="mt-4 space-y-2.5 text-sm text-cream/80">
					{#each categories as category (category.id)}
						<li><a href={`/shop/${category.slug}`} class="hover:text-cream">{category.name}</a></li>
					{/each}
				</ul>
			</div>

			<div>
				<p class="text-xs font-semibold tracking-widest text-cream/50 uppercase">Company</p>
				<ul class="mt-4 space-y-2.5 text-sm text-cream/80">
					<li><a href="/menus" class="hover:text-cream">Weekly menus</a></li>
					<li><a href="/promotions" class="hover:text-cream">Promotions</a></li>
					<li><a href="/about" class="hover:text-cream">About</a></li>
					<li><a href="/contact" class="hover:text-cream">Contact</a></li>
				</ul>
			</div>

			<div>
				<p class="text-xs font-semibold tracking-widest text-cream/50 uppercase">Visit</p>
				<p class="mt-4 text-sm leading-relaxed text-cream/80">
					9&ndash;11 Paisley Road<br />
					Barrhead, G78 1HG
				</p>
				<p class="mt-4 text-sm leading-relaxed text-cream/80">
					Pre-order for pickup<br />
					Friday &amp; Saturday
				</p>
			</div>
		</div>

		<div class="mt-14 flex flex-col-reverse items-start justify-between gap-4 border-t border-cream/10 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center">
			<p>&copy; {new Date().getFullYear()} Smashin&rsquo; Bakes. All rights reserved.</p>
			<a href="/admin/login" class="hover:text-cream/80">Staff login</a>
		</div>
	</div>
</footer>
