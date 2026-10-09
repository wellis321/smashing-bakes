<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function formatDate(iso: string | Date) {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	// Day + month only — what matters for a birthday perk is the date it recurs
	// on each year, not which year they were born.
	function formatBirthday(iso: string) {
		return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short'
		});
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
		<div class="flex items-center gap-2">
			<h1 class="font-display text-3xl text-ink">Subscribers</h1>
			<HelpLink section="subscribers" task="subscribers" />
		</div>
		<p class="mt-1 text-sm text-ink-soft">
			Everyone who's signed up for specials and offers. Welcome offer: <strong
				>{data.welcomeOffer.code}</strong
			>
			&mdash; {data.welcomeOffer.description}.
			<a href="/admin/settings" class="hover:underline">Change it</a>
		</p>
	</div>
	<a
		href="/admin/subscribers/export"
		class="shrink-0 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
	>
		Export CSV
	</a>
</div>

{#if form?.message}
	<p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
{/if}

<p class="mt-6 text-sm text-ink">
	<span class="font-semibold">{data.subscribers.length}</span> subscriber{data.subscribers
		.length === 1
		? ''
		: 's'}
</p>

<div class="mt-4 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/60">
	{#if data.subscribers.length === 0}
		<p class="px-4 py-8 text-center text-sm text-ink-soft">No subscribers yet.</p>
	{/if}
	{#each data.subscribers as subscriber (subscriber.id)}
		<div class="flex flex-wrap items-center gap-3 px-4 py-3">
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium text-ink">{subscriber.name || subscriber.email}</p>
				{#if subscriber.name}
					<p class="truncate text-xs text-ink-soft">{subscriber.email}</p>
				{/if}
			</div>
			{#if subscriber.source}
				<span class="shrink-0 rounded-full bg-ink/5 px-2.5 py-0.5 text-xs text-ink-soft"
					>{subscriber.source}</span
				>
			{/if}
			{#if subscriber.birthday}
				<span
					class="shrink-0 rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-semibold text-gold-deep"
				>
					🎂 {formatBirthday(subscriber.birthday)}
				</span>
			{/if}
			<span class="shrink-0 text-xs text-ink-soft">{formatDate(subscriber.subscribedAt)}</span>
			<form method="POST" action="?/toggleRedeemed" use:enhance>
				<input type="hidden" name="id" value={subscriber.id} />
				<input
					type="hidden"
					name="nextValue"
					value={(!subscriber.welcomeCodeRedeemedAt).toString()}
				/>
				<button
					type="submit"
					class={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
						subscriber.welcomeCodeRedeemedAt
							? 'bg-pink/10 text-pink-deep'
							: 'bg-ink/5 text-ink-soft'
					}`}
				>
					{subscriber.welcomeCodeRedeemedAt ? 'Offer redeemed' : 'Mark redeemed'}
				</button>
			</form>
			<form
				method="POST"
				action="?/delete"
				use:enhance
				onsubmit={(e) => confirmDelete(e, subscriber.email)}
			>
				<input type="hidden" name="id" value={subscriber.id} />
				<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Remove</button>
			</form>
		</div>
	{/each}
</div>
