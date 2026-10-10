<script lang="ts">
	import type { Snippet } from 'svelte';

	// A small chalkboard card in a wooden frame, for short headed paragraphs.
	let { title, tilt = 0, children }: { title: string; tilt?: number; children: Snippet } = $props();
</script>

<div class="card" style:--tilt={`${tilt}deg`}>
	<h2>{title}</h2>
	<div class="body">
		{@render children()}
	</div>
</div>

<style>
	.card {
		border-radius: 0.5rem;
		border: 4px solid oklch(54% 0.08 60);
		padding: 1.4rem 1.4rem 1.5rem;
		background: linear-gradient(150deg, oklch(30% 0.04 50), oklch(24% 0.035 50));
		box-shadow:
			0 14px 18px -12px oklch(24% 0.035 50 / 0.55),
			inset 0 0 0 1px oklch(40% 0.04 52);
		transform: rotate(var(--tilt));
		color: oklch(92% 0.02 80);
	}

	h2 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.05rem, 2.6vw, 1.3rem);
		letter-spacing: 0.05em;
		line-height: 1.1;
		text-transform: uppercase;
		color: var(--color-gold);
	}

	.body {
		margin-top: 0.75rem;
		font-size: 0.92rem;
		line-height: 1.6;
	}

	.body :global(a) {
		font-weight: 700;
		color: var(--color-blush-deep);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
