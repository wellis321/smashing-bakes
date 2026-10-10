<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/Logo.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
</script>

<SeoHead title="Reset your password — Smashin' Bakes" noindex={true} />

<div class="flex justify-center bg-cream px-5 pt-10 pb-20 sm:pt-14">
	<div class="w-full max-w-sm">
		<a href="/" class="mx-auto block w-32" aria-label="Smashin' Bakes home">
			<Logo variant="stacked" theme="badge" class="w-full" />
		</a>
		<p class="mt-5 text-center text-xs font-semibold tracking-[0.2em] text-pink-deep uppercase">
			Account login
		</p>
		<h1 class="mt-1 text-center font-display text-2xl text-ink">Choose a new password</h1>

		{#if !data.valid}
			<div class="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 text-center">
				<p class="text-sm leading-relaxed text-ink">
					This reset link is invalid or has expired — reset links only last an hour.
				</p>
				<a
					href="/account/forgot-password"
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
					<p class="mt-1 text-xs text-ink-soft/70">
						At least 10 characters. A few unrelated words together works well.
					</p>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="w-full rounded-full bg-pink py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
				>
					{submitting ? 'Saving…' : 'Reset password'}
				</button>
			</form>
		{/if}
	</div>
</div>
