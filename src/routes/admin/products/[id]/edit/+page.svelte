<script lang="ts">
	import { enhance } from '$app/forms';
	import ProductFormFields from '$lib/components/admin/ProductFormFields.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.product.name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit {data.product.name} — Admin</title>
</svelte:head>

<a href="/admin/products" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Products</a>
<h1 class="font-display mt-2 text-3xl text-ink">{data.product.name}</h1>

<form
	method="POST"
	action="?/update"
	enctype="multipart/form-data"
	class="border-ink/10 mt-6 max-w-2xl rounded-2xl border bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
	{/if}
	{#if form?.success}
		<p class="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>
	{/if}

	<ProductFormFields
		categories={data.categories}
		values={{
			name: data.product.name,
			slug: data.product.slug,
			description: data.product.description ?? '',
			categoryId: data.product.categoryId,
			basePricePence: data.product.basePricePence,
			salePricePence: data.product.salePricePence,
			badge: data.product.badge,
			isActive: data.product.isActive,
			isFeatured: data.product.isFeatured
		}}
		currentImageUrl={data.product.images[0]?.url}
	/>

	<button
		type="submit"
		disabled={submitting}
		class="bg-pink hover:bg-pink-deep mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Save changes'}
	</button>
</form>

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4 max-w-2xl">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this product</button>
</form>
