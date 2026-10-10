<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>My account — Admin</title>
</svelte:head>

<div class="flex items-center gap-2">
	<h1 class="font-display text-3xl text-ink">My account</h1>
	<HelpLink
		section="security"
		task="change-password"
		label="Help"
		title="How to change your password"
	/>
</div>
<p class="mt-1 text-sm text-ink-soft">{data.staff?.name} &middot; {data.staff?.email}</p>

<div class="mt-8 max-w-md rounded-2xl border border-ink/10 bg-white/60 p-6">
	<h2 class="text-lg font-semibold text-ink">Change password</h2>

	<form
		method="POST"
		class="mt-4 space-y-4"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update({ reset: true });
				submitting = false;
			};
		}}
	>
		<div>
			<label for="currentPassword" class="text-sm font-medium text-ink-soft">Current password</label
			>
			<input
				id="currentPassword"
				name="currentPassword"
				type="password"
				required
				autocomplete="current-password"
				class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>
		<div>
			<label for="newPassword" class="text-sm font-medium text-ink-soft">New password</label>
			<input
				id="newPassword"
				name="newPassword"
				type="password"
				required
				autocomplete="new-password"
				class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
			<p class="mt-1 text-xs text-ink-soft/70">
				At least 12 characters. A few unrelated words together works well.
			</p>
		</div>
		<div>
			<label for="confirmPassword" class="text-sm font-medium text-ink-soft"
				>Confirm new password</label
			>
			<input
				id="confirmPassword"
				name="confirmPassword"
				type="password"
				required
				autocomplete="new-password"
				class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		{#if form?.message}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
		{/if}
		{#if form?.success}
			<p class="rounded-lg bg-blush px-3 py-2 text-sm text-ink">Password changed.</p>
		{/if}

		<button
			type="submit"
			disabled={submitting}
			class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Change password'}
		</button>
	</form>
</div>
