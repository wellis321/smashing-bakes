<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.category.name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit {data.category.name} — Admin</title>
</svelte:head>

<a href="/admin/categories" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Categories</a>
<h1 class="font-display mt-2 text-3xl text-ink">{data.category.name}</h1>

<form
	method="POST"
	action="?/update"
	class="border-ink/10 mt-6 max-w-lg rounded-2xl border bg-white/60 p-6"
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

	<div class="space-y-4">
		<div>
			<label for="name" class="text-ink-soft text-sm font-medium">Category name</label>
			<input
				id="name"
				name="name"
				required
				value={data.category.name}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="slug" class="text-ink-soft text-sm font-medium">URL slug</label>
			<input
				id="slug"
				name="slug"
				value={data.category.slug}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="description" class="text-ink-soft text-sm font-medium">Description (optional)</label>
			<textarea
				id="description"
				name="description"
				rows="2"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				>{data.category.description ?? ''}</textarea
			>
		</div>

		<label class="text-ink-soft flex items-center gap-2 text-sm">
			<input type="checkbox" name="isActive" value="true" checked={data.category.isActive} class="accent-pink h-4 w-4" />
			Visible on site
		</label>
	</div>

	<button
		type="submit"
		disabled={submitting}
		class="bg-pink hover:bg-pink-deep mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Save changes'}
	</button>
</form>

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4 max-w-lg">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this category</button>
</form>
