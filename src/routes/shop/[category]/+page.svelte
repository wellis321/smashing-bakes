<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ShopWindow from '$lib/components/shop/ShopWindow.svelte';
	import ShopHeader from '$lib/components/shop/ShopHeader.svelte';
	import Shelf from '$lib/components/shop/Shelf.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	title={`${data.category.name} — Smashin' Bakes`}
	description={`${data.category.name} baked fresh in Barrhead — order online for Friday & Saturday pickup or free delivery.`}
/>

<ShopWindow openingHours={data.openingHours}>
	<ShopHeader
		eyebrow="On the shelf"
		title={data.category.name}
		intro={data.category.description}
		categories={data.categories}
		activeSlug={data.category.slug}
	>
		{#snippet help()}
			{#if data.staff}
				<HelpLink
					section="categories"
					title="Staff only: how to manage this category"
					task="category-photos"
					label="Staff help"
					staff
				/>
			{/if}
		{/snippet}
	</ShopHeader>

	{#if data.products.length === 0}
		<p class="mt-14 text-center text-ink-soft">
			Nothing baked in this category just yet — check back soon.
		</p>
	{:else}
		<Shelf
			products={data.products}
			fit={data.products.length <= 3 ? data.products.length : 0}
			fallbackSrc={data.category.imageUrl ?? `/images/placeholder/${data.category.slug}.svg`}
		/>
	{/if}
</ShopWindow>
