<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPence } from '$lib/utils/money';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let running = $state(false);

	const when = (iso: string) =>
		new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(iso));

	const tone = (score: number | null) =>
		score == null
			? 'bg-ink/5 text-ink-soft'
			: score >= 90
				? 'bg-green-100 text-green-900'
				: score >= 50
					? 'bg-amber-100 text-amber-900'
					: 'bg-red-100 text-red-800';

	const scoreList = [
		['performance', 'Speed'],
		['accessibility', 'Accessibility'],
		['seo', 'Search (SEO)'],
		['bestPractices', 'Site basics']
	] as const;

	function last(key: (typeof scoreList)[number][0]) {
		const s = data.quickHistory.map((h) => h[key]).filter((v): v is number => v != null);
		return s[s.length - 1] ?? null;
	}
	function change(key: (typeof scoreList)[number][0]) {
		const s = data.quickHistory.map((h) => h[key]).filter((v): v is number => v != null);
		return s.length >= 2 ? s[s.length - 1] - s[s.length - 2] : null;
	}

	const changeText = (now: number, before: number) => {
		if (before === 0) return now === 0 ? 'no change' : 'new';
		const p = Math.round(((now - before) / before) * 100);
		return `${p > 0 ? '+' : ''}${p}%`;
	};
	const changeTone = (now: number, before: number) =>
		now > before ? 'text-green-700' : now < before ? 'text-red-700' : 'text-ink-soft';

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
</script>

