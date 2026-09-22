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
		if (
			!confirm(
				`Delete "${filename}"? This can't be undone, and it may still be in use elsewhere on the site.`
			)
		) {
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
		<p class="mt-1 max-w-lg text-sm text-ink-soft">
			Upload photos here to use anywhere on the site &mdash; copy a URL and paste it wherever an
			image field asks for one.
		</p>
	</div>
	<p class="text-sm text-ink-soft">{data.items.length} image{data.items.length === 1 ? '' : 's'}</p>
</div>

<div class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6">
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
		<label for="files" class="text-sm font-medium text-ink-soft">Add images</label>
		<p class="mt-1 text-xs text-ink-soft/70">
			JPG, PNG or WEBP, up to 5MB each. Select several at once &mdash; open a folder in the file
			picker and select-all to upload the whole thing in one go.
		</p>
		<input
			id="files"
			name="files"
			type="file"
			multiple
			accept="image/jpeg,image/png,image/webp"
			onchange={handleFileChange}
			class="mt-3 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-pink/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-pink-deep"
		/>

		{#if form?.message}
			<p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
		{/if}
		{#if form?.success}
			<p class="mt-3 rounded-lg bg-blush px-3 py-2 text-sm text-ink">
				Uploaded {form.uploaded} image{form.uploaded === 1 ? '' : 's'}{form.skipped
					? `, skipped ${form.skipped}`
					: ''}.
			</p>
		{/if}

		<button
			type="submit"
			disabled={uploading || selectedCount === 0}
			class="mt-4 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
		>
			{uploading
				? 'Uploading…'
				: selectedCount > 0
					? `Upload ${selectedCount} image${selectedCount === 1 ? '' : 's'}`
					: 'Upload'}
		</button>
	</form>
</div>

{#if data.items.length === 0}
	<p class="mt-10 text-center text-sm text-ink-soft">No images uploaded yet.</p>
{:else}
	<div class="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
		{#each data.items as item (item.id)}
			<div class="overflow-hidden rounded-2xl border border-ink/10 bg-white/60">
				<img src={item.url} alt={item.altText ?? ''} class="aspect-square w-full object-cover" />
				<div class="space-y-2 p-3">
					<form
						method="POST"
						action="?/updateFilename"
						use:enhance
						onchange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}
					>
						<input type="hidden" name="id" value={item.id} />
						<input
							name="filename"
							type="text"
							required
							value={item.filename}
							title={item.filename}
							placeholder="Title"
							class="w-full rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-xs font-medium text-ink outline-none focus:ring-2 focus:ring-pink/40"
						/>
					</form>

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
							class="w-full rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-pink/40"
						/>
					</form>

					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={() => copyUrl(item.id, item.url)}
							class="flex-1 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
						>
							{copiedId === item.id ? 'Copied!' : 'Copy URL'}
						</button>
						<form
							method="POST"
							action="?/delete"
							use:enhance
							onsubmit={(e) => confirmDelete(e, item.filename)}
						>
							<input type="hidden" name="id" value={item.id} />
							<button type="submit" class="text-xs text-red-600/70 hover:text-red-600"
								>Delete</button
							>
						</form>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
