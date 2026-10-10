<script lang="ts">
	// Striped, scalloped shop awning — pure CSS, no images. The stripes and the
	// scallops share one 5rem repeat so each scallop continues its own stripe.
</script>

<div class="awning" aria-hidden="true">
	<div class="stripes"></div>
	<div class="scallops"></div>
</div>

<style>
	.awning {
		--stripe: 2.5rem;
		position: relative;
		z-index: 2;
		filter: drop-shadow(0 10px 8px oklch(24% 0.035 50 / 0.28));
	}

	.stripes {
		height: clamp(2.75rem, 7vw, 4.25rem);
		border-radius: 1.25rem 1.25rem 0 0;
		background:
			linear-gradient(180deg, oklch(100% 0 0 / 0.22), transparent 38%, oklch(24% 0.035 50 / 0.1)),
			repeating-linear-gradient(
				90deg,
				var(--color-pink) 0 var(--stripe),
				var(--color-blush) var(--stripe) calc(var(--stripe) * 2)
			);
	}

	.scallops {
		height: calc(var(--stripe) / 2);
		margin-top: -1px;
		background:
			radial-gradient(
					circle at calc(var(--stripe) / 2) 0,
					var(--color-pink) calc(var(--stripe) / 2),
					transparent calc(var(--stripe) / 2 + 0.5px)
				)
				0 0 / calc(var(--stripe) * 2) 100% repeat-x,
			radial-gradient(
					circle at calc(var(--stripe) / 2) 0,
					var(--color-blush) calc(var(--stripe) / 2),
					transparent calc(var(--stripe) / 2 + 0.5px)
				)
				var(--stripe) 0 / calc(var(--stripe) * 2) 100% repeat-x;
	}

	@media (max-width: 640px) {
		.awning {
			--stripe: 1.75rem;
		}
	}
</style>
