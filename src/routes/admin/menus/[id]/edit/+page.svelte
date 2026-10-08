<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import MenuFormFields from '$lib/components/admin/MenuFormFields.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
	let closeAfterSave = $state(false);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete this menu? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit weekly menu — Admin</title>
</svelte:head>

<a href="/admin/menus" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Weekly menus</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">
		{data.menu.title || `Menu for ${data.menu.menuDate}`}
	</h1>
	<HelpLink section="weekly-menus" />
</div>
{#if data.menu.isPublished}
	<a
		href={`/menus/${data.menu.menuDate}`}
		target="_blank"
		rel="noreferrer"
		class="mt-1 inline-block text-sm text-pink-deep hover:underline"
	>
		View live page &#8599;
	</a>
{/if}

<form
	method="POST"
	action="?/update"
	class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			submitting = false;
			if (closeAfterSave && result.type === 'success') goto('/admin/menus');
			closeAfterSave = false;
		};
	}}
>
	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
	{/if}
	{#if form?.success}
		<p class="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>
	{/if}

	<MenuFormFields
		values={{
			menuDate: data.menu.menuDate,
			title: data.menu.title ?? '',
			openingHoursText: data.menu.openingHoursText ?? '',
			noteText: data.menu.noteText ?? '',
			isPublished: data.menu.isPublished
		}}
		initialSections={data.menu.sections.map((s) => ({
			title: s.title,
			itemsText: s.items.map((i) => i.name).join('\n')
		}))}
	/>

	<div class="mt-6 flex gap-3">
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = false)}
			class="rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save changes'}
		</button>
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = true)}
			class="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-60"
		>
			Save &amp; close
		</button>
	</div>
</form>

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this menu</button>
</form>
