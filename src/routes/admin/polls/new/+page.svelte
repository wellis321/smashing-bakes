<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import PollOptionsEditor from '$lib/components/admin/PollOptionsEditor.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>New poll — Admin</title>
</svelte:head>

<a href="/admin/polls" class="text-sm font-semibold text-ink-soft hover:text-ink">&larr; Polls</a>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">New flavour poll</h1>
	<HelpLink section="polls" task="flavour-poll" />
</div>

<form
	method="POST"
	class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}
>
	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
	{/if}

	<div class="grid gap-6 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<label for="title" class="text-sm font-medium text-ink-soft">Poll title</label>
			<input
				id="title"
				name="title"
				required
				placeholder="Which brownie flavour needs to make a comeback?"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div class="sm:col-span-2">
			<label for="description" class="text-sm font-medium text-ink-soft"
				>Description (optional)</label
			>
			<textarea
				id="description"
				name="description"
				rows="2"
				placeholder="We've made all of these before... which one needs to come back this weekend?"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			></textarea>
		</div>

		<div class="sm:col-span-2">
			<PollOptionsEditor />
		</div>

		<div>
			<label for="prizeDescription" class="text-sm font-medium text-ink-soft"
				>Prize (optional)</label
			>
			<input
				id="prizeDescription"
				name="prizeDescription"
				placeholder="A free box of your winning flavour"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>

		<div>
			<label for="deadlineText" class="text-sm font-medium text-ink-soft">Deadline (optional)</label
			>
			<input
				id="deadlineText"
				name="deadlineText"
				placeholder="Voting closes Sunday night"
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
		</div>
	</div>

	<p class="mt-4 text-xs text-ink-soft/70">
		New polls are created inactive — use "Set active" from the poll list once you're ready.
	</p>

	<button
		type="submit"
		disabled={submitting}
		class="mt-4 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Create poll'}
	</button>
</form>
