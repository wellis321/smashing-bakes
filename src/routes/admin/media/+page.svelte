<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let uploading = $state(false);
	let selectedCount = $state(0);
	let copiedId = $state<number | null>(null);

	function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		selectedCount = input.files?.length ?? 0;
	}

	async function copyUrl(id: number, url: string) {
		try {
			await navigator.clipboard.writeText(`${location.origin}${url}`);
			copiedId = id;
			setTimeout(() => {
				if (copiedId === id) copiedId = null;
			}, 2000);
		} catch {
			// clipboard unavailable — the url is still visible to copy manually
		}
	}

	function confirmDelete(event: SubmitEvent, filename: string) {
		if (!confirm(`Delete "${filename}"? This can't be undone, and it may still be in use elsewhere on the site.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Media library — Admin</title>
</svelte:head>

<div class="flex flex-wrap items-start justify-between gap-4">
	<div>
		<h1 class="font-display text-3xl text-ink">Media library</h1>
		<p class="text-ink-soft mt-1 max-w-lg text-sm">
			Upload photos here to use anywhere on the site &mdash; copy a URL and paste it wherever an image
			field asks for one.
		</p>
	</div>
	<p class="text-ink-soft text-sm">{data.items.length} image{data.items.length === 1 ? '' : 's'}</p>
</div>

<div class="border-ink/10 mt-6 rounded-2xl border bg-white/60 p-6">
	<form
		method="POST"
		action="?/upload"
		enctype="multipart/form-data"
		use:enhance={() => {
			uploading = true;
			return async ({ update }) => {
				await update({ reset: true });
				uploading = false;
				selectedCount = 0;
			};
		}}
	>
		<label for="files" class="text-ink-soft text-sm font-medium">Add images</label>
		<p class="text-ink-soft/70 mt-1 text-xs">
			JPG, PNG or WEBP, up to 5MB each. Select several at once &mdash; open a folder in the file picker and
			select-all to upload the whole thing in one go.
		</p>
		<input
			id="files"
			name="files"
			type="file"
			multiple
			accept="image/jpeg,image/png,image/webp"
			onchange={handleFileChange}
			class="border-ink/15 mt-3 w-full rounded-lg border bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-pink/10 file:px-3 file:py-1.5 file:text-pink-deep file:text-sm file:font-semibold"
		/>

		{#if form?.message}
			<p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
		{/if}
		{#if form?.success}
			<p class="bg-blush text-ink mt-3 rounded-lg px-3 py-2 text-sm">
				Uploaded {form.uploaded} image{form.uploaded === 1 ? '' : 's'}{form.skipped ? `, skipped ${form.skipped}` : ''}.
			</p>
		{/if}

		<button
			type="submit"
			disabled={uploading || selectedCount === 0}
			class="bg-pink hover:bg-pink-deep mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
		>
			{uploading ? 'Uploading…' : selectedCount > 0 ? `Upload ${selectedCount} image${selectedCount === 1 ? '' : 's'}` : 'Upload'}
		</button>
	</form>
</div>

{#if data.items.length === 0}
	<p class="text-ink-soft mt-10 text-center text-sm">No images uploaded yet.</p>
{:else}
	<div class="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
		{#each data.items as item (item.id)}
			<div class="border-ink/10 overflow-hidden rounded-2xl border bg-white/60">
				<img src={item.url} alt={item.altText ?? ''} class="aspect-square w-full object-cover" />
				<div class="space-y-2 p-3">
					<p class="text-ink-soft truncate text-xs" title={item.filename}>{item.filename}</p>

					<form
						method="POST"
						action="?/updateAlt"
						use:enhance
						onchange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}
					>
						<input type="hidden" name="id" value={item.id} />
						<input
							name="altText"
							type="text"
							value={item.altText ?? ''}
							placeholder="Alt text (optional)"
							class="border-ink/15 focus:ring-pink/40 w-full rounded-lg border bg-white px-2 py-1.5 text-xs outline-none focus:ring-2"
						/>
					</form>

					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={() => copyUrl(item.id, item.url)}
							class="bg-ink/5 text-ink-soft hover:text-ink flex-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
						>
							{copiedId === item.id ? 'Copied!' : 'Copy URL'}
						</button>
						<form method="POST" action="?/delete" use:enhance onsubmit={(e) => confirmDelete(e, item.filename)}>
							<input type="hidden" name="id" value={item.id} />
							<button type="submit" class="text-xs text-red-600/70 hover:text-red-600">Delete</button>
						</form>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
