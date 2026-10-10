<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ShopWindow from '$lib/components/shop/ShopWindow.svelte';
	import SignBoard from '$lib/components/shop/SignBoard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	title="Promotions & giveaways — Smashin' Bakes"
	description="Current giveaways, competitions and community promotions from Smashin' Bakes in Barrhead."
/>

<ShopWindow openingHours={data.openingHours}>
	<header class="mx-auto max-w-2xl text-center">
		<SignBoard eyebrow="Community" title="Promotions & giveaways">
			{#snippet help()}
				{#if data.staff}
					<HelpLink
						section="promotions"
						title="Staff only: how to manage promotions"
						task="edit-promotion"
						label="Staff help"
						staff
					/>
				{/if}
			{/snippet}
		</SignBoard>
		<p class="mt-6 leading-relaxed text-ink-soft">
			Giveaways, shout-outs and the odd surprise for our community &mdash; all in one place.
		</p>
	</header>

	<div class="mt-12">
		{#if data.promotions.length === 0}
			<p class="py-10 text-center text-ink-soft">
				Nothing running right now &mdash; check back soon.
			</p>
		{:else}
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.promotions as promo (promo.id)}
					<a href={`/promotions/${promo.slug}`} class="group block">
						<div class="relative overflow-hidden rounded-[1.75rem] bg-cream-dim">
							{#if promo.heroImageUrl}
								<img
									src={promo.heroImageUrl}
									alt={promo.title}
									class="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
								/>
							{:else}
								<div class="flex aspect-[4/3] w-full items-center justify-center bg-blush p-10">
									<Logo variant="stacked" class="h-full w-auto" />
								</div>
							{/if}
						</div>
						<h2 class="mt-4 font-display text-xl text-ink">{promo.title}</h2>
						{#if promo.tagline}
							<p class="mt-1 text-sm text-ink-soft">{promo.tagline}</p>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</ShopWindow>
