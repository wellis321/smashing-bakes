<script lang="ts">
	// Points at the matching section id on /admin/help (see that page's own
	// `groups` array in its <script> for the full list of valid ids).
	// `task` sends people to a short step-by-step guide instead of the long
	// reference section.
	// `staff` is the stronger solid style used on the public site, where the
	// pill has to stand out against page content rather than an admin header.
	let {
		section,
		title = 'Help for this page',
		label = 'Help',
		staff = false,
		task
	}: {
		section: string;
		title?: string;
		label?: string;
		staff?: boolean;
		task?: string;
	} = $props();
</script>

<a
	href={task ? `/admin/help/${task}` : `/admin/help#${section}`}
	target="_blank"
	rel="noreferrer"
	class={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-pink/50 focus-visible:outline-none ${
		staff
			? 'bg-pink text-cream shadow-soft hover:bg-pink-deep'
			: 'border border-pink/40 bg-pink/10 text-pink-deep hover:bg-pink hover:text-cream'
	}`}
	{title}
	aria-label={title}
>
	<svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.6" />
		<path d="M10 9.2v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
		<circle cx="10" cy="6.2" r="1.1" fill="currentColor" />
	</svg>
	{label}
</a>
