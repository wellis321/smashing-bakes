<svelte:head>
	<title>Security — Help — Admin</title>
</svelte:head>

<p class="text-ink-soft text-sm">
	A plain-English rundown of what's actually protecting this site and the people who use it — no jargon,
	just what's in place today. Last checked 4 August 2026.
</p>

<div class="mt-6 space-y-6">
	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Passwords are never stored as plain text</h2>
		<p class="text-ink-soft mt-2 text-sm leading-relaxed">
			Every password — staff and customer — is run through a one-way scrambling process before it ever
			touches the database. That process can't be reversed, so even in the worst case (someone getting
			access to the database itself), actual passwords aren't sitting there to be read. When someone
			logs in, their typed password is scrambled the same way and the two scrambled versions are
			compared — the real password is never stored or checked directly.
		</p>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Staff logins lock out after repeated wrong guesses</h2>
		<p class="text-ink-soft mt-2 text-sm leading-relaxed">
			After 5 wrong password attempts, a staff account locks for 15 minutes. This stops anyone from
			sitting there guessing passwords over and over.
		</p>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Staff and customer accounts are kept completely separate</h2>
		<p class="text-ink-soft mt-2 text-sm leading-relaxed">
			They're two independent systems with their own logins, their own sessions and their own storage.
			A problem in one genuinely cannot reach across and affect the other.
		</p>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Being "logged in" doesn't mean a password is floating around</h2>
		<p class="text-ink-soft mt-2 text-sm leading-relaxed">
			After logging in, a random one-time code is set as a secure cookie in the browser — it's marked
			so JavaScript can't read it, so it's only ever sent back to this site (not others), and so it's
			only sent over a secure, encrypted connection. The database only ever stores a scrambled version
			of that code, matching the same approach used for passwords.
		</p>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">The contact form has a spam trap</h2>
		<p class="text-ink-soft mt-2 text-sm leading-relaxed">
			There's a hidden field on the Contact page that's invisible to a real visitor but that automated
			spam bots tend to fill in anyway — any submission that fills it in gets quietly dropped before it
			reaches your enquiries list.
		</p>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">The site is served securely (https)</h2>
		<p class="text-ink-soft mt-2 text-sm leading-relaxed">
			Everything sent between a visitor's browser and the server — including anything typed into a
			form — is encrypted in transit, so it can't be read or tampered with along the way.
		</p>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Under the hood</h2>
		<p class="text-ink-soft mt-2 text-sm leading-relaxed">
			Every form on the site is built in a way that rules out SQL injection — one of the most common
			ways websites get hacked — because submitted data is never treated as part of a database command,
			only ever as a value. The code libraries the site is built on are checked for known
			vulnerabilities; as of the last check, there are none in anything that runs on the live site.
		</p>
	</section>
</div>

<div class="border-ink/10 mt-8 rounded-2xl border border-dashed p-6">
	<p class="text-ink-soft text-sm">
		Nothing here is a substitute for the basics on your end: use a proper password for your admin
		account and don't share logins between staff. See <a href="/admin/help/roadmap" class="text-pink-deep hover:underline">What's next</a>
		for the handful of things that could still be tightened up.
	</p>
</div>
