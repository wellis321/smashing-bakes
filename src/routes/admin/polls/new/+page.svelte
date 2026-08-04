<script lang="ts">
	import { enhance } from '$app/forms';
	import PollOptionsEditor from '$lib/components/admin/PollOptionsEditor.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>New poll — Admin</title>
</svelte:head>

<a href="/admin/polls" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Polls</a>
<h1 class="font-display mt-2 text-3xl text-ink">New flavour poll</h1>

<form
	method="POST"
	class="border-ink/10 mt-6 max-w-2xl rounded-2xl border bg-white/60 p-6"
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
			<label for="title" class="text-ink-soft text-sm font-medium">Poll title</label>
			<input
				id="title"
				name="title"
				required
				placeholder="Which brownie flavour needs to make a comeback?"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div class="sm:col-span-2">
			<label for="description" class="text-ink-soft text-sm font-medium">Description (optional)</label>
			<textarea
				id="description"
				name="description"
				rows="2"
				placeholder="We've made all of these before... which one needs to come back this weekend?"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			></textarea>
		</div>

		<div class="sm:col-span-2">
			<PollOptionsEditor />
		</div>

		<div>
			<label for="prizeDescription" class="text-ink-soft text-sm font-medium">Prize (optional)</label>
			<input
				id="prizeDescription"
				name="prizeDescription"
				placeholder="A free box of your winning flavour"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>

		<div>
			<label for="deadlineText" class="text-ink-soft text-sm font-medium">Deadline (optional)</label>
			<input
				id="deadlineText"
				name="deadlineText"
				placeholder="Voting closes Sunday night"
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			/>
		</div>
	</div>

	<p class="text-ink-soft/70 mt-4 text-xs">
		New polls are created inactive — use "Set active" from the poll list once you're ready.
	</p>

	<button
		type="submit"
		disabled={submitting}
		class="bg-pink hover:bg-pink-deep mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
	>
		{submitting ? 'Saving…' : 'Create poll'}
	</button>
</form>
