<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>New poster — Admin</title>
</svelte:head>

<a href="/admin/posters" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Posters</a>
<h1 class="font-display mt-2 text-3xl text-ink">New poster</h1>

<form
	method="POST"
	enctype="multipart/form-data"
	class="border-ink/10 mt-6 max-w-2xl rounded-2xl border bg-white/60 p-6"
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

	<div class="grid gap-6 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<label for="heading" class="text-ink-soft text-sm font-medium">Heading</label>
			<input
				id="heading"
				name="heading"
				required
				placeholder="Caramel Cornflake Brownie"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div class="sm:col-span-2">
			<label for="message" class="text-ink-soft text-sm font-medium">Message</label>
			<textarea
				id="message"
				name="message"
				rows="3"
				required
				placeholder="Honestly can't believe how fast these sold out! They'll be making an appearance again this weekend."
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			></textarea>
		</div>

		<div>
			<label for="style" class="text-ink-soft text-sm font-medium">Style</label>
			<select
				id="style"
				name="style"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			>
				<option value="general">General</option>
				<option value="announcement">Announcement</option>
				<option value="sold-out">Sold out</option>
				<option value="celebration">Celebration</option>
			</select>
		</div>

		<div>
			<label for="image" class="text-ink-soft text-sm font-medium">Image (optional)</label>
			<input
				id="image"
				name="image"
				type="file"
				accept="image/jpeg,image/png,image/webp"
				class="text-ink-soft mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink"
			/>
			<p class="text-ink-soft/70 mt-1 text-xs">
				JPG, PNG or WEBP, up to 5MB. Recommended: wide landscape, at least 1600&times;600px &mdash;
				the right-hand side shows most prominently, so keep the main subject there.
			</p>
		</div>

		<div>
			<label for="ctaLabel" class="text-ink-soft text-sm font-medium">Button text (optional)</label>
			<input
				id="ctaLabel"
				name="ctaLabel"
				placeholder="Vote for next week's flavour"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="ctaUrl" class="text-ink-soft text-sm font-medium">Button link (optional)</label>
			<input
				id="ctaUrl"
				name="ctaUrl"
				placeholder="/vote"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>
	</div>

	<p class="text-ink-soft/70 mt-4 text-xs">
		New posters are created inactive — use "Set active" from the poster list once you're happy
		with it.
	</p>

	<button
		type="submit"
		disabled={submitting}
		class="bg-pink hover:bg-pink-deep mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Create poster'}
	</button>
</form>
