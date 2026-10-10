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
				body.set('last', String(i === pages.length - 1));
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

	// Copy a plain-text summary of every result, to paste to Claude.
	let copied = $state(false);
	async function copyReport() {
		try {
			await navigator.clipboard.writeText(data.report);
		} catch {
			const box = document.createElement('textarea');
			box.value = data.report;
			document.body.appendChild(box);
			box.select();
			document.execCommand('copy');
			box.remove();
		}
		copied = true;
		setTimeout(() => (copied = false), 3000);
	}

	// The improvement plan
	const staffTasks = $derived(
		data.tasks.filter((t) => t.who === 'staff' && (t.status === 'open' || t.status === 'working'))
	);
	const devTasks = $derived(
		data.tasks.filter((t) => t.who !== 'staff' && (t.status === 'open' || t.status === 'working'))
	);
	const fixedTasks = $derived(data.tasks.filter((t) => t.status === 'fixed').slice(0, 15));
	const ignoredTasks = $derived(data.tasks.filter((t) => t.status === 'ignored'));
	const pageLabel = (page: string) => (page === '(whole site)' ? 'Whole site' : page);
	const statusLabel: Record<string, string> = {
		open: 'To do',
		working: 'Being worked on',
		fixed: 'Fixed',
		ignored: 'Ignored'
	};

	const maxDaily = $derived(Math.max(1, ...(data.visitors?.daily.map((d) => d.visitors) ?? [1])));
	const topFunnel = $derived(Math.max(1, data.visitors?.funnel[0]?.visitors ?? 1));
	const pct = (part: number, whole: number) =>
		whole ? `${Math.round((part / whole) * 100)}%` : '–';
	const num = (n: number | null) => (n == null ? '–' : String(n));

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
	Check how fast, accessible and findable the website is, and see how orders are going. Every test
	is saved, so you can watch the scores improve over time.
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

<p class="mt-3 text-sm text-ink-soft">
	The instant checks also run <strong>by themselves every night</strong>, so the history and the
	plan below stay up to date without anyone pressing anything.
