<script lang="ts">
	import { enhance } from '$app/forms';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
	let heroSubmitting = $state(false);
	let navSubmitting = $state(false);

	const navItems = [
		{ key: 'navMenusEnabled', label: 'Weekly menus', href: '/menus' },
		{ key: 'navVoteEnabled', label: 'Vote', href: '/vote' },
		{ key: 'navAboutEnabled', label: 'About', href: '/about' },
		{ key: 'navBespokeCakesEnabled', label: 'Bespoke cakes', href: '/bespoke-cakes' },
		{ key: 'navContactEnabled', label: 'Contact', href: '/contact' },
		{ key: 'navPromotionsEnabled', label: 'Promotions', href: '/promotions' }
	] as const;
</script>

<svelte:head>
	<title>Settings — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Settings</h1>
<p class="mt-1 max-w-lg text-sm text-ink-soft">
	Site-wide settings that show up on the public site.
</p>

<div class="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
	<div class="flex flex-col gap-6">
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
					<label for="welcomeOfferCode" class="text-sm font-medium text-ink-soft">Short label</label
					>
					<input
						id="welcomeOfferCode"
						name="welcomeOfferCode"
						type="text"
						required
						maxlength="50"
						value={form?.values?.welcomeOfferCode ??
							data.settings?.welcomeOfferCode ??
							'TREAT CLUB'}
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
						Staff honor this manually in person — there's no automatic redemption system yet, so
						keep it something you're happy to give whoever asks for it, however often it applies.
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
			<h2 class="text-lg font-semibold text-ink">Page visibility</h2>
			<p class="mt-1 text-sm text-ink-soft">
				Untick a page to hide it from the menu and footer and take it offline (visitors get a "page
				not found"). Shop, cart and account pages always stay on.
			</p>

			<form
				method="POST"
				action="?/updateNavVisibility"
				class="mt-5 space-y-3"
				use:enhance={() => {
					navSubmitting = true;
					return async ({ update }) => {
						await update();
						navSubmitting = false;
					};
				}}
			>
				{#each navItems as item (item.key)}
					<label class="flex items-center justify-between gap-3 rounded-lg px-1 py-1">
						<span class="text-sm font-medium text-ink">
							{item.label}
							<span class="text-ink-soft/60">&middot; {item.href}</span>
						</span>
						<input
							type="checkbox"
							name={item.key}
							checked={data.settings?.[item.key] ?? true}
							class="h-4 w-4 accent-pink"
						/>
					</label>
				{/each}

				{#if form?.navSuccess}
					<p class="rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
				{/if}

				<button
					type="submit"
					disabled={navSubmitting}
					class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
				>
					{navSubmitting ? 'Saving…' : 'Save changes'}
				</button>
			</form>
		</div>
	</div>

	<div class="flex flex-col gap-6">
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
	</div>
</div>
