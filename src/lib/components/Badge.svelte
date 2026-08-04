<script lang="ts">
	let { kind }: { kind: 'new' | 'sale' } = $props();
</script>

<!--
	Diagonal corner ribbon, matching the "sold out" sash on PosterBanner. Positions
	itself absolutely, so the parent just needs `relative overflow-hidden`.
-->
<div
	class={`absolute -left-9 top-3 w-36 -rotate-45 py-1 text-center text-[0.65rem] font-bold tracking-[0.15em] text-cream uppercase shadow-md ${
		kind === 'new' ? 'bg-ink' : 'bg-pink'
	}`}
>
	{kind === 'new' ? 'New bake' : 'On sale'}
</div>
