<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function formatDate(iso: string | Date | null) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function confirmDelete(event: SubmitEvent, subject: string) {
		if (!confirm(`Delete "${subject}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}

	const statusClasses: Record<string, string> = {
		draft: 'bg-ink/5 text-ink-soft',
		scheduled: 'bg-gold/20 text-gold-deep',
		sent: 'bg-pink/10 text-pink-deep'
	};
</script>

<svelte:head>
	<title>Newsletters — Admin</title>
</svelte:head>

<div class="flex flex-wrap items-start justify-between gap-4">
	<div>
		<div class="flex items-center gap-2">
			<h1 class="font-display text-3xl text-ink">Newsletters</h1>
			<HelpLink section="newsletters" task="send-newsletter" />
		</div>
		<p class="mt-1 max-w-lg text-sm text-ink-soft">
			Compose and send a newsletter to your <strong>{data.audienceCount}</strong>
			subscriber{data.audienceCount === 1 ? '' : 's'}
			(newsletter sign-ups plus customer accounts opted into marketing).
		</p>
	</div>
	<a
		href="/admin/newsletters/new"
		class="shrink-0 rounded-full bg-pink-deep px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker"
	>
		+ New newsletter
	</a>
</div>

{#if form?.message}
	<p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
{/if}

<div class="mt-6 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/60">
	{#if data.newsletters.length === 0}
		<p class="px-4 py-8 text-center text-sm text-ink-soft">
			No newsletters yet — create your first one.
		</p>
	{/if}
	{#each data.newsletters as newsletter (newsletter.id)}
		<div class="flex flex-wrap items-center gap-3 px-4 py-3">
			<a href={`/admin/newsletters/${newsletter.id}/edit`} class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium text-ink">{newsletter.subject}</p>
				<p class="truncate text-xs text-ink-soft">{newsletter.heading}</p>
			</a>
			<span
				class={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClasses[newsletter.status]}`}
			>
				{newsletter.status}
			</span>
			<span class="shrink-0 text-xs text-ink-soft">
				{#if newsletter.status === 'sent'}
					Sent {formatDate(newsletter.sentAt)} &middot; {newsletter.recipientCount ?? 0} recipients
				{:else if newsletter.status === 'scheduled'}
					Scheduled for {formatDate(newsletter.scheduledFor)}
				{:else}
					Created {formatDate(newsletter.createdAt)}
				{/if}
			</span>
			<a
				href={`/admin/newsletters/${newsletter.id}/edit`}
				class="shrink-0 text-sm text-ink-soft hover:text-ink">Edit</a
			>
			{#if newsletter.status !== 'sent'}
				<form
					method="POST"
					action="?/delete"
					use:enhance
					onsubmit={(e) => confirmDelete(e, newsletter.subject)}
				>
					<input type="hidden" name="id" value={newsletter.id} />
					<button type="submit" class="shrink-0 text-sm text-red-600/70 hover:text-red-600"
						>Delete</button
					>
				</form>
			{/if}
		</div>
	{/each}
</div>
