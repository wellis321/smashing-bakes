<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function formatDate(iso: string | Date) {
		return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	// Day + month only — what matters for a birthday perk is the date it recurs
	// on each year, not which year they were born.
	function formatBirthday(iso: string) {
		return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}

	function confirmDelete(event: SubmitEvent, email: string) {
		if (!confirm(`Remove "${email}" from the list? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Subscribers — Admin</title>
</svelte:head>

<div class="flex flex-wrap items-start justify-between gap-4">
	<div>
		<h1 class="font-display text-3xl text-ink">Subscribers</h1>
		<p class="text-ink-soft mt-1 text-sm">
			Everyone who's signed up for specials and offers. Welcome offer: <strong>{data.welcomeOffer.code}</strong>
			&mdash; {data.welcomeOffer.description}. <a href="/admin/settings" class="hover:underline">Change it</a>
		</p>
	</div>
	<a
		href="/admin/subscribers/export"
		class="border-ink/10 text-ink-soft hover:text-ink shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
	>
		Export CSV
	</a>
</div>

{#if form?.message}
	<p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
{/if}

<p class="text-ink mt-6 text-sm">
	<span class="font-semibold">{data.subscribers.length}</span> subscriber{data.subscribers.length === 1 ? '' : 's'}
</p>

<div class="border-ink/10 mt-4 divide-y divide-ink/10 rounded-2xl border bg-white/60">
	{#if data.subscribers.length === 0}
		<p class="text-ink-soft px-4 py-8 text-center text-sm">No subscribers yet.</p>
	{/if}
	{#each data.subscribers as subscriber (subscriber.id)}
		<div class="flex flex-wrap items-center gap-3 px-4 py-3">
			<div class="min-w-0 flex-1">
				<p class="text-ink truncate text-sm font-medium">{subscriber.name || subscriber.email}</p>
				{#if subscriber.name}
					<p class="text-ink-soft truncate text-xs">{subscriber.email}</p>
				{/if}
			</div>
			{#if subscriber.source}
				<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs">{subscriber.source}</span>
			{/if}
			{#if subscriber.birthday}
				<span class="bg-gold/20 text-gold-deep shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
					🎂 {formatBirthday(subscriber.birthday)}
				</span>
			{/if}
			<span class="text-ink-soft shrink-0 text-xs">{formatDate(subscriber.subscribedAt)}</span>
			<form method="POST" action="?/toggleRedeemed" use:enhance>
				<input type="hidden" name="id" value={subscriber.id} />
				<input type="hidden" name="nextValue" value={(!subscriber.welcomeCodeRedeemedAt).toString()} />
				<button
					type="submit"
					class={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
						subscriber.welcomeCodeRedeemedAt ? 'bg-pink/10 text-pink-deep' : 'bg-ink/5 text-ink-soft'
					}`}
				>
					{subscriber.welcomeCodeRedeemedAt ? 'Offer redeemed' : 'Mark redeemed'}
				</button>
			</form>
			<form method="POST" action="?/delete" use:enhance onsubmit={(e) => confirmDelete(e, subscriber.email)}>
				<input type="hidden" name="id" value={subscriber.id} />
				<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Remove</button>
			</form>
		</div>
	{/each}
</div>
