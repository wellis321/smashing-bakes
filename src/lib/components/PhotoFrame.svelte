<script lang="ts">
	import { srcFor, srcsetFor } from '$lib/utils/img';

	// A photo cropped into whatever shape `class` gives it (aspect ratio,
	// rounding). Zoom and focal point match the admin's drag-a-frame control.
	// Zooming out below 100% fills the gaps with a soft blurred copy of the
	// photo itself, which looks far better than a plain flat colour.
	//
	// Uploaded photos are requested at a size that suits the screen: `sizes`
	// tells the browser how wide the picture will be shown, and it picks the
	// smallest copy that still looks sharp. `eager` is for the one big picture
	// at the top of a page, which should load first.
	let {
		src,
		alt = '',
		zoom = 100,
		focal = 'center',
		class: className = '',
		sizes = '50vw',
		widths = [320, 480, 640, 960, 1280],
		defaultWidth = 640,
		eager = false
	}: {
		src: string;
		alt?: string;
		zoom?: number;
		focal?: string;
		class?: string;
		sizes?: string;
		widths?: number[];
		// The size used by browsers that ignore srcset, and by simple checkers.
		defaultWidth?: number;
		eager?: boolean;
	} = $props();
</script>

<div class="relative overflow-hidden bg-cream-dim {className}">
	{#if zoom < 100}
		<!-- It's blurred, so a tiny copy is plenty -->
		<img
			src={srcFor(src, 160)}
			alt=""
			aria-hidden="true"
			loading="lazy"
			decoding="async"
			class="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
		/>
	{/if}
	<img
		src={srcFor(src, defaultWidth)}
		srcset={srcsetFor(src, widths)}
		{sizes}
		{alt}
		loading={eager ? 'eager' : 'lazy'}
		decoding="async"
		fetchpriority={eager ? 'high' : 'auto'}
		class="relative h-full w-full object-cover"
		style:object-position={focal}
		style:transform-origin={focal}
		style:transform={`scale(${zoom / 100})`}
	/>
</div>
