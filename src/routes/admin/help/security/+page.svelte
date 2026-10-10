<script lang="ts">
	// A plain-English security page: what to do on the accounts, what already
	// protects the site, and what to do if something looks wrong. The technical
	// detail lives in the long Security section of the main Help page.
	import GuideFooter from '$lib/components/admin/GuideFooter.svelte';
	type Item = { id: string; text: string; detail?: string; href?: string; label?: string };

	const items: Item[] = [
		{
			id: 'hostinger',
			text: 'Turn on two-step login for Hostinger',
			detail: 'This account runs the website and its database, so it matters most.',
			href: 'https://hpanel.hostinger.com',
			label: 'Open Hostinger'
		},
		{
			id: 'godaddy',
			text: 'Turn on two-step login for GoDaddy',
			detail: 'Whoever controls the domain controls where the website points.',
			href: 'https://account.godaddy.com',
			label: 'Open GoDaddy'
		},
		{
			id: 'sumup',
			text: 'Turn on two-step login for SumUp',
			detail: 'It holds the money and the payment key.',
			href: 'https://me.sumup.com',
			label: 'Open SumUp'
		},
		{
			id: 'github',
			text: 'Turn on two-step login for GitHub',
			detail: 'It holds the website’s code, and pushing code updates the live site.',
			href: 'https://github.com/settings/security',
			label: 'Open GitHub security'
		},
		{
			id: 'resend',
			text: 'Turn on two-step login for Resend (the email service)',
			href: 'https://resend.com/login',
			label: 'Open Resend'
		},
		{
			id: 'manager',
			text: 'Use a password manager, with a different password for each account',
			detail:
				'Bitwarden and Proton Pass both have free plans. A password used on more than one site is the most common way accounts get taken over.'
		},
		{
			id: 'staff',
			text: 'Check who has an admin login, and remove anyone who doesn’t need one',
			href: '/admin/staff',
			label: 'Staff accounts'
		},
		{
			id: 'dbpass',
			text: 'Change the database password (I’ll do this in Hostinger)'
		},
		{
			id: 'backups',
			text: 'Check backups exist, and try restoring one (I’ll check this)',
			detail: 'A backup that has never been tested might not work when it’s needed.'
		}
	];

	let done = $state<Record<string, boolean>>({});
	const doneCount = $derived(items.filter((i) => done[i.id]).length);

	// Ticks are remembered in this browser only.
	$effect(() => {
		try {
			done = JSON.parse(localStorage.getItem('security-ticks') ?? '{}');
		} catch {
			/* storage unavailable — start with nothing ticked */
		}
	});

	function toggle(id: string) {
		done[id] = !done[id];
		try {
			localStorage.setItem('security-ticks', JSON.stringify(done));
		} catch {
			/* ticking still works for this visit */
		}
	}
</script>

<svelte:head>
	<title>Keeping the site safe — Help</title>
</svelte:head>

<a href="/admin/help" class="text-sm font-semibold text-ink-soft hover:text-ink">&larr; All help</a>

