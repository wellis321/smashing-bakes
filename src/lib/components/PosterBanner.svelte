<script lang="ts">
	type Poster = {
		heading: string;
		message: string;
		imageUrl: string | null;
		imageZoom: number;
		style: 'announcement' | 'sold-out' | 'celebration' | 'general';
		ctaLabel: string | null;
		ctaUrl: string | null;
	};

	let { poster }: { poster: Poster } = $props();

	const bgVar: Record<Poster['style'], string> = {
		announcement: 'var(--color-blush)',
		general: 'var(--color-blush)',
		'sold-out': 'var(--color-ink)',
		celebration: 'var(--color-gold)'
	};

	const textClasses: Record<Poster['style'], string> = {
		announcement: 'text-ink',
		general: 'text-ink',
		'sold-out': 'text-cream',
		celebration: 'text-ink'
	};

	const ctaClasses: Record<Poster['style'], string> = {
		announcement: 'bg-pink hover:bg-pink-deep text-cream',
		general: 'bg-pink hover:bg-pink-deep text-cream',
		'sold-out': 'bg-cream text-ink hover:bg-cream/90',
		celebration: 'bg-ink hover:bg-ink/90 text-cream'
	};
</script>

<section class="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
	<div
		class={`relative overflow-hidden rounded-[2rem] ${textClasses[poster.style]}`}
		style:background-color={bgVar[poster.style]}
	>
		{#if poster.imageUrl}
			<img
				src={poster.imageUrl}
				alt=""
				class="absolute inset-0 h-full w-full object-cover object-right"
				style:transform={`scale(${(poster.imageZoom ?? 100) / 100})`}
				style:transform-origin="right center"
			/>
			<div
				class="absolute inset-0"
				style:background={`linear-gradient(to right, ${bgVar[poster.style]} 0%, ${bgVar[poster.style]} 38%, transparent 78%, transparent 100%)`}
			></div>
			<div
				class="absolute inset-0 sm:hidden"
				style:background={`linear-gradient(to top, ${bgVar[poster.style]} 55%, transparent 90%)`}
			></div>
		{/if}
		{#if poster.style === 'sold-out'}
			<div
				class="bg-pink text-cream absolute -left-24 top-8 z-10 w-72 -rotate-45 py-2.5 text-center text-sm font-bold tracking-[0.2em] uppercase shadow-lg sm:text-base"
			>
				Sold out
			</div>
		{/if}
		<div
			class={`relative flex flex-col justify-center px-8 py-10 sm:max-w-[55%] sm:px-10 sm:py-14 ${poster.style === 'sold-out' ? 'pt-24 sm:pt-14' : ''}`}
		>
			<h2 class="font-display text-2xl sm:text-3xl">{poster.heading}</h2>
			<p class="mt-3 leading-relaxed opacity-90">{poster.message}</p>
			{#if poster.ctaLabel && poster.ctaUrl}
				<a
					href={poster.ctaUrl}
					class={`mt-5 inline-flex w-fit rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${ctaClasses[poster.style]}`}
				>
					{poster.ctaLabel}
				</a>
			{/if}
		</div>
	</div>
</section>
