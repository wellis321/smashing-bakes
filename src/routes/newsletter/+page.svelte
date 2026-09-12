<script lang="ts">
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<SeoHead
	title="Join the list — Smashin' Bakes"
	description="Sign up for specials, new bakes and offers from Smashin' Bakes."
/>

<section class="mx-auto max-w-xl px-5 py-20 text-center sm:px-8 sm:py-28">
	<div class="bg-pink/10 text-pink-deep mx-auto grid h-14 w-14 place-items-center rounded-full">
		<svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M3 5.5A1.5 1.5 0 014.5 4h11A1.5 1.5 0 0117 5.5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5v-9z" />
			<path d="M3.5 5l6.5 5 6.5-5" />
		</svg>
	</div>

	<h1 class="font-display mt-5 text-4xl text-ink sm:text-5xl">Get the inside scoop</h1>
	<p class="text-ink-soft mt-4 leading-relaxed">
		First look at new bakes, weekly specials and the odd surprise offer — straight from us,
		nothing spammy. Sign up now and get <strong class="text-ink">{data.welcomeOffer.description}</strong>.
	</p>

	{#if form?.success}
		<p class="bg-blush text-ink mt-6 rounded-xl px-4 py-2.5 text-sm">
			{form.alreadySubscribed ? "You're already on the list!" : "You're in! Check the offer below."}
		</p>
	{/if}

	<div class="mt-8">
		<NewsletterSignup source="newsletter-page" variant="hero" offer={data.welcomeOffer} />
	</div>
</section>
