<script lang="ts">
	import { enhance } from '$app/forms';

	type FormResult = {
		success?: boolean;
		message?: string;
		values?: { name: string; email: string; phone: string; details: string };
	} | null;

	let {
		// Submits to a different route's action than the current page — used by
		// any page (e.g. /bespoke-cakes) that embeds this form but isn't itself
		// /contact, which is where the actual insert/notify logic lives.
		action = ''
	}: { action?: string } = $props();

	let submitting = $state(false);
	// Read directly from the enhance callback's own `result`, not from
	// `$page.form` — that only reliably reflects a submission when the form's
	// `action` targets the CURRENT route's own action. For a cross-route
	// submission (action="/contact" rendered on a different page), `$page.form`
	// never updates, which showed as "nothing happens" with no success message
	// at all despite the submission genuinely succeeding server-side.
	let result = $state<FormResult>(null);
</script>

<div class="rounded-[2rem] bg-blush p-6 sm:p-8">
	<p class="font-display text-2xl text-ink">Bespoke order</p>
	<p class="mt-3 text-sm leading-relaxed text-ink-soft">
		Whether it&rsquo;s a Smashin&rsquo; old-school cake or a themed birthday cake, we can get you
		sorted. Fill in the form and we&rsquo;ll be in touch &mdash; if you&rsquo;re not sure exactly
		what you want yet, just leave us your details and we&rsquo;ll help you figure it out.
	</p>

	{#if result?.success}
		<div class="mt-6 rounded-xl bg-white/70 px-5 py-6 text-center">
			<p class="font-display text-xl text-ink">Thanks &mdash; got it!</p>
			<p class="mt-2 text-sm text-ink-soft">
				We&rsquo;ll be in touch soon to talk through your order.
			</p>
		</div>
	{:else}
		<form
			method="POST"
			{action}
			class="mt-6 space-y-4"
			use:enhance={() => {
				submitting = true;
				return async ({ result: actionResult }) => {
					submitting = false;
					if (actionResult.type === 'success' || actionResult.type === 'failure') {
						result = (actionResult.data as FormResult) ?? null;
					} else {
						// 'error' (thrown exception) or 'redirect' — neither of
						// which this action ever does, but fail closed with a
						// generic message rather than silently showing nothing.
						result = { message: 'Something went wrong — please try again.' };
					}
				};
			}}
		>
			<!-- Honeypot — left blank by real visitors, hidden from view and the tab order. -->
			<div class="absolute -left-[9999px]" aria-hidden="true">
				<label for="company">Company</label>
				<input type="text" id="company" name="company" tabindex="-1" autocomplete="off" />
			</div>

			{#if result?.message}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{result.message}</p>
			{/if}

			<div>
				<label for="name" class="text-sm font-medium text-ink-soft">Name</label>
				<input
					id="name"
					name="name"
					required
					value={result?.values?.name ?? ''}
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="email" class="text-sm font-medium text-ink-soft">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						value={result?.values?.email ?? ''}
						class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					/>
				</div>
				<div>
					<label for="phone" class="text-sm font-medium text-ink-soft">Phone (optional)</label>
					<input
						id="phone"
						name="phone"
						type="tel"
						value={result?.values?.phone ?? ''}
						class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					/>
				</div>
			</div>

			<div>
				<label for="details" class="text-sm font-medium text-ink-soft"
					>What can we bake for you?</label
				>
				<textarea
					id="details"
					name="details"
					rows="4"
					required
					placeholder="Occasion, date, flavours, how many people it needs to feed…"
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					>{result?.values?.details ?? ''}</textarea
				>
			</div>

			<label class="flex items-start gap-2 text-sm text-ink-soft">
				<input
					type="checkbox"
					name="wantsNewsletter"
					value="true"
					class="mt-0.5 h-4 w-4 accent-pink"
				/>
				Keep me posted on new bakes and offers by email
			</label>

			<button
				type="submit"
				disabled={submitting}
				class="w-full rounded-full bg-pink py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
			>
				{submitting ? 'Sending…' : 'Send enquiry'}
			</button>
		</form>
	{/if}
</div>
