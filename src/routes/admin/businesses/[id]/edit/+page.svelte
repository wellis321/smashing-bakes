<script lang="ts">
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

<a href="/admin/businesses" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Local businesses</a>
<h1 class="font-display mt-2 text-3xl text-ink">{data.business.name}</h1>

<form
	method="POST"
	action="?/update"
	class="border-ink/10 mt-6 max-w-2xl rounded-2xl border bg-white/60 p-6"
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
			<label for="name" class="text-ink-soft text-sm font-medium">Business name</label>
			<input
				id="name"
				name="name"
				required
				value={data.business.name}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="category" class="text-ink-soft text-sm font-medium">Category (optional)</label>
			<input
				id="category"
				name="category"
				value={data.business.category ?? ''}
				placeholder="Cafe, Salon, Retail…"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div class="sm:col-span-2">
			<label for="description" class="text-ink-soft text-sm font-medium">Description (optional)</label>
			<textarea
				id="description"
				name="description"
				rows="2"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				>{data.business.description ?? ''}</textarea
			>
		</div>

		<div class="sm:col-span-2">
			<label for="address" class="text-ink-soft text-sm font-medium">Address (optional)</label>
			<input
				id="address"
				name="address"
				value={data.business.address ?? ''}
				placeholder="42 Main Street, Barrhead"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="phone" class="text-ink-soft text-sm font-medium">Phone (optional)</label>
			<input
				id="phone"
				name="phone"
				type="tel"
				value={data.business.phone ?? ''}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="website" class="text-ink-soft text-sm font-medium">Website (optional)</label>
			<input
				id="website"
				name="website"
				type="url"
				value={data.business.website ?? ''}
				placeholder="https://…"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div class="sm:col-span-2">
			<label class="text-ink-soft flex items-center gap-2 text-sm">
				<input type="checkbox" name="isActive" value="true" checked={data.business.isActive} class="accent-pink h-4 w-4" />
				Active (shows in the strip)
			</label>
		</div>
	</div>

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
	<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this business</button>
</form>
