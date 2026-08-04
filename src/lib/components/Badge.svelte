<script lang="ts">
	let { kind }: { kind: 'new' | 'sale' } = $props();
</script>

{#if kind === 'new'}
	<span
		class="bg-ink inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-cream uppercase"
	>
		New bake
	</span>
{:else}
	<span
		class="bg-pink inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-cream uppercase"
	>
		On sale
	</span>
{/if}
