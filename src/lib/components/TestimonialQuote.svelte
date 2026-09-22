<script lang="ts">
	let { quote, authorName }: { quote: string; authorName?: string | null } = $props();
</script>

<div
	class="relative mx-auto max-w-2xl rounded-[2rem] bg-blush px-8 py-10 text-center sm:px-14 sm:py-12"
>
	<span
		class="pointer-events-none absolute top-2 left-5 font-display text-7xl text-pink/40 select-none sm:top-3 sm:left-8"
		aria-hidden="true"
	>
		&ldquo;
	</span>
	<p class="relative font-display text-xl leading-snug text-ink sm:text-2xl">{quote}</p>
	{#if authorName}
		<p class="mt-4 text-sm font-semibold tracking-wide text-pink-deep uppercase">{authorName}</p>
	{/if}
</div>
