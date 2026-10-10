<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import SettingsCard from '$lib/components/admin/SettingsCard.svelte';
	import { onMount, tick } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
	let heroSubmitting = $state(false);
	let navSubmitting = $state(false);
	let hoursSubmitting = $state(false);
	let merchantSubmitting = $state(false);

	// One box open at a time keeps the page calm. A link like
	// /admin/settings#opening-hours opens that box and scrolls to it.
	let openId = $state('');
	function toggle(id: string) {
		openId = openId === id ? '' : id;
	}
	async function openFromHash() {
		const id = location.hash.slice(1);
		if (!id) return;
		openId = id;
		await tick();
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
	onMount(() => {
		openFromHash();
		window.addEventListener('hashchange', openFromHash);
		return () => window.removeEventListener('hashchange', openFromHash);
	});

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

<div class="flex items-center gap-2">
	<h1 class="font-display text-3xl text-ink">Settings</h1>
	<HelpLink section="settings" task="hero-photos" />
</div>
<p class="mt-1 max-w-lg text-sm text-ink-soft">Choose a box below to change it.</p>

<div class="mt-8 max-w-3xl space-y-4">
	<SettingsCard
		id="hero-images"
		title="Homepage photos"
		summary="The three photos next to the big headline on the homepage."
		open={openId === 'hero-images'}
		ontoggle={() => toggle('hero-images')}
	>
		<p class="text-sm leading-relaxed text-ink-soft">
			For each photo, press <strong>Choose from library</strong> to pick one you've uploaded before,
			or <strong>Browse…</strong> to upload a new one. Then press <strong>Save changes</strong>. A
			photo you leave alone stays as it is.
		</p>
		<div class="mt-3">
			<HelpLink
				section="settings"
				task="hero-photos"
				label="Show me how"
				title="Step-by-step guide"
			/>
		</div>
		<form
			method="POST"
			action="?/updateHeroImages"
			enctype="multipart/form-data"
			class="mt-4 space-y-5"
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
	</SettingsCard>

	<SettingsCard
		id="opening-hours"
		title="Opening hours"
		summary="Shown in the top banner, footer, homepage and Contact page."
		open={openId === 'opening-hours'}
		ontoggle={() => toggle('opening-hours')}
	>
		<p class="text-sm leading-relaxed text-ink-soft">
			Type each day or range on its own line, just as you'd like it to read. Then press
			<strong>Save changes</strong>.
		</p>
		<div class="mt-3">
			<HelpLink
				section="settings"
				task="opening-hours"
				label="Show me how"
				title="Step-by-step guide"
			/>
		</div>
		<form
			method="POST"
			action="?/updateOpeningHours"
			class="mt-4 space-y-4"
			use:enhance={() => {
				hoursSubmitting = true;
				return async ({ update }) => {
					await update({ reset: false });
					hoursSubmitting = false;
				};
			}}
		>
			<textarea
				name="openingHoursText"
				rows="4"
				class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				>{data.settings?.openingHoursText ?? 'Friday 10am – 4pm\nSaturday 10am – 4pm'}</textarea
			>
			<p class="text-xs text-ink-soft/70">
				Clear the box and save to go back to the default (Friday and Saturday, 10am – 4pm).
			</p>

			{#if form?.hoursSuccess}
				<p class="rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
			{/if}

			<button
				type="submit"
				disabled={hoursSubmitting}
				class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
			>
				{hoursSubmitting ? 'Saving…' : 'Save changes'}
			</button>
		</form>
	</SettingsCard>

	<SettingsCard
		id="welcome-offer"
		title="Newsletter welcome offer"
		summary="What people are told they get when they join the mailing list."
		open={openId === 'welcome-offer'}
		ontoggle={() => toggle('welcome-offer')}
	>
		<p class="text-sm leading-relaxed text-ink-soft">
			Shown straight after someone signs up (footer, homepage and the newsletter page).
		</p>
		<div class="mt-3">
			<HelpLink
				section="settings"
				task="welcome-offer"
				label="Show me how"
				title="Step-by-step guide"
			/>
		</div>
		<form
			method="POST"
			action="?/updateOffer"
			class="mt-4 space-y-4"
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
	</SettingsCard>

	<SettingsCard
		id="online-payments"
		title="Online payments (SumUp)"
		summary="The merchant code that tells SumUp which account to pay into."
		open={openId === 'online-payments'}
		ontoggle={() => toggle('online-payments')}
	>
		<p class="text-sm leading-relaxed text-ink-soft">
			Paste your SumUp <strong>merchant code</strong> here, then press
			<strong>Save changes</strong>. It&rsquo;s a short mix of letters and numbers in your SumUp
			account.
		</p>
		<p class="mt-2 rounded-lg bg-blush px-3 py-2 text-sm leading-relaxed text-ink">
			Please don&rsquo;t put your SumUp <strong>API key</strong> here &mdash; it&rsquo;s secret, so please
			pass it straight to me instead (the guide shows how).
		</p>
		<div class="mt-3">
			<HelpLink
				section="settings"
				task="payment-setup"
				label="Show me how to find it"
				title="Step-by-step guide"
			/>
		</div>
		<form
			method="POST"
			action="?/updateSumupMerchantCode"
			class="mt-4 space-y-4"
			use:enhance={() => {
				merchantSubmitting = true;
				return async ({ update }) => {
					await update({ reset: false });
					merchantSubmitting = false;
				};
			}}
		>
			<label class="block text-sm text-ink-soft">
				Merchant code
				<input
					name="sumupMerchantCode"
					type="text"
					autocomplete="off"
					spellcheck="false"
					maxlength="50"
					value={data.settings?.sumupMerchantCode ?? ''}
					class="mt-1 w-full max-w-xs rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-pink/40"
				/>
			</label>

			{#if form?.merchantError}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.merchantError}</p>
			{/if}
			{#if form?.merchantSuccess}
				<p class="rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
			{/if}

			<button
				type="submit"
				disabled={merchantSubmitting}
				class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
			>
				{merchantSubmitting ? 'Saving…' : 'Save changes'}
			</button>
		</form>
	</SettingsCard>

	<SettingsCard
		id="page-visibility"
		title="Show or hide pages"
		summary="Switch a page off to remove it from the menu and take it offline."
		open={openId === 'page-visibility'}
		ontoggle={() => toggle('page-visibility')}
	>
		<p class="text-sm leading-relaxed text-ink-soft">
			Untick a page to hide it. Visitors who find it get "page not found". Shop, cart and account
			pages always stay on.
		</p>
		<div class="mt-3">
			<HelpLink
				section="settings"
				task="hide-page"
				label="Show me how"
				title="Step-by-step guide"
			/>
		</div>
		<form
			method="POST"
			action="?/updateNavVisibility"
			class="mt-4 space-y-3"
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
	</SettingsCard>
</div>
