<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/Logo.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	const loginHref = $derived(data.redirectTo ? `/account/login?redirectTo=${encodeURIComponent(data.redirectTo)}` : '/account/login');
</script>

<svelte:head>
	<title>Create an account — Smashin&rsquo; Bakes</title>
</svelte:head>

<div class="bg-cream flex min-h-dvh items-center justify-center px-5 py-16">
	<div class="w-full max-w-sm">
		<a href="/" class="mx-auto block w-40" aria-label="Smashin' Bakes home">
			<Logo variant="stacked" theme="badge" class="w-full" />
		</a>
		<p class="text-ink-soft mt-4 text-center text-sm">Create an account</p>

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
				<label for="name" class="text-ink-soft text-sm font-medium">Name</label>
				<input
					id="name"
					name="name"
					required
					value={form?.values?.name ?? ''}
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>

			<div>
				<label for="email" class="text-ink-soft text-sm font-medium">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					required
					value={form?.values?.email ?? ''}
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>

			<div>
				<label for="password" class="text-ink-soft text-sm font-medium">Password</label>
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

			<label class="text-ink-soft flex items-start gap-2 text-sm">
				<input type="checkbox" name="marketingOptIn" value="true" class="accent-pink mt-0.5 h-4 w-4" />
				Keep me posted on new bakes and offers by email
			</label>

			<button
				type="submit"
				disabled={submitting}
				class="bg-pink hover:bg-pink-deep w-full rounded-full py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
			>
				{submitting ? 'Creating account…' : 'Create account'}
			</button>
		</form>

		<p class="text-ink-soft mt-5 text-center text-sm">
			Already have an account? <a href={loginHref} class="text-pink-deep font-semibold hover:underline">Log in</a>
		</p>
	</div>
</div>
