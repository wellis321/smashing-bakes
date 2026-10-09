<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import MenuFormFields from '$lib/components/admin/MenuFormFields.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>New weekly menu — Admin</title>
</svelte:head>

<a href="/admin/menus" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Weekly menus</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">New weekly menu</h1>
	<HelpLink section="weekly-menus" task="weekly-menu" />
</div>

<form
	method="POST"
	class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}
>
	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
	{/if}

	<MenuFormFields />

	<button
		type="submit"
		disabled={submitting}
		class="mt-6 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Create menu'}
	</button>
</form>
