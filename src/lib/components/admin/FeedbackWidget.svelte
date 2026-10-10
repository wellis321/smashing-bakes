<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	// A "Feedback" tab fixed to the bottom-right of every admin page. It sends the
	// message to the Feedback page along with the address of the page being
	// looked at, so there's no need to explain where something was.
	let open = $state(false);
	let sending = $state(false);
	let sent = $state(false);
	let error = $state('');
	let message = $state('');

	const path = $derived(page.url.pathname + page.url.search);

	function toggle() {
		open = !open;
		if (open) {
			sent = false;
			error = '';
		}
	}
</script>

<div class="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 print:hidden">
	{#if open}
		<div
			role="dialog"
			aria-label="Send feedback"
			class="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-ink/10 bg-cream p-5 shadow-soft"
		>
			{#if sent}
				<p class="text-lg font-semibold text-ink">Thank you!</p>
				<p class="mt-1 text-base text-ink-soft">Your feedback has been sent.</p>
				<button
					type="button"
					onclick={() => (open = false)}
					class="mt-4 rounded-full bg-pink px-5 py-2 text-sm font-semibold text-cream hover:bg-pink-deep"
				>
					Close
				</button>
			{:else}
				<form
					method="POST"
					action="/admin/feedback?/submit"
					use:enhance={() => {
						sending = true;
						error = '';
						return async ({ result }) => {
							sending = false;
							if (result.type === 'success') {
								sent = true;
								message = '';
							} else {
								error =
									result.type === 'failure' && typeof result.data?.message === 'string'
										? result.data.message
										: 'Sorry, that did not send. Please try again.';
							}
						};
					}}
				>
					<label for="feedback-message" class="text-base font-semibold text-ink">
						What would you like to tell us?
					</label>
					<textarea
						id="feedback-message"
						name="message"
						bind:value={message}
						rows="5"
						required
						maxlength="3000"
						placeholder="Something not working, something confusing, or an idea…"
						class="mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-pink/40"
					></textarea>
					<input type="hidden" name="path" value={path} />
					<p class="mt-1 text-xs break-all text-ink-soft">About this page: {page.url.pathname}</p>
					{#if error}
						<p class="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
					{/if}
					<div class="mt-3 flex items-center gap-3">
						<button
							type="submit"
							disabled={sending || !message.trim()}
							class="rounded-full bg-pink px-5 py-2 text-sm font-semibold text-cream hover:bg-pink-deep disabled:opacity-60"
						>
							{sending ? 'Sending…' : 'Send'}
						</button>
						<button
							type="button"
							onclick={() => (open = false)}
							class="text-sm font-semibold text-ink-soft hover:text-ink"
						>
							Cancel
						</button>
					</div>
				</form>
			{/if}
		</div>
	{/if}

	<button
		type="button"
		onclick={toggle}
		aria-expanded={open}
		class="rounded-full bg-pink px-5 py-3 text-sm font-semibold text-cream shadow-soft transition-colors hover:bg-pink-deep"
	>
		Feedback
	</button>
</div>