<div class="mt-4 max-w-2xl">
	<h1 class="font-display text-3xl text-ink sm:text-4xl">Keeping the site safe</h1>
	<p class="mt-2 text-lg text-ink-soft">
		What to do on your accounts, what already protects the site, and what to do if something looks
		wrong.
	</p>

	<h2 class="mt-10 font-display text-2xl text-ink">1 &middot; Things to do on your accounts</h2>
	<p class="mt-1 text-base text-ink-soft" aria-live="polite">
		{doneCount} of {items.length} done. Press the circle when you&rsquo;ve done each one.
	</p>
	<p class="mt-2 text-base leading-relaxed text-ink-soft">
		&ldquo;Two-step login&rdquo; means that even if someone learns a password, they also need your
		phone to get in. It&rsquo;s the single best protection, and it&rsquo;s free.
	</p>

	<ul class="mt-5 space-y-4">
		{#each items as item, i (item.id)}
			<li class="flex gap-4">
				<button
					type="button"
					onclick={() => toggle(item.id)}
					aria-pressed={!!done[item.id]}
					aria-label={`${item.text}: ${done[item.id] ? 'done, press to untick' : 'press when done'}`}
					class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-base font-bold transition-colors {done[
						item.id
					]
						? 'border-green-600 bg-green-600 text-white'
						: 'border-pink bg-pink text-cream hover:bg-pink-deep'}"
				>
					{#if done[item.id]}
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
						{i + 1}
					{/if}
				</button>
				<div class="min-w-0 flex-1">
					<p class="text-lg leading-snug font-semibold text-ink">{item.text}</p>
					{#if item.detail}
						<p class="mt-1 text-base leading-relaxed text-ink-soft">{item.detail}</p>
					{/if}
					{#if item.href}
						<a
							href={item.href}
							target={item.href.startsWith('http') ? '_blank' : undefined}
							rel="noreferrer"
							class="mt-1 inline-block text-base font-semibold text-pink-deep underline hover:text-pink"
						>
							{item.label}
							{item.href.startsWith('http') ? '↗' : '→'}
						</a>
					{/if}
				</div>
			</li>
		{/each}
	</ul>

	<h2 class="mt-12 font-display text-2xl text-ink">2 &middot; What already protects the site</h2>
	<ul class="mt-4 space-y-3 text-base leading-relaxed text-ink">
		<li class="rounded-xl border border-ink/10 bg-white/60 px-4 py-3">
			<strong>Passwords can&rsquo;t be read.</strong> They&rsquo;re scrambled before saving, so not even
			we can see them.
		</li>
		<li class="rounded-xl border border-ink/10 bg-white/60 px-4 py-3">
			<strong>Guessing is stopped.</strong> Five wrong tries locks a login for 15 minutes, for staff and
			customers.
		</li>
		<li class="rounded-xl border border-ink/10 bg-white/60 px-4 py-3">
			<strong>Strong passwords are required.</strong> At least 12 characters for staff and 10 for customers,
			and the obvious ones like &ldquo;password123&rdquo; are refused.
		</li>
		<li class="rounded-xl border border-ink/10 bg-white/60 px-4 py-3">
			<strong>Forms can&rsquo;t be flooded.</strong> The contact, sign-up and password-reset forms have
			limits, so nobody can use them to fill an inbox.
		</li>
		<li class="rounded-xl border border-ink/10 bg-white/60 px-4 py-3">
			<strong>The database is locked down.</strong> Only the website itself (and two named home connections)
			can reach it.
		</li>
		<li class="rounded-xl border border-ink/10 bg-white/60 px-4 py-3">
			<strong>Card details never touch the site.</strong> Payments happen on SumUp&rsquo;s own page, so
			there are no card numbers here to steal.
		</li>
		<li class="rounded-xl border border-ink/10 bg-white/60 px-4 py-3">
			<strong>Browsers are told to be careful.</strong> The site only works over a secure connection and
			can&rsquo;t be shown inside other websites.
		</li>
	</ul>
	<p class="mt-4 text-base text-ink-soft">
		Want the technical detail?
		<a href="/admin/help#security" class="font-semibold text-pink-deep hover:underline"
			>Read the full security rundown</a
		>.
	</p>

	<h2 class="mt-12 font-display text-2xl text-ink">3 &middot; If something looks wrong</h2>
	<section class="mt-4 rounded-xl bg-blush px-5 py-4 text-base leading-relaxed text-ink">
		<p class="font-semibold">
			For example: a login you don&rsquo;t recognise, an email you didn&rsquo;t ask for, or a
			password shared by mistake.
		</p>
		<ol class="mt-3 list-decimal space-y-2 pl-5">
			<li>Change your password straight away (My account), and any account that shared it.</li>
			<li>
				Tell me. Use the Feedback button, or phone me on <a
					href="tel:+447566257092"
					class="font-semibold text-pink-deep underline hover:text-pink">07566 257092</a
				> if it&rsquo;s urgent.
			</li>
			<li>
				If a SumUp key was shared by mistake, delete it in SumUp and make a new one. Nothing is
				lost.
			</li>
			<li>
				Staff admins can see who did what in the <a
					href="/admin/activity"
					class="font-semibold text-pink-deep hover:underline">Activity log</a
				>.
			</li>
		</ol>
	</section>

	<GuideFooter title="Keeping the site safe" />
</div>
