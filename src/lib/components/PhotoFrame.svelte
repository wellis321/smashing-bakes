<script lang="ts">
	// A photo cropped into whatever shape `class` gives it (aspect ratio,
	// rounding). Zoom and focal point match the admin's drag-a-frame control.
	// Zooming out below 100% fills the gaps with a soft blurred copy of the
	// photo itself, which looks far better than a plain flat colour.
	let {
		src,
		alt = '',
		zoom = 100,
		focal = 'center',
		class: className = ''
	}: { src: string; alt?: string; zoom?: number; focal?: string; class?: string } = $props();
</script>

<div class="relative overflow-hidden bg-cream-dim {className}">
	{#if zoom < 100}
		<img
			{src}
			alt=""
			aria-hidden="true"
			class="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
		/>
	{/if}
	<img
		{src}
		{alt}
		class="relative h-full w-full object-cover"
		style:object-position={focal}
		style:transform-origin={focal}
		style:transform={`scale(${zoom / 100})`}
	/>
</div>
