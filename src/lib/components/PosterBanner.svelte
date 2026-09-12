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

	// Solid base colors only — this same value both paints the card and feeds
	// the fade-to-image overlay below, so it can't be a gradient itself. Kept
	// inside the site's own blush/pink/ink family throughout; gold (the one
	// color outside that family) is used only as a small accent, never as a
	// full-panel background — a flat gold card read as jarring and off-brand.
	const bgVar: Record<Poster['style'], string> = {
		announcement: 'var(--color-blush-deep)',
		general: 'var(--color-blush)',
		'sold-out': 'var(--color-ink)',
		celebration: 'var(--color-blush)'
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
		celebration: 'bg-gold-deep hover:bg-gold text-ink'
	};

	// The accent motif shown in the empty right-hand side when there's no
	// photo — same heart used elsewhere on the site (promo pages, newsletter),
	// so a photo-less poster still feels like it belongs rather than reading
	// as a flat, empty block.
	const accentClasses: Record<Poster['style'], string> = {
		announcement: 'text-pink/25',
		general: 'text-pink/20',
		'sold-out': 'text-cream/10',
		celebration: 'text-gold-deep/25'
	};
</script>

<section class="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
	<div
		class={`relative overflow-hidden rounded-[2rem] sm:min-h-[240px] ${textClasses[poster.style]}`}
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
		{:else}
			<svg
				width="340"
				height="340"
				viewBox="0 0 20 20"
				fill="currentColor"
				class={`pointer-events-none absolute -right-12 -bottom-16 hidden rotate-[8deg] sm:block ${accentClasses[poster.style]}`}
				aria-hidden="true"
			>
				<path d="M10 17.5s-6.5-4.2-6.5-9A4 4 0 0110 6.2 4 4 0 0116.5 8.5c0 4.8-6.5 9-6.5 9z" />
			</svg>
		{/if}
		{#if poster.style === 'sold-out'}
			<div
				class="bg-pink text-cream absolute -left-24 top-8 z-10 w-72 -rotate-45 py-2.5 text-center text-sm font-bold tracking-[0.2em] uppercase shadow-lg sm:text-base"
			>
				Sold out
			</div>
		{/if}
		<div
			class={`relative flex flex-col justify-center px-8 py-10 sm:max-w-[55%] sm:px-10 sm:py-14 ${poster.style === 'sold-out' ? 'pt-24 sm:pt-20' : ''}`}
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
