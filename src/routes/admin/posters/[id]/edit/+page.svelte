<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
	let imageZoom = $state(data.poster.imageZoom ?? 100);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.poster.heading}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit {data.poster.heading} — Admin</title>
</svelte:head>

<a href="/admin/posters" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Posters</a>
<h1 class="font-display mt-2 text-3xl text-ink">{data.poster.heading}</h1>

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

	<div class="grid gap-6 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<label for="heading" class="text-ink-soft text-sm font-medium">Heading</label>
			<input
				id="heading"
				name="heading"
				required
				value={data.poster.heading}
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
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				>{data.poster.message}</textarea
			>
		</div>

		<div>
			<label for="style" class="text-ink-soft text-sm font-medium">Style</label>
			<select
				id="style"
				name="style"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			>
				<option value="general" selected={data.poster.style === 'general'}>General</option>
				<option value="announcement" selected={data.poster.style === 'announcement'}>Announcement</option>
				<option value="sold-out" selected={data.poster.style === 'sold-out'}>Sold out</option>
				<option value="celebration" selected={data.poster.style === 'celebration'}>Celebration</option>
			</select>
		</div>

		<div class="sm:col-span-2">
			<label for="image" class="text-ink-soft text-sm font-medium">Image</label>
			{#if data.poster.imageUrl}
				<div class="bg-cream-dim relative mt-1 h-32 w-full overflow-hidden rounded-lg">
					<img
						src={data.poster.imageUrl}
						alt="Current poster"
						class="absolute inset-0 h-full w-full object-cover object-right"
						style:transform={`scale(${imageZoom / 100})`}
						style:transform-origin="right center"
					/>
				</div>
				<div class="mt-3 flex items-center gap-3">
					<label for="imageZoom" class="text-ink-soft shrink-0 text-sm">Zoom</label>
					<input
						id="imageZoom"
						name="imageZoom"
						type="range"
						min="100"
						max="200"
						step="1"
						bind:value={imageZoom}
						class="accent-pink w-full"
					/>
					<span class="text-ink-soft w-12 shrink-0 text-right text-sm">{imageZoom}%</span>
				</div>
			{:else}
				<input type="hidden" name="imageZoom" value={imageZoom} />
			{/if}
			<input
				id="image"
				name="image"
				type="file"
				accept="image/jpeg,image/png,image/webp"
				class="text-ink-soft mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink"
			/>
			<p class="text-ink-soft/70 mt-1 text-xs">
				JPG, PNG or WEBP, up to 5MB. Recommended: wide landscape, at least 1600&times;600px &mdash;
				the right-hand side shows most prominently, so keep the main subject there. Leave blank to
				keep the current photo.
			</p>
		</div>

		<div>
			<label for="ctaLabel" class="text-ink-soft text-sm font-medium">Button text (optional)</label>
			<input
				id="ctaLabel"
				name="ctaLabel"
				value={data.poster.ctaLabel ?? ''}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="ctaUrl" class="text-ink-soft text-sm font-medium">Button link (optional)</label>
			<input
				id="ctaUrl"
				name="ctaUrl"
				value={data.poster.ctaUrl ?? ''}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label class="text-ink-soft flex items-center gap-2 text-sm">
				<input type="checkbox" name="isActive" value="true" checked={data.poster.isActive} class="accent-pink h-4 w-4" />
				Active (shows on homepage)
			</label>
			<p class="text-ink-soft/70 mt-1 text-xs">Activating this will deactivate any other active poster.</p>
		</div>
	</div>

	<button
		type="submit"
		disabled={submitting}
		class="bg-pink hover:bg-pink-deep mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Save changes'}
	</button>
</form>

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4 max-w-2xl">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this poster</button>
</form>
