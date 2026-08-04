<svelte:head>
	<title>What's next — Help — Admin</title>
</svelte:head>

<p class="text-ink-soft text-sm">
	A full security, accessibility and search-engine check was run on 4 August 2026. Nothing critical or
	urgent came up — this is a punch-list for a future tidy-up pass, not a list of live problems.
</p>

<div class="mt-6 space-y-8">
	<section>
		<h2 class="text-ink text-lg font-semibold">Security</h2>
		<div class="border-ink/10 mt-3 divide-y divide-ink/10 rounded-2xl border bg-white/60">
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink text-sm font-medium">Customer logins don't lock out after repeated wrong guesses</p>
					<span class="bg-pink/10 text-pink-deep shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Recommended next</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					Staff logins already lock for 15 minutes after 5 wrong attempts; customer logins don't have
					the same protection yet, so a customer's password could in theory be guessed at with no
					limit on attempts.
				</p>
			</div>
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink-soft text-sm font-medium">The admin login page can be found by search engines</p>
					<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Quick fix</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					Not a data risk — the login itself is still protected — but there's no reason to let Google
					index it or waste crawl attention on it.
				</p>
			</div>
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink-soft text-sm font-medium">Uploaded photos are trusted to be what they claim to be</p>
					<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Low priority</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					Only JPG/PNG/WEBP are accepted and files are renamed on upload, so real-world risk is low —
					but the file's actual content isn't double-checked against what it claims to be.
				</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-ink text-lg font-semibold">Accessibility</h2>
		<div class="border-ink/10 mt-3 divide-y divide-ink/10 rounded-2xl border bg-white/60">
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink-soft text-sm font-medium">No "skip to content" link</p>
					<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Quick fix</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					Visitors using a keyboard or screen reader currently have to tab through the whole menu on
					every page before reaching the actual content.
				</p>
			</div>
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink-soft text-sm font-medium">Log in / sign up pages are missing a proper page heading</p>
					<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Quick fix</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					Screen readers rely on a page's main heading to announce what the page is — these two pages
					currently only have a logo and a small subtitle.
				</p>
			</div>
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink-soft text-sm font-medium">The search box on the weekly menus page has no label</p>
					<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Quick fix</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					It works fine visually, but a screen reader can't announce what the box is for without a
					label attached to it.
				</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-ink text-lg font-semibold">Search visibility (SEO)</h2>
		<div class="border-ink/10 mt-3 divide-y divide-ink/10 rounded-2xl border bg-white/60">
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink text-sm font-medium">Links shared on social media don't show a preview yet</p>
					<span class="bg-pink/10 text-pink-deep shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Recommended next</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					Sharing a link from the site to Instagram, Facebook or WhatsApp currently shows no image,
					title or description preview — worth fixing given how much traffic already comes from
					social.
				</p>
			</div>
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink text-sm font-medium">No structured "business card" data for Google</p>
					<span class="bg-pink/10 text-pink-deep shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Recommended next</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					Adding the address, phone number and opening hours in a format Google specifically
					understands can help with local search results and map listings.
				</p>
			</div>
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink-soft text-sm font-medium">No sitemap</p>
					<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Quick fix</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					A sitemap makes it slightly easier for Google to find every page automatically, rather than
					only the ones it discovers by following links.
				</p>
			</div>
			<div class="p-5">
				<div class="flex items-start justify-between gap-3">
					<p class="text-ink-soft text-sm font-medium">A product with no description can show a blank search-result snippet</p>
					<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">Quick fix</span>
				</div>
				<p class="text-ink-soft mt-1.5 text-sm leading-relaxed">
					Only affects products with the description field left empty on their edit page.
				</p>
			</div>
		</div>
	</section>
</div>
