<script lang="ts">
	import type { Snippet } from 'svelte';
	import ShopAwning from './ShopAwning.svelte';

	// The shopfront every shop page sits inside: awning, hanging OPEN sign,
	// window frame and glass, and the sill. Pages put their content in the glass.
	let { openingHours, children }: { openingHours: string[]; children: Snippet } = $props();
</script>

<section class="mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-8 sm:pt-14">
	<div class="scene">
		<div class="awning-wrap">
			<ShopAwning />
		</div>

		<!-- Hanging sign: big screens only, where there's room beside the title board -->
		<div class="open-sign" aria-hidden="true">
			<span class="open-string open-string-l"></span>
			<span class="open-string open-string-r"></span>
			<p class="open-word">Open</p>
			{#each openingHours as line (line)}
				<p class="open-line">{line}</p>
			{/each}
		</div>

		<div class="window">
			<div class="glass">
				<div class="relative z-[1]">
					{@render children()}
				</div>
				<div class="reflection" aria-hidden="true"></div>
			</div>
		</div>
		<div class="sill" aria-hidden="true"></div>
	</div>
</section>

<style>
	.scene {
		position: relative;
	}

	.awning-wrap {
		margin-inline: -0.75rem;
	}

	/* ---- The window itself ---- */
	.window {
		position: relative;
		margin-top: -0.35rem;
		padding: clamp(0.55rem, 1.6vw, 0.9rem);
		background: linear-gradient(180deg, oklch(30% 0.04 50), var(--color-ink));
		box-shadow: inset 0 0 0 1px oklch(40% 0.04 52);
	}

	.glass {
		--glass-pad: 1.25rem;
		--gap: 1rem;
		position: relative;
		overflow: hidden;
		padding: 2.75rem var(--glass-pad) 3.5rem;
		border-radius: 0.4rem;
		background: linear-gradient(
			180deg,
			oklch(97% 0.022 82) 0%,
			oklch(96.5% 0.03 62) 55%,
			oklch(93.5% 0.045 22) 100%
		);
		box-shadow:
			inset 0 18px 24px -12px oklch(24% 0.035 50 / 0.4),
			inset 0 0 0 3px oklch(62% 0.13 63 / 0.4);
	}

	@media (min-width: 640px) {
		.glass {
			--glass-pad: 2.5rem;
			--gap: 1.5rem;
			padding-top: 3.5rem;
		}
	}

	.reflection {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: linear-gradient(
			112deg,
			transparent 0 24%,
			oklch(100% 0 0 / 0.3) 24% 30%,
			transparent 30% 35%,
			oklch(100% 0 0 / 0.18) 35% 37%,
			transparent 37%
		);
	}

	.sill {
		margin: 0 -0.75rem;
		height: 1.15rem;
		border-radius: 0 0 0.7rem 0.7rem;
		background:
			linear-gradient(180deg, oklch(52% 0.05 52) 0 3px, transparent 3px),
			linear-gradient(180deg, oklch(34% 0.045 50), var(--color-ink));
		box-shadow: 0 20px 26px -14px oklch(24% 0.035 50 / 0.5);
	}

	/* ---- Hanging OPEN sign ---- */
	.open-sign {
		display: none;
	}

	@media (min-width: 1024px) {
		.open-sign {
			display: block;
			position: absolute;
			z-index: 7;
			top: 4.4rem;
			right: 3.5rem;
			width: 10.25rem;
			padding: 0.9rem 0.6rem 0.95rem;
			text-align: center;
			border-radius: 0.9rem;
			background: var(--color-pink-deep);
			border: 3px solid oklch(98% 0.015 85);
			box-shadow:
				0 14px 18px -10px oklch(24% 0.035 50 / 0.6),
				inset 0 0 0 2px var(--color-pink-deep);
			transform: rotate(2.5deg);
			transform-origin: 50% -1.4rem;
		}
	}

	.open-string {
		position: absolute;
		bottom: 100%;
		width: 2px;
		height: 1.5rem;
		background: oklch(98% 0.015 85);
	}

	.open-string-l {
		left: 22%;
	}

	.open-string-r {
		right: 22%;
	}

	.open-word {
		font-family: var(--font-brand);
		font-size: 1.7rem;
		line-height: 1;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: oklch(98% 0.015 85);
		text-shadow: 2px 2px 0 oklch(40% 0.12 8);
	}

	.open-line {
		margin-top: 0.4rem;
		font-size: 0.76rem;
		line-height: 1.2;
		font-weight: 700;
		white-space: nowrap;
		color: oklch(96% 0.025 8);
	}

	.open-word + .open-line {
		margin-top: 0.65rem;
		padding-top: 0.6rem;
		border-top: 1.5px dashed oklch(98% 0.015 85 / 0.7);
	}
</style>
