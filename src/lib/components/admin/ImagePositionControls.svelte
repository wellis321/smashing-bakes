<script lang="ts">
	// Lets staff fix a photo that doesn't crop well by default inside a fixed-
	// aspect box — zoom (matches the existing poster image-zoom pattern) plus
	// a 3x3 focal-point picker for which part of the image stays visible,
	// with a live preview so the effect is obvious before saving.
	let {
		previewUrl,
		zoom = $bindable(100),
		focalPoint = $bindable('center'),
		zoomFieldName,
		focalFieldName,
		aspectClass = 'aspect-[16/9]'
	}: {
		previewUrl: string | null;
		zoom?: number;
		focalPoint?: string;
		zoomFieldName: string;
		focalFieldName: string;
		aspectClass?: string;
	} = $props();

	const FOCAL_POINTS = [
		'top left',
		'top',
		'top right',
		'left',
		'center',
		'right',
		'bottom left',
		'bottom',
		'bottom right'
	];
</script>

{#if previewUrl}
	<div class="mt-3">
		<p class="text-xs font-medium text-ink-soft">Preview</p>
		<div class="mt-1.5 overflow-hidden rounded-xl border border-ink/10 bg-cream-dim {aspectClass}">
			<img
				src={previewUrl}
				alt=""
				class="h-full w-full object-cover"
				style:object-position={focalPoint}
				style:transform={`scale(${zoom / 100})`}
			/>
		</div>

		<div class="mt-3 flex flex-wrap items-start gap-6">
			<div class="flex-1">
				<div class="flex items-center gap-3">
					<label for={zoomFieldName} class="shrink-0 text-sm text-ink-soft">Zoom</label>
					<input
						id={zoomFieldName}
						type="range"
						min="100"
						max="200"
						step="1"
						bind:value={zoom}
						class="w-full max-w-[180px] accent-pink"
					/>
					<span class="w-12 shrink-0 text-right text-sm text-ink-soft">{zoom}%</span>
				</div>
			</div>

			<div>
				<p class="text-sm text-ink-soft">Position</p>
				<div class="mt-1.5 grid w-[84px] grid-cols-3 gap-1">
					{#each FOCAL_POINTS as point (point)}
						<button
							type="button"
							onclick={() => (focalPoint = point)}
							title={point}
							aria-label={point}
							aria-pressed={focalPoint === point}
							class={`h-6 w-6 rounded ${
								focalPoint === point ? 'bg-pink' : 'bg-ink/10 hover:bg-ink/20'
							}`}
						></button>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<input type="hidden" name={zoomFieldName} value={zoom} />
<input type="hidden" name={focalFieldName} value={focalPoint} />
