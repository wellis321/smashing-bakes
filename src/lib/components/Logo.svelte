<script lang="ts">
	type Variant = 'inline' | 'stacked';
	type Theme = 'light' | 'badge';

	let {
		variant = 'inline',
		theme = 'light',
		class: className = ''
	}: { variant?: Variant; theme?: Theme; class?: string } = $props();

	// Stepped offsets build a thick, hand-painted extrusion rather than a single flat drop shadow.
	const depth = Array.from({ length: 6 }, (_, i) => i + 1);

	const colors = $derived(
		theme === 'badge'
			? { front: 'var(--color-cream)', shadow: 'var(--color-pink-deep)' }
			: { front: 'var(--color-pink)', shadow: 'var(--color-gold-deep)' }
	);
</script>

{#if variant === 'inline'}
	<svg viewBox="0 0 640 92" class={className} role="img" aria-label="Smashin' Bakes">
		{#if theme === 'badge'}
			<rect x="0" y="0" width="640" height="92" rx="16" fill="var(--color-pink)" />
		{/if}
		<g font-family="var(--font-brand)" font-size="58" text-anchor="start">
			{#each depth as d (d)}
				<text x={2 + d} y={64 + d} fill={colors.shadow}>SMASHIN BAKES</text>
			{/each}
			<text x="2" y="64" fill={colors.front}>SMASHIN BAKES</text>
		</g>
	</svg>
{:else}
	<svg viewBox="0 0 360 210" class={className} role="img" aria-label="Smashin' Bakes">
		{#if theme === 'badge'}
			<rect x="0" y="0" width="360" height="210" rx="24" fill="var(--color-pink)" />
		{/if}
		<g font-family="var(--font-brand)" text-anchor="middle">
			{#each depth as d (d)}
				<text x={180 + d} y={82 + d} font-size="52" fill={colors.shadow}>SMASHIN</text>
				<text x={180 + d} y={168 + d} font-size="76" fill={colors.shadow}>BAKES</text>
			{/each}
			<text x="180" y="82" font-size="52" fill={colors.front}>SMASHIN</text>
			<text x="180" y="168" font-size="76" fill={colors.front}>BAKES</text>
		</g>
	</svg>
{/if}
