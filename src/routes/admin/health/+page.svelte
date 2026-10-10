<script lang="ts">
	import { enhance, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatPence } from '$lib/utils/money';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type Kind = 'quick' | 'lighthouse-mobile' | 'lighthouse-desktop';
	let tab = $state<Kind>('quick');
	let quickRunning = $state(false);
	let lhRunning = $state(false);
	let lhProgress = $state('');
	let lhError = $state('');

	const kindLabels: Record<Kind, string> = {
		quick: 'Instant checks',
		'lighthouse-mobile': 'Google test: phone',
		'lighthouse-desktop': 'Google test: computer'
	};

	const scoreNames = $derived(
		tab === 'quick'
			? ([
					['performance', 'Speed'],
					['accessibility', 'Accessibility'],
					['seo', 'Search (SEO)'],
					['bestPractices', 'Site basics']
				] as const)
			: ([
					['performance', 'Speed'],
					['accessibility', 'Accessibility'],
					['seo', 'Search (SEO)'],
					['bestPractices', 'Best practice']
				] as const)
	);

	const history = $derived(data.history[tab] ?? []);
	const latest = $derived(data.latest[tab]);

	const tone = (score: number | null) =>
		score == null
			? 'bg-ink/5 text-ink-soft'
			: score >= 90
				? 'bg-green-100 text-green-900'
				: score >= 50
					? 'bg-amber-100 text-amber-900'
					: 'bg-red-100 text-red-800';

	function series(key: 'performance' | 'accessibility' | 'bestPractices' | 'seo') {
		return history.map((h) => h[key]).filter((v): v is number => v != null);
	}

	function delta(key: 'performance' | 'accessibility' | 'bestPractices' | 'seo') {
		const s = series(key);
		return s.length >= 2 ? s[s.length - 1] - s[s.length - 2] : null;
	}

	function spark(values: number[]) {
		if (values.length < 2) return '';
		const w = 120;
		const h = 36;
		return values
			.map(
				(v, i) =>
					`${(i / (values.length - 1)) * w},${h - (Math.max(0, Math.min(100, v)) / 100) * (h - 4) - 2}`
			)
			.join(' ');
	}

	const when = (iso: string) =>
		new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(iso));

	async function runLighthouse(strategy: 'mobile' | 'desktop') {
		lhRunning = true;
		lhError = '';
		const runId = crypto.randomUUID();
		const pages = data.pages.slice(0, 6);
		try {
			for (const [i, path] of pages.entries()) {
				lhProgress = `Testing ${path} (${i + 1} of ${pages.length}). Each page takes about 20–40 seconds.`;
				const body = new FormData();
				body.set('path', path);
				body.set('strategy', strategy);
				body.set('runId', runId);
				const res = await fetch('?/lighthouse', {
					method: 'POST',
					body,
					headers: { 'x-sveltekit-action': 'true' }
				});
				const result = deserialize(await res.text());
				if (result.type === 'failure') {
					lhError = String(
						(result.data as { message?: string } | undefined)?.message ?? 'A test did not finish.'
					);
				}
			}
			tab = strategy === 'desktop' ? 'lighthouse-desktop' : 'lighthouse-mobile';
			await invalidateAll();
		} finally {
			lhRunning = false;
			lhProgress = '';
		}
	}

	const maxWeekly = $derived(Math.max(1, ...(data.sales?.weekly.map((w) => w.revenue) ?? [1])));
	const changeText = (now: number, before: number) => {
		if (before === 0) return now === 0 ? 'no change' : 'new';
		const p = Math.round(((now - before) / before) * 100);
		return `${p > 0 ? '+' : ''}${p}%`;
	};
	const changeTone = (now: number, before: number) =>
		now > before ? 'text-green-700' : now < before ? 'text-red-700' : 'text-ink-soft';
</script>

<svelte:head>
	<title>Site health — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Site health</h1>
