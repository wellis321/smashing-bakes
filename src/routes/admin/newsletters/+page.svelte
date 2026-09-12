<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function formatDate(iso: string | Date | null) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
		<h1 class="font-display text-3xl text-ink">Newsletters</h1>
		<p class="text-ink-soft mt-1 max-w-lg text-sm">
			Compose and send a newsletter to your <strong>{data.audienceCount}</strong> subscriber{data.audienceCount === 1 ? '' : 's'}
			(newsletter sign-ups plus customer accounts opted into marketing).
		</p>
	</div>
	<a
		href="/admin/newsletters/new"
		class="bg-pink hover:bg-pink-deep shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-cream transition-colors"
	>
		+ New newsletter
	</a>
</div>

{#if form?.message}
	<p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
{/if}

<div class="border-ink/10 mt-6 divide-y divide-ink/10 rounded-2xl border bg-white/60">
	{#if data.newsletters.length === 0}
		<p class="text-ink-soft px-4 py-8 text-center text-sm">No newsletters yet — create your first one.</p>
	{/if}
	{#each data.newsletters as newsletter (newsletter.id)}
		<div class="flex flex-wrap items-center gap-3 px-4 py-3">
			<a href={`/admin/newsletters/${newsletter.id}/edit`} class="min-w-0 flex-1">
				<p class="text-ink truncate text-sm font-medium">{newsletter.subject}</p>
				<p class="text-ink-soft truncate text-xs">{newsletter.heading}</p>
			</a>
			<span class={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClasses[newsletter.status]}`}>
				{newsletter.status}
			</span>
			<span class="text-ink-soft shrink-0 text-xs">
				{#if newsletter.status === 'sent'}
					Sent {formatDate(newsletter.sentAt)} &middot; {newsletter.recipientCount ?? 0} recipients
				{:else if newsletter.status === 'scheduled'}
					Scheduled for {formatDate(newsletter.scheduledFor)}
				{:else}
					Created {formatDate(newsletter.createdAt)}
				{/if}
			</span>
			<a href={`/admin/newsletters/${newsletter.id}/edit`} class="text-ink-soft hover:text-ink shrink-0 text-sm">Edit</a>
			{#if newsletter.status !== 'sent'}
				<form method="POST" action="?/delete" use:enhance onsubmit={(e) => confirmDelete(e, newsletter.subject)}>
					<input type="hidden" name="id" value={newsletter.id} />
					<button type="submit" class="shrink-0 text-sm text-red-600/70 hover:text-red-600">Delete</button>
				</form>
			{/if}
		</div>
	{/each}
</div>
