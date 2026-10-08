<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const task = $derived(data.task);
</script>

<svelte:head>
	<title>{task.title} — Help</title>
</svelte:head>

<a href="/admin/help" class="text-sm font-semibold text-ink-soft hover:text-ink">&larr; All help</a>

<div class="mt-4 max-w-2xl">
	<h1 class="font-display text-3xl text-ink sm:text-4xl">{task.title}</h1>
	<p class="mt-2 text-lg text-ink-soft">{task.summary}</p>

	<ol class="mt-8 space-y-5">
		{#each task.steps as step, i (i)}
			<li class="flex gap-4">
				<span
					class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink text-base font-bold text-cream"
				>
					{i + 1}
				</span>
				<p class="pt-1 text-lg leading-relaxed text-ink">{step}</p>
			</li>
		{/each}
	</ol>

	{#if task.tip}
		<p class="mt-8 rounded-xl bg-blush px-5 py-4 text-base leading-relaxed text-ink">
			<strong>Good to know:</strong>
			{task.tip}
		</p>
	{/if}

	<a
		href={task.goTo.href}
		class="mt-8 inline-flex rounded-full bg-pink px-7 py-3.5 text-base font-semibold text-cream shadow-soft transition-colors hover:bg-pink-deep"
	>
		{task.goTo.label} &rarr;
	</a>

	<p class="mt-8 text-sm text-ink-soft">
		Want every detail? <a
			href={`/admin/help#${task.section}`}
			class="font-semibold text-pink-deep hover:underline">Read the full guide</a
		>.
	</p>
</div>
