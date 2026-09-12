<script lang="ts">
	type MediaItem = { id: number; url: string; filename: string; altText: string | null };

	let {
		items,
		fileFieldName,
		urlFieldName,
		currentUrl = null,
		label,
		hint,
		showPreview = true,
		allowUpload = true,
		previewUrl = $bindable(null)
	}: {
		items: MediaItem[];
		fileFieldName?: string;
		urlFieldName: string;
		currentUrl?: string | null;
		label: string;
		hint?: string;
		showPreview?: boolean;
		allowUpload?: boolean;
		previewUrl?: string | null;
	} = $props();

	let open = $state(false);
	let selectedUrl = $state<string | null>(null);
	let newFilePreview = $state<string | null>(null);
	let wrapper: HTMLDivElement | undefined = $state();

	// A freshly chosen file previews immediately (object URL); a library pick
	// previews its own url; otherwise fall back to whatever's already saved.
	// Exposed as a bindable prop too, so a parent page (e.g. a live poster
	// preview) can reflect the same in-progress choice before it's ever saved.
	$effect(() => {
		previewUrl = newFilePreview ?? selectedUrl ?? currentUrl;
	});

	function pick(url: string) {
		selectedUrl = url;
		newFilePreview = null;
		open = false;
	}

	function clearLibrarySelection() {
		selectedUrl = null;
	}

	function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			// A fresh upload wins over a previous library pick, not both at once.
			selectedUrl = null;
			newFilePreview = URL.createObjectURL(file);
		} else {
			newFilePreview = null;
		}
	}

	function closeOnOutsideClick(event: MouseEvent) {
		if (open && wrapper && !wrapper.contains(event.target as Node)) open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') open = false;
	}
</script>

<svelte:window onclick={closeOnOutsideClick} onkeydown={handleKeydown} />

<div>
	<label for={fileFieldName ?? urlFieldName} class="text-ink-soft text-sm font-medium">{label}</label>

	<div class="mt-2 flex items-start gap-4">
		{#if showPreview && previewUrl}
			<img src={previewUrl} alt="" class="bg-cream-dim h-24 w-24 shrink-0 rounded-lg object-cover" />
		{/if}

		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-start gap-4">
				{#if allowUpload}
					<div>
						<span class="text-ink-soft mb-1 block text-xs font-medium">Upload new photo</span>
						<input
							id={fileFieldName}
							name={fileFieldName}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onchange={handleFileChange}
							class="text-ink-soft block text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink"
						/>
					</div>
				{/if}

				<div class="relative pt-5" bind:this={wrapper}>
					<button
						type="button"
						aria-haspopup="menu"
						aria-expanded={open}
						onclick={() => (open = !open)}
						class="text-pink-deep hover:underline shrink-0 text-sm font-semibold"
					>
						Choose from library
					</button>

					{#if open}
						<div
							role="menu"
							class="border-ink/10 shadow-soft absolute top-full left-0 z-20 mt-2 max-h-80 w-72 overflow-y-auto rounded-2xl border bg-cream p-3"
						>
							{#if items.length === 0}
								<p class="text-ink-soft p-2 text-center text-xs">
									No images yet —
									<a href="/admin/media" target="_blank" rel="noreferrer" class="underline">upload some</a>
									first.
								</p>
							{:else}
								<div class="grid grid-cols-3 gap-2">
									{#each items as item (item.id)}
										<button
											type="button"
											onclick={() => pick(item.url)}
											title={item.filename}
											class="border-ink/10 hover:ring-pink aspect-square overflow-hidden rounded-lg border transition-shadow hover:ring-2"
										>
											<img src={item.url} alt={item.altText ?? ''} class="h-full w-full object-cover" />
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>

				{#if selectedUrl}
					<button type="button" onclick={clearLibrarySelection} class="text-ink-soft hover:text-ink shrink-0 pt-5 text-xs underline">
						Undo library pick
					</button>
				{/if}
			</div>

			{#if hint}
				<p class="text-ink-soft/70 mt-2 text-xs">{hint}</p>
			{/if}
		</div>
	</div>

	<!-- Re-submits the existing url when nothing new is picked — matters for any
	     caller (e.g. newsletter highlights) that fully replaces rows on save
	     rather than only patching changed columns. -->
	<input type="hidden" name={urlFieldName} value={selectedUrl ?? currentUrl ?? ''} />
</div>
