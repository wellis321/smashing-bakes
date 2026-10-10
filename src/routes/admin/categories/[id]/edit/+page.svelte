<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
	let closeAfterSave = $state(false);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.category.name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit {data.category.name} — Admin</title>
</svelte:head>

<a href="/admin/categories" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Categories</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">{data.category.name}</h1>
	<HelpLink section="categories" task="category-photos" />
</div>

<form
	method="POST"
	action="?/update"
	enctype="multipart/form-data"
	class="mt-6 max-w-lg rounded-2xl border border-ink/10 bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			submitting = false;
			if (closeAfterSave && result.type === 'success') goto('/admin/categories');
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

	<div class="space-y-4">
		<div>
			<label for="name" class="text-sm font-medium text-ink-soft">Category name</label>
			<input
				id="name"
				name="name"
				required
				value={data.category.name}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="slug" class="text-sm font-medium text-ink-soft">URL slug</label>
			<input
				id="slug"
				name="slug"
				value={data.category.slug}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="description" class="text-sm font-medium text-ink-soft"
				>Description (optional)</label
			>
			<textarea
				id="description"
				name="description"
				rows="2"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				>{data.category.description ?? ''}</textarea
			>
		</div>

		<div>
			<MediaPicker
				items={data.mediaItems}
				fileFieldName="imageFile"
				urlFieldName="imageUrl"
				label="Homepage tile photo (optional)"
				hint="Shown on the homepage's Browse by bake strip. Leave blank to use the built-in illustration."
				currentUrl={data.category.imageUrl}
			/>
			{#if data.category.imageUrl}
				<label class="mt-3 flex items-center gap-2 text-sm text-ink-soft">
					<input type="checkbox" name="clearImage" value="true" class="h-4 w-4 accent-pink" />
					Remove my photo and use the built-in illustration instead
				</label>
			{/if}
		</div>

		<label class="flex items-center gap-2 text-sm text-ink-soft">
			<input
				type="checkbox"
				name="isActive"
				value="true"
				checked={data.category.isActive}
				class="h-4 w-4 accent-pink"
			/>
			Visible on site
		</label>
	</div>

	<div class="mt-6 flex gap-3">
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = false)}
			class="rounded-full bg-pink-deep px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker disabled:opacity-60"
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

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4 max-w-lg">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600"
		>Delete this category</button
	>
</form>
