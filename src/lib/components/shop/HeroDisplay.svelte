<script lang="ts">
	import type { Snippet } from 'svelte';

	// The home page hero's three editable photos, standing as plates on a wooden
	// shelf in the shop window, the middle one on a cake stand.
	let { images, help }: { images: string[]; help?: Snippet } = $props();
</script>

<div class="display">
	{#if help}
		<div class="help">{@render help()}</div>
	{/if}

	<div class="row">
		<div class="slot slot-1">
			<span class="contact-shadow" aria-hidden="true"></span>
			<div class="plate"><img src={images[0]} alt="" /></div>
		</div>

		<div class="slot slot-2">
			<div class="stand" aria-hidden="true">
				<span class="stand-stem"></span>
				<span class="stand-foot"></span>
			</div>
			<div class="plate"><img src={images[1]} alt="" /></div>
		</div>

		<div class="slot slot-3">
			<span class="contact-shadow" aria-hidden="true"></span>
			<div class="plate"><img src={images[2]} alt="" /></div>
		</div>
	</div>

	<div class="board" aria-hidden="true"></div>
</div>

<style>
	.display {
		position: relative;
		width: 100%;
		max-width: 64rem;
		margin-inline: auto;
		padding-top: clamp(1.5rem, 5vw, 3.5rem);
		padding-bottom: clamp(0.5rem, 2vw, 1.5rem);
	}

	.help {
		position: absolute;
		z-index: 5;
		top: 0;
		right: 0;
	}

	.row {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 0;
		margin-bottom: -0.55rem;
	}

	.slot {
		position: relative;
	}

	.slot-1 {
		width: 33%;
		margin-right: -3%;
	}
	.slot-2 {
		width: 46%;
		z-index: 3;
	}
	.slot-3 {
		width: 28%;
		margin-left: -3%;
	}

	.plate {
		position: relative;
		z-index: 2;
		aspect-ratio: 1;
		border-radius: 50%;
		border: clamp(5px, 1.3vw, 8px) solid oklch(99% 0.008 80);
		background: var(--color-cream-dim);
		box-shadow:
			0 0 0 1px oklch(85% 0.025 70),
			0 18px 22px -14px oklch(30% 0.05 45 / 0.55);
	}

	.plate img {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.slot-1 .plate {
		transform: rotate(-3deg);
	}
	.slot-3 .plate {
		transform: rotate(4deg);
	}

	.contact-shadow {
		position: absolute;
		z-index: 1;
		left: 10%;
		right: 10%;
		bottom: -0.35rem;
		height: 0.9rem;
		border-radius: 50%;
		background: radial-gradient(closest-side, oklch(25% 0.05 45 / 0.5), transparent);
		filter: blur(2px);
	}

	/* Cake stand under the middle plate */
	.slot-2 {
		padding-bottom: clamp(1.9rem, 6vw, 3rem);
	}

	.stand {
		position: absolute;
		z-index: 1;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stand-stem {
		width: 9%;
		height: clamp(1.4rem, 4.6vw, 2.3rem);
		margin-top: -0.2rem;
		background: linear-gradient(
			90deg,
			oklch(86% 0.04 78),
			oklch(99% 0.01 85) 45%,
			oklch(84% 0.05 75)
		);
		border-radius: 0.2rem;
	}

	.stand-foot {
		width: 44%;
		height: 0.7rem;
		border-radius: 50%;
		background: linear-gradient(180deg, oklch(99% 0.01 85), oklch(84% 0.05 75));
		box-shadow:
			0 0 0 1px var(--color-gold-deep),
			0 8px 10px -4px oklch(25% 0.05 45 / 0.45);
	}

	.board {
		position: relative;
		z-index: 1;
		height: 1.1rem;
		margin-inline: -1rem;
		background:
			linear-gradient(180deg, oklch(80% 0.07 70) 0 2px, transparent 2px),
			linear-gradient(180deg, oklch(60% 0.08 62), oklch(43% 0.07 50));
		box-shadow:
			0 12px 14px -8px oklch(25% 0.05 45 / 0.45),
			inset 0 -2px 0 oklch(35% 0.06 48 / 0.6);
	}

	@media (max-width: 639px) {
		.display {
			width: calc(100% + 1.2rem);
			margin-inline: -0.6rem;
		}
		.slot-1 {
			width: 32%;
		}
		.slot-2 {
			width: 46%;
		}
		.slot-3 {
			width: 27%;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.slot {
			animation: plate-in 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
		}
		.slot-1 {
			animation-delay: 0.2s;
		}
		.slot-2 {
			animation-delay: 0.32s;
		}
		.slot-3 {
			animation-delay: 0.44s;
		}
	}

	@keyframes plate-in {
		from {
			opacity: 0;
			transform: translateY(-26px);
		}
	}
</style>
