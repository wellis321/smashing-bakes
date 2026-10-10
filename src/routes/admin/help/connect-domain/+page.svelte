<script lang="ts">
	// A one-off, step-by-step guide for pointing smashinbakes.com (registered at
	// GoDaddy, currently showing a Wix site) at this website on Hostinger.
	// The domain has already been added on the Hostinger side; 77.37.35.98 is
	// that hosting server's IP address.
	import GuideFooter from '$lib/components/admin/GuideFooter.svelte';
	type Row = { type: string; name: string; value: string; note?: string };

	const before: Row[] = [
		{ type: 'A', name: '@', value: '185.230.63.107', note: 'Wix' },
		{ type: 'CNAME', name: 'www', value: 'pointing.wixdns.net', note: 'Wix' }
	];
	const TOTAL = 9;
	let done = $state<Record<string, boolean>>({});
	const doneCount = $derived(Object.values(done).filter(Boolean).length);

	// Ticks are remembered in this browser only, so a half-finished job is still
	// half-finished when the page is reopened.
	$effect(() => {
		try {
			done = JSON.parse(localStorage.getItem('connect-domain-ticks') ?? '{}');
		} catch {
			/* storage unavailable — start with nothing ticked */
		}
	});

	function toggle(id: string) {
		done[id] = !done[id];
		try {
			localStorage.setItem('connect-domain-ticks', JSON.stringify(done));
		} catch {
			/* ticking still works for this visit */
		}
	}

	function clearAll() {
		done = {};
		try {
			localStorage.removeItem('connect-domain-ticks');
		} catch {
			/* nothing to clear */
		}
	}

	const after: Row[] = [
		{ type: 'A', name: '@', value: '77.37.35.98', note: 'New website' },
		{ type: 'CNAME', name: 'www', value: 'smashinbakes.com', note: 'New website' }
	];
</script>

<svelte:head>
	<title>Point smashinbakes.com at the new website — Help</title>
</svelte:head>

<a href="/admin/help" class="text-sm font-semibold text-ink-soft hover:text-ink">&larr; All help</a>

