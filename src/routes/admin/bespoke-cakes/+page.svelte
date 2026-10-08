<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import ImagePositionControls from '$lib/components/admin/ImagePositionControls.svelte';
	import PhotoFrame from '$lib/components/PhotoFrame.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let contentSubmitting = $state(false);
	let gallerySubmitting = $state(false);
	let testimonialSubmitting = $state(false);
	let editingTestimonialId = $state<number | null>(null);
	let editingGalleryId = $state<number | null>(null);

	let heroPreviewUrl = $state<string | null>(data.settings?.bespokeCakesImageUrl ?? null);
	let heroZoom = $state(data.settings?.bespokeCakesImageZoom ?? 100);
	let heroFocalPoint = $state(data.settings?.bespokeCakesImageFocalPoint ?? 'center');
	let heroShape = $state<'wide' | 'tall'>(
		data.settings?.bespokeCakesImageShape === 'tall' ? 'tall' : 'wide'
	);
	let heroPhotoRatio = $state(0);

	const shapes = [
		{
			value: 'wide',
			label: 'Wide banner',
			hint: 'Spans the page under the intro. Best for landscape photos.',
			icon: 'h-6 w-12'
		},
		{
			value: 'tall',
			label: 'Tall',
			hint: 'Upright photo beside the heading. Best for cakes shot portrait.',
			icon: 'h-10 w-8'
		}
	] as const;

	let newGalleryPreviewUrl = $state<string | null>(null);
	let newGalleryZoom = $state(100);
	let newGalleryFocalPoint = $state('center');

	// Shared across whichever single gallery item is being adjusted at a time
	// (editingGalleryId), seeded from that item's saved values when opened.
	let editZoom = $state(100);
	let editFocalPoint = $state('center');

	function startEditingGallery(item: { id: number; imageZoom: number; focalPoint: string }) {
		editingGalleryId = item.id;
		editZoom = item.imageZoom;
		editFocalPoint = item.focalPoint;
	}

	function confirmDeleteImage(event: SubmitEvent) {
		if (!confirm("Remove this photo from the gallery? This can't be undone.")) {
			event.preventDefault();
		}
	}

	function confirmDeleteTestimonial(event: SubmitEvent) {
		if (!confirm("Delete this quote? This can't be undone.")) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Bespoke cakes page — Admin</title>
</svelte:head>

<div class="flex flex-wrap items-baseline justify-between gap-2">
	<div class="flex items-center gap-2">
		<h1 class="font-display text-3xl text-ink">Bespoke cakes page</h1>
		<HelpLink section="bespoke-cakes" />
	</div>
	<a
		href="/bespoke-cakes"
		target="_blank"
		rel="noreferrer"
		class="text-sm font-semibold text-pink-deep hover:underline"
	>
		View page &#8599;
	</a>
</div>
<p class="mt-1 max-w-lg text-sm text-ink-soft">
	Everything shown on the public <code class="text-xs">/bespoke-cakes</code> page — the hero, the design
	gallery, and customer quotes — is managed here.
</p>

<div class="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6">
	<h2 class="text-lg font-semibold text-ink">Hero photo &amp; intro text</h2>
	<p class="mt-1 text-sm text-ink-soft">Shown at the top of the page, above the gallery.</p>

	<form
		method="POST"
		action="?/updatePageContent"
		enctype="multipart/form-data"
		class="mt-5 space-y-4"
		use:enhance={() => {
			contentSubmitting = true;
			return async ({ result, update }) => {
				await update();
				contentSubmitting = false;
				// Re-sync straight from what the server just confirmed it saved,
				// rather than trusting the post-update `data` prop to have
				// already caught up — that reactivity lands a beat later, which
				// otherwise shows the photo/zoom/position reverting to blank
				// for a moment right after a real save.
				if (result.type === 'success' && result.data && 'contentValues' in result.data) {
					const values = result.data.contentValues as {
						bespokeCakesImageUrl: string | null;
						bespokeCakesImageZoom: number;
						bespokeCakesImageFocalPoint: string;
						bespokeCakesImageShape?: string;
					};
					heroPreviewUrl = values.bespokeCakesImageUrl ?? null;
					heroZoom = values.bespokeCakesImageZoom ?? 100;
					heroFocalPoint = values.bespokeCakesImageFocalPoint ?? 'center';
					heroShape = values.bespokeCakesImageShape === 'tall' ? 'tall' : 'wide';
				}
			};
		}}
	>
		<div>
			<label for="bespokeCakesHeading" class="text-sm font-medium text-ink-soft">Heading</label>
			<input
				id="bespokeCakesHeading"
				name="bespokeCakesHeading"
				type="text"
				required
				maxlength="200"
				value={form?.contentValues?.bespokeCakesHeading ??
					data.settings?.bespokeCakesHeading ??
					"Bespoke cakes for your Smashin' occasion"}
				class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>
		<div>
			<label for="bespokeCakesIntro" class="text-sm font-medium text-ink-soft">Intro text</label>
			<textarea
				id="bespokeCakesIntro"
				name="bespokeCakesIntro"
				rows="3"
				required
				class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				>{form?.contentValues?.bespokeCakesIntro ??
					data.settings?.bespokeCakesIntro ??
					'Birthdays, celebrations, anything worth marking with something a bit special — tell us what you have in mind and our baker Alanah will help bring it to life.'}</textarea
			>
		</div>

		<MediaPicker
			items={data.mediaItems}
			fileFieldName="bespokeCakesImageFile"
			urlFieldName="bespokeCakesImageUrl"
			label="Hero photo"
			hint="Landscape photos suit the Wide banner shape; upright photos (most cake photos) suit Tall. Leave blank to show the page with no photo."
			currentUrl={form?.contentValues?.bespokeCakesImageUrl ??
				data.settings?.bespokeCakesImageUrl ??
				null}
			showPreview={false}
			bind:previewUrl={heroPreviewUrl}
		/>
		<fieldset>
			<legend class="text-sm font-medium text-ink-soft">Photo shape</legend>
			<div class="mt-2 grid gap-3 sm:grid-cols-2">
				{#each shapes as option (option.value)}
					<label class="cursor-pointer">
						<input
							type="radio"
							name="bespokeCakesImageShape"
							value={option.value}
							bind:group={heroShape}
							class="peer sr-only"
						/>
						<span
							class="flex items-center gap-3 rounded-xl border border-ink/15 bg-white p-3 transition-colors peer-checked:border-pink peer-checked:bg-pink/5 peer-focus-visible:ring-2 peer-focus-visible:ring-pink/40"
						>
							<span
								class={`shrink-0 rounded-sm border-2 border-ink/40 bg-ink/10 ${option.icon}`}
								aria-hidden="true"
							></span>
							<span>
								<span class="block text-sm font-semibold text-ink">{option.label}</span>
								<span class="block text-xs text-ink-soft">{option.hint}</span>
							</span>
						</span>
					</label>
				{/each}
			</div>
			{#if heroShape === 'wide' && heroPhotoRatio > 0 && heroPhotoRatio < 1}
				<p class="mt-3 rounded-lg bg-blush px-3 py-2.5 text-sm text-ink">
					This is an upright photo, so a wide banner will crop most of it away.
					<button
						type="button"
						onclick={() => (heroShape = 'tall')}
						class="font-semibold text-pink-deep underline"
					>
						Switch to Tall
					</button>
					to show it properly.
				</p>
			{/if}
		</fieldset>
		<ImagePositionControls
			bind:photoRatio={heroPhotoRatio}
			previewUrl={heroPreviewUrl}
			bind:zoom={heroZoom}
			bind:focalPoint={heroFocalPoint}
			zoomFieldName="bespokeCakesImageZoom"
			focalFieldName="bespokeCakesImageFocalPoint"
			aspectClass={heroShape === 'tall' ? 'aspect-[4/5]' : 'aspect-[21/9]'}
		/>

		{#if form?.contentMessage}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.contentMessage}</p>
		{/if}
		{#if form?.contentSuccess}
			<p class="rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
		{/if}

		<button
			type="submit"
			disabled={contentSubmitting}
			class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
		>
			{contentSubmitting ? 'Saving…' : 'Save changes'}
		</button>
	</form>
</div>

<div class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6">
	<h2 class="text-lg font-semibold text-ink">Cake gallery</h2>
	<p class="mt-1 text-sm text-ink-soft">
		Past designs shown in the slider on the page, most recently added first.
	</p>

	<form
		method="POST"
		action="?/addGalleryImage"
		enctype="multipart/form-data"
		class="mt-5 space-y-4 rounded-xl bg-cream-dim/60 p-4"
		use:enhance={() => {
			gallerySubmitting = true;
			return async ({ update }) => {
				await update({ reset: true });
				gallerySubmitting = false;
				newGalleryPreviewUrl = null;
				newGalleryZoom = 100;
				newGalleryFocalPoint = 'center';
			};
		}}
	>
		<MediaPicker
			items={data.mediaItems}
			fileFieldName="imageFile"
			urlFieldName="imageUrl"
			label="Add a photo"
			showPreview={false}
			bind:previewUrl={newGalleryPreviewUrl}
		/>
		<ImagePositionControls
			previewUrl={newGalleryPreviewUrl}
			bind:zoom={newGalleryZoom}
			bind:focalPoint={newGalleryFocalPoint}
			zoomFieldName="imageZoom"
			focalFieldName="focalPoint"
			aspectClass="aspect-[4/5]"
		/>
		<div>
			<label for="caption" class="text-sm font-medium text-ink-soft">Caption (optional)</label>
			<input
				id="caption"
				name="caption"
				type="text"
				maxlength="200"
				placeholder="e.g. 3-tier drip cake with fresh florals"
				class="mt-1.5 w-full max-w-sm rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		{#if form?.galleryMessage}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.galleryMessage}</p>
		{/if}

		<button
			type="submit"
			disabled={gallerySubmitting}
			class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
		>
			{gallerySubmitting ? 'Adding…' : 'Add to gallery'}
		</button>
	</form>

	{#if data.galleryItems.length === 0}
		<p class="mt-5 text-sm text-ink-soft">No gallery photos yet.</p>
	{:else}
		<div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{#each data.galleryItems as item (item.id)}
				<div
					class={`overflow-hidden rounded-xl border border-ink/10 bg-white ${editingGalleryId === item.id ? 'col-span-full' : ''}`}
				>
					{#if editingGalleryId === item.id}
						<form
							method="POST"
							action="?/updateGalleryImage"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
									editingGalleryId = null;
								};
							}}
							class="p-4"
						>
							<input type="hidden" name="id" value={item.id} />
							<ImagePositionControls
								previewUrl={item.imageUrl}
								bind:zoom={editZoom}
								bind:focalPoint={editFocalPoint}
								zoomFieldName="imageZoom"
								focalFieldName="focalPoint"
								aspectClass="aspect-[4/5]"
							/>
							<input
								name="caption"
								type="text"
								maxlength="200"
								value={item.caption ?? ''}
								placeholder="Caption (optional)"
								class="mt-4 w-full max-w-md rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
							/>
							<div class="mt-3 flex items-center gap-3">
								<button
									type="submit"
									class="rounded-full bg-pink px-4 py-1.5 text-sm font-semibold text-cream hover:bg-pink-deep"
								>
									Save
								</button>
								<button
									type="button"
									onclick={() => (editingGalleryId = null)}
									class="text-sm font-semibold text-ink-soft hover:text-ink"
								>
									Cancel
								</button>
							</div>
						</form>
					{:else}
						<PhotoFrame
							src={item.imageUrl}
							alt={item.caption ?? ''}
							zoom={item.imageZoom}
							focal={item.focalPoint}
							class="aspect-[4/5] w-full"
						/>
						<div class="p-2.5">
							{#if item.caption}
								<p class="truncate text-xs text-ink-soft" title={item.caption}>{item.caption}</p>
							{/if}
							<div class="mt-1.5 flex items-center gap-3">
								<button
									type="button"
									onclick={() => startEditingGallery(item)}
									class="text-xs font-semibold text-ink-soft hover:text-ink"
								>
									Adjust
								</button>
								<form
									method="POST"
									action="?/deleteGalleryImage"
									use:enhance
									onsubmit={confirmDeleteImage}
								>
									<input type="hidden" name="id" value={item.id} />
									<button type="submit" class="text-xs text-red-600/70 hover:text-red-600"
										>Remove</button
									>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<div class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6">
	<h2 class="text-lg font-semibold text-ink">Customer quotes</h2>
	<p class="mt-1 text-sm text-ink-soft">
		Shown dotted throughout the page rather than all in one place.
	</p>

	<form
		method="POST"
		action="?/addTestimonial"
		class="mt-5 space-y-3 rounded-xl bg-cream-dim/60 p-4"
		use:enhance={() => {
			testimonialSubmitting = true;
			return async ({ update }) => {
				await update({ reset: true });
				testimonialSubmitting = false;
			};
		}}
	>
		<div>
			<label for="quote" class="text-sm font-medium text-ink-soft">Quote</label>
			<textarea
				id="quote"
				name="quote"
				rows="2"
				required
				placeholder="They made our anniversary so much sweeter — the cake was even better than the photos!"
				class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			></textarea>
		</div>
		<div>
			<label for="authorName" class="text-sm font-medium text-ink-soft"
				>Attributed to (optional)</label
			>
			<input
				id="authorName"
				name="authorName"
				type="text"
				maxlength="150"
				placeholder="e.g. Sarah M."
				class="mt-1.5 w-full max-w-sm rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		{#if form?.testimonialMessage}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.testimonialMessage}</p>
		{/if}

		<button
			type="submit"
			disabled={testimonialSubmitting}
			class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
		>
			{testimonialSubmitting ? 'Adding…' : 'Add quote'}
		</button>
	</form>

	{#if data.testimonials.length === 0}
		<p class="mt-5 text-sm text-ink-soft">No quotes yet.</p>
	{:else}
		<div class="mt-5 space-y-3">
			{#each data.testimonials as item (item.id)}
				<div class="rounded-xl border border-ink/10 bg-white p-4">
					{#if editingTestimonialId === item.id}
						<form
							method="POST"
							action="?/updateTestimonial"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
									editingTestimonialId = null;
								};
							}}
							class="space-y-2.5"
						>
							<input type="hidden" name="id" value={item.id} />
							<textarea
								name="quote"
								rows="2"
								required
								value={item.quote}
								class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
							></textarea>
							<input
								name="authorName"
								type="text"
								maxlength="150"
								value={item.authorName ?? ''}
								placeholder="Attributed to (optional)"
								class="w-full max-w-sm rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
							/>
							<div class="flex items-center gap-3">
								<button
									type="submit"
									class="rounded-full bg-pink px-4 py-1.5 text-xs font-semibold text-cream hover:bg-pink-deep"
								>
									Save
								</button>
								<button
									type="button"
									onclick={() => (editingTestimonialId = null)}
									class="text-xs font-semibold text-ink-soft hover:text-ink"
								>
									Cancel
								</button>
							</div>
						</form>
					{:else}
						<p class="text-sm text-ink italic">&ldquo;{item.quote}&rdquo;</p>
						{#if item.authorName}
							<p class="mt-1.5 text-xs font-semibold text-ink-soft">&mdash; {item.authorName}</p>
						{/if}
						<div class="mt-2.5 flex items-center gap-3">
							<button
								type="button"
								onclick={() => (editingTestimonialId = item.id)}
								class="text-xs font-semibold text-ink-soft hover:text-ink"
							>
								Edit
							</button>
							<form
								method="POST"
								action="?/deleteTestimonial"
								use:enhance
								onsubmit={confirmDeleteTestimonial}
							>
								<input type="hidden" name="id" value={item.id} />
								<button type="submit" class="text-xs text-red-600/70 hover:text-red-600"
									>Delete</button
								>
							</form>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