<p class="mt-2 max-w-2xl text-base text-ink-soft">
	Check how fast, accessible and findable the website is, and see how sales are going. Every test is
	saved, so you can watch the scores improve over time.
</p>

{#if data.tableMissing}
	<p class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
		The test history isn't set up yet. Please ask William to finish the database step, then reload
		this page.
	</p>
{/if}

<!-- Run the tests -->
<section class="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-5">
	<h2 class="text-lg font-semibold text-ink">Run the tests</h2>
	<div class="mt-3 grid gap-5 md:grid-cols-2">
		<div>
			<p class="text-base font-semibold text-ink">Instant checks</p>
			<p class="mt-1 text-sm leading-relaxed text-ink-soft">
				Looks at every key page the way a visitor and a search engine would: titles, headings,
				picture descriptions, speed, picture weight, security and more. Takes about 20 seconds and
				costs nothing.
			</p>
			<form
				method="POST"
				action="?/quick"
				class="mt-3"
				use:enhance={() => {
					quickRunning = true;
					return async ({ update }) => {
						await update();
						quickRunning = false;
						tab = 'quick';
					};
				}}
			>
				<button
					type="submit"
					disabled={quickRunning || lhRunning}
					class="rounded-full bg-pink-deep px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker disabled:opacity-60"
				>
					{quickRunning ? 'Checking… about 20 seconds' : 'Run instant checks'}
				</button>
			</form>
			{#if form?.message && !lhRunning}
				<p class="mt-2 text-sm text-red-700">{form.message}</p>
			{/if}
		</div>

		<div>
			<p class="text-base font-semibold text-ink">Google Lighthouse tests</p>
			{#if data.hasPageSpeedKey}
				<p class="mt-1 text-sm leading-relaxed text-ink-soft">
					The same speed, accessibility, best-practice and search tests Google uses. Each page takes
					a little while, so this runs one page at a time.
				</p>
				<div class="mt-3 flex flex-wrap gap-3">
					<button
						type="button"
						disabled={lhRunning || quickRunning}
						onclick={() => runLighthouse('mobile')}
						class="rounded-full bg-pink-deep px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker disabled:opacity-60"
					>
						Test on a phone
					</button>
					<button
						type="button"
						disabled={lhRunning || quickRunning}
						onclick={() => runLighthouse('desktop')}
						class="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-pink disabled:opacity-60"
					>
						Test on a computer
					</button>
				</div>
				{#if lhProgress}<p class="mt-2 text-sm text-ink-soft" aria-live="polite">
						{lhProgress}
					</p>{/if}
				{#if lhError}<p class="mt-2 text-sm text-red-700">Last problem: {lhError}</p>{/if}
			{:else}
				<p class="mt-1 text-sm leading-relaxed text-ink-soft">
					These need a free Google key, which takes about five minutes to set up.
				</p>
				<details class="mt-2 text-sm text-ink">
					<summary class="cursor-pointer font-semibold text-pink-deep">Show me how</summary>
					<ol class="mt-2 list-decimal space-y-1 pl-5 text-ink-soft">
						<li>Go to console.cloud.google.com and sign in with a Google account.</li>
						<li>
							Create a project (call it “Smashin Bakes”), then open <strong
								>APIs &amp; Services</strong
							>.
						</li>
						<li>
							Search for <strong>PageSpeed Insights API</strong> and press <strong>Enable</strong>.
						</li>
						<li>
							Open <strong>Credentials</strong>, press <strong>Create credentials</strong> and
							choose <strong>API key</strong>.
						</li>
						<li>
							Send the key to William the same safe way as the SumUp key. He adds it to the hosting
							settings as <code>PAGESPEED_API_KEY</code>, and these buttons appear.
						</li>
					</ol>
				</details>
			{/if}
		</div>
	</div>
</section>

<!-- Scores over time -->
<div class="mt-8 flex flex-wrap gap-2" role="tablist">
	{#each Object.entries(kindLabels) as [kind, label] (kind)}
		<button
			type="button"
			role="tab"
			aria-selected={tab === kind}
			onclick={() => (tab = kind as Kind)}
			class="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors {tab === kind
				? 'bg-ink text-cream'
				: 'bg-white/70 text-ink-soft hover:text-ink'}"
		>
			{label}
		</button>
	{/each}
</div>

{#if !latest}
	<p class="mt-6 text-base text-ink-soft">
		No results yet for this test. Press the matching button above to run it.
	</p>
{:else}
	<p class="mt-4 text-sm text-ink-soft">
		Latest run: {when(latest.at)}. {history.length} run{history.length === 1 ? '' : 's'} saved.
	</p>

	<div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each scoreNames as [key, label] (key)}
			{@const values = series(key)}
			{@const last = values[values.length - 1] ?? null}
			{@const d = delta(key)}
			<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
				<p class="text-sm font-semibold text-ink-soft">{label}</p>
				<div class="mt-1 flex items-baseline gap-2">
					<span class="rounded-lg px-2 py-0.5 font-display text-3xl {tone(last)}"
						>{last ?? '—'}</span
					>
					{#if d != null && d !== 0}
						<span class="text-sm font-semibold {d > 0 ? 'text-green-700' : 'text-red-700'}">
							{d > 0 ? '▲' : '▼'}
							{Math.abs(d)} since last time
						</span>
					{/if}
				</div>
				{#if values.length >= 2}
					<svg
						viewBox="0 0 120 36"
						class="mt-2 h-9 w-full"
						role="img"
						aria-label={`${label} over time`}
					>
						<polyline
							points={spark(values)}
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class="text-pink-deep"
						/>
					</svg>
				{:else}
					<p class="mt-2 text-xs text-ink-soft">Run it again later to start the graph.</p>
				{/if}
			</div>
		{/each}
	</div>

	<h2 class="mt-8 font-display text-2xl text-ink">Page by page</h2>
	<div class="mt-3 overflow-x-auto rounded-2xl border border-ink/10 bg-white/60">
		<table class="w-full text-left text-sm">
			<thead class="bg-cream-dim text-xs tracking-widest text-ink-soft uppercase">
				<tr>
					<th class="px-4 py-2 font-semibold">Page</th>
					{#each scoreNames as [, label] (label)}
						<th class="px-3 py-2 font-semibold">{label}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each latest.rows as row (row.url)}
					<tr class="border-t border-ink/10 align-top">
						<td class="px-4 py-3">
							<p class="font-semibold text-ink">{row.url}</p>
							{#if row.metrics}
								<p class="mt-0.5 text-xs text-ink-soft">
									{#if 'totalMs' in row.metrics}
										Loads in {(row.metrics.totalMs / 1000).toFixed(1)}s · pictures {row.metrics
											.imageKb} KB
									{:else if 'lcpMs' in row.metrics}
										Main picture/text in {(row.metrics.lcpMs / 1000).toFixed(1)}s · page weight {row
											.metrics.totalKb} KB
									{/if}
								</p>
							{/if}
							{#if row.error}
								<p class="mt-1 text-xs text-red-700">Could not be tested: {row.error}</p>
							{:else if row.details.length > 0}
								<details class="mt-1">
									<summary class="cursor-pointer text-xs font-semibold text-pink-deep">
										{row.details.length} thing{row.details.length === 1 ? '' : 's'} to improve
									</summary>
									<ul class="mt-1 list-disc space-y-0.5 pl-5 text-xs text-ink-soft">
										{#each row.details as d, i (i)}
											<li>{d.label}{d.detail ? ` — ${d.detail}` : ''}</li>
										{/each}
									</ul>
								</details>
							{:else}
								<p class="mt-1 text-xs text-green-800">Nothing to fix.</p>
							{/if}
						</td>
						{#each scoreNames as [key] (key)}
							<td class="px-3 py-3">
								<span
									class="inline-block min-w-10 rounded-md px-2 py-0.5 text-center font-semibold {tone(
										row[key]
									)}"
								>
									{row[key] ?? '—'}
								</span>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="mt-2 text-xs text-ink-soft">
		90 and above is good, 50–89 could be better, under 50 needs attention.
	</p>
{/if}

<!-- Sales -->
<h2 class="mt-12 font-display text-2xl text-ink">Sales and growth</h2>
{#if data.sales}
	<p class="mt-1 text-sm text-ink-soft">
		The last 30 days compared with the 30 days before. Cancelled orders are left out.
	</p>
	<div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.sales.periods as p (p.label)}
			<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
				<p class="text-sm font-semibold text-ink-soft">{p.label}</p>
				<p class="mt-1 font-display text-3xl text-ink">{p.money ? formatPence(p.now) : p.now}</p>
				<p class="mt-1 text-sm {changeTone(p.now, p.before)}">
					{changeText(p.now, p.before)}
					<span class="text-ink-soft">
						(before: {p.money ? formatPence(p.before) : p.before})
					</span>
				</p>
			</div>
		{/each}
	</div>

	<h3 class="mt-6 text-base font-semibold text-ink">Sales each week (last 12 weeks)</h3>
	<div
		class="mt-2 flex h-40 items-end gap-1.5 rounded-2xl border border-ink/10 bg-white/60 p-4"
		role="img"
		aria-label="Weekly sales for the last 12 weeks"
	>
		{#each data.sales.weekly as w (w.weekStart)}
			<div
				class="flex flex-1 flex-col items-center justify-end gap-1"
				title={`Week of ${w.weekStart}: ${formatPence(w.revenue)} from ${w.orders} orders`}
			>
				<div
					class="w-full rounded-t bg-pink-deep"
					style:height={`${Math.max(2, (w.revenue / maxWeekly) * 100)}%`}
				></div>
			</div>
		{/each}
	</div>
	<p class="mt-1 text-xs text-ink-soft">Hover a bar for that week's total.</p>

	<div class="mt-6 grid gap-6 lg:grid-cols-2">
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
			<h3 class="text-base font-semibold text-ink">Best sellers (last 30 days)</h3>
			{#if data.sales.topProducts.length === 0}
				<p class="mt-2 text-sm text-ink-soft">No orders in the last 30 days yet.</p>
			{:else}
				<table class="mt-2 w-full text-sm">
					<tbody>
						{#each data.sales.topProducts as t (t.name)}
							<tr class="border-t border-ink/10 first:border-0">
								<td class="py-2 pr-2 text-ink">{t.name}</td>
								<td class="py-2 text-right text-ink-soft">{t.quantity} sold</td>
								<td class="py-2 pl-3 text-right font-semibold text-ink">{formatPence(t.revenue)}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
			<h3 class="text-base font-semibold text-ink">Since the start</h3>
			<ul class="mt-2 space-y-1 text-sm text-ink-soft">
				<li>
					<strong class="text-ink">{data.sales.totals.orders}</strong> orders worth
					<strong class="text-ink">{formatPence(data.sales.totals.revenue)}</strong>
				</li>
				<li>
					{#if data.sales.repeatRate != null}
						<strong class="text-ink">{data.sales.repeatRate}%</strong> of customers have ordered more
						than once
					{:else}
						No repeat-customer figure yet
					{/if}
				</li>
			</ul>
		</div>
	</div>
{:else}
	<p class="mt-2 text-sm text-ink-soft">The sales figures could not be loaded just now.</p>
{/if}

<p class="mt-10 max-w-2xl rounded-xl bg-blush px-4 py-3 text-sm leading-relaxed text-ink">
	<strong>Not here yet:</strong> how many people visit the site and what share of them buy. That needs
	a simple, privacy-friendly visitor counter, which I can add if you'd like it.
</p>
