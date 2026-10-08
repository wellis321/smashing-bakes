<script lang="ts">
	// Points at the matching section id on /admin/help (see that page's own
	// `groups` array in its <script> for the full list of valid ids).
	let { section, title = 'Help for this page' }: { section: string; title?: string } = $props();
</script>

<a
	href={`/admin/help#${section}`}
	target="_blank"
	rel="noreferrer"
	class="inline-flex shrink-0 items-center text-ink-soft/50 transition-colors hover:text-pink-deep"
	{title}
	aria-label={title}
>
	<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.4" />
		<path d="M10 9.2v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
		<circle cx="10" cy="6.2" r="1" fill="currentColor" />
	</svg>
</a>
