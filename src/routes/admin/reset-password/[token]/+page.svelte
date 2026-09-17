<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/Logo.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Reset password — Smashin&rsquo; Bakes admin</title>
</svelte:head>

<div class="flex min-h-dvh items-center justify-center bg-cream px-5">
	<div class="w-full max-w-sm">
		<a href="/" class="mx-auto block w-40" aria-label="Smashin' Bakes home">
			<Logo variant="stacked" theme="badge" class="w-full" />
		</a>
		<p class="mt-4 text-center text-sm text-ink-soft">Staff login</p>

		{#if !data.valid}
			<div class="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 text-center">
				<p class="text-sm leading-relaxed text-ink">
					This reset link is invalid or has expired — reset links only last an hour.
				</p>
				<a
					href="/admin/forgot-password"
					class="mt-4 inline-block text-sm font-semibold text-pink-deep hover:underline"
				>
					Request a new link
				</a>
			</div>
		{:else}
			<form
				method="POST"
				class="mt-8 space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-6"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}
			>
				{#if form?.message}
					<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
				{/if}

				<div>
					<label for="password" class="text-sm font-medium text-ink-soft">New password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					/>
					<p class="mt-1 text-xs text-ink-soft/70">At least 8 characters.</p>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="w-full rounded-lg bg-pink py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
				>
					{submitting ? 'Saving…' : 'Reset password'}
				</button>
			</form>
		{/if}
	</div>
</div>
