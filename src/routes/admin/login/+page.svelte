<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/Logo.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Staff login — Smashin&rsquo; Bakes</title>
</svelte:head>

<div class="bg-cream flex min-h-dvh items-center justify-center px-5">
	<div class="w-full max-w-sm">
		<a href="/" class="mx-auto block w-40" aria-label="Smashin' Bakes home">
			<Logo variant="stacked" theme="badge" class="w-full" />
		</a>
		<p class="text-ink-soft mt-4 text-center text-sm">Staff login</p>

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
				<label for="email" class="text-ink-soft text-sm font-medium">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="username"
					required
					value={form?.email ?? ''}
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>

			<div>
				<label for="password" class="text-ink-soft text-sm font-medium">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="bg-pink hover:bg-pink-deep w-full rounded-lg py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
			>
				{submitting ? 'Signing in…' : 'Sign in'}
			</button>
		</form>
	</div>
</div>
