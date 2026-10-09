<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import PhotoFrame from '$lib/components/PhotoFrame.svelte';
	// Lets staff choose exactly which part of a photo shows inside a fixed-shape
	// box: drag a frame over the full photo, and zoom in or out. The frame is the
	// same shape as the live box, so what's inside it is what visitors will see.
	//
	// Position is stored as "X% Y%". The same value drives both `object-position`
	// and `transform-origin`, so zooming keeps the chosen area in view, and the
	// frame's position along each axis is simply (X% of the room it has to move).
	// Older saved values like "top left" or "center" are still valid CSS and are
	// understood here too.
	let {
		previewUrl,
		zoom = $bindable(100),
		focalPoint = $bindable('50% 50%'),
		zoomFieldName,
		focalFieldName,
		aspectClass = 'aspect-[16/9]',
		photoRatio = $bindable(0)
	}: {
		previewUrl: string | null;
		zoom?: number;
		focalPoint?: string;
		zoomFieldName: string;
		focalFieldName: string;
		aspectClass?: string;
		// Width ÷ height of the chosen photo (0 until it has loaded), so the page can
		// suggest a better shape for upright photos.
		photoRatio?: number;
	} = $props();

	const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

	function parseFocal(value: string): { x: number; y: number } {
		const pct = value.match(/^\s*(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%\s*$/);
		if (pct) return { x: clamp(Number(pct[1])), y: clamp(Number(pct[2])) };
		let x = 50;
		let y = 50;
		for (const word of value.split(/\s+/)) {
			if (word === 'left') x = 0;
			else if (word === 'right') x = 100;
			else if (word === 'top') y = 0;
			else if (word === 'bottom') y = 100;
		}
		return { x, y };
	}

	let naturalW = $state(0);
	let naturalH = $state(0);
	let boxW = $state(0);
	let boxH = $state(0);
	let picker: HTMLDivElement | undefined = $state();

	const imageRatio = $derived(naturalW > 0 && naturalH > 0 ? naturalW / naturalH : 1.5);
	$effect(() => {
		photoRatio = naturalW > 0 && naturalH > 0 ? naturalW / naturalH : 0;
	});
	const boxRatio = $derived(boxW > 0 && boxH > 0 ? boxW / boxH : 16 / 9);
	const zoomFactor = $derived(zoom / 100);

	// How much of the photo (as a fraction of its width/height) the live box
	// shows. `object-fit: cover` fills the box along one axis, then zoom changes
	// both. A value of 1 or more means the whole axis is visible, so there's
	// nothing to slide along that axis.
	const frameW = $derived((imageRatio > boxRatio ? boxRatio / imageRatio : 1) / zoomFactor);
	const frameH = $derived((imageRatio > boxRatio ? 1 : imageRatio / boxRatio) / zoomFactor);

	const focal = $derived(parseFocal(focalPoint));
	const drawW = $derived(Math.min(frameW, 1));
	const drawH = $derived(Math.min(frameH, 1));
	const left = $derived(frameW < 1 ? (focal.x / 100) * (1 - frameW) : 0);
	const top = $derived(frameH < 1 ? (focal.y / 100) * (1 - frameH) : 0);

	function setFromFrame(nextLeft: number, nextTop: number) {
		const x = frameW < 1 ? clamp((nextLeft / (1 - frameW)) * 100) : 50;
		const y = frameH < 1 ? clamp((nextTop / (1 - frameH)) * 100) : 50;
		focalPoint = `${Math.round(x)}% ${Math.round(y)}%`;
	}

	let dragging = false;
	let grab = { x: 0, y: 0 };

	function fractionAt(event: PointerEvent) {
		const rect = picker!.getBoundingClientRect();
		return {
			fx: (event.clientX - rect.left) / rect.width,
			fy: (event.clientY - rect.top) / rect.height
		};
	}

	function moveTo(fx: number, fy: number) {
		setFromFrame(
			clamp(fx - grab.x, 0, Math.max(0, 1 - drawW)),
			clamp(fy - grab.y, 0, Math.max(0, 1 - drawH))
		);
	}

	function onpointerdown(event: PointerEvent) {
		if (!picker) return;
		picker.setPointerCapture(event.pointerId);
		const { fx, fy } = fractionAt(event);
		const inside = fx >= left && fx <= left + drawW && fy >= top && fy <= top + drawH;
		// Grab the frame where it is; or, if the click was outside it, centre the
		// frame on the click.
		grab = inside ? { x: fx - left, y: fy - top } : { x: drawW / 2, y: drawH / 2 };
		dragging = true;
		moveTo(fx, fy);
	}

	function onpointermove(event: PointerEvent) {
		if (!dragging) return;
		const { fx, fy } = fractionAt(event);
		moveTo(fx, fy);
	}

	function onpointerup() {
		dragging = false;
	}

	function onkeydown(event: KeyboardEvent) {
		const step = event.shiftKey ? 10 : 2;
		const moves: Record<string, [number, number]> = {
			ArrowLeft: [-step, 0],
			ArrowRight: [step, 0],
			ArrowUp: [0, -step],
			ArrowDown: [0, step]
		};
		const move = moves[event.key];
		if (!move) return;
		event.preventDefault();
		focalPoint = `${Math.round(clamp(focal.x + move[0]))}% ${Math.round(clamp(focal.y + move[1]))}%`;
	}

	// The zoom at which the whole photo is visible inside the box (never below
	// the slider's minimum).
	function fitWholePhoto() {
		const fit = Math.min(
			imageRatio > boxRatio ? boxRatio / imageRatio : 1,
			imageRatio > boxRatio ? 1 : imageRatio / boxRatio
		);
		zoom = Math.max(30, Math.min(100, Math.floor(fit * 100)));
		focalPoint = '50% 50%';
	}

	function reset() {
		focalPoint = '50% 50%';
		zoom = 100;
	}
</script>

{#if previewUrl}
	<div class="mt-3">
		<div class="flex flex-wrap items-center gap-3">
			<p class="text-sm font-medium text-ink">
				Drag the pink frame over the part of the photo you want to show
			</p>
			<HelpLink
				section="bespoke-cakes"
				task="adjust-photo"
				label="Help"
				title="How to choose which part of a photo shows"
			/>
		</div>

		<div class="mt-2 grid items-start gap-4 sm:grid-cols-2">
			<div>
				<div
					bind:this={picker}
					{onpointerdown}
					{onpointermove}
					{onpointerup}
					onpointercancel={onpointerup}
					role="presentation"
					class="relative max-w-full cursor-grab touch-none overflow-hidden rounded-xl border border-ink/10 select-none active:cursor-grabbing"
				>
					<img
						src={previewUrl}
						alt=""
						draggable="false"
						bind:naturalWidth={naturalW}
						bind:naturalHeight={naturalH}
						class="pointer-events-none block h-auto w-full"
					/>
					<div
						role="slider"
						tabindex="0"
						aria-label="Part of the photo to show. Use the arrow keys to move it."
						aria-valuemin="0"
						aria-valuemax="100"
						aria-valuenow={Math.round(focal.x)}
						aria-valuetext={`${Math.round(focal.x)} percent across, ${Math.round(focal.y)} percent down`}
						{onkeydown}
						class="absolute rounded-lg border-[3px] border-pink shadow-[0_0_0_9999px_rgba(45,28,20,0.55)] outline-none focus-visible:ring-2 focus-visible:ring-cream"
						style:left={`${left * 100}%`}
						style:top={`${top * 100}%`}
						style:width={`${drawW * 100}%`}
						style:height={`${drawH * 100}%`}
					></div>
				</div>
				<p class="mt-1.5 text-xs text-ink-soft/70">
					This is the whole photo. The bright part inside the frame is what visitors will see.
				</p>
			</div>

			<div>
				<p class="text-xs font-medium text-ink-soft">How it will look</p>
				<div
					bind:clientWidth={boxW}
					bind:clientHeight={boxH}
					class="mt-1.5 overflow-hidden rounded-xl border border-ink/10 bg-cream-dim {aspectClass}"
				>
					<PhotoFrame src={previewUrl} {zoom} focal={focalPoint} class="h-full w-full" />
				</div>
			</div>
		</div>

		<div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
			<div class="flex items-center gap-3">
				<label for={zoomFieldName} class="shrink-0 text-sm text-ink-soft">Zoom</label>
				<input
					id={zoomFieldName}
					type="range"
					min="30"
					max="200"
					step="1"
					bind:value={zoom}
					class="w-full max-w-[200px] accent-pink"
				/>
				<span class="w-12 shrink-0 text-right text-sm text-ink-soft">{zoom}%</span>
			</div>
			<button
				type="button"
				onclick={fitWholePhoto}
				class="text-sm font-semibold text-pink-deep hover:underline"
			>
				Fit whole photo
			</button>
			<button
				type="button"
				onclick={reset}
				class="text-sm font-semibold text-pink-deep hover:underline"
			>
				Reset
			</button>
		</div>
		<p class="mt-1 text-xs text-ink-soft/70">
			Slide the zoom right to get closer, or left to show more of the photo (the space around it
			fills with a soft blur of the photo).
		</p>
	</div>
{/if}

<input type="hidden" name={zoomFieldName} value={zoom} />
<input type="hidden" name={focalFieldName} value={focalPoint} />
