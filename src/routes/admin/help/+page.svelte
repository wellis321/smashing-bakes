<svelte:head>
	<title>Guide — Help — Admin</title>
</svelte:head>

<div class="space-y-6">
	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Products</h2>
		<p class="text-ink-soft mt-1 text-sm">Everything customers can see and order in the shop.</p>
		<ul class="text-ink-soft mt-3 list-disc space-y-1.5 pl-5 text-sm">
			<li>"Add product" needs a name, category, price and photo at minimum — description and a badge ("New bake" or "On sale") are optional.</li>
			<li>Turn a product's <strong>Active</strong> toggle off to hide it from the shop without deleting it — handy for anything seasonal.</li>
			<li>Use the search box and the category/status filters at the top of the list to find something quickly once you've got a lot of products.</li>
			<li>On the edit page, <strong>Save changes</strong> keeps you there so you can keep tweaking; <strong>Save &amp; close</strong> saves and takes you back to the list.</li>
		</ul>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Categories</h2>
		<p class="text-ink-soft mt-1 text-sm">The groups products live under (Cupcakes, Brownies, Cheesecakes, etc).</p>
		<ul class="text-ink-soft mt-3 list-disc space-y-1.5 pl-5 text-sm">
			<li>Set these up before adding products for a brand-new type of bake — a product always needs a category to belong to.</li>
			<li>Renaming a category updates it everywhere it's used; nothing needs to be re-linked.</li>
		</ul>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Weekly menus</h2>
		<p class="text-ink-soft mt-1 text-sm">The specials board for a given week.</p>
		<ul class="text-ink-soft mt-3 list-disc space-y-1.5 pl-5 text-sm">
			<li>Add a menu with a date, then build it up in sections (e.g. "Brownies", "Cookie Pie") with items underneath each one.</li>
			<li>There's no separate "featured" switch — whichever menu has the soonest upcoming date automatically becomes the one shown on the homepage and at the top of <code class="text-xs">/menus</code>. Older ones stay visible further down.</li>
		</ul>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Promotions</h2>
		<p class="text-ink-soft mt-1 text-sm">Giveaways and competitions, like "Supporting Local Businesses".</p>
		<ul class="text-ink-soft mt-3 list-disc space-y-1.5 pl-5 text-sm">
			<li>Two styles: a plain step-by-step one (you write your own "Like / Comment / Share" style steps), or the "local business picker" style with the scrolling strip — set this on the edit page.</li>
			<li>A promotion only shows on its page once <strong>Published</strong> is on, and only shows its banner on the homepage once <strong>Feature on homepage</strong> is also on.</li>
			<li>If more than one promotion is marked "Feature on homepage" at the same time, the most recently created one wins — so switch the old one off before featuring a new one.</li>
		</ul>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Local businesses</h2>
		<p class="text-ink-soft mt-1 text-sm">Powers the scrolling strip on the "Supporting Local Businesses" promotion.</p>
		<ul class="text-ink-soft mt-3 list-disc space-y-1.5 pl-5 text-sm">
			<li>Bulk-add names one per line — add a category after a <code class="text-xs">|</code> if you like, e.g. <code class="text-xs">Cafe 136 | Cafe</code>.</li>
			<li>Click into a business to add its description, address, phone and website — anything filled in shows in the info card when a customer taps it on the strip.</li>
			<li>Toggle a business to <strong>Hidden</strong> to pull it from the strip without losing its details.</li>
			<li>The entries panel shows who picked what this week (it resets every Monday) — <strong>Pick random winner</strong> draws from that list.</li>
		</ul>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Polls</h2>
		<p class="text-ink-soft mt-1 text-sm">The flavour vote customers see at <code class="text-xs">/vote</code>.</p>
		<ul class="text-ink-soft mt-3 list-disc space-y-1.5 pl-5 text-sm">
			<li>Add your flavour options, then mark the poll <strong>Active</strong> — only one poll can run at a time, so activating a new one automatically switches off whichever was running before.</li>
			<li>Results and the list of voters build up on the poll's edit page as votes come in, ready for picking a winner.</li>
		</ul>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Posters</h2>
		<p class="text-ink-soft mt-1 text-sm">The swappable banner at the top of the homepage.</p>
		<ul class="text-ink-soft mt-3 list-disc space-y-1.5 pl-5 text-sm">
			<li>Set a heading, message, image and style, then mark it <strong>Active</strong>.</li>
			<li>Only one poster shows at a time — activating one automatically switches off whichever was live before, so there's no cleanup needed.</li>
		</ul>
	</section>

	<section class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Enquiries</h2>
		<p class="text-ink-soft mt-1 text-sm">Messages sent through the Contact page.</p>
		<ul class="text-ink-soft mt-3 list-disc space-y-1.5 pl-5 text-sm">
			<li>New enquiries are highlighted on the Dashboard as soon as they come in.</li>
			<li>Mark each one <strong>Contacted</strong> or <strong>Archived</strong> as you work through it, so the "new" count on the Dashboard stays a true to-do list rather than a running total.</li>
		</ul>
	</section>
</div>
