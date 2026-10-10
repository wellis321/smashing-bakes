<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// Shown at the bottom of every guide. It remembers the guide so the Help page
	// can offer "pick up where you left off", and asks whether it helped. Only a
	// "no" is sent on (to the Feedback page) so it doesn't fill up with praise.
	let { title }: { title: string } = $props();

	let answer = $state<'' | 'yes' | 'no' | 'sent'>('');
	let comment = $state('');
	let sending = $state(false);
	let error = $state('');

	const message = $derived(
		`Guide "${title}" wasn't helpful.${comment.trim() ? ` ${comment.trim()}` : ''}`
	);

	onMount(() => {
		try {
			const key = 'help-recent';
			const list: { href: string; title: string }[] = JSON.parse(localStorage.getItem(key) ?? '[]');
			const next = [
				{ href: page.url.pathname, title },
				...list.filter((i) => i.href !== page.url.pathname)
			].slice(0, 4);
			localStorage.setItem(key, JSON.stringify(next));
		} catch {
			/* storage unavailable — nothing to remember */
		}
	});
</script>

<section class="mt-10 rounded-2xl border border-ink/10 bg-white/60 p-5">
	{#if answer === 'sent'}
		<p class="text-base font-semibold text-ink">Thank you — that&rsquo;s been sent.</p>
		<p class="mt-1 text-base text-ink-soft">I&rsquo;ll use it to improve this guide.</p>
	{:else if answer === 'yes'}
		<p class="text-base font-semibold text-ink">Glad it helped!</p>
	{:else if answer === 'no'}
		<form
			method="POST"
			action="/admin/feedback?/submit"
			use:enhance={() => {
				sending = true;
				error = '';
				return async ({ result }) => {
					sending = false;
					if (result.type === 'success') answer = 'sent';
					else error = 'Sorry, that did not send. Please try again.';
				};
			}}
		>
			<label for="guide-comment" class="text-base font-semibold text-ink">
				Sorry about that. What was missing or confusing? <span class="font-normal text-ink-soft"
					>(optional)</span
				>
			</label>
			<textarea
				id="guide-comment"
				bind:value={comment}
				rows="3"
				maxlength="1500"
				class="mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-pink/40"
			></textarea>
			<input type="hidden" name="message" value={message} />
			<input type="hidden" name="path" value={page.url.pathname} />
			{#if error}
				<p class="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
			{/if}
			<button
				type="submit"
				disabled={sending}
				class="mt-3 rounded-full bg-pink px-5 py-2 text-sm font-semibold text-cream hover:bg-pink-deep disabled:opacity-60"
			>
				{sending ? 'Sending…' : 'Send'}
			</button>
		</form>
	{:else}
		<div class="flex flex-wrap items-center gap-3">
			<p class="text-base font-semibold text-ink">Was this guide helpful?</p>
			<button
				type="button"
				onclick={() => (answer = 'yes')}
				class="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-semibold text-ink hover:border-pink hover:text-pink-deep"
			>
				Yes
			</button>
			<button
				type="button"
				onclick={() => (answer = 'no')}
				class="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-semibold text-ink hover:border-pink hover:text-pink-deep"
			>
				Not really
			</button>
		</div>
	{/if}
</section>
