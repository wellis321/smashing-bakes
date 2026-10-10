<script lang="ts">
	import type { Snippet } from 'svelte';

	// A photo in a wooden frame with a white mat, hanging from a nail.
	let { children, class: className = '' }: { children: Snippet; class?: string } = $props();
</script>

<figure class="framed {className}">
	<span class="nail" aria-hidden="true"></span>
	<span class="string" aria-hidden="true"></span>
	<div class="frame">
		<div class="mat">
			{@render children()}
		</div>
	</div>
</figure>

<style>
	.framed {
		position: relative;
		padding-top: 1.8rem;
	}

	.nail {
		position: absolute;
		z-index: 2;
		top: 0.1rem;
		left: 50%;
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, var(--color-gold), var(--color-gold-deep));
		box-shadow: 0 2px 3px oklch(25% 0.05 45 / 0.45);
		transform: translateX(-50%);
	}

	.string {
		position: absolute;
		z-index: 1;
		top: 0.45rem;
		left: 50%;
		width: 36%;
		height: 1.4rem;
		transform: translateX(-50%);
		background:
			linear-gradient(
				to bottom right,
				transparent calc(50% - 0.75px),
				oklch(40% 0.04 50) 50%,
				transparent calc(50% + 0.75px)
			),
			linear-gradient(
				to bottom left,
				transparent calc(50% - 0.75px),
				oklch(40% 0.04 50) 50%,
				transparent calc(50% + 0.75px)
			);
		clip-path: polygon(50% 0, 100% 100%, 0 100%);
	}

	.frame {
		padding: clamp(8px, 1.5vw, 14px);
		border-radius: 0.3rem;
		background: linear-gradient(
			140deg,
			oklch(62% 0.08 62),
			oklch(42% 0.07 50) 60%,
			oklch(52% 0.08 58)
		);
		box-shadow:
			0 20px 26px -16px oklch(24% 0.035 50 / 0.6),
			inset 0 0 0 1px oklch(75% 0.07 68 / 0.6),
			inset 0 0 0 2px oklch(32% 0.05 48 / 0.5);
	}

	.mat {
		padding: clamp(6px, 1.3vw, 11px);
		background: oklch(99% 0.008 85);
		box-shadow:
			inset 0 0 0 1px oklch(86% 0.02 70),
			inset 0 3px 7px oklch(25% 0.05 45 / 0.18);
	}

	.mat :global(img),
	.mat :global(iframe) {
		display: block;
	}
</style>
