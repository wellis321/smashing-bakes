<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
</script>

<!-- Improvement plan -->
<section class="mt-6" aria-labelledby="plan-heading">
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

{#if data.report}
	<div class="mt-4 flex flex-wrap items-center gap-3">
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
