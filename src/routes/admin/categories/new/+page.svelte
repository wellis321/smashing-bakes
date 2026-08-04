<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>New category — Admin</title>
</svelte:head>

<a href="/admin/categories" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Categories</a>
<h1 class="font-display mt-2 text-3xl text-ink">New category</h1>

<form
	method="POST"
	class="border-ink/10 mt-6 max-w-lg rounded-2xl border bg-white/60 p-6"
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

	<div class="space-y-4">
		<div>
			<label for="name" class="text-ink-soft text-sm font-medium">Category name</label>
			<input
				id="name"
				name="name"
				required
				placeholder="Blondies"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="slug" class="text-ink-soft text-sm font-medium">URL slug</label>
			<input
				id="slug"
				name="slug"
				placeholder="auto-generated from name if left blank"
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
			></textarea>
		</div>
	</div>

	<button
		type="submit"
		disabled={submitting}
		class="bg-pink hover:bg-pink-deep mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Create category'}
	</button>
</form>
