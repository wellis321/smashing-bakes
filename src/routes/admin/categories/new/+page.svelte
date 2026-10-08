<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>New category — Admin</title>
</svelte:head>

<a href="/admin/categories" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Categories</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">New category</h1>
	<HelpLink section="categories" />
</div>

<form
	method="POST"
	class="mt-6 max-w-lg rounded-2xl border border-ink/10 bg-white/60 p-6"
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
			<label for="name" class="text-sm font-medium text-ink-soft">Category name</label>
			<input
				id="name"
				name="name"
				required
				placeholder="Blondies"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="slug" class="text-sm font-medium text-ink-soft">URL slug</label>
			<input
				id="slug"
				name="slug"
				placeholder="auto-generated from name if left blank"
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
			></textarea>
		</div>
	</div>

	<button
		type="submit"
		disabled={submitting}
		class="mt-6 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Create category'}
	</button>
</form>
