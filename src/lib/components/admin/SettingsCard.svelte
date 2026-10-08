<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		title,
		summary,
		open,
		ontoggle,
		children
	}: {
		id: string;
		title: string;
		summary: string;
		open: boolean;
		ontoggle: () => void;
		children: Snippet;
	} = $props();
</script>

<section {id} class="scroll-mt-6 rounded-2xl border border-ink/10 bg-white/60">
	<button
		type="button"
		onclick={ontoggle}
		aria-expanded={open}
		aria-controls={`${id}-panel`}
		class="flex w-full items-center justify-between gap-4 rounded-2xl p-6 text-left"
	>
		<span>
			<span class="block text-lg font-semibold text-ink">{title}</span>
			<span class="mt-0.5 block text-sm text-ink-soft">{summary}</span>
		</span>
		<svg
			width="16"
			height="16"
			viewBox="0 0 12 12"
			fill="none"
			class={`shrink-0 text-ink-soft transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
			aria-hidden="true"
		>
			<path
				d="M2.5 4.5L6 8L9.5 4.5"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#if open}
		<div id={`${id}-panel`} class="border-t border-ink/10 px-6 pt-5 pb-6">
			{@render children()}
		</div>
	{/if}
</section>