{#if data.tableMissing}
	<p class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
		The test history isn't set up yet. Please ask William to finish the database step, then reload.
	</p>
{/if}

<!-- How the website is doing -->
<section class="mt-6" aria-labelledby="quality-heading">
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<h2 id="quality-heading" class="font-display text-2xl text-ink">How the website is doing</h2>
		<a href="/admin/health/quality" class="text-sm font-semibold text-pink-deep hover:underline"
			>Details &rarr;</a
		>
	</div>
	{#if data.quickLatest}
		<p class="mt-1 text-sm text-ink-soft">
			Instant checks, last run {when(data.quickLatest.at)}. They also run by themselves every night.
		</p>
		<div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each scoreList as [key, label] (key)}
				{@const value = last(key)}
				{@const d = change(key)}
				<a
					href="/admin/health/quality"
					class="rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-pink"
				>
					<p class="text-sm font-semibold text-ink-soft">{label}</p>
					<div class="mt-1 flex items-baseline gap-2">
						<span class="rounded-lg px-2 py-0.5 font-display text-3xl {tone(value)}"
							>{value ?? '—'}</span
						>
						{#if d != null && d !== 0}
							<span class="text-sm font-semibold {d > 0 ? 'text-green-700' : 'text-red-700'}">
								{d > 0 ? '▲' : '▼'}
								{Math.abs(d)}
							</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
		{#if data.lighthouseMobile || data.lighthouseDesktop}
			<p class="mt-3 text-sm text-ink-soft">
				Google's tests, last run:
				{#if data.lighthouseMobile}
					<strong class="text-ink">phone</strong>: speed {data.lighthouseMobile.performance ?? '–'},
					accessibility {data.lighthouseMobile.accessibility ?? '–'}, search {data.lighthouseMobile
						.seo ?? '–'}.
				{/if}
				{#if data.lighthouseDesktop}
					<strong class="text-ink">computer</strong>: speed {data.lighthouseDesktop.performance ??
						'–'}, accessibility {data.lighthouseDesktop.accessibility ?? '–'}, search {data
						.lighthouseDesktop.seo ?? '–'}.
				{/if}
			</p>
		{/if}
	{:else if !data.tableMissing}
		<p class="mt-2 text-sm text-ink-soft">
			No results yet. Press the button below to run the first checks.
		</p>
	{/if}

	<div class="mt-4 flex flex-wrap items-center gap-3">
		<form
			method="POST"
			action="/admin/health/quality?/quick"
			use:enhance={() => {
				running = true;
				return async ({ update }) => {
					await update();
					running = false;
				};
			}}
		>
			<button
				type="submit"
				disabled={running}
				class="rounded-full bg-pink-deep px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker disabled:opacity-60"
			>
				{running ? 'Checking… about 20 seconds' : 'Run instant checks now'}
			</button>
		</form>
		{#if data.report}
			<button
				type="button"
				onclick={copyReport}
				class="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-pink"
			>
				{copied ? 'Copied — now paste it to Claude' : 'Copy this report for Claude'}
			</button>
		{/if}
	</div>
</section>

<!-- Things to do -->
<section class="mt-10" aria-labelledby="todo-heading">
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<h2 id="todo-heading" class="font-display text-2xl text-ink">Things to do</h2>
		<a href="/admin/health/plan" class="text-sm font-semibold text-pink-deep hover:underline"
			>To-do list &rarr;</a
		>
	</div>
	{#if data.tasksMissing}
		<p class="mt-2 text-sm text-ink-soft">The to-do list isn't set up yet.</p>
	{:else if data.openStaff + data.openDeveloper === 0}
		<p class="mt-2 text-base text-green-800">Nothing needs doing right now.</p>
	{:else}
		<div class="mt-3 grid gap-4 sm:grid-cols-2">
			<a
				href="/admin/health/plan"
				class="rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-pink"
			>
				<p class="text-sm font-semibold text-ink-soft">You can sort these out</p>
				<p class="mt-1 font-display text-3xl text-ink">{data.openStaff}</p>
			</a>
			<a
				href="/admin/health/plan"
				class="rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-pink"
			>
				<p class="text-sm font-semibold text-ink-soft">Needs William</p>
				<p class="mt-1 font-display text-3xl text-ink">{data.openDeveloper}</p>
			</a>
		</div>
	{/if}
</section>

<!-- Visitors and orders -->
<section class="mt-10" aria-labelledby="business-heading">
	<h2 id="business-heading" class="font-display text-2xl text-ink">The last 30 days</h2>
	<div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#if data.visitors}
			<a
				href="/admin/health/visitors"
				class="rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-pink"
			>
				<p class="text-sm font-semibold text-ink-soft">Visits</p>
				<p class="mt-1 font-display text-3xl text-ink">{data.visitors.visits.now}</p>
				<p class="mt-1 text-sm {changeTone(data.visitors.visits.now, data.visitors.visits.before)}">
					{changeText(data.visitors.visits.now, data.visitors.visits.before)}
				</p>
			</a>
		{/if}
		{#if data.sales}
			{@const orders = data.sales.periods.find((p) => p.label === 'Orders')}
			{@const value = data.sales.periods.find((p) => p.label === 'Value of orders placed')}
			{#if orders}
				<a
					href="/admin/health/orders"
					class="rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-pink"
				>
					<p class="text-sm font-semibold text-ink-soft">Orders</p>
					<p class="mt-1 font-display text-3xl text-ink">{orders.now}</p>
					<p class="mt-1 text-sm {changeTone(orders.now, orders.before)}">
						{changeText(orders.now, orders.before)}
					</p>
				</a>
			{/if}
			{#if value}
				<a
					href="/admin/health/orders"
					class="rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-pink"
				>
					<p class="text-sm font-semibold text-ink-soft">Value of orders</p>
					<p class="mt-1 font-display text-3xl text-ink">{formatPence(value.now)}</p>
					<p class="mt-1 text-sm {changeTone(value.now, value.before)}">
						{changeText(value.now, value.before)}
					</p>
				</a>
			{/if}
		{/if}
		{#if data.visitors}
			<a
				href="/admin/health/visitors"
				class="rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-pink"
			>
				<p class="text-sm font-semibold text-ink-soft">Visitors who order</p>
				<p class="mt-1 font-display text-3xl text-ink">
					{data.visitors.conversion.now == null ? '–' : `${data.visitors.conversion.now}%`}
				</p>
			</a>
		{/if}
	</div>
</section>
