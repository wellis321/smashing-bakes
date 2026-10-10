<script lang="ts">
	import GuideFooter from '$lib/components/admin/GuideFooter.svelte';
	import { onMount } from 'svelte';

	// A step-by-step guide whose steps can be ticked off (remembered in this
	// browser). Each page supplies its content as plain data; **double asterisks**
	// in any text make it bold.
	type Step = { text: string; detail?: string; link?: { href: string; label: string } };
	type Part = { heading: string; steps: Step[] };
	type Note = { heading: string; items: string[] };

	let {
		title,
		intro,
		storageKey,
		notes = [],
		parts,
		after
	}: {
		title: string;
		intro: string;
		storageKey: string;
		notes?: Note[];
		parts: Part[];
		after?: Note;
	} = $props();

	const total = $derived(parts.reduce((n, p) => n + p.steps.length, 0));
	let done = $state<Record<string, boolean>>({});
	const doneCount = $derived(Object.values(done).filter(Boolean).length);

	onMount(() => {
		try {
			done = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
		} catch {
			/* storage unavailable — start with nothing ticked */
		}
	});

	function save() {
		try {
			localStorage.setItem(storageKey, JSON.stringify(done));
		} catch {
			/* ticking still works for this visit */
		}
	}

	function toggle(id: string) {
		done[id] = !done[id];
		save();
	}

	function clearAll() {
		done = {};
		save();
	}

	const bold = (text: string) =>
		text.split(/\*\*(.+?)\*\*/g).map((t, i) => ({ t, strong: i % 2 === 1 }));

	// Number steps continuously across parts.
	const offsets = $derived(
		parts.map((_, i) => parts.slice(0, i).reduce((n, p) => n + p.steps.length, 0))
	);
</script>

<svelte:head>
	<title>{title} — Help</title>
</svelte:head>

<a href="/admin/help" class="text-sm font-semibold text-ink-soft hover:text-ink">&larr; All help</a>

<div class="mt-4 max-w-2xl">
	<h1 class="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
	<p class="mt-2 text-lg text-ink-soft">{intro}</p>

	<p class="mt-4 text-base text-ink-soft">
		When you&rsquo;ve finished a step, please press the circle beside it to tick it off.
	</p>
	<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-base">
		<p class="font-semibold text-ink" aria-live="polite">
			{doneCount} of {total} steps done{doneCount === total ? ' — all finished!' : ''}
		</p>
		{#if doneCount > 0}
			<button type="button" onclick={clearAll} class="text-pink-deep hover:underline">
				Clear ticks
			</button>
		{/if}
	</div>

	{#each notes as note (note.heading)}
		<section class="mt-6 rounded-xl bg-blush px-5 py-4 text-base leading-relaxed text-ink">
			<p class="font-semibold">{note.heading}</p>
			<ul class="mt-2 list-disc space-y-1 pl-5">
				{#each note.items as item (item)}
					<li>
						{#each bold(item) as seg, i (i)}{#if seg.strong}<strong>{seg.t}</strong
								>{:else}{seg.t}{/if}{/each}
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	{#each parts as part, pi (part.heading)}
		<h2 class="mt-12 font-display text-2xl text-ink">{part.heading}</h2>
		<ol class="mt-6 space-y-7">
			{#each part.steps as step, si (si)}
				{@const id = `s${offsets[pi] + si + 1}`}
				{@const n = offsets[pi] + si + 1}
				<li class="flex gap-4">
					<button
						type="button"
						onclick={() => toggle(id)}
						aria-pressed={!!done[id]}
						aria-label={`Step ${n}: ${done[id] ? 'done, press to untick' : 'press when done'}`}
						class="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-base font-bold transition-colors {done[
							id
						]
							? 'border-green-600 bg-green-600 text-white'
							: 'border-pink bg-pink-deep text-cream hover:bg-pink-darker'}"
					>
						{#if done[id]}
							<svg
								viewBox="0 0 20 20"
								class="h-5 w-5"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								aria-hidden="true"
							>
								<path d="M4 10.5l4 4 8-9" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{:else}
							{n}
						{/if}
					</button>
					<div class="min-w-0 flex-1">
						<p class="pt-1 text-lg leading-relaxed text-ink">
							{#each bold(step.text) as seg, i (i)}{#if seg.strong}<strong>{seg.t}</strong
									>{:else}{seg.t}{/if}{/each}
						</p>
						{#if step.detail}
							<p class="mt-2 text-base leading-relaxed text-ink-soft">
								{#each bold(step.detail) as seg, i (i)}{#if seg.strong}<strong>{seg.t}</strong
										>{:else}{seg.t}{/if}{/each}
							</p>
						{/if}
						{#if step.link}
							<a
								href={step.link.href}
								target="_blank"
								rel="noreferrer"
								class="mt-2 inline-block text-base font-semibold text-pink-deep underline hover:text-pink"
							>
								{step.link.label} &#8599;
							</a>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	{/each}

	{#if after}
		<section class="mt-10 rounded-2xl border border-ink/10 bg-white/60 p-5">
			<h2 class="text-base font-semibold text-ink">{after.heading}</h2>
			<ul class="mt-2 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				{#each after.items as item (item)}
					<li>
						{#each bold(item) as seg, i (i)}{#if seg.strong}<strong>{seg.t}</strong
								>{:else}{seg.t}{/if}{/each}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<GuideFooter {title} />
</div>
