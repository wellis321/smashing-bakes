<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	const token = $derived(page.url.searchParams.get('token') ?? '');
</script>

<svelte:head>
	<title>Unsubscribe — Smashin&rsquo; Bakes</title>
</svelte:head>

<section class="mx-auto max-w-md px-5 py-24 text-center sm:px-8">
	{#if form?.success}
		<h1 class="font-display text-3xl text-ink">You're unsubscribed</h1>
		<p class="text-ink-soft mt-3 leading-relaxed">
			{form.email} won&rsquo;t receive any more newsletters from us. Sorry to see you go — you're always
			welcome back.
		</p>
	{:else if !data.match}
		<h1 class="font-display text-3xl text-ink">Link not found</h1>
		<p class="text-ink-soft mt-3 leading-relaxed">
			That unsubscribe link doesn&rsquo;t match anything — it may have already been used. If you&rsquo;re
			still receiving emails you don&rsquo;t want, get in touch and we&rsquo;ll sort it out.
		</p>
	{:else}
		<h1 class="font-display text-3xl text-ink">Unsubscribe?</h1>
		<p class="text-ink-soft mt-3 leading-relaxed">
			This will stop newsletter emails to <strong class="text-ink">{data.match.email}</strong>.
		</p>

		{#if form?.message}
			<p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
		{/if}

		<form
			method="POST"
			class="mt-6"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<input type="hidden" name="token" value={token} />
			<button
				type="submit"
				disabled={submitting}
				class="bg-pink hover:bg-pink-deep rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
			>
				{submitting ? 'Unsubscribing…' : 'Yes, unsubscribe me'}
			</button>
		</form>
	{/if}
</section>
