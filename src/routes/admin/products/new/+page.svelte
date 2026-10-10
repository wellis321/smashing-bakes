<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import ProductFormFields from '$lib/components/admin/ProductFormFields.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Add product — Admin</title>
</svelte:head>

<a href="/admin/products" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Products</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">Add product</h1>
	<HelpLink section="products" task="add-product" />
</div>

<form
	method="POST"
	enctype="multipart/form-data"
	class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}
>
	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
	{/if}

	<ProductFormFields
		categories={data.categories}
		values={form?.values}
		mediaItems={data.mediaItems}
	/>

	<button
		type="submit"
		disabled={submitting}
		class="mt-6 rounded-full bg-pink-deep px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Add product'}
	</button>
</form>
