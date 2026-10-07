<script lang="ts">
	import { page } from '$app/state';

	const isNotFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{isNotFound ? 'Page not found' : 'Something went wrong'} — Smashin' Bakes</title>
</svelte:head>

<section class="mx-auto max-w-lg px-5 py-24 text-center sm:py-32">
	<p class="font-display text-7xl text-pink sm:text-8xl">{page.status}</p>
	<h1 class="mt-4 font-display text-3xl text-ink sm:text-4xl">
		{isNotFound ? "We couldn't find that page" : 'Something went wrong'}
	</h1>
	<p class="mt-3 text-ink-soft">
		{isNotFound
			? "It might have moved, or isn't available right now."
			: (page.error?.message ?? 'Please try again in a moment.')}
	</p>

	<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
		<a
			href="/"
			class="rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep"
		>
			Back to home
		</a>
		<a
			href="/shop"
			class="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
		>
			Browse the shop
		</a>
	</div>
</section>
