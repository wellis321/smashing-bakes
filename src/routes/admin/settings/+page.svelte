<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>Settings — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Settings</h1>
<p class="text-ink-soft mt-1 max-w-lg text-sm">Site-wide settings that show up on the public site.</p>

<div class="border-ink/10 mt-8 max-w-lg rounded-2xl border bg-white/60 p-6">
	<h2 class="text-ink text-lg font-semibold">Newsletter welcome offer</h2>
	<p class="text-ink-soft mt-1 text-sm">
		Shown immediately when someone signs up on the site (footer, homepage, and the
		<code class="text-xs">/newsletter</code> page).
	</p>

	<form
		method="POST"
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
			<label for="welcomeOfferCode" class="text-ink-soft text-sm font-medium">Short label</label>
			<input
				id="welcomeOfferCode"
				name="welcomeOfferCode"
				type="text"
				required
				maxlength="50"
				value={form?.values?.welcomeOfferCode ?? data.settings?.welcomeOfferCode ?? 'TREAT CLUB'}
				class="border-ink/15 focus:ring-pink/40 mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
			<p class="text-ink-soft/70 mt-1.5 text-xs">
				A short name shown in a badge — doesn't need to be a redeemable code. "TREAT CLUB" or "WELCOME10" both work.
			</p>
		</div>
		<div>
			<label for="welcomeOfferDescription" class="text-ink-soft text-sm font-medium">What it means</label>
			<input
				id="welcomeOfferDescription"
				name="welcomeOfferDescription"
				type="text"
				required
				maxlength="255"
				value={form?.values?.welcomeOfferDescription ??
					data.settings?.welcomeOfferDescription ??
					'a free coffee or iced latte every month, plus a free bake on your birthday'}
				class="border-ink/15 focus:ring-pink/40 mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
			<p class="text-ink-soft/70 mt-1.5 text-xs">
				Staff honor this manually in person — there's no automatic redemption system yet, so keep it something
				you're happy to give whoever asks for it, however often it applies.
			</p>
		</div>

		{#if form?.message}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
		{/if}
		{#if form?.success}
			<p class="bg-blush text-ink rounded-lg px-3 py-2 text-sm">Saved.</p>
		{/if}

		<button
			type="submit"
			disabled={submitting}
			class="bg-pink hover:bg-pink-deep rounded-full px-5 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save changes'}
		</button>
	</form>
</div>
