<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import PosterBanner from '$lib/components/PosterBanner.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	let eyebrow = $state('');
	let heading = $state('');
	let message = $state('');
	let perks = $state('');
	let style = $state<'general' | 'announcement' | 'sold-out' | 'celebration'>('general');
	let ctaLabel = $state('');
	let ctaUrl = $state('');
	let imagePreviewUrl = $state<string | null>(null);

	const previewPoster = $derived({
		eyebrow: eyebrow || null,
		heading: heading || 'Your heading here',
		message: message || 'Your message will appear here as you type.',
		perks: perks || null,
		imageUrl: imagePreviewUrl,
		imageZoom: 100,
		style,
		ctaLabel: ctaLabel || null,
		ctaUrl: ctaUrl || null
	});
</script>

<svelte:head>
	<title>New poster — Admin</title>
</svelte:head>

<a href="/admin/posters" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Posters</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">New poster</h1>
	<HelpLink section="posters" task="new-banner" />
</div>

<div class="mt-6">
	<p class="text-xs font-semibold tracking-widest text-ink-soft uppercase">Live preview</p>
	<div class="mt-2 rounded-2xl border border-ink/10 bg-white/40 p-4">
		<PosterBanner poster={previewPoster} />
	</div>
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
				placeholder="Caramel Cornflake Brownie"
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
				placeholder="Honestly can't believe how fast these sold out! They'll be making an appearance again this weekend."
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

		<div>
			<MediaPicker
				items={data.mediaItems}
				fileFieldName="image"
				urlFieldName="imageUrl"
				label="Image (optional)"
				hint="JPG, PNG or WEBP, up to 5MB. Recommended: wide landscape, at least 1600×600px — the right-hand side shows most prominently, so keep the main subject there."
				bind:previewUrl={imagePreviewUrl}
			/>
		</div>

		<div>
			<label for="ctaLabel" class="text-sm font-medium text-ink-soft">Button text (optional)</label>
			<input
				id="ctaLabel"
				name="ctaLabel"
				bind:value={ctaLabel}
				placeholder="Vote for next week's flavour"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="ctaUrl" class="text-sm font-medium text-ink-soft">Button link (optional)</label>
			<input
				id="ctaUrl"
				name="ctaUrl"
				bind:value={ctaUrl}
				placeholder="/vote"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>
	</div>

	<p class="mt-4 text-xs text-ink-soft/70">
		New posters are created inactive — use "Set active" from the poster list once you're happy with
		it.
	</p>

	<button
		type="submit"
		disabled={submitting}
		class="mt-4 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Create poster'}
	</button>
</form>