<div class="mt-4 max-w-2xl">
	<h1 class="font-display text-3xl text-ink sm:text-4xl">
		Point smashinbakes.com at the new website
	</h1>
	<p class="mt-2 text-lg text-ink-soft">
		One short job in GoDaddy &mdash; two lines to change. About 10 minutes, then a wait.
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

	<!-- The idea, as a picture -->
	<section class="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-5" aria-label="What changes">
		<h2 class="text-base font-semibold text-ink">What is changing</h2>
		<p class="mt-1 text-base text-ink-soft">
			GoDaddy keeps the &ldquo;address book&rdquo; for smashinbakes.com. Right now it sends visitors
			to the old Wix site. We&rsquo;re changing two lines so it sends them here instead.
		</p>

		<div class="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
			<div class="rounded-xl bg-cream-dim p-4 text-center">
				<p class="text-xs font-semibold tracking-widest text-ink-soft/70 uppercase">Now</p>
				<p class="mt-2 text-base font-semibold text-ink">smashinbakes.com</p>
				<p class="text-2xl" aria-hidden="true">&darr;</p>
				<p class="text-sm text-ink-soft">GoDaddy address book</p>
				<p class="text-2xl" aria-hidden="true">&darr;</p>
				<p class="rounded-lg bg-ink/10 px-3 py-2 text-base font-semibold text-ink">Old Wix site</p>
			</div>
			<p class="text-center text-3xl text-pink" aria-hidden="true">
				<span class="hidden sm:inline">&rarr;</span><span class="sm:hidden">&darr;</span>
			</p>
			<div class="rounded-xl bg-blush p-4 text-center">
				<p class="text-xs font-semibold tracking-widest text-pink-deep uppercase">After</p>
				<p class="mt-2 text-base font-semibold text-ink">smashinbakes.com</p>
				<p class="text-2xl" aria-hidden="true">&darr;</p>
				<p class="text-sm text-ink-soft">GoDaddy address book</p>
				<p class="text-2xl" aria-hidden="true">&darr;</p>
				<p class="rounded-lg bg-pink-deep px-3 py-2 text-base font-semibold text-cream">
					The new website
				</p>
			</div>
		</div>
	</section>

	<section class="mt-6 rounded-xl bg-blush px-5 py-4 text-base leading-relaxed text-ink">
		<p class="font-semibold">Before you start</p>
		<ul class="mt-2 list-disc space-y-1 pl-5">
			<li>You need the <strong>GoDaddy login</strong> for smashinbakes.com.</li>
			<li>
				Nothing is deleted from Wix. The old site simply stops showing on this address. If it
				isn&rsquo;t needed any more, the Wix plan can be cancelled separately, later.
			</li>
			<li>
				There is no email set up on smashinbakes.com, so this change can&rsquo;t affect
				anyone&rsquo;s email.
			</li>
		</ul>
	</section>

	<!-- Part 1 -->
	<section class="mt-12 rounded-2xl border border-green-600/30 bg-green-50 p-5">
		<h2 class="text-base font-semibold text-green-900">Hostinger &mdash; already done &#10003;</h2>
		<p class="mt-1 text-base leading-relaxed text-green-900">
			smashinbakes.com has already been added to this website on Hostinger, so there&rsquo;s nothing
			to do there. The values to use in GoDaddy are below.
		</p>
	</section>

	<!-- Part 2 -->
	<h2 class="mt-12 font-display text-2xl text-ink">
		In GoDaddy <span class="text-base font-normal text-ink-soft">(about 10 minutes)</span>
	</h2>

	<ol class="mt-6 space-y-8">
		<li class="flex gap-4">
			{@render tick('godaddy-1', 1)}
			<p class="pt-1 text-lg leading-relaxed text-ink">
				Go to <strong>godaddy.com</strong> and sign in. Open <strong>My Products</strong>, find
				<strong>smashinbakes.com</strong> and press <strong>DNS</strong> (it may say &ldquo;Manage DNS&rdquo;).
			</p>
		</li>

		<li class="flex gap-4">
			{@render tick('godaddy-2', 2)}
			<div class="min-w-0 flex-1">
				<p class="pt-1 text-lg leading-relaxed text-ink">
					You&rsquo;ll see a list of records. Find the <strong>two Wix lines</strong>. They look
					like this:
				</p>
				{@render table(before, 'bg-ink/5')}
				<p class="mt-3 text-base text-ink-soft">
					The wording on GoDaddy&rsquo;s screen may differ slightly (for example &ldquo;Data&rdquo;
					instead of &ldquo;Value&rdquo;), but the Type and Name will match.
				</p>
			</div>
		</li>

		<li class="flex gap-4">
			{@render tick('godaddy-3', 3)}
			<div class="min-w-0 flex-1">
				<p class="pt-1 text-lg leading-relaxed text-ink">
					Press the <strong>pencil</strong> next to the <strong>A</strong> line. Replace the Wix
					number with <strong>77.37.35.98</strong>, then press
					<strong>Save</strong>.
				</p>
			</div>
		</li>

		<li class="flex gap-4">
			{@render tick('godaddy-4', 4)}
			<p class="pt-1 text-lg leading-relaxed text-ink">
				Press the <strong>pencil</strong> next to the <strong>CNAME www</strong> line. Replace
				<em>pointing.wixdns.net</em> with <strong>smashinbakes.com</strong>, then press
				<strong>Save</strong>.
			</p>
		</li>

		<li class="flex gap-4">
			{@render tick('godaddy-5', 5)}
			<div class="min-w-0 flex-1">
				<p class="pt-1 text-lg leading-relaxed text-ink">
					The two lines should now look like this:
				</p>
				{@render table(after, 'bg-blush')}
			</div>
		</li>

		<li class="flex gap-4">
			{@render tick('godaddy-6', 6)}
			<div class="min-w-0 flex-1">
				<p class="pt-1 text-lg leading-relaxed text-ink">
					<strong>Please leave everything else as it is.</strong>
				</p>
				<ul class="mt-2 list-disc space-y-1 pl-5 text-lg text-ink">
					<li>
						Please don&rsquo;t change the lines of type <strong>NS</strong> or <strong>SOA</strong>,
						or the one called <strong>_domainconnect</strong>, as GoDaddy needs those.
					</li>
					<li>
						If there&rsquo;s any other line that mentions <strong>wix</strong>, it&rsquo;s fine to
						delete it.
					</li>
					<li>
						If GoDaddy shows <strong>Forwarding</strong> set up for the domain, please remove it.
					</li>
				</ul>
			</div>
		</li>
	</ol>

	<!-- After -->
	<h2 class="mt-12 font-display text-2xl text-ink">Then wait, and check</h2>
	<ol class="mt-6 space-y-7">
		<li class="flex gap-4">
			{@render tick('check-1', 7)}
			<p class="pt-1 text-lg leading-relaxed text-ink">
				It usually takes a few minutes, sometimes a few hours, and rarely up to a day. You
				don&rsquo;t need to do anything while you wait.
			</p>
		</li>
		<li class="flex gap-4">
			{@render tick('check-2', 8)}
			<p class="pt-1 text-lg leading-relaxed text-ink">
				The security certificate (the padlock) is added by Hostinger by itself once the address
				points here. It can take up to an hour.
			</p>
		</li>
		<li class="flex gap-4">
			{@render tick('check-3', 9)}
			<p class="pt-1 text-lg leading-relaxed text-ink">
				Open <strong>https://smashinbakes.com</strong> in a private or incognito window. You should see
				this website with the awning at the top.
			</p>
		</li>
	</ol>

	<section class="mt-10 rounded-2xl border border-ink/10 bg-white/60 p-5">
		<h2 class="text-base font-semibold text-ink">If something looks wrong</h2>
		<dl class="mt-3 space-y-4 text-base leading-relaxed">
			<div>
				<dt class="font-semibold text-ink">I still see the old Wix site</dt>
				<dd class="text-ink-soft">
					Please give it a little longer, then try a private window. Your own computer remembers old
					addresses for a while.
				</dd>
			</div>
			<div>
				<dt class="font-semibold text-ink">The browser says &ldquo;Not secure&rdquo;</dt>
				<dd class="text-ink-soft">
					The certificate hasn&rsquo;t arrived yet. Please wait an hour, then check
					Hostinger&rsquo;s SSL page and press the button to install it if it hasn&rsquo;t been
					done.
				</dd>
			</div>
			<div>
				<dt class="font-semibold text-ink">I want to go back</dt>
				<dd class="text-ink-soft">
					Please put the two Wix values from step 2 back in GoDaddy. The old site comes back as soon
					as it has updated.
				</dd>
			</div>
		</dl>
	</section>

	<GuideFooter title="Point smashinbakes.com at the new website" />
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

{#snippet table(rows: Row[], rowClass: string)}
	<div class="mt-4 overflow-x-auto rounded-xl border border-ink/10 bg-white">
		<table class="w-full text-left text-base">
			<thead class="bg-cream-dim text-xs tracking-widest text-ink-soft/80 uppercase">
				<tr>
					<th class="px-4 py-2 font-semibold">Type</th>
					<th class="px-4 py-2 font-semibold">Name</th>
					<th class="px-4 py-2 font-semibold">Value</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.type)}
					<tr class="border-t border-ink/10 {rowClass}">
						<td class="px-4 py-3 font-semibold text-ink">{row.type}</td>
						<td class="px-4 py-3 text-ink">{row.name}</td>
						<td class="px-4 py-3 text-ink">
							{row.value}
							{#if row.note}
								<span class="ml-1 text-sm text-ink-soft">({row.note})</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}
