<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const maxDaily = $derived(Math.max(1, ...(data.visitors?.daily.map((d) => d.visitors) ?? [1])));
	const topFunnel = $derived(Math.max(1, data.visitors?.funnel[0]?.visitors ?? 1));
	const pct = (part: number, whole: number) =>
		whole ? `${Math.round((part / whole) * 100)}%` : '–';
	const num = (n: number | null) => (n == null ? '–' : String(n));
	const changeText = (now: number, before: number) => {
		if (before === 0) return now === 0 ? 'no change' : 'new';
		const p = Math.round(((now - before) / before) * 100);
		return `${p > 0 ? '+' : ''}${p}%`;
	};
	const changeTone = (now: number, before: number) =>
		now > before ? 'text-green-700' : now < before ? 'text-red-700' : 'text-ink-soft';
</script>

<!-- Visitors -->
<h2 class="mt-6 font-display text-2xl text-ink">Visitors</h2>
{#if data.visitorsMissing}
	<p class="mt-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
		The visitor counter isn't set up yet. Please ask William to finish the database step, then
		reload.
	</p>
{:else if data.visitors}
	{@const v = data.visitors}
	<p class="mt-1 max-w-2xl text-sm text-ink-soft">
		The last 30 days compared with the 30 before. It counts real visitors only (not staff or search
		engine robots), uses no cookies and keeps no personal details. A "visit" is one person on one
		day.
	</p>
	{#if v.visits.now + v.visits.before === 0}
		<p class="mt-3 rounded-xl bg-blush px-4 py-3 text-sm text-ink">
			Counting has started. Numbers appear here after the first visitors, and fill in as days go by.
		</p>
	{/if}
	<div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each [{ label: 'Visits', now: v.visits.now, before: v.visits.before }, { label: 'Pages viewed', now: v.views.now, before: v.views.before }, { label: 'Orders placed', now: v.orders.now, before: v.orders.before }] as k (k.label)}
			<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
				<p class="text-sm font-semibold text-ink-soft">{k.label}</p>
				<p class="mt-1 font-display text-3xl text-ink">{k.now}</p>
				<p class="mt-1 text-sm {changeTone(k.now, k.before)}">
					{changeText(k.now, k.before)} <span class="text-ink-soft">(before: {k.before})</span>
				</p>
			</div>
		{/each}
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
			<p class="text-sm font-semibold text-ink-soft">Visitors who order</p>
			<p class="mt-1 font-display text-3xl text-ink">
				{v.conversion.now == null ? '–' : `${num(v.conversion.now)}%`}
			</p>
			<p class="mt-1 text-sm text-ink-soft">
				before: {v.conversion.before == null ? '–' : `${num(v.conversion.before)}%`}
			</p>
		</div>
	</div>

	<h3 class="mt-6 text-base font-semibold text-ink">Visits each day (last 30 days)</h3>
	<div
		class="mt-2 flex h-36 items-end gap-1 rounded-2xl border border-ink/10 bg-white/60 p-4"
		role="img"
		aria-label="Visits each day for the last 30 days"
	>
		{#each v.daily as d (d.day)}
			<div class="flex h-full flex-1 items-end" title={`${d.day}: ${d.visitors} visits`}>
				<div
					class="w-full rounded-t bg-pink-deep"
					style:height={`${Math.max(2, (d.visitors / maxDaily) * 100)}%`}
				></div>
			</div>
		{/each}
	</div>

	<div class="mt-6 grid gap-6 lg:grid-cols-2">
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
			<h3 class="text-base font-semibold text-ink">From visit to order</h3>
			<p class="mt-1 text-xs text-ink-soft">
				How far visitors get. The bar shows the share of everyone who visited the home page.
			</p>
			<ul class="mt-3 space-y-2">
				{#each v.funnel as step (step.name)}
					<li>
						<div class="flex justify-between text-sm">
							<span class="text-ink">{step.name}</span>
							<span class="font-semibold text-ink"
								>{step.visitors}
								<span class="font-normal text-ink-soft">({pct(step.visitors, topFunnel)})</span
								></span
							>
						</div>
						<div class="mt-1 h-2 rounded-full bg-ink/10">
							<div
								class="h-2 rounded-full bg-pink-deep"
								style:width={`${Math.min(100, (step.visitors / topFunnel) * 100)}%`}
							></div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
			<h3 class="text-base font-semibold text-ink">Where visitors come from</h3>
			{#if v.sources.length === 0}
				<p class="mt-2 text-sm text-ink-soft">Nothing counted yet.</p>
			{:else}
				<table class="mt-2 w-full text-sm">
					<tbody>
						{#each v.sources as s (s.name)}
							<tr class="border-t border-ink/10 first:border-0">
								<td class="py-1.5 text-ink">{s.name}</td>
								<td class="py-1.5 text-right font-semibold text-ink">{s.visitors}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
			{#if v.devices.length}
				<h3 class="mt-4 text-base font-semibold text-ink">What they use</h3>
				<table class="mt-1 w-full text-sm">
					<tbody>
						{#each v.devices as d (d.name)}
							<tr class="border-t border-ink/10 first:border-0">
								<td class="py-1.5 text-ink">{d.name}</td>
								<td class="py-1.5 text-right font-semibold text-ink">{d.visitors}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>

	<div class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-4">
		<h3 class="text-base font-semibold text-ink">Most viewed pages</h3>
		{#if v.pages.length === 0}
			<p class="mt-2 text-sm text-ink-soft">Nothing counted yet.</p>
		{:else}
			<table class="mt-2 w-full text-sm">
				<tbody>
					{#each v.pages as pg (pg.name)}
						<tr class="border-t border-ink/10 first:border-0">
							<td class="py-1.5 text-ink">{pg.name}</td>
							<td class="py-1.5 text-right font-semibold text-ink">{pg.views}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
{/if}
