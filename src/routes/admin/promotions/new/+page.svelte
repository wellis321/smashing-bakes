<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import PromotionFormFields from '$lib/components/admin/PromotionFormFields.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>New promotion — Admin</title>
</svelte:head>

<a href="/admin/promotions" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Promotions</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">New promotion</h1>
	<HelpLink section="promotions" task="add-promotion" />
</div>

<form
	method="POST"
	enctype="multipart/form-data"
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

	<PromotionFormFields mediaItems={data.mediaItems} />

	<button
		type="submit"
		disabled={submitting}
		class="mt-6 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Create promotion'}
	</button>
</form>
