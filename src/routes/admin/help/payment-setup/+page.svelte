<script lang="ts">
	// A one-off guide for getting the SumUp details the website needs to take card
	// payments online. SumUp's screens change from time to time, so the wording
	// here describes where things usually are.
	import GuideFooter from '$lib/components/admin/GuideFooter.svelte';
	const TOTAL = 11;
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
		When you&rsquo;ve finished a step, please press the circle beside it to tick it off.
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
				Please don&rsquo;t send it by email, text or chat. You can hand it over in person, or use
				the steps in Part 3.
			</li>
			<li>
				If it ever gets shared by mistake, please delete it in SumUp (same screen as step 2) and
				make a new one. Nothing is lost.
			</li>
		</ul>
	</section>

	<h2 class="mt-12 font-display text-2xl text-ink">Part 1 &middot; Create the API key</h2>
	<ol class="mt-6 space-y-7">
		<li class="flex gap-4">
			{@render tick('key-1', 1)}
			<p class="pt-1 text-lg leading-relaxed text-ink">
				Go to <a
					href="https://me.sumup.com"
					target="_blank"
					rel="noreferrer"
					class="font-semibold text-pink-deep underline hover:text-pink">me.sumup.com &#8599;</a
				> and sign in to the business&rsquo;s SumUp account. Please check that the account is fully set
				up (SumUp may ask for business details or ID if it isn&rsquo;t).
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
					payments switched on yet. Please let me know and we&rsquo;ll get it sorted.
				</p>
			</div>
		</li>
		<li class="flex gap-4">
			{@render tick('key-3', 3)}
			<div class="min-w-0 flex-1">
				<p class="pt-1 text-lg leading-relaxed text-ink">
					Please press <strong>API Keys</strong>, then <strong>Create</strong>, and call it
					<strong>Smashin&rsquo; Bakes website</strong>.
					<a
						href="https://developer.sumup.com/tools/authorization/api-keys"
						target="_blank"
						rel="noreferrer"
						class="text-base font-semibold text-pink-deep underline hover:text-pink"
						>SumUp&rsquo;s own instructions &#8599;</a
					>
				</p>
				<p class="mt-3 text-lg leading-relaxed text-ink">
					<strong>Please copy the key straight away</strong>, as SumUp can&rsquo;t show it again
					later. If SumUp shows a &ldquo;public key&rdquo; too, please leave that one alone &mdash;
					we need the secret API key.
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
					Then type it into <a
						href="/admin/settings#online-payments"
						class="font-semibold text-pink-deep hover:underline"
						>Settings &rarr; Online payments (SumUp)</a
					>
					and press <strong>Save changes</strong>. Can&rsquo;t find it? Please let me know and
					we&rsquo;ll look for it together.
				</p>
			</div>
		</li>
	</ol>

	<h2 class="mt-12 font-display text-2xl text-ink">Part 3 &middot; Send me the API key safely</h2>
	<p class="mt-2 text-base text-ink-soft">
		Please use <strong>Proton Pass</strong>. It&rsquo;s free, and the key never has to be emailed or
		texted. I&rsquo;ve already shared a private vault called <strong>SmashinBakes</strong> with you, and
		I can only see what you save inside that vault.
	</p>

	<section
		class="mt-5 rounded-2xl border-2 border-pink-deep bg-white px-5 py-6 sm:px-7"
		aria-labelledby="proton-steps"
	>
		<p class="text-xs font-bold tracking-widest text-pink-deep uppercase">Recommended</p>
		<h3 id="proton-steps" class="mt-1 font-display text-2xl text-ink">
			Add the SumUp key in Proton Pass
		</h3>
		<p class="mt-1 text-base text-ink-soft">
			Have the key from Part 1 ready to paste. If Proton&rsquo;s screens look a little different
			from what&rsquo;s described, please let me know.
		</p>
		<ol class="mt-6 space-y-7">
			<li class="flex gap-4">
				{@render tick('proton-1', 5)}
				<div class="min-w-0 flex-1">
					<p class="pt-1 text-lg font-semibold text-ink">Sign in to Proton Pass</p>
					<p class="mt-1 text-lg leading-relaxed text-ink">
						Go to <a
							href="https://pass.proton.me"
							target="_blank"
							rel="noreferrer"
							class="font-semibold text-pink-deep underline hover:text-pink"
							>pass.proton.me &#8599;</a
						>
						and sign in with the Proton account you made with
						<strong>alanah@smashinbakes.co.uk</strong>.
					</p>
					<p class="mt-2 text-base leading-relaxed text-ink-soft">
						First time only: open the invitation email from <strong
							>williamjamesellis@outlook.com</strong
						>
						and press the button to accept it. If it asks you to create a free Proton account, use
						<strong>alanah@smashinbakes.co.uk</strong>.
					</p>
				</div>
			</li>
			<li class="flex gap-4">
				{@render tick('proton-2', 6)}
				<div class="min-w-0 flex-1">
					<p class="pt-1 text-lg font-semibold text-ink">Open the SmashinBakes vault</p>
					<p class="mt-1 text-lg leading-relaxed text-ink">
						On the left, under <strong>Vaults</strong>, click <strong>SmashinBakes</strong>. It has
						a small icon of two people with a number beside it.
					</p>
					<p class="mt-2 text-base leading-relaxed text-ink-soft">
						Check the search box at the top says <strong
							>&ldquo;Search in SmashinBakes&rdquo;</strong
						>. That tells you you&rsquo;re in the right place.
						<strong>Please don&rsquo;t use &ldquo;Personal&rdquo;</strong>, because I can&rsquo;t
						see anything saved there.
					</p>
				</div>
			</li>
			<li class="flex gap-4">
				{@render tick('proton-3', 7)}
				<div class="min-w-0 flex-1">
					<p class="pt-1 text-lg font-semibold text-ink">Start a new item</p>
					<p class="mt-1 text-lg leading-relaxed text-ink">
						In the middle of the screen, press <strong>Create a custom item</strong>. It&rsquo;s the
						grey button with a small spanner icon.
					</p>
					<p class="mt-2 text-base leading-relaxed text-ink-soft">
						Or press the purple <strong>Create item</strong> button at the top right and choose a custom
						item from the list.
					</p>
				</div>
			</li>
			<li class="flex gap-4">
				{@render tick('proton-4', 8)}
				<div class="min-w-0 flex-1">
					<p class="pt-1 text-lg font-semibold text-ink">Choose API credential</p>
					<p class="mt-1 text-lg leading-relaxed text-ink">
						If it asks what kind of custom item, choose <strong>API credential</strong>.
					</p>
					<p class="mt-2 text-base leading-relaxed text-ink-soft">
						Can&rsquo;t see that choice? Pick the plain custom item and add a field called <strong
							>API key</strong
						> instead. Either works.
					</p>
				</div>
			</li>
			<li class="flex gap-4">
				{@render tick('proton-5', 9)}
				<div class="min-w-0 flex-1">
					<p class="pt-1 text-lg font-semibold text-ink">Fill it in</p>
					<p class="mt-1 text-lg leading-relaxed text-ink">
						Give it the name <strong>SumUp API key</strong>. Then
						<strong>paste the key you copied from SumUp</strong> into the box for the key (it may be called
						&ldquo;API key&rdquo;, &ldquo;Key&rdquo; or &ldquo;Secret&rdquo;).
					</p>
					<p class="mt-2 text-base leading-relaxed text-ink-soft">
						Leave everything else empty. The merchant code doesn&rsquo;t go here. It goes in the
						website&rsquo;s Settings (step 4 above).
					</p>
				</div>
			</li>
			<li class="flex gap-4">
				{@render tick('proton-6', 10)}
				<div class="min-w-0 flex-1">
					<p class="pt-1 text-lg font-semibold text-ink">Save it</p>
					<p class="mt-1 text-lg leading-relaxed text-ink">
						Press <strong>Save</strong> (or <strong>Create</strong>). You should now see
						<strong>SumUp API key</strong> listed in the SmashinBakes vault, which no longer says it&rsquo;s
						empty.
					</p>
				</div>
			</li>
			<li class="flex gap-4">
				{@render tick('proton-7', 11)}
				<div class="min-w-0 flex-1">
					<p class="pt-1 text-lg font-semibold text-ink">Let me know</p>
					<p class="mt-1 text-lg leading-relaxed text-ink">
						Please tell me you&rsquo;ve added it, by phone on <a
							href="tel:+447566257092"
							class="font-semibold text-pink-deep underline hover:text-pink">07566 257092</a
						>
						or with the <strong>Feedback</strong> button in the corner. I can see it straight away, and
						I&rsquo;ll take it from there.
					</p>
				</div>
			</li>
		</ol>
		<p class="mt-6 text-base text-ink-soft">
			Can&rsquo;t find the invitation? Please check your spam folder, and if it isn&rsquo;t there,
			give me a ring on
			<a href="tel:+447566257092" class="font-semibold text-pink-deep underline hover:text-pink"
				>07566 257092</a
			>.
		</p>
	</section>

	<h3 class="mt-10 font-display text-xl text-ink">
		Other ways (only if Proton Pass doesn&rsquo;t suit)
	</h3>
	<section class="mt-3 rounded-xl bg-blush px-5 py-4 text-base leading-relaxed text-ink">
		<p class="font-semibold">An iPhone or a Mac</p>
		<p class="mt-1">
			Apple&rsquo;s <strong>Passwords</strong> app can share one saved item with me. Open it and
			press
			<strong>+</strong>, set the website to <strong>SumUp API key</strong> and paste the key as the
			password, then press <strong>Share</strong> and choose me. Ask me for the email I use for my Apple
			Account.
		</p>
	</section>
	<section class="mt-3 rounded-xl bg-blush px-5 py-4 text-base leading-relaxed text-ink">
		<p class="font-semibold">A one-time private link (Bitwarden Send)</p>
		<ol class="mt-1 list-decimal space-y-1 pl-5">
			<li>
				Go to <a
					href="https://vault.bitwarden.com"
					target="_blank"
					rel="noreferrer"
					class="font-semibold text-pink-deep underline hover:text-pink"
					>vault.bitwarden.com &#8599;</a
				> and sign in (a free account is fine).
			</li>
			<li>
				Open <strong>Send</strong>, press <strong>New Send</strong>, choose <strong>Text</strong>,
				and paste the key.
			</li>
			<li>
				Under <strong>Options</strong> set the deletion date to tomorrow, the maximum access count to
				1, and add a password.
			</li>
			<li>
				Send me the link by email or text, and <strong>phone me</strong> on 07566 257092 with the password.
				Please don&rsquo;t put the password in the same message as the link.
			</li>
		</ol>
		<p class="mt-1 text-sm text-ink-soft">
			<a
				href="https://bitwarden.com/help/about-send/"
				target="_blank"
				rel="noreferrer"
				class="font-semibold text-pink-deep underline hover:text-pink">What is a Send? &#8599;</a
			>
		</p>
	</section>

	<section class="mt-10 rounded-2xl border border-ink/10 bg-white/60 p-5">
		<h2 class="text-base font-semibold text-ink">What happens next</h2>
		<p class="mt-2 text-base leading-relaxed text-ink-soft">
			Once the details are added, the checkout can send customers to SumUp&rsquo;s secure payment
			page, and orders are marked as paid when the payment goes through. Until then, everything
			works as it does now &mdash; customers pay when they collect.
		</p>
	</section>

	<GuideFooter title="Get the SumUp details for online payments" />
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
