<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>My account — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">My account</h1>
<p class="text-ink-soft mt-1 text-sm">{data.staff?.name} &middot; {data.staff?.email}</p>

<div class="border-ink/10 mt-8 max-w-md rounded-2xl border bg-white/60 p-6">
	<h2 class="text-ink text-lg font-semibold">Change password</h2>

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
			<label for="currentPassword" class="text-ink-soft text-sm font-medium">Current password</label>
			<input
				id="currentPassword"
				name="currentPassword"
				type="password"
				required
				autocomplete="current-password"
				class="border-ink/15 focus:ring-pink/40 mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>
		<div>
			<label for="newPassword" class="text-ink-soft text-sm font-medium">New password</label>
			<input
				id="newPassword"
				name="newPassword"
				type="password"
				required
				autocomplete="new-password"
				class="border-ink/15 focus:ring-pink/40 mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>
		<div>
			<label for="confirmPassword" class="text-ink-soft text-sm font-medium">Confirm new password</label>
			<input
				id="confirmPassword"
				name="confirmPassword"
				type="password"
				required
				autocomplete="new-password"
				class="border-ink/15 focus:ring-pink/40 mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		{#if form?.message}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
		{/if}
		{#if form?.success}
			<p class="bg-blush text-ink rounded-lg px-3 py-2 text-sm">Password changed.</p>
		{/if}

		<button
			type="submit"
			disabled={submitting}
			class="bg-pink hover:bg-pink-deep rounded-full px-5 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Change password'}
		</button>
	</form>
</div>
