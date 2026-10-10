<script lang="ts">
	import { srcFor, srcsetFor } from '$lib/utils/img';

	// A plain picture that asks the server for a size that suits the screen.
	// `sizes` says how wide it is shown; the browser picks the smallest copy that
	// still looks sharp. Use `eager` for the one big picture at the top of a page.
	let {
		src,
		alt = '',
		sizes = '100vw',
		widths = [320, 480, 640, 960, 1280],
		eager = false,
		class: className = '',
		style = undefined
	}: {
		src: string;
		alt?: string;
		sizes?: string;
		widths?: number[];
		eager?: boolean;
		class?: string;
		style?: string;
	} = $props();
</script>

<img
	src={srcFor(src, widths[Math.min(2, widths.length - 1)])}
	srcset={srcsetFor(src, widths)}
	{sizes}
	{alt}
	loading={eager ? 'eager' : 'lazy'}
	decoding="async"
	fetchpriority={eager ? 'high' : 'auto'}
	class={className}
	{style}
/>
