<script lang="ts">
	import MenuDisplay from '$lib/components/MenuDisplay.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const menu = $derived(data.menu);

	function formatDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
			new Date(`${dateStr}T00:00:00`)
		);
	}
</script>

<svelte:head>
	<title>{menu.title || `Menu for ${formatDate(menu.menuDate)}`} — Smashin&rsquo; Bakes</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-5 pt-10 pb-24 sm:px-8">
	<a href="/menus" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Weekly menus</a>

	<div class="mt-6">
		<MenuDisplay {menu} />
	</div>

	<p class="text-ink-soft mt-8 text-center text-sm">
		Fancy something on this menu? Message us on
		<a href="https://www.instagram.com/smashinbakes" target="_blank" rel="noreferrer" class="text-pink-deep font-semibold hover:underline">Instagram</a>
		or
		<a href="https://www.facebook.com/p/Smashin-Bakes-61588572510001/?locale=en_GB" target="_blank" rel="noreferrer" class="text-pink-deep font-semibold hover:underline">Facebook</a>
		to pre-order.
	</p>
</section>