</p>
{#if data.report}
	<div class="mt-3 flex flex-wrap items-center gap-3">
		<button
			type="button"
			onclick={copyReport}
			class="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-pink"
		>
			{copied ? 'Copied — now paste it to Claude' : 'Copy this report for Claude'}
		</button>
		<span class="text-xs text-ink-soft"
			>One press copies every result and the to-do list as plain text.</span
		>
	</div>
{/if}

<!-- Improvement plan -->
<section class="mt-8" aria-labelledby="plan-heading">
	<h2 id="plan-heading" class="font-display text-2xl text-ink">Improvement plan</h2>
	{#if data.tasksMissing}
		<p class="mt-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
			The to-do list isn't set up yet. Please ask William to finish the database step, then reload.
		</p>
	{:else if data.tasks.length === 0}
		<p class="mt-2 text-sm text-ink-soft">
			Nothing to do yet. After the next test run, anything that needs improving is listed here, and
			each item ticks itself off when a later test shows it's fixed.
		</p>
	{:else}
		<p class="mt-1 text-sm text-ink-soft">
			Every problem the tests find becomes an item here. Items close themselves when a later test
			shows they're fixed, and come back if the problem returns.
		</p>

		{#snippet taskList(list: typeof data.tasks)}
			<ul class="space-y-3">
				{#each list as t (t.id)}
					<li class="rounded-2xl border border-ink/10 bg-white/60 p-4">
						<div class="flex flex-wrap items-start justify-between gap-2">
							<p class="min-w-0 flex-1 text-base font-semibold text-ink">{t.title}</p>
							<span
								class="rounded-full px-3 py-0.5 text-xs font-bold {t.status === 'working'
									? 'bg-amber-100 text-amber-900'
									: t.status === 'fixed'
										? 'bg-green-100 text-green-900'
										: t.status === 'ignored'
											? 'bg-ink/10 text-ink-soft'
											: 'bg-pink-deep text-cream'}">{statusLabel[t.status]}</span
							>
						</div>
						<p class="mt-0.5 text-xs text-ink-soft">
							On: {pageLabel(t.page)}{t.detail ? ` · ${t.detail}` : ''}
						</p>
						{#if t.howToFix}<p class="mt-2 text-sm text-ink">{t.howToFix}</p>{/if}
						{#if t.status !== 'fixed'}
							<form
								method="POST"
								action="?/setTask"
								use:enhance
								class="mt-3 flex flex-wrap items-center gap-2"
							>
								<input type="hidden" name="id" value={t.id} />
								<input
									name="note"
									value={t.note ?? ''}
									placeholder="Add a note (optional)"
									class="min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
								/>
								{#if t.status !== 'working'}
									<button
										type="submit"
										name="status"
										value="working"
										class="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink hover:border-pink"
										>Working on it</button
									>
								{/if}
								{#if t.status === 'ignored' || t.status === 'working'}
									<button
										type="submit"
										name="status"
										value="open"
										class="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink hover:border-pink"
										>Back to to-do</button
									>
								{/if}
								{#if t.status !== 'ignored'}
									<button
										type="submit"
										name="status"
										value="ignored"
										class="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink-soft hover:border-pink"
										>Ignore</button
									>
								{/if}
							</form>
						{:else if t.note}
							<p class="mt-2 text-xs text-ink-soft">Note: {t.note}</p>
						{/if}
					</li>
				{/each}
			</ul>
		{/snippet}

		<h3 class="mt-4 text-base font-semibold text-ink">
			You can sort these out ({staffTasks.length})
		</h3>
		<div class="mt-2">
			{#if staffTasks.length}{@render taskList(staffTasks)}{:else}<p class="text-sm text-ink-soft">
					Nothing for you right now.
				</p>{/if}
		</div>

		<h3 class="mt-6 text-base font-semibold text-ink">Needs William ({devTasks.length})</h3>
		<div class="mt-2">
			{#if devTasks.length}{@render taskList(devTasks)}{:else}<p class="text-sm text-ink-soft">
					Nothing waiting.
				</p>{/if}
		</div>

		{#if fixedTasks.length}
			<details class="mt-6">
				<summary class="cursor-pointer text-sm font-semibold text-green-800"
					>Recently fixed ({fixedTasks.length})</summary
				>
				<div class="mt-2">{@render taskList(fixedTasks)}</div>
			</details>
		{/if}
		{#if ignoredTasks.length}
			<details class="mt-3">
				<summary class="cursor-pointer text-sm font-semibold text-ink-soft"
					>Ignored ({ignoredTasks.length})</summary
				>
				<div class="mt-2">{@render taskList(ignoredTasks)}</div>
			</details>
		{/if}
	{/if}
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

<!-- Visitors -->
<h2 class="mt-12 font-display text-2xl text-ink">Visitors</h2>
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

<!-- Sales -->
<h2 class="mt-12 font-display text-2xl text-ink">Orders and growth</h2>
{#if data.sales}
	<p class="mt-1 text-sm text-ink-soft">
		The last 30 days compared with the 30 days before. These are orders placed on the website
		(cancelled ones are left out). Customers pay when they collect until online payment is switched
		on, so this is the value of orders, not money received.
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

	<h3 class="mt-6 text-base font-semibold text-ink">Value of orders each week (last 12 weeks)</h3>
	<div
		class="mt-2 flex h-40 items-end gap-1.5 rounded-2xl border border-ink/10 bg-white/60 p-4"
		role="img"
		aria-label="Weekly sales for the last 12 weeks"
	>
		{#each data.sales.weekly as w (w.weekStart)}
			<div
				class="flex h-full flex-1 flex-col items-center justify-end gap-1"
				title={`Week of ${w.weekStart}: ${formatPence(w.revenue)} from ${w.orders} orders`}
			>
				<div
					class="w-full rounded-t bg-pink-deep"
					style:height={`${Math.max(2, (w.revenue / maxWeekly) * 100)}%`}
				></div>
			</div>
		{/each}
	</div>
	<p class="mt-1 text-xs text-ink-soft">
		Hover a bar for that week's total value and number of orders.
	</p>

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
