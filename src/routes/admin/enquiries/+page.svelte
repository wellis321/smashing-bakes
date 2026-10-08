<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(date: string | Date) {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	}

	function confirmDelete(event: SubmitEvent, name: string) {
		if (!confirm(`Delete the enquiry from ${name}? This can't be undone.`)) {
			event.preventDefault();
		}
	}

	const statusLabels = { new: 'New', contacted: 'Contacted', archived: 'Archived' } as const;
</script>

<svelte:head>
	<title>Enquiries — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-2">
		<h1 class="font-display text-3xl text-ink">Bespoke order enquiries</h1>
		<HelpLink section="enquiries" />
	</div>
	<a href="/admin/subscribers" class="text-sm text-ink-soft hover:text-ink">
		{data.subscriberCount} newsletter subscriber{data.subscriberCount === 1 ? '' : 's'} &rarr;
	</a>
</div>
<p class="mt-2 max-w-lg text-sm text-ink-soft">
	Submissions from the "Bespoke order" form on the contact page.
</p>

{#if data.enquiries.length === 0}
	<p class="mt-10 text-ink-soft">No enquiries yet.</p>
{:else}
	<div class="mt-6 space-y-3">
		{#each data.enquiries as enquiry (enquiry.id)}
			<div class="rounded-xl border border-ink/10 bg-white/60 p-4">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="font-medium text-ink">
							{enquiry.name}
							{#if enquiry.wantsNewsletter}
								<span class="ml-1 text-xs font-semibold text-pink-deep uppercase"
									>&middot; subscribed</span
								>
							{/if}
						</p>
						<p class="text-xs text-ink-soft">{formatDate(enquiry.createdAt)}</p>
					</div>

					<form method="POST" action="?/setStatus" use:enhance>
						<input type="hidden" name="id" value={enquiry.id} />
						<select
							name="status"
							value={enquiry.status}
							onchange={(e) => e.currentTarget.form?.requestSubmit()}
							class={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${
								enquiry.status === 'new'
									? 'bg-pink/15 text-pink-deep'
									: enquiry.status === 'contacted'
										? 'bg-ink/10 text-ink'
										: 'bg-ink/5 text-ink-soft'
							}`}
						>
							{#each Object.entries(statusLabels) as [value, label] (value)}
								<option {value} selected={enquiry.status === value}>{label}</option>
							{/each}
						</select>
					</form>
				</div>

				<p class="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
					{enquiry.details}
				</p>

				<div class="mt-3 flex flex-wrap items-center gap-4 text-sm">
					<a href={`mailto:${enquiry.email}`} class="font-semibold text-pink-deep hover:underline"
						>{enquiry.email}</a
					>
					{#if enquiry.phone}
						<a href={`tel:${enquiry.phone}`} class="font-semibold text-pink-deep hover:underline"
							>{enquiry.phone}</a
						>
					{/if}
					<form
						method="POST"
						action="?/delete"
						use:enhance
						onsubmit={(e) => confirmDelete(e, enquiry.name)}
						class="ml-auto"
					>
						<input type="hidden" name="id" value={enquiry.id} />
						<button type="submit" class="text-red-600/70 hover:text-red-600">Delete</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
{/if}
