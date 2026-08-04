<script lang="ts">
	import { enhance } from '$app/forms';
	import MenuFormFields from '$lib/components/admin/MenuFormFields.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>New weekly menu — Admin</title>
</svelte:head>

<a href="/admin/menus" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Weekly menus</a>
<h1 class="font-display mt-2 text-3xl text-ink">New weekly menu</h1>

<form
	method="POST"
	class="border-ink/10 mt-6 max-w-2xl rounded-2xl border bg-white/60 p-6"
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
		class="bg-pink hover:bg-pink-deep mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Create menu'}
	</button>
</form>
