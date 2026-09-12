<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/Logo.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
</script>

<SeoHead title="Reset your password — Smashin' Bakes" noindex={true} />

<div class="bg-cream flex min-h-dvh items-center justify-center px-5 py-16">
	<div class="w-full max-w-sm">
		<a href="/" class="mx-auto block w-32" aria-label="Smashin' Bakes home">
			<Logo variant="stacked" theme="badge" class="w-full" />
		</a>
		<p class="text-pink-deep mt-5 text-center text-xs font-semibold tracking-[0.2em] uppercase">Account login</p>
		<h1 class="font-display text-ink mt-1 text-center text-2xl">Choose a new password</h1>

		{#if !data.valid}
			<div class="border-ink/10 mt-8 rounded-2xl border bg-white/60 p-6 text-center">
				<p class="text-ink text-sm leading-relaxed">
					This reset link is invalid or has expired — reset links only last an hour.
				</p>
				<a
					href="/account/forgot-password"
					class="text-pink-deep mt-4 inline-block text-sm font-semibold hover:underline"
				>
					Request a new link
				</a>
			</div>
		{:else}
			<form
				method="POST"
				class="border-ink/10 mt-8 space-y-4 rounded-2xl border bg-white/60 p-6"
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
					<label for="password" class="text-ink-soft text-sm font-medium">New password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
					/>
					<p class="text-ink-soft/70 mt-1 text-xs">At least 8 characters.</p>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="bg-pink hover:bg-pink-deep w-full rounded-full py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
				>
					{submitting ? 'Saving…' : 'Reset password'}
				</button>
			</form>
		{/if}
	</div>
</div>
