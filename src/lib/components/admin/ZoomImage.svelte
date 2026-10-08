<script lang="ts">
	let { src, alt, class: className = '' }: { src: string; alt: string; class?: string } = $props();

	let open = $state(false);

	function onkeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') open = false;
	}

	// Stops the page scrolling behind the enlarged image.
	$effect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});
</script>

<svelte:window {onkeydown} />

<button
	type="button"
	onclick={() => (open = true)}
	class="group relative block w-full cursor-zoom-in text-left"
	aria-label={`Enlarge image: ${alt}`}
>
	<img {src} {alt} loading="lazy" class={className} />
	<span
		class="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-cream opacity-90 transition-opacity group-hover:opacity-100"
	>
		<svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
			<circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.6" />
			<path d="M12.5 12.5L17 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
			<path
				d="M8.5 6.5v4M6.5 8.5h4"
				stroke="currentColor"
				stroke-width="1.4"
				stroke-linecap="round"
			/>
		</svg>
		Click to enlarge
	</span>
</button>

{#if open}
	<button
		type="button"
		onclick={() => (open = false)}
		class="fixed inset-0 z-[100] flex cursor-zoom-out overflow-auto bg-ink/85 p-4 sm:p-8"
		aria-label="Close enlarged image"
	>
		<img {src} {alt} class="m-auto w-full max-w-[1100px] rounded-xl shadow-2xl" />
		<span
			class="pointer-events-none fixed top-4 right-4 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-ink"
		>
			Click anywhere to close
		</span>
	</button>
{/if}
