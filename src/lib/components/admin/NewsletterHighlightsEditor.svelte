<script lang="ts">
	import MediaPicker from './MediaPicker.svelte';

	type MediaItem = { id: number; url: string; filename: string; altText: string | null };
	type Highlight = { imageUrl: string | null; title: string; description: string; linkUrl: string };

	let {
		initialHighlights = [],
		mediaItems
	}: { initialHighlights?: Highlight[]; mediaItems: MediaItem[] } = $props();

	let highlights = $state<Highlight[]>(
		initialHighlights.length > 0 ? initialHighlights.map((h) => ({ ...h })) : [{ imageUrl: null, title: '', description: '', linkUrl: '' }]
	);

	function addHighlight() {
		highlights.push({ imageUrl: null, title: '', description: '', linkUrl: '' });
	}

	function removeHighlight(index: number) {
		highlights.splice(index, 1);
	}
</script>

<div>
	<p class="text-ink-soft text-sm font-medium">Highlights</p>
	<p class="text-ink-soft/70 mt-1 text-xs">
		A few things to promote this issue — this week's menu, a current promotion, a bestseller. Each
		becomes a small card with an image, title and link.
	</p>

	<div class="mt-3 space-y-5">
		{#each highlights as highlight, index (index)}
			<div class="border-ink/10 rounded-xl border bg-white/60 p-4">
				<div class="flex items-start justify-between gap-2">
					<p class="text-ink-soft text-xs font-semibold tracking-widest uppercase">Highlight {index + 1}</p>
					<button
						type="button"
						onclick={() => removeHighlight(index)}
						disabled={highlights.length === 1}
						class="text-ink-soft shrink-0 text-sm hover:text-red-600 disabled:opacity-30"
						aria-label="Remove highlight"
					>
						&times; Remove
					</button>
				</div>

				<div class="mt-3 grid gap-3 sm:grid-cols-2">
					<div class="sm:col-span-2">
						<MediaPicker
							items={mediaItems}
							allowUpload={false}
							urlFieldName="highlightImageUrl"
							currentUrl={highlight.imageUrl}
							label="Image (optional)"
						/>
					</div>
					<div>
						<label for={`highlightTitle-${index}`} class="text-ink-soft text-xs font-medium">Title</label>
						<input
							id={`highlightTitle-${index}`}
							name="highlightTitle"
							bind:value={highlight.title}
							placeholder="This week's menu is up"
							class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
						/>
					</div>
					<div>
						<label for={`highlightLinkUrl-${index}`} class="text-ink-soft text-xs font-medium">Link (optional)</label>
						<input
							id={`highlightLinkUrl-${index}`}
							name="highlightLinkUrl"
							bind:value={highlight.linkUrl}
							placeholder="/menus"
							class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
						/>
					</div>
					<div class="sm:col-span-2">
						<label for={`highlightDescription-${index}`} class="text-ink-soft text-xs font-medium">Description (optional)</label>
						<textarea
							id={`highlightDescription-${index}`}
							name="highlightDescription"
							bind:value={highlight.description}
							rows="2"
							class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
						></textarea>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<button type="button" onclick={addHighlight} class="text-pink-deep mt-3 text-sm font-semibold hover:underline">
		+ Add highlight
	</button>
</div>
