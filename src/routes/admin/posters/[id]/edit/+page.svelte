<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import PosterBanner from '$lib/components/PosterBanner.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
	let closeAfterSave = $state(false);
	let imageZoom = $state(data.poster.imageZoom ?? 100);

	let eyebrow = $state(data.poster.eyebrow ?? '');
	let heading = $state(data.poster.heading);
	let message = $state(data.poster.message);
	let perks = $state(data.poster.perks ?? '');
	let style = $state(data.poster.style);
	let ctaLabel = $state(data.poster.ctaLabel ?? '');
	let ctaUrl = $state(data.poster.ctaUrl ?? '');
	let imagePreviewUrl = $state<string | null>(data.poster.imageUrl);

	const previewPoster = $derived({
		eyebrow: eyebrow || null,
		heading: heading || 'Your heading here',
		message: message || 'Your message will appear here as you type.',
		perks: perks || null,
		imageUrl: imagePreviewUrl,
		imageZoom,
		style,
		ctaLabel: ctaLabel || null,
		ctaUrl: ctaUrl || null
	});

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.poster.heading}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit {data.poster.heading} — Admin</title>
</svelte:head>

<a href="/admin/posters" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Posters</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">{data.poster.heading}</h1>
	<HelpLink section="posters" task="banner" />
</div>

<div class="mt-6">
	<p class="text-xs font-semibold tracking-widest text-ink-soft uppercase">Live preview</p>
	<div class="mt-2 rounded-2xl border border-ink/10 bg-white/40 p-4">
		<PosterBanner poster={previewPoster} />
	</div>
</div>

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
			if (closeAfterSave && result.type === 'success') goto('/admin/posters');
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

	<div class="grid gap-6 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<label for="eyebrow" class="text-sm font-medium text-ink-soft">Overline (optional)</label>
			<input
				id="eyebrow"
				name="eyebrow"
				bind:value={eyebrow}
				placeholder="Like our cakes?"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
			<p class="mt-1.5 text-xs text-ink-soft/70">Small label shown above the heading.</p>
		</div>

		<div class="sm:col-span-2">
			<label for="heading" class="text-sm font-medium text-ink-soft">Heading</label>
			<input
				id="heading"
				name="heading"
				required
				bind:value={heading}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div class="sm:col-span-2">
			<label for="message" class="text-sm font-medium text-ink-soft">Message</label>
			<textarea
				id="message"
				name="message"
				rows="3"
				required
				bind:value={message}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			></textarea>
		</div>

		<div class="sm:col-span-2">
			<label for="perks" class="text-sm font-medium text-ink-soft">Perks list (optional)</label>
			<textarea
				id="perks"
				name="perks"
				rows="4"
				bind:value={perks}
				placeholder={'One perk per line, e.g.\nFree standard delivery\nEarly access to new flavours\nExclusive flash offers'}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			></textarea>
			<p class="mt-1.5 text-xs text-ink-soft/70">
				One per line. Shown as a checklist under a divider — leave blank to hide this section
				entirely.
			</p>
		</div>

		<div>
			<label for="style" class="text-sm font-medium text-ink-soft">Style</label>
			<select
				id="style"
				name="style"
				bind:value={style}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			>
				<option value="general">General</option>
				<option value="announcement">Announcement</option>
				<option value="sold-out">Sold out</option>
				<option value="celebration">Celebration</option>
			</select>
		</div>

		<div class="sm:col-span-2">
			<label for="image" class="text-sm font-medium text-ink-soft">Image</label>
			{#if data.poster.imageUrl}
				<div class="mt-3 flex items-center gap-3">
					<label for="imageZoom" class="shrink-0 text-sm text-ink-soft">Zoom</label>
					<input
						id="imageZoom"
						name="imageZoom"
						type="range"
						min="100"
						max="200"
						step="1"
						bind:value={imageZoom}
						class="w-full accent-pink"
					/>
					<span class="w-12 shrink-0 text-right text-sm text-ink-soft">{imageZoom}%</span>
				</div>
				<p class="mt-1 text-xs text-ink-soft/70">
					See the live preview above — zoom applies to the current photo.
				</p>
			{:else}
				<input type="hidden" name="imageZoom" value={imageZoom} />
			{/if}
			<div class="mt-3">
				<MediaPicker
					items={data.mediaItems}
					fileFieldName="image"
					urlFieldName="imageUrl"
					label=""
					showPreview={false}
					hint="JPG, PNG or WEBP, up to 5MB. Recommended: wide landscape, at least 1600×600px — the right-hand side shows most prominently, so keep the main subject there. Leave blank to keep the current photo."
					currentUrl={data.poster.imageUrl}
					bind:previewUrl={imagePreviewUrl}
				/>
			</div>
		</div>

		<div>
			<label for="ctaLabel" class="text-sm font-medium text-ink-soft">Button text (optional)</label>
			<input
				id="ctaLabel"
				name="ctaLabel"
				bind:value={ctaLabel}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="ctaUrl" class="text-sm font-medium text-ink-soft">Button link (optional)</label>
			<input
				id="ctaUrl"
				name="ctaUrl"
				bind:value={ctaUrl}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label class="flex items-center gap-2 text-sm text-ink-soft">
				<input
					type="checkbox"
					name="isActive"
					value="true"
					checked={data.poster.isActive}
					class="h-4 w-4 accent-pink"
				/>
				Active (shows on homepage)
			</label>
			<p class="mt-1 text-xs text-ink-soft/70">
				Activating this will deactivate any other active poster.
			</p>
		</div>
	</div>

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

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600"
		>Delete this poster</button
	>
</form>
