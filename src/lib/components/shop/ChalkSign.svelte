<script lang="ts">
	// A chalkboard sign in a wooden frame, hung slightly crooked.
	let {
		title,
		id,
		alt = false,
		count = null
	}: { title: string; id?: string; alt?: boolean; count?: string | null } = $props();
</script>

<div class="chalk" class:chalk-alt={alt}>
	<h2 {id}>{title}</h2>
	{#if count}
		<span>{count}</span>
	{/if}
</div>

<style>
	.chalk {
		display: inline-flex;
		align-items: baseline;
		gap: 0.85rem;
		padding: 0.6rem 1.3rem 0.65rem;
		border-radius: 0.5rem;
		border: 4px solid oklch(54% 0.08 60);
		background: linear-gradient(150deg, oklch(30% 0.04 50), oklch(24% 0.035 50));
		box-shadow:
			0 12px 16px -10px oklch(24% 0.035 50 / 0.55),
			inset 0 0 0 1px oklch(40% 0.04 52);
		transform: rotate(-1.2deg);
	}

	.chalk-alt {
		transform: rotate(0.9deg);
	}

	.chalk h2 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.15rem, 3.4vw, 1.6rem);
		letter-spacing: 0.06em;
		line-height: 1;
		text-transform: uppercase;
		color: oklch(97.5% 0.014 80);
	}

	.chalk span {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--color-gold);
	}
</style>
