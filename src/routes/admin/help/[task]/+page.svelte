<script lang="ts">
	import GuideFooter from '$lib/components/admin/GuideFooter.svelte';
	import ZoomImage from '$lib/components/admin/ZoomImage.svelte';
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

	<ol class="mt-8 space-y-8">
		{#each task.steps as step, i (i)}
			<li class="flex gap-4">
				<span
					class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink text-base font-bold text-cream"
				>
					{i + 1}
				</span>
				<div class="min-w-0 flex-1">
					<p class="pt-1 text-lg leading-relaxed text-ink">{step.text}</p>
					{#if step.image}
						<div class="mt-4">
							<ZoomImage
								src={`/images/help/${step.image}.jpg`}
								alt={`What to look for in step ${i + 1}: the highlighted part of the screen`}
								class="w-full rounded-xl border border-ink/10 shadow-soft"
							/>
						</div>
					{/if}
				</div>
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

	<GuideFooter title={task.title} />

	{#if data.related.length > 0}
		<div class="mt-10 border-t border-ink/10 pt-6">
			<h2 class="text-base font-semibold text-ink">More guides like this</h2>
			<ul class="mt-3 space-y-2">
				{#each data.related as other (other.slug)}
					<li>
						<a href={`/admin/help/${other.slug}`} class="text-base text-pink-deep hover:underline">
							{other.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<p class="mt-8 text-sm text-ink-soft">
		Want every detail? <a
			href={`/admin/help#${task.section}`}
			class="font-semibold text-pink-deep hover:underline">Read the full guide</a
		>.
	</p>
</div>
