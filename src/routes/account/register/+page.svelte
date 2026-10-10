<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/Logo.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	const loginHref = $derived(
		data.redirectTo
			? `/account/login?redirectTo=${encodeURIComponent(data.redirectTo)}`
			: '/account/login'
	);
</script>

<SeoHead title="Create an account — Smashin' Bakes" noindex={true} />

<div class="flex justify-center bg-cream px-5 pt-10 pb-20 sm:pt-14">
	<div class="w-full max-w-sm">
		<a href="/" class="mx-auto block w-32" aria-label="Smashin' Bakes home">
			<Logo variant="stacked" theme="badge" class="w-full" />
		</a>
		<p class="mt-5 text-center text-xs font-semibold tracking-[0.2em] text-pink-deep uppercase">
			Join us
		</p>
		<h1 class="mt-1 text-center font-display text-2xl text-ink">Create your account</h1>
		<p class="mt-2 text-center text-sm text-ink-soft">
			Track your pickup orders, save your details for next time, and hear about new flavours first.
		</p>

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
			<input type="hidden" name="redirectTo" value={data.redirectTo} />

			{#if form?.message}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
			{/if}

			<div>
				<label for="name" class="text-sm font-medium text-ink-soft">Name</label>
				<input
					id="name"
					name="name"
					required
					value={form?.values?.name ?? ''}
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
			</div>

			<div>
				<label for="email" class="text-sm font-medium text-ink-soft">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					required
					value={form?.values?.email ?? ''}
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
			</div>

			<div>
				<label for="password" class="text-sm font-medium text-ink-soft">Password</label>
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

			<label class="flex items-start gap-2 text-sm text-ink-soft">
				<input
					type="checkbox"
					name="marketingOptIn"
					value="true"
					class="mt-0.5 h-4 w-4 accent-pink"
				/>
				Keep me posted on new bakes and offers by email
			</label>

			<button
				type="submit"
				disabled={submitting}
				class="w-full rounded-full bg-pink py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
			>
				{submitting ? 'Creating account…' : 'Create account'}
			</button>
		</form>

		<p class="mt-5 text-center text-sm text-ink-soft">
			Already have an account? <a
				href={loginHref}
				class="font-semibold text-pink-deep hover:underline">Log in</a
			>
		</p>
	</div>
</div>
