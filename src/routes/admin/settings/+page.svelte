<script lang="ts">
	import { enhance } from '$app/forms';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
	let heroSubmitting = $state(false);
	let bespokeSubmitting = $state(false);
</script>

<svelte:head>
	<title>Settings — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Settings</h1>
<p class="mt-1 max-w-lg text-sm text-ink-soft">
	Site-wide settings that show up on the public site.
</p>

<div class="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
	<div class="rounded-2xl border border-ink/10 bg-white/60 p-6">
		<h2 class="text-lg font-semibold text-ink">Newsletter welcome offer</h2>
		<p class="mt-1 text-sm text-ink-soft">
			Shown immediately when someone signs up on the site (footer, homepage, and the
			<code class="text-xs">/newsletter</code> page).
		</p>

		<form
			method="POST"
			action="?/updateOffer"
			class="mt-5 space-y-4"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<div>
				<label for="welcomeOfferCode" class="text-sm font-medium text-ink-soft">Short label</label>
				<input
					id="welcomeOfferCode"
					name="welcomeOfferCode"
					type="text"
					required
					maxlength="50"
					value={form?.values?.welcomeOfferCode ?? data.settings?.welcomeOfferCode ?? 'TREAT CLUB'}
					class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
				<p class="mt-1.5 text-xs text-ink-soft/70">
					A short name shown in a badge — doesn't need to be a redeemable code. "TREAT CLUB" or
					"WELCOME10" both work.
				</p>
			</div>
			<div>
				<label for="welcomeOfferDescription" class="text-sm font-medium text-ink-soft"
					>What it means</label
				>
				<input
					id="welcomeOfferDescription"
					name="welcomeOfferDescription"
					type="text"
					required
					maxlength="255"
					value={form?.values?.welcomeOfferDescription ??
						data.settings?.welcomeOfferDescription ??
						'a free coffee or iced latte every month, plus a free bake on your birthday'}
					class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
				<p class="mt-1.5 text-xs text-ink-soft/70">
					Staff honor this manually in person — there's no automatic redemption system yet, so keep
					it something you're happy to give whoever asks for it, however often it applies.
				</p>
			</div>

			{#if form?.message}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
			{/if}
			{#if form?.success}
				<p class="rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
			{/if}

			<button
				type="submit"
				disabled={submitting}
				class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
			>
				{submitting ? 'Saving…' : 'Save changes'}
			</button>
		</form>
	</div>

	<div class="rounded-2xl border border-ink/10 bg-white/60 p-6">
		<h2 class="text-lg font-semibold text-ink">Homepage hero images</h2>
		<p class="mt-1 text-sm text-ink-soft">
			The three overlapping photo cards next to the homepage headline. Leave any of them blank to
			use the built-in placeholder illustration instead.
		</p>

		<form
			method="POST"
			action="?/updateHeroImages"
			enctype="multipart/form-data"
			class="mt-5 space-y-5"
			use:enhance={() => {
				heroSubmitting = true;
				return async ({ update }) => {
					await update();
					heroSubmitting = false;
				};
			}}
		>
			<MediaPicker
				items={data.mediaItems}
				fileFieldName="heroImage1File"
				urlFieldName="heroImage1Url"
				label="Photo 1 — left"
				hint="Square photo works best (it's cropped to a square card)."
				currentUrl={data.settings?.heroImage1Url ?? null}
			/>
			<MediaPicker
				items={data.mediaItems}
				fileFieldName="heroImage2File"
				urlFieldName="heroImage2Url"
				label="Photo 2 — top right"
				hint="Square photo works best (it's cropped to a square card)."
				currentUrl={data.settings?.heroImage2Url ?? null}
			/>
			<MediaPicker
				items={data.mediaItems}
				fileFieldName="heroImage3File"
				urlFieldName="heroImage3Url"
				label="Photo 3 — bottom left"
				hint="Square photo works best (it's cropped to a square card)."
				currentUrl={data.settings?.heroImage3Url ?? null}
			/>

			{#if form?.heroMessage}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.heroMessage}</p>
			{/if}
			{#if form?.heroSuccess}
				<p class="rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
			{/if}

			<button
				type="submit"
				disabled={heroSubmitting}
				class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
			>
				{heroSubmitting ? 'Saving…' : 'Save changes'}
			</button>
		</form>
	</div>

	<div class="rounded-2xl border border-ink/10 bg-white/60 p-6">
		<h2 class="text-lg font-semibold text-ink">Bespoke cakes page</h2>
		<p class="mt-1 text-sm text-ink-soft">
			The photo and intro text shown on the public <code class="text-xs">/bespoke-cakes</code> page, above
			the enquiry form.
		</p>

		<form
			method="POST"
			action="?/updateBespokeCakesPage"
			enctype="multipart/form-data"
			class="mt-5 space-y-4"
			use:enhance={() => {
				bespokeSubmitting = true;
				return async ({ update }) => {
					await update();
					bespokeSubmitting = false;
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
				label="Photo"
				hint="A wide photo works best — it spans the full page width. Leave blank to show the page with no photo."
				currentUrl={data.settings?.bespokeCakesImageUrl ?? null}
			/>

			{#if form?.bespokeMessage}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.bespokeMessage}</p>
			{/if}
			{#if form?.bespokeSuccess}
				<p class="rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
			{/if}

			<button
				type="submit"
				disabled={bespokeSubmitting}
				class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
			>
				{bespokeSubmitting ? 'Saving…' : 'Save changes'}
			</button>
		</form>
	</div>
</div>
