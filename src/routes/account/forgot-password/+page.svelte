<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/Logo.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<SeoHead title="Reset your password — Smashin' Bakes" noindex={true} />

<div class="bg-cream flex justify-center px-5 pt-10 pb-20 sm:pt-14">
	<div class="w-full max-w-sm">
		<a href="/" class="mx-auto block w-32" aria-label="Smashin' Bakes home">
			<Logo variant="stacked" theme="badge" class="w-full" />
		</a>
		<p class="text-pink-deep mt-5 text-center text-xs font-semibold tracking-[0.2em] uppercase">Account login</p>
		<h1 class="font-display text-ink mt-1 text-center text-2xl">Reset your password</h1>

		{#if form?.success}
			<div class="border-ink/10 mt-8 rounded-2xl border bg-white/60 p-6 text-center">
				<p class="text-ink text-sm leading-relaxed">
					If an account exists for that email, we've sent a link to reset your password. It'll expire in an
					hour.
				</p>
				<a href="/account/login" class="text-pink-deep mt-4 inline-block text-sm font-semibold hover:underline">
					&larr; Back to login
				</a>
			</div>
		{:else}
			<p class="text-ink-soft mt-2 text-center text-sm">
				Enter the email address on your account and we'll send you a link to reset it.
			</p>

			<form
				method="POST"
				class="border-ink/10 mt-6 space-y-4 rounded-2xl border bg-white/60 p-6"
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
					<label for="email" class="text-ink-soft text-sm font-medium">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="username"
						required
						class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
					/>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="bg-pink hover:bg-pink-deep w-full rounded-full py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
				>
					{submitting ? 'Sending…' : 'Send reset link'}
				</button>
			</form>

			<p class="text-ink-soft mt-5 text-center text-sm">
				<a href="/account/login" class="text-pink-deep font-semibold hover:underline">&larr; Back to login</a>
			</p>
		{/if}
	</div>
</div>
