<script lang="ts">
	import { page } from '$app/state';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import BespokeOrderForm from '$lib/components/BespokeOrderForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// This page has no actions of its own — the embedded form posts to
	// /contact, whose action does the actual insert/notify. `page.form` is
	// shared app state (not scoped to the route that owns the action), so it
	// still reflects that result here once submitted — hence reading it via
	// $app/state rather than this route's own (actionless) generated types.
	const form = $derived(
		page.form as {
			success?: boolean;
			message?: string;
			values?: { name: string; email: string; phone: string; details: string };
		} | null
	);
</script>

<SeoHead
	title="Bespoke cakes — Smashin' Bakes"
	description="Bespoke, made-to-order cakes from Smashin' Bakes in Barrhead — tell us the occasion and we'll help bring it to life."
	image={data.imageUrl ?? undefined}
/>

<section class="mx-auto max-w-5xl px-5 pt-14 pb-8 sm:px-8">
	<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">Bespoke cakes</p>
	<h1 class="mt-2 font-display text-4xl text-ink sm:text-5xl">{data.heading}</h1>
	<p class="mt-4 max-w-xl leading-relaxed text-ink-soft">{data.intro}</p>
</section>

{#if data.imageUrl}
	<section class="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
		<img
			src={data.imageUrl}
			alt="A bespoke Smashin' Bakes cake"
			class="aspect-[16/9] w-full rounded-[2rem] bg-cream-dim object-cover sm:aspect-[21/9]"
		/>
	</section>
{/if}

<section class="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
	<BespokeOrderForm {form} action="/contact" />
</section>
