<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statuses = [
		{ value: 'new', label: 'New', badge: 'bg-pink-deep text-cream' },
		{ value: 'working', label: 'Working on it', badge: 'bg-gold/40 text-ink' },
		{ value: 'resolved', label: 'Resolved', badge: 'bg-green-100 text-green-800' },
		{ value: 'parked', label: 'Not doing', badge: 'bg-ink/10 text-ink-soft' }
	] as const;

	// "open" = anything still needing attention.
	let filter = $state<'open' | 'all' | (typeof statuses)[number]['value']>('open');

	const counts = $derived({
		open: data.items.filter((i) => i.status === 'new' || i.status === 'working').length,
		all: data.items.length,
		...Object.fromEntries(
			statuses.map((s) => [s.value, data.items.filter((i) => i.status === s.value).length])
		)
	} as Record<string, number>);

	const shown = $derived(
		data.items.filter((i) =>
			filter === 'all'
				? true
				: filter === 'open'
					? i.status === 'new' || i.status === 'working'
					: i.status === filter
		)
	);

	const tabs = $derived([
		{ value: 'open', label: 'Open' },
		...statuses.map((s) => ({ value: s.value, label: s.label })),
		{ value: 'all', label: 'All' }
	] as { value: typeof filter; label: string }[]);

	function formatDate(date: string | Date) {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	}

	function confirmDelete(event: SubmitEvent) {
		if (!confirm("Delete this feedback? This can't be undone.")) event.preventDefault();
	}
</script>

<svelte:head>
	<title>Feedback — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Feedback</h1>
<p class="mt-2 max-w-lg text-sm text-ink-soft">
	Sent from the Feedback button on every admin page. Each one shows which page it was about.
</p>

<div class="mt-6 flex flex-wrap gap-2" role="tablist">
	{#each tabs as tab (tab.value)}
		<button
			type="button"
			role="tab"
			aria-selected={filter === tab.value}
			onclick={() => (filter = tab.value)}
			class="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors {filter === tab.value
				? 'bg-ink text-cream'
				: 'bg-white/70 text-ink-soft hover:text-ink'}"
		>
			{tab.label} <span class="opacity-70">{counts[tab.value]}</span>
		</button>
	{/each}
</div>

{#if shown.length === 0}
	<p class="mt-10 text-ink-soft">
		{filter === 'open' ? 'Nothing waiting — all caught up.' : 'Nothing here.'}
	</p>
{:else}
	<div class="mt-6 space-y-4">
		{#each shown as item (item.id)}
			{@const current = statuses.find((s) => s.value === item.status)!}
			<div class="rounded-xl border border-ink/10 bg-white/60 p-4">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<span class="rounded-full px-3 py-1 text-xs font-bold {current.badge}">
						{current.label}
					</span>
					<p class="text-xs text-ink-soft">
						{item.staffName} &middot; {formatDate(item.createdAt)}
					</p>
				</div>

				<p class="mt-3 text-base leading-relaxed whitespace-pre-wrap text-ink">{item.message}</p>

				<p class="mt-3 text-sm text-ink-soft">
					About:
					<a href={item.pagePath} class="font-semibold break-all text-pink-deep hover:underline">
						{item.pagePath}
					</a>
				</p>

				<form
					method="POST"
					action="?/update"
					use:enhance={() =>
						async ({ update }) =>
							update({ reset: false })}
					class="mt-4 space-y-3"
				>
					<input type="hidden" name="id" value={item.id} />
					<label class="block text-sm text-ink-soft">
						Note (optional, e.g. what was done)
						<textarea
							name="note"
							rows="2"
							maxlength="3000"
							class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-base text-ink outline-none focus:ring-2 focus:ring-pink/40"
							>{item.note ?? ''}</textarea
						>
					</label>
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-sm text-ink-soft">Set as:</span>
						{#each statuses as s (s.value)}
							<button
								type="submit"
								name="status"
								value={s.value}
								class="rounded-full border px-3 py-1 text-sm font-semibold transition-colors {item.status ===
								s.value
									? 'border-ink bg-ink text-cream'
									: 'border-ink/15 text-ink-soft hover:border-ink/40 hover:text-ink'}"
							>
								{s.label}
							</button>
						{/each}
					</div>
				</form>

				<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-3">
					<input type="hidden" name="id" value={item.id} />
					<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
				</form>
			</div>
		{/each}
	</div>
{/if}
