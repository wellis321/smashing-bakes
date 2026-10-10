<script lang="ts">
	// A one-off guide for getting the SumUp details the website needs to take card
	// payments online. SumUp's screens change from time to time, so the wording
	// here describes where things usually are.
	const TOTAL = 6;
	let done = $state<Record<string, boolean>>({});
	const doneCount = $derived(Object.values(done).filter(Boolean).length);

	// Ticks are remembered in this browser only.
	$effect(() => {
		try {
			done = JSON.parse(localStorage.getItem('payment-setup-ticks') ?? '{}');
		} catch {
			/* storage unavailable — start with nothing ticked */
		}
	});

	function toggle(id: string) {
		done[id] = !done[id];
		try {
			localStorage.setItem('payment-setup-ticks', JSON.stringify(done));
		} catch {
			/* ticking still works for this visit */
		}
	}

	function clearAll() {
		done = {};
		try {
			localStorage.removeItem('payment-setup-ticks');
		} catch {
			/* nothing to clear */
		}
	}
</script>

<svelte:head>
	<title>Get the SumUp details for online payments — Help</title>
</svelte:head>

<a href="/admin/help" class="text-sm font-semibold text-ink-soft hover:text-ink">&larr; All help</a>

<div class="mt-4 max-w-2xl">
	<h1 class="font-display text-3xl text-ink sm:text-4xl">
		Get the SumUp details for online payments
	</h1>
	<p class="mt-2 text-lg text-ink-soft">
		Two things are needed from your SumUp account: an <strong>API key</strong> and your
		<strong>merchant code</strong>. About 10 minutes.
	</p>

	<p class="mt-4 text-base text-ink-soft">
		Press the circle next to each step when it&rsquo;s done to tick it off.
	</p>
	<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-base">
		<p class="font-semibold text-ink" aria-live="polite">
			{doneCount} of {TOTAL} steps done{doneCount === TOTAL ? ' — all finished!' : ''}
		</p>
		{#if doneCount > 0}
			<button type="button" onclick={clearAll} class="text-pink-deep hover:underline">
				Clear ticks
			</button>
		{/if}
	</div>

	<section class="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-5">
		<h2 class="text-base font-semibold text-ink">What these are</h2>
		<ul class="mt-2 space-y-2 text-base leading-relaxed text-ink-soft">
			<li>
				<strong class="text-ink">API key</strong> &mdash; a long secret code that lets the website ask
				SumUp to take a payment. Think of it as a password for the website.
			</li>
			<li>
				<strong class="text-ink">Merchant code</strong> &mdash; a short code that tells SumUp which account
				the money goes into.
			</li>
		</ul>
	</section>

	<section class="mt-6 rounded-xl bg-blush px-5 py-4 text-base leading-relaxed text-ink">
		<p class="font-semibold">Keep the API key private</p>
		<ul class="mt-2 list-disc space-y-1 pl-5">
			<li>Anyone with the key can act on the SumUp account, so treat it like a bank password.</li>
			<li>
				Don&rsquo;t send it by email, text or chat. Hand it over in person, or share it from a
				password manager.
			</li>
			<li>
				If it ever gets shared by mistake, delete it in SumUp (same screen as step 2) and make a new
				one. Nothing is lost.
			</li>
		</ul>
	</section>

	<h2 class="mt-12 font-display text-2xl text-ink">Part 1 &middot; Create the API key</h2>
	<ol class="mt-6 space-y-7">
		<li class="flex gap-4">
			{@render tick('key-1', 1)}
			<p class="pt-1 text-lg leading-relaxed text-ink">
				Go to <strong>sumup.com</strong> and sign in to the business&rsquo;s SumUp account. Check that
				the account is fully set up (SumUp may ask for business details or ID if it isn&rsquo;t).
			</p>
		</li>
		<li class="flex gap-4">
			{@render tick('key-2', 2)}
			<div class="min-w-0 flex-1">
				<p class="pt-1 text-lg leading-relaxed text-ink">
					Open your <strong>profile</strong> (top corner), choose <strong>Settings</strong>, then go
					to <strong>For Developers</strong> and press <strong>Toolkit</strong>.
				</p>
				<p class="mt-2 text-base text-ink-soft">
					If you can&rsquo;t see &ldquo;For Developers&rdquo;, the account may not have online
					payments switched on yet. Tell William.
				</p>
			</div>
		</li>
		<li class="flex gap-4">
			{@render tick('key-3', 3)}
			<div class="min-w-0 flex-1">
				<p class="pt-1 text-lg leading-relaxed text-ink">
					Press <strong>API Keys</strong>, then <strong>Create</strong>. Call it
					<strong>Smashin&rsquo; Bakes website</strong>.
				</p>
				<p class="mt-3 text-lg leading-relaxed text-ink">
					<strong>Copy the key straight away.</strong> SumUp can&rsquo;t show it again later. If SumUp
					shows a &ldquo;public key&rdquo; too, ignore that one &mdash; we need the secret API key.
				</p>
			</div>
		</li>
	</ol>

	<h2 class="mt-12 font-display text-2xl text-ink">Part 2 &middot; Find the merchant code</h2>
	<ol class="mt-6 space-y-7">
		<li class="flex gap-4">
			{@render tick('code-1', 4)}
			<div class="min-w-0 flex-1">
				<p class="pt-1 text-lg leading-relaxed text-ink">
					In the same SumUp account, look in your <strong>profile or account details</strong> for
					the <strong>merchant code</strong>. It&rsquo;s a short mix of letters and numbers.
				</p>
				<p class="mt-2 text-base text-ink-soft">
					Can&rsquo;t find it? That&rsquo;s fine &mdash; tell William and we&rsquo;ll look for it
					together.
				</p>
			</div>
		</li>
	</ol>

	<h2 class="mt-12 font-display text-2xl text-ink">Part 3 &middot; Pass them on safely</h2>
	<ol class="mt-6 space-y-7">
		<li class="flex gap-4">
			{@render tick('pass-1', 5)}
			<p class="pt-1 text-lg leading-relaxed text-ink">
				Save both somewhere safe, such as a <strong>password manager</strong>. Don&rsquo;t leave
				them in an email or a note on the desktop.
			</p>
		</li>
		<li class="flex gap-4">
			{@render tick('pass-2', 6)}
			<p class="pt-1 text-lg leading-relaxed text-ink">
				Give the <strong>API key</strong> and <strong>merchant code</strong> to William in person, or
				share them from the password manager. He will add them to the website&rsquo;s hosting settings
				&mdash; they are never typed into the website itself.
			</p>
		</li>
	</ol>

	<section class="mt-10 rounded-2xl border border-ink/10 bg-white/60 p-5">
		<h2 class="text-base font-semibold text-ink">What happens next</h2>
		<p class="mt-2 text-base leading-relaxed text-ink-soft">
			Once the details are added, the checkout can send customers to SumUp&rsquo;s secure payment
			page, and orders are marked as paid when the payment goes through. Until then, everything
			works as it does now &mdash; customers pay when they collect.
		</p>
	</section>
</div>

{#snippet tick(id: string, n: number)}
	<button
		type="button"
		onclick={() => toggle(id)}
		aria-pressed={!!done[id]}
		aria-label={`Step ${n}: ${done[id] ? 'done, press to untick' : 'press when done'}`}
		class="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-base font-bold transition-colors {done[
			id
		]
			? 'border-green-600 bg-green-600 text-white'
			: 'border-pink bg-pink text-cream hover:bg-pink-deep'}"
	>
		{#if done[id]}
			<svg
				viewBox="0 0 20 20"
				class="h-5 w-5"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				aria-hidden="true"
			>
				<path d="M4 10.5l4 4 8-9" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		{:else}
			{n}
		{/if}
	</button>
{/snippet}
