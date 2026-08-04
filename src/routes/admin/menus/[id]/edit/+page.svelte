<script lang="ts">
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

<a href="/admin/menus" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Weekly menus</a>
<h1 class="font-display mt-2 text-3xl text-ink">{data.menu.title || `Menu for ${data.menu.menuDate}`}</h1>
{#if data.menu.isPublished}
	<a href={`/menus/${data.menu.menuDate}`} target="_blank" rel="noreferrer" class="text-pink-deep mt-1 inline-block text-sm hover:underline">
		View live page &#8599;
	</a>
{/if}

<form
	method="POST"
	action="?/update"
	class="border-ink/10 mt-6 max-w-2xl rounded-2xl border bg-white/60 p-6"
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
			class="bg-pink hover:bg-pink-deep rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save changes'}
		</button>
		<button
			type="submit"
			disabled={submitting}
			onclick={() => (closeAfterSave = true)}
			class="text-ink rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold transition-colors hover:border-ink/30 disabled:opacity-60"
		>
			Save &amp; close
		</button>
	</div>
</form>

<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4 max-w-2xl">
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this menu</button>
</form>
