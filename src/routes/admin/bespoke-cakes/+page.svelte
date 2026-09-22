<script lang="ts">
	import { enhance } from '$app/forms';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let contentSubmitting = $state(false);
	let gallerySubmitting = $state(false);
	let testimonialSubmitting = $state(false);
	let editingTestimonialId = $state<number | null>(null);

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
	<h1 class="font-display text-3xl text-ink">Bespoke cakes page</h1>
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
			return async ({ update }) => {
				await update();
				contentSubmitting = false;
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
				value={data.settings?.bespokeCakesHeading ?? "Bespoke cakes for your Smashin' occasion"}
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
				>{data.settings?.bespokeCakesIntro ??
					'Birthdays, celebrations, anything worth marking with something a bit special — tell us what you have in mind and our baker Alanah will help bring it to life.'}</textarea
			>
		</div>

		<MediaPicker
			items={data.mediaItems}
			fileFieldName="bespokeCakesImageFile"
			urlFieldName="bespokeCakesImageUrl"
			label="Hero photo"
			hint="A wide photo works best — it spans the full page width. Leave blank to show the page with no photo."
			currentUrl={data.settings?.bespokeCakesImageUrl ?? null}
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
			};
		}}
	>
		<MediaPicker
			items={data.mediaItems}
			fileFieldName="imageFile"
			urlFieldName="imageUrl"
			label="Add a photo"
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
				<div class="overflow-hidden rounded-xl border border-ink/10 bg-white">
					<img
						src={item.imageUrl}
						alt={item.caption ?? ''}
						class="aspect-square w-full object-cover"
					/>
					<div class="p-2.5">
						{#if item.caption}
							<p class="truncate text-xs text-ink-soft" title={item.caption}>{item.caption}</p>
						{/if}
						<form
							method="POST"
							action="?/deleteGalleryImage"
							use:enhance
							onsubmit={confirmDeleteImage}
							class="mt-1.5"
						>
							<input type="hidden" name="id" value={item.id} />
							<button type="submit" class="text-xs text-red-600/70 hover:text-red-600"
								>Remove</button
							>
						</form>
					</div>
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
