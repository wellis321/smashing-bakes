<script lang="ts">
	type Poster = {
		eyebrow?: string | null;
		heading: string;
		message: string;
		perks?: string | null;
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
		general: 'var(--color-ink)',
		'sold-out': 'var(--color-ink)',
		celebration: 'var(--color-blush)'
	};

	const textClasses: Record<Poster['style'], string> = {
		announcement: 'text-ink',
		general: 'text-cream',
		'sold-out': 'text-cream',
		celebration: 'text-ink'
	};

	const softTextClasses: Record<Poster['style'], string> = {
		announcement: 'text-ink/75',
		general: 'text-cream/75',
		'sold-out': 'text-cream/75',
		celebration: 'text-ink/75'
	};

	const dividerClasses: Record<Poster['style'], string> = {
		announcement: 'border-ink/25',
		general: 'border-cream/25',
		'sold-out': 'border-cream/25',
		celebration: 'border-ink/25'
	};

	const ctaClasses: Record<Poster['style'], string> = {
		announcement: 'border-ink text-ink hover:bg-ink hover:text-cream',
		general: 'border-cream text-cream hover:bg-cream hover:text-ink',
		'sold-out': 'border-cream text-cream hover:bg-cream hover:text-ink',
		celebration: 'border-ink text-ink hover:bg-ink hover:text-cream'
	};

	const badgeClasses: Record<Poster['style'], string> = {
		announcement: 'border-ink/30 text-ink',
		general: 'border-gold/60 text-gold',
		'sold-out': 'border-cream/30 text-cream',
		celebration: 'border-ink/30 text-ink'
	};

	// The accent motif shown in the empty right-hand side when there's no
	// photo — same heart used elsewhere on the site (promo pages, newsletter),
	// so a photo-less poster still feels like it belongs rather than reading
	// as a flat, empty block.
	const accentClasses: Record<Poster['style'], string> = {
		announcement: 'text-pink/25',
		general: 'text-cream/10',
		'sold-out': 'text-cream/10',
		celebration: 'text-gold-deep/25'
	};

	const perkList = $derived(
		(poster.perks ?? '')
			.split('\n')
			.map((p) => p.trim())
			.filter(Boolean)
	);
</script>

<section class="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
	<div
		class={`relative flex flex-col overflow-visible rounded-[2rem] sm:min-h-[380px] sm:flex-row ${textClasses[poster.style]}`}
		style:background-color={bgVar[poster.style]}
	>
		<div
			class={`relative z-10 flex flex-1 flex-col justify-center overflow-hidden rounded-[2rem] px-8 py-10 sm:px-10 sm:py-12 ${poster.style === 'sold-out' ? 'pt-16 sm:pt-12' : ''} ${poster.imageUrl ? 'sm:rounded-r-none' : ''}`}
		>
			{#if poster.style === 'sold-out'}
				<div
					class="bg-pink text-cream absolute -left-14 top-6 z-20 w-52 -rotate-45 py-1.5 text-center text-xs font-bold tracking-[0.2em] uppercase shadow-lg"
				>
					Sold out
				</div>
			{/if}

			<div
				class={`pointer-events-none absolute right-6 top-6 flex h-16 w-16 shrink-0 rotate-6 items-center justify-center rounded-full border-2 text-center text-[10px] font-bold tracking-[0.15em] uppercase ${badgeClasses[poster.style]}`}
				aria-hidden="true"
			>
				Smashin<br />Bakes
			</div>

			{#if !poster.imageUrl}
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

			<div class="max-w-md pr-16">
				{#if poster.eyebrow}
					<p class="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">{poster.eyebrow}</p>
				{/if}
				<h2 class="font-display mt-1.5 text-2xl sm:text-3xl">{poster.heading}</h2>
				<p class={`mt-3 leading-relaxed ${softTextClasses[poster.style]}`}>{poster.message}</p>

				{#if perkList.length > 0}
					<div class={`mt-5 border-t border-dashed pt-4 ${dividerClasses[poster.style]}`}>
						<p class="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">Exclusive perks</p>
						<ul class="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
							{#each perkList as perk (perk)}
								<li class="flex items-start gap-2 text-sm">
									<svg
										width="14"
										height="14"
										viewBox="0 0 20 20"
										fill="none"
										class="mt-0.5 shrink-0 opacity-80"
										aria-hidden="true"
									>
										<path
											d="M4 10.5l4 4 8-9"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									<span>{perk}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if poster.ctaLabel && poster.ctaUrl}
					<a
						href={poster.ctaUrl}
						class={`mt-6 inline-flex w-fit rounded-full border-2 px-6 py-2.5 text-sm font-bold tracking-wide uppercase transition-colors ${ctaClasses[poster.style]}`}
					>
						{poster.ctaLabel}
					</a>
				{/if}
			</div>
		</div>

		{#if poster.imageUrl}
			<div class="relative hidden shrink-0 sm:block sm:w-[38%]">
				<div
					class="absolute -top-6 -bottom-6 left-4 right-0 overflow-hidden rounded-[1.75rem] rotate-2 shadow-xl"
				>
					<img
						src={poster.imageUrl}
						alt=""
						class="h-full w-full object-cover"
						style:transform={`scale(${(poster.imageZoom ?? 100) / 100})`}
					/>
				</div>
			</div>
			<div class="relative -mt-4 sm:hidden">
				<div class="mx-8 mb-8 aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
					<img
						src={poster.imageUrl}
						alt=""
						class="h-full w-full object-cover"
						style:transform={`scale(${(poster.imageZoom ?? 100) / 100})`}
					/>
				</div>
			</div>
		{/if}
	</div>
</section>
