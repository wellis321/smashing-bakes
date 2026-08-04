<script lang="ts">
	import { enhance } from '$app/forms';
	import PromotionFormFields from '$lib/components/admin/PromotionFormFields.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.promotion.title}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit {data.promotion.title} — Admin</title>
</svelte:head>

<a href="/admin/promotions" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Promotions</a>
<h1 class="font-display mt-2 text-3xl text-ink">{data.promotion.title}</h1>
{#if data.promotion.isPublished}
	<a href={`/promotions/${data.promotion.slug}`} target="_blank" rel="noreferrer" class="text-pink-deep mt-1 inline-block text-sm hover:underline">
		View live page &#8599;
	</a>
{/if}

<form
	method="POST"
	action="?/update"
	enctype="multipart/form-data"
	class="border-ink/10 mt-6 max-w-2xl rounded-2xl border bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
	{/if}
	{#if form?.success}
		<p class="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>
	{/if}

	<PromotionFormFields
		values={{
			title: data.promotion.title,
			slug: data.promotion.slug,
			tagline: data.promotion.tagline ?? '',
			introText: data.promotion.introText ?? '',
			prizeDescription: data.promotion.prizeDescription ?? '',
			areaText: data.promotion.areaText ?? '',
			deadlineText: data.promotion.deadlineText ?? '',
			ctaLabel: data.promotion.ctaLabel ?? '',
			ctaUrl: data.promotion.ctaUrl ?? '',
			isPublished: data.promotion.isPublished,
			isFeaturedOnHomepage: data.promotion.isFeaturedOnHomepage,
			mechanic: data.promotion.mechanic
		}}
		currentImageUrl={data.promotion.heroImageUrl}
		initialSteps={data.promotion.steps.map((s) => ({ label: s.label, description: s.description }))}
	/>

	<button
		type="submit"
		disabled={submitting}
		class="bg-pink hover:bg-pink-deep mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Save changes'}
	</button>
</form>

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4 max-w-2xl">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this promotion</button>
</form>
