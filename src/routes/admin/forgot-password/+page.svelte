<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/Logo.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
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

		{#if form?.success}
			<div class="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 text-center">
				<p class="text-sm leading-relaxed text-ink">
					If a staff account exists for that email, a reset link has been sent. It'll expire in an
					hour.
				</p>
				<a
					href="/admin/login"
					class="mt-4 inline-block text-sm font-semibold text-pink-deep hover:underline"
				>
					&larr; Back to login
				</a>
			</div>
		{:else}
			<p class="mt-2 text-center text-sm text-ink-soft">
				Enter your staff account email and we'll send you a link to reset your password.
			</p>

			<form
				method="POST"
				class="mt-6 space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-6"
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
					<label for="email" class="text-sm font-medium text-ink-soft">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="username"
						required
						class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					/>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="w-full rounded-lg bg-pink py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
				>
					{submitting ? 'Sending…' : 'Send reset link'}
				</button>
			</form>

			<p class="mt-5 text-center text-sm text-ink-soft">
				<a href="/admin/login" class="font-semibold text-pink-deep hover:underline"
					>&larr; Back to login</a
				>
			</p>
		{/if}
	</div>
</div>
