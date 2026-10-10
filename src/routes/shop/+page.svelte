<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ShopWindow from '$lib/components/shop/ShopWindow.svelte';
	import ShopHeader from '$lib/components/shop/ShopHeader.svelte';
	import Shelf from '$lib/components/shop/Shelf.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// One shelf per category, in the shop's own category order.
	const shelves = $derived(
		data.categories
			.map((category) => ({
				category,
				products: data.products.filter((p) => p.categoryId === category.id)
			}))
			.filter((shelf) => shelf.products.length > 0)
	);
</script>

<SeoHead
	title="Shop all bakes — Smashin' Bakes"
	description="Cupcakes, brownies, cookies, pies and cakes, baked fresh in Barrhead. Order online for Friday & Saturday pickup or free delivery."
/>

<ShopWindow openingHours={data.openingHours}>
	<ShopHeader
		eyebrow="The full menu"
		title="Shop all bakes"
		intro="Everything we’re baking this week. Pick your favourites and choose how to get them when you check out."
		categories={data.categories}
	>
		{#snippet help()}
			{#if data.staff}
				<HelpLink
					section="products"
					title="Staff only: how to manage products"
					task="edit-product"
					label="Staff help"
					staff
				/>
			{/if}
		{/snippet}
	</ShopHeader>

	{#each shelves as shelf, shelfIndex (shelf.category.id)}
		<Shelf
			label={shelf.category.name}
			labelId={`shelf-${shelf.category.id}`}
			alt={shelfIndex % 2 === 1}
			showCount={false}
			products={shelf.products}
			fallbackSrc={shelf.category.imageUrl ?? `/images/placeholder/${shelf.category.slug}.svg`}
		/>
	{:else}
		<p class="mt-12 text-center text-ink-soft">
			The window&rsquo;s being restocked &mdash; check back soon.
		</p>
	{/each}
</ShopWindow>
