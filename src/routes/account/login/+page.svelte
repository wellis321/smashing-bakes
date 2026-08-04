<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/Logo.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	const registerHref = $derived(data.redirectTo ? `/account/register?redirectTo=${encodeURIComponent(data.redirectTo)}` : '/account/register');
</script>

<svelte:head>
	<title>Log in — Smashin&rsquo; Bakes</title>
</svelte:head>

<div class="bg-cream flex min-h-dvh items-center justify-center px-5 py-16">
	<div class="w-full max-w-sm">
		<a href="/" class="mx-auto block w-40" aria-label="Smashin' Bakes home">
			<Logo variant="stacked" theme="badge" class="w-full" />
		</a>
		<p class="text-ink-soft mt-4 text-center text-sm">Log in to your account</p>

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
			<input type="hidden" name="redirectTo" value={data.redirectTo} />

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
				class="bg-pink hover:bg-pink-deep w-full rounded-full py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
			>
				{submitting ? 'Signing in…' : 'Log in'}
			</button>
		</form>

		<p class="text-ink-soft mt-5 text-center text-sm">
			New here? <a href={registerHref} class="text-pink-deep font-semibold hover:underline">Create an account</a>
		</p>
	</div>
</div>
