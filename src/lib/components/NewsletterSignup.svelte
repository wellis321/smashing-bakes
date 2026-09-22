<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		source,
		variant = 'hero',
		offer,
		onSuccess
	}: {
		source: string;
		variant?: 'compact' | 'hero' | 'minimal';
		offer: { code: string; description: string };
		onSuccess?: () => void;
	} = $props();

	const uid = $derived(`newsletter-${source}`);

	let email = $state('');
	let name = $state('');
	let birthday = $state('');
	let submitting = $state(false);
	let result = $state<
		{ status: 'success'; alreadySubscribed: boolean } | { status: 'error'; message: string } | null
	>(null);
</script>

{#if result?.status === 'success'}
	<div class={variant === 'compact' ? 'max-w-sm' : 'mx-auto max-w-md text-center'}>
		<p class={`font-display text-xl ${variant === 'compact' ? 'text-cream' : 'text-ink'}`}>
			{result.alreadySubscribed ? "You're already on the list!" : "You're in!"}
		</p>
		<p
			class={`mt-2 text-[15px] leading-relaxed ${variant === 'compact' ? 'text-cream/85' : 'text-ink-soft'}`}
		>
			{result.alreadySubscribed
				? "No need to sign up twice — here's your welcome code again, just in case:"
				: "We'll let you know about specials, new bakes and the odd surprise. Here's your welcome offer:"}
		</p>
		<div
			class={`mt-4 inline-flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-2.5 ${
				variant === 'compact' ? 'border-cream/25' : 'border-pink/40'
			}`}
		>
			<span
				class={`font-display text-lg tracking-wide ${variant === 'compact' ? 'text-cream' : 'text-pink-deep'}`}
			>
				{offer.code}
			</span>
			<span class={`text-sm ${variant === 'compact' ? 'text-cream/80' : 'text-ink-soft'}`}>
				{offer.description}
			</span>
		</div>
		<p class={`mt-3 text-sm ${variant === 'compact' ? 'text-cream/60' : 'text-ink-soft/70'}`}>
			Just mention it when you order for pickup.
		</p>
	</div>
{:else}
	<form
		method="POST"
		action="/newsletter"
		class={variant === 'compact' ? 'max-w-sm' : 'mx-auto max-w-md'}
		use:enhance={() => {
			submitting = true;
			result = null;
			return async ({ result: actionResult }) => {
				submitting = false;
				if (actionResult.type === 'success' && actionResult.data) {
					result = {
						status: 'success',
						alreadySubscribed: Boolean(actionResult.data.alreadySubscribed)
					};
					email = '';
					name = '';
					birthday = '';
					onSuccess?.();
				} else if (actionResult.type === 'failure') {
					result = {
						status: 'error',
						message:
							(actionResult.data?.message as string) ?? 'Something went wrong — please try again.'
					};
				}
			};
		}}
	>
		<input type="hidden" name="source" value={source} />

		<!-- Honeypot — left blank by real visitors. display:none (not off-screen
		     positioning) so real browsers' autofill/password managers never see
		     it as a fillable field, only naive bots that scrape raw HTML do. -->
		<div class="hidden" aria-hidden="true">
			<label for={`${uid}-company`}>Company</label>
			<input type="text" id={`${uid}-company`} name="company" tabindex="-1" autocomplete="off" />
		</div>

		<div class={`flex flex-col gap-2.5 ${variant === 'hero' ? 'sm:flex-row' : 'sm:flex-row'}`}>
			<label for={`${uid}-email`} class="sr-only">Email address</label>
			<input
				id={`${uid}-email`}
				name="email"
				type="email"
				required
				bind:value={email}
				placeholder="Your email address"
				class={`w-full rounded-full border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
					variant === 'compact'
						? 'border-cream/30 bg-cream/10 text-cream placeholder:text-cream/55 focus:ring-pink/40'
						: 'border-ink/15 bg-white text-ink focus:ring-pink/40'
				}`}
			/>
			<button
				type="submit"
				disabled={submitting}
				class="shrink-0 rounded-full bg-pink px-6 py-3 text-[15px] font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
			>
				{submitting ? 'Joining…' : 'Get my offer'}
			</button>
		</div>

		{#if variant === 'hero'}
			<label for={`${uid}-name`} class="sr-only">Name (optional)</label>
			<input
				id={`${uid}-name`}
				name="name"
				type="text"
				bind:value={name}
				placeholder="Name (optional)"
				class="mt-2.5 w-full rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-pink/40"
			/>

			<label for={`${uid}-birthday`} class="mt-3 block text-xs text-ink-soft">
				Birthday (optional) — for a free treat on the day!
			</label>
			<input
				id={`${uid}-birthday`}
				name="birthday"
				type="date"
				bind:value={birthday}
				class="mt-1 w-full rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-pink/40"
			/>
		{:else}
			<input type="hidden" name="name" value={name} />
			<input type="hidden" name="birthday" value={birthday} />
		{/if}

		{#if result?.status === 'error'}
			<p class={`mt-2.5 text-sm ${variant === 'compact' ? 'text-pink' : 'text-red-700'}`}>
				{result.message}
			</p>
		{/if}
	</form>
{/if}
