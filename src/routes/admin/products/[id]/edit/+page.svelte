<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import ProductFormFields from '$lib/components/admin/ProductFormFields.svelte';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
	let closeAfterSave = $state(false);
	let addingImage = $state(false);

	const MAX_EXTRA_IMAGES = 3;
	// images[0] is always the primary photo (sortOrder 0) — see the load
	// function's comment for why that ordering is guaranteed.
	const extraImages = $derived(data.product.images.slice(1));

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.product.name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}

	function confirmRemoveImage(event: SubmitEvent) {
		if (!confirm("Remove this photo? This can't be undone.")) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit {data.product.name} — Admin</title>
</svelte:head>

<a href="/admin/products" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Products</a
>
<h1 class="mt-2 font-display text-3xl text-ink">{data.product.name}</h1>

<form
	method="POST"
	action="?/update"
	enctype="multipart/form-data"
	class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			submitting = false;
			if (closeAfterSave && result.type === 'success') goto('/admin/products');
			closeAfterSave = false;
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
		mediaItems={data.mediaItems}
	/>

	<div class="mt-6 flex gap-3">
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = false)}
			class="rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save changes'}
		</button>
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = true)}
			class="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-60"
		>
			Save &amp; close
		</button>
	</div>
</form>

<div class="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-6">
	<h2 class="text-lg font-semibold text-ink">Additional photos</h2>
	<p class="mt-1 text-sm text-ink-soft">
		Shown as smaller thumbnails under the main photo on the product page — optional, and only shown
		at all once there's at least one. Up to {MAX_EXTRA_IMAGES}.
	</p>

	{#if extraImages.length > 0}
		<div class="mt-4 grid grid-cols-3 gap-3 sm:w-fit">
			{#each extraImages as image (image.id)}
				<div class="overflow-hidden rounded-xl border border-ink/10 bg-white">
					<img src={image.url} alt={image.altText ?? ''} class="aspect-square w-28 object-cover" />
					<form
						method="POST"
						action="?/deleteImage"
						use:enhance
						onsubmit={confirmRemoveImage}
						class="p-1.5"
					>
						<input type="hidden" name="imageId" value={image.id} />
						<button
							type="submit"
							class="w-full text-center text-xs text-ink-soft/70 hover:text-red-600"
						>
							Remove
						</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}

	{#if form?.imagesMessage}
		<p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.imagesMessage}</p>
	{/if}

	{#if extraImages.length < MAX_EXTRA_IMAGES}
		<form
			method="POST"
			action="?/addImage"
			enctype="multipart/form-data"
			class="mt-4"
			use:enhance={() => {
				addingImage = true;
				return async ({ update }) => {
					await update({ reset: true });
					addingImage = false;
				};
			}}
		>
			<MediaPicker
				items={data.mediaItems}
				fileFieldName="image"
				urlFieldName="imageUrl"
				label="Add a photo"
				showPreview={false}
			/>
			<button
				type="submit"
				disabled={addingImage}
				class="mt-3 rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-60"
			>
				{addingImage ? 'Adding…' : 'Add photo'}
			</button>
		</form>
	{/if}
</div>

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600"
		>Delete this product</button
	>
</form>
