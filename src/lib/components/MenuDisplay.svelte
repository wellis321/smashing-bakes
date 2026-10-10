<script lang="ts">
	type Item = { id: number; name: string };
	type Section = { id: number; title: string; items: Item[] };
	type Menu = {
		menuDate: string;
		title: string | null;
		openingHoursText: string | null;
		noteText: string | null;
		sections: Section[];
	};

	let {
		menu,
		eyebrow,
		viewHref,
		headingLevel = 'h1'
	}: {
		menu: Menu;
		eyebrow?: string;
		viewHref?: string;
		// The /menus page already has its own main heading, so it uses h2 here.
		headingLevel?: 'h1' | 'h2';
	} = $props();

	function formatDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(`${dateStr}T00:00:00`));
	}
</script>

<div class="rounded-[2rem] bg-blush p-6 sm:p-10">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">
			{eyebrow ?? formatDate(menu.menuDate)}
		</p>
		{#if viewHref}
			<a href={viewHref} class="text-sm font-semibold text-pink-deep hover:underline"
				>View full page &rarr;</a
			>
		{/if}
	</div>
	<svelte:element this={headingLevel} class="mt-2 font-display text-4xl text-ink sm:text-5xl"
		>{menu.title || 'Menu for the weekend'}</svelte:element
	>

	{#if menu.openingHoursText}
		<p class="mt-4 inline-block rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-cream">
			{menu.openingHoursText}
		</p>
	{/if}

	{#if menu.noteText}
		<p class="mt-5 leading-relaxed text-ink-soft italic">{menu.noteText}</p>
	{/if}

	{#if menu.sections.length > 0}
		<div class="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
			{#each menu.sections as section (section.id)}
				<div>
					<h2 class="inline-block border-b-2 border-ink pb-0.5 font-display text-xl text-ink">
						{section.title}
					</h2>
					<ul class="mt-3 space-y-1.5">
						{#each section.items as item (item.id)}
							<li class="text-sm text-ink-soft">{item.name}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{/if}
</div>
