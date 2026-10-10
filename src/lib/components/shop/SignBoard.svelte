<script lang="ts">
	import type { Snippet } from 'svelte';

	// The dark, gold-trimmed title board with gold block lettering, like the real
	// shop sign. Long titles (admin-editable page headings) step down a size.
	let { eyebrow, title, help }: { eyebrow: string; title: string; help?: Snippet } = $props();
	const long = $derived(title.length > 24);
</script>

<div class="sign">
	<p class="sign-eyebrow">{eyebrow}</p>
	<div class="flex flex-wrap items-center justify-center gap-3">
		<h1 class="sign-title" class:long>{title}</h1>
		{@render help?.()}
	</div>
</div>

<style>
	/* ---- Title board, gold lettering like the real shop sign ---- */
	.sign {
		display: inline-block;
		max-width: 100%;
		padding: 1.1rem clamp(1.4rem, 5vw, 3rem) 1.2rem;
		border-radius: 2.75rem 2.75rem 1rem 1rem;
		background: linear-gradient(160deg, oklch(30% 0.04 50), var(--color-ink));
		border: 3px solid var(--color-gold-deep);
		box-shadow:
			inset 0 0 0 2px oklch(24% 0.035 50),
			inset 0 0 0 3px oklch(78% 0.12 72 / 0.45),
			0 14px 20px -12px oklch(24% 0.035 50 / 0.55);
	}

	.sign-eyebrow {
		font-family: var(--font-brand);
		font-size: 0.7rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--color-blush-deep);
	}

	.sign-title {
		margin-top: 0.35rem;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.9rem, 6.5vw, 3.1rem);
		letter-spacing: 0.01em;
		line-height: 1;
		text-transform: uppercase;
		color: var(--color-gold);
		text-shadow:
			1px 1px 0 var(--color-gold-deep),
			2px 2px 0 var(--color-gold-deep),
			3px 3px 0 var(--color-gold-deep),
			4px 4px 0 oklch(36% 0.06 52),
			5px 5px 0 oklch(36% 0.06 52);
	}

	.sign-title.long {
		font-size: clamp(1.35rem, 4.4vw, 2.2rem);
		line-height: 1.08;
		letter-spacing: 0.02em;
	}
</style>
