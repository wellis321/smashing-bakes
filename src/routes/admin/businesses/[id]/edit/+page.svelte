<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
	let closeAfterSave = $state(false);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.business.name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Edit {data.business.name} — Admin</title>
</svelte:head>

<a href="/admin/businesses" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Local businesses</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">{data.business.name}</h1>
	<HelpLink section="local-businesses" task="add-business" />
</div>

<form
	method="POST"
	action="?/update"
	class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			submitting = false;
			if (closeAfterSave && result.type === 'success') goto('/admin/businesses');
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

	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="name" class="text-sm font-medium text-ink-soft">Business name</label>
			<input
				id="name"
				name="name"
				required
				value={data.business.name}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="category" class="text-sm font-medium text-ink-soft">Category (optional)</label>
			<input
				id="category"
				name="category"
				value={data.business.category ?? ''}
				placeholder="Cafe, Salon, Retail…"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div class="sm:col-span-2">
			<label for="description" class="text-sm font-medium text-ink-soft"
				>Description (optional)</label
			>
			<textarea
				id="description"
				name="description"
				rows="2"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				>{data.business.description ?? ''}</textarea
			>
		</div>

		<div class="sm:col-span-2">
			<label for="address" class="text-sm font-medium text-ink-soft">Address (optional)</label>
			<input
				id="address"
				name="address"
				value={data.business.address ?? ''}
				placeholder="42 Main Street, Barrhead"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="phone" class="text-sm font-medium text-ink-soft">Phone (optional)</label>
			<input
				id="phone"
				name="phone"
				type="tel"
				value={data.business.phone ?? ''}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="website" class="text-sm font-medium text-ink-soft">Website (optional)</label>
			<input
				id="website"
				name="website"
				type="url"
				value={data.business.website ?? ''}
				placeholder="https://…"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div class="sm:col-span-2">
			<label class="flex items-center gap-2 text-sm text-ink-soft">
				<input
					type="checkbox"
					name="isActive"
					value="true"
					checked={data.business.isActive}
					class="h-4 w-4 accent-pink"
				/>
				Active (shows in the strip)
			</label>
		</div>
	</div>

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
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600"
		>Delete this business</button
	>
</form>
