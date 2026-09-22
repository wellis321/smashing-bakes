<script lang="ts">
	type Item = { id: string; label: string };
	type Group = { label: string; items: Item[] };

	const groups: Group[] = [
		{ label: '', items: [{ id: 'getting-started', label: 'Getting started' }] },
		{
			label: 'Shop',
			items: [
				{ id: 'products', label: 'Products' },
				{ id: 'categories', label: 'Categories' },
				{ id: 'weekly-menus', label: 'Weekly menus' }
			]
		},
		{ label: '', items: [{ id: 'orders', label: 'Orders' }] },
		{
			label: 'Marketing',
			items: [
				{ id: 'promotions', label: 'Promotions' },
				{ id: 'local-businesses', label: 'Local businesses' },
				{ id: 'polls', label: 'Polls' },
				{ id: 'posters', label: 'Posters' },
				{ id: 'bespoke-cakes', label: 'Bespoke cakes' },
				{ id: 'newsletters', label: 'Newsletters' },
				{ id: 'media', label: 'Media library' }
			]
		},
		{
			label: 'People',
			items: [
				{ id: 'enquiries', label: 'Enquiries' },
				{ id: 'subscribers', label: 'Subscribers' },
				{ id: 'customers', label: 'Customers' },
				{ id: 'staff', label: 'Staff accounts' },
				{ id: 'activity-log', label: 'Activity log' }
			]
		},
		{ label: '', items: [{ id: 'settings', label: 'Settings' }] },
		{ label: '', items: [{ id: 'security', label: 'Security' }] },
		{ label: '', items: [{ id: 'whats-next', label: "What's next" }] }
	];

	const allIds = groups.flatMap((g) => g.items.map((i) => i.id));

	let activeId = $state(allIds[0]);
	let sections: Record<string, HTMLElement> = {};

	function registerSection(node: HTMLElement, id: string) {
		sections[id] = node;
		return {
			destroy() {
				delete sections[id];
			}
		};
	}

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id;
				}
			},
			{ rootMargin: '-15% 0px -70% 0px' }
		);
		for (const id of allIds) {
			const el = sections[id];
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>Help — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Help</h1>
<p class="mt-1 text-base text-ink-soft">
	How to use every feature on the site, what's protecting it, and what's still on the list.
</p>

<div class="mt-6 lg:hidden">
	<label for="help-jump" class="text-base font-medium text-ink-soft">Jump to a section</label>
	<select
		id="help-jump"
		value={activeId}
		onchange={(e) => {
			const id = e.currentTarget.value;
			sections[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}}
		class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
	>
		{#each groups as group, i (i)}
			<optgroup label={group.label || 'General'}>
				{#each group.items as item (item.id)}
					<option value={item.id}>{item.label}</option>
				{/each}
			</optgroup>
		{/each}
	</select>
</div>

<div class="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
	<aside class="hidden lg:block">
		<nav class="sticky top-6 space-y-5 rounded-2xl border border-ink/10 bg-white/60 p-4">
			{#each groups as group, i (i)}
				<div>
					{#if group.label}
						<p class="mb-1.5 px-3 text-xs font-semibold tracking-widest text-ink-soft/70 uppercase">
							{group.label}
						</p>
					{/if}
					<div class="space-y-0.5">
						{#each group.items as item (item.id)}
							<a
								href={`#${item.id}`}
								class={`block rounded-lg px-3 py-1.5 text-base transition-colors ${
									activeId === item.id
										? 'bg-pink/15 font-semibold text-pink-deep'
										: 'text-ink-soft hover:bg-blush hover:text-ink'
								}`}
							>
								{item.label}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</nav>
	</aside>

	<div class="min-w-0 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/60">
		<section
			id="getting-started"
			use:registerSection={'getting-started'}
			class="scroll-mt-6 p-6 sm:p-8"
		>
			<h2 class="font-display text-2xl text-ink">Getting started</h2>
			<p class="mt-3 text-base leading-relaxed text-ink-soft">
				New here? The short version: Smashin' Bakes takes pre-orders online for pickup Friday and
				Saturday — there's no online payment yet, so most of what you'll do in here is keeping the
				public site current and following up on what customers have already asked for.
			</p>

			<p class="mt-4 text-base font-semibold text-ink-soft">A typical routine looks like:</p>
			<ul class="mt-2 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Check <a href="#orders" class="text-pink-deep hover:underline">Orders</a> for anything placed
					since you last looked.
				</li>
				<li>
					Check <a href="#enquiries" class="text-pink-deep hover:underline">Enquiries</a> for anything
					sent through the contact form.
				</li>
				<li>
					Keep <a href="#weekly-menus" class="text-pink-deep hover:underline">Weekly menus</a> up to date
					with what's actually available this week.
				</li>
				<li>
					Swap the homepage <a href="#posters" class="text-pink-deep hover:underline">poster</a> if there's
					something worth announcing — sold out, a new bake, a shout-out.
				</li>
			</ul>

			<p class="mt-4 text-base leading-relaxed text-ink-soft">
				Beyond that, each section further down this page covers one specific part of the site — the
				same list you can see on the left (or in the dropdown menu, if your screen is narrower). If
				you already know what you're looking for, click it there and you'll jump straight to it. If
				you want to know what's actually protecting the site and its customers, rather than how to
				use a specific page, that's covered separately under <a
					href="#security"
					class="text-pink-deep hover:underline">Security</a
				>.
			</p>
		</section>

		<section id="products" use:registerSection={'products'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Products</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a href="/shop" target="_blank" rel="noreferrer" class="text-pink-deep hover:underline"
						>Front page &#8599;</a
					>
					<a
						href="/admin/products"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Everything customers can see and order in the shop.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					"Add product" needs a name, category and price at minimum — description, a photo and a
					badge ("New bake" or "On sale") are all optional. A product with no photo still gets
					created and shows fine on the shop page (just with no image); on the admin list it shows a
					small "no photo" icon in place of a thumbnail, so it's easy to spot which products still
					need one.
				</li>
				<li>
					Turn a product's <strong>Active</strong> toggle off to hide it from the shop without deleting
					it — handy for anything seasonal.
				</li>
				<li>
					Use the search box and the category/status filters at the top of the list to find
					something quickly once you've got a lot of products.
				</li>
				<li>
					On the edit page, <strong>Save changes</strong> keeps you there so you can keep tweaking;
					<strong>Save &amp; close</strong> saves and takes you back to the list.
				</li>
				<li>
					A product can have named options (variants) with their own price — a customer picks one
					before adding it to their cart. None are set up yet, but the field's ready whenever you
					need it (e.g. cake sizes).
				</li>
			</ul>
		</section>

		<section id="categories" use:registerSection={'categories'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Categories</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a href="/shop" target="_blank" rel="noreferrer" class="text-pink-deep hover:underline"
						>Front page &#8599;</a
					>
					<a
						href="/admin/categories"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				The groups products live under (Cupcakes, Brownies, Cheesecakes, etc).
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Set these up before adding products for a brand-new type of bake — a product always needs
					a category to belong to.
				</li>
				<li>Renaming a category updates it everywhere it's used; nothing needs to be re-linked.</li>
			</ul>
		</section>

		<section id="weekly-menus" use:registerSection={'weekly-menus'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Weekly menus</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a href="/menus" target="_blank" rel="noreferrer" class="text-pink-deep hover:underline"
						>Front page &#8599;</a
					>
					<a
						href="/admin/menus"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">The specials board for a given week.</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Add a menu with a date, then build it up in sections (e.g. "Brownies", "Cookie Pie") with
					items underneath each one.
				</li>
				<li>
					There's no separate "featured" switch — whichever menu has the soonest upcoming date
					automatically becomes the one shown on the homepage and at the top of <code
						class="text-xs">/menus</code
					>. Older ones stay visible further down.
				</li>
			</ul>
		</section>

		<section id="orders" use:registerSection={'orders'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Orders</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a href="/cart" target="_blank" rel="noreferrer" class="text-pink-deep hover:underline"
						>Front page &#8599;</a
					>
					<a
						href="/admin/orders"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Quick-buy orders placed on the site — a customer picks an item (or a few), checks out with
				their details and a pickup or delivery day, and it lands here.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					There's no online payment connected yet — every order is placed as "reserve now, pay in
					person on pickup/delivery," and the checkout page and confirmation email both say so
					plainly. Nothing here pretends to have taken a payment that hasn't happened.
				</li>
				<li>
					At checkout, a customer chooses <strong>pickup in store</strong> or
					<strong>free delivery</strong> (Barrhead/Neilston only, by copy alone — the address itself isn't
					validated against those areas, so it's worth a glance before the delivery day). A delivery order
					shows its address on the order detail page.
				</li>
				<li>
					An email goes out to <code class="text-xs">alanah@smashinbakes.co.uk</code> every time a
					new order comes in (set via the <code class="text-xs">NOTIFY_OWNER_EMAIL</code> environment
					variable, not from anywhere in this admin area) — so this list isn't the only way to notice
					one.
				</li>
				<li>
					The <strong>Active</strong> filter hides collected/cancelled orders so the list stays a
					working to-do rather than a full history — switch to <strong>All</strong> to see everything.
				</li>
				<li>
					Open an order to see the items, customer contact details, pickup/delivery day and any
					notes they left (allergies, messages), and to set its status (<strong>Pending</strong> →
					<strong>Ready for pickup</strong>
					→ <strong>Collected</strong>, or <strong>Cancelled</strong>) and mark payment as received
					once they've paid in person.
				</li>
				<li>
					Prices are always taken fresh from the product's current price at the moment an order is
					placed — a later price change never rewrites what an existing order actually charged.
				</li>
			</ul>
		</section>

		<section id="promotions" use:registerSection={'promotions'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Promotions</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a
						href="/promotions"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Front page &#8599;</a
					>
					<a
						href="/admin/promotions"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Giveaways and competitions, like "Supporting Local Businesses".
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Two styles: a plain step-by-step one (you write your own "Like / Comment / Share" style
					steps), or the "local business picker" style with the scrolling strip — set this on the
					edit page.
				</li>
				<li>
					A promotion only shows on its page once <strong>Published</strong> is on, and only shows
					its banner on the homepage once <strong>Feature on homepage</strong> is also on.
				</li>
				<li>
					If more than one promotion is marked "Feature on homepage" at the same time, the most
					recently created one wins — so switch the old one off before featuring a new one.
				</li>
			</ul>
		</section>

		<section
			id="local-businesses"
			use:registerSection={'local-businesses'}
			class="scroll-mt-6 p-6 sm:p-8"
		>
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Local businesses</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a
						href="/promotions/supporting-local-businesses"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Front page &#8599;</a
					>
					<a
						href="/admin/businesses"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Powers the scrolling strip on the "Supporting Local Businesses" promotion.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Bulk-add names one per line — add a category after a <code class="text-xs">|</code> if you
					like, e.g. <code class="text-xs">Cafe 136 | Cafe</code>.
				</li>
				<li>
					Click into a business to add its description, address, phone and website — anything filled
					in shows in the info card when a customer taps it on the strip.
				</li>
				<li>
					Toggle a business to <strong>Hidden</strong> to pull it from the strip without losing its details.
				</li>
				<li>
					The entries panel shows who picked what this week (it resets every Monday) — <strong
						>Pick random winner</strong
					> draws from that list.
				</li>
				<li>
					The strip's order is randomised on each visit, so businesses near the end of the list
					still get seen regularly rather than being permanently buried.
				</li>
			</ul>
		</section>

		<section id="polls" use:registerSection={'polls'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Polls</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a href="/vote" target="_blank" rel="noreferrer" class="text-pink-deep hover:underline"
						>Front page &#8599;</a
					>
					<a
						href="/admin/polls"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				The flavour vote customers see at <code class="text-xs">/vote</code>.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Add your flavour options, then mark the poll <strong>Active</strong> — only one poll can run
					at a time, so activating a new one automatically switches off whichever was running before.
				</li>
				<li>
					Results and the list of voters build up on the poll's edit page as votes come in, ready
					for picking a winner.
				</li>
			</ul>
		</section>

		<section id="posters" use:registerSection={'posters'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Posters</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a href="/" target="_blank" rel="noreferrer" class="text-pink-deep hover:underline"
						>Front page &#8599;</a
					>
					<a
						href="/admin/posters"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">The swappable banner at the top of the homepage.</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Set a heading, message, image and style, then mark it <strong>Active</strong>. Only one
					poster shows at a time — activating one automatically switches off whichever was live
					before, so there's no cleanup needed.
				</li>
				<li>
					An optional overline (small label above the heading) and a perks list (one per line, shown
					as a checklist) turn a plain announcement into more of a "join us" style pitch — both are
					entirely optional and hidden when left blank.
				</li>
				<li>
					The image bleeds past the card's top and bottom edges on the right-hand side — a
					square-ish photo with the main subject centred works best.
				</li>
			</ul>
		</section>

		<section
			id="bespoke-cakes"
			use:registerSection={'bespoke-cakes'}
			class="scroll-mt-6 p-6 sm:p-8"
		>
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Bespoke cakes</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a
						href="/bespoke-cakes"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Front page &#8599;</a
					>
					<a
						href="/admin/bespoke-cakes"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Everything on the public <code class="text-xs">/bespoke-cakes</code> page — hero, gallery,
				and customer quotes — has its own admin page, under
				<strong>Marketing &rarr; Bespoke cakes</strong>. Enquiries submitted from that page still
				land in <a href="#enquiries" class="text-pink-deep hover:underline">Enquiries</a>, same as
				the ones from the Contact page.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					A bold "Already know what you want? Skip straight to the form" button sits above
					everything else on the page, for anyone who doesn't want to scroll through the hero and
					gallery first — it jumps straight down to the enquiry form.
				</li>
				<li>
					The hero heading, intro text and photo work exactly like the homepage hero images — set
					once, shown until changed. Leave the photo blank and the page shows just the text.
				</li>
				<li>
					Both the hero photo and every gallery photo have <strong>Zoom</strong> and
					<strong>Position</strong> controls, with a live preview, for when a photo doesn't crop the
					way you'd like inside its box — drag the zoom slider below 100% to shrink back in (showing
					plain background around it) or above 100% to crop in tighter, and click one of the 9
					position dots to choose which part of the photo stays visible. Already-added gallery
					photos can be fixed the same way via their <strong>Adjust</strong> link, not just new ones.
				</li>
				<li>
					The gallery auto-scrolls continuously and loops seamlessly — hover over it to pause and
					read a caption. Add a photo (upload or choose from the library) with an optional caption,
					most recently added shown first; remove one any time, nothing else on the site references
					these photos so removing one is safe. Anyone with reduced-motion turned on at the OS level
					sees the original manual swipe-through-once version instead — nothing auto-moves for them.
				</li>
				<li>
					Customer quotes are deliberately <em>not</em> all shown together — the first two appear dotted
					between the hero, gallery and enquiry form, and anything beyond that shows as a small grid near
					the bottom. Edit or delete a quote any time; there's no limit on how many you can add.
				</li>
				<li>
					When choosing a photo "from library" for any of the above, double-check you've picked the
					right one — see the note under <a href="#media" class="text-pink-deep hover:underline"
						>Media library</a
					> about why that's easier to get wrong than it sounds.
				</li>
			</ul>
		</section>

		<section id="newsletters" use:registerSection={'newsletters'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Newsletters</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a
						href="/newsletter"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Front page &#8599;</a
					>
					<a
						href="/admin/newsletters"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Compose and send a proper email newsletter to everyone on the subscriber &amp; opted-in
				customer list.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Build it from a subject line, a hero image, a heading/intro, a few "highlight" cards (this
					week's menu, a promotion, a bestseller), a button and a sign-off — the live preview on the
					right shows exactly what it'll look like in an inbox.
				</li>
				<li>
					Always "Send test" to yourself first and check it in a real inbox before sending to
					everyone.
				</li>
				<li>
					"Send now" goes out immediately; "Schedule" sets a target date but still needs either a
					click on "Send now" once it arrives, or a cron/uptime service pointed at the dispatch
					endpoint (with its secret key) to fire automatically.
				</li>
				<li>
					Sending anything needs an email service connected first (<a
						href="https://resend.com"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Resend</a
					>) — without it, everything here still works except the actual sending.
				</li>
				<li>
					Every email includes a one-click unsubscribe link, as required by law for marketing email
					— clicking it removes a subscriber or turns off a customer's marketing opt-in.
				</li>
				<li>A sent newsletter is kept as a permanent record and can't be edited or deleted.</li>
			</ul>
		</section>

		<section id="media" use:registerSection={'media'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Media library</h2>
				<a
					href="/admin/media"
					target="_blank"
					rel="noreferrer"
					class="text-pink-deep hover:underline">Admin page &#8599;</a
				>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				The single shared pool of every image on the site — not just the ones uploaded here
				directly. Upload a photo anywhere in admin (a product, a poster, the bespoke cakes gallery,
				this page, anywhere with an image field) and it registers here automatically, so it can be
				found and reused anywhere else too, rather than getting re-uploaded as a separate copy each
				time it's needed.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Select several files at once — open a folder in the file picker and select-all to upload
					the whole thing in one go.
				</li>
				<li>
					Each uploaded image gets a permanent URL — use <strong>Copy URL</strong> and paste it anywhere
					on the site that asks for one, or pick it straight from the library on any image field elsewhere
					in admin.
				</li>
				<li>
					Click the title under any thumbnail to rename it — handy since a photo uploaded through a
					product/poster/etc's own upload field only ever gets a generated filename like
					<code class="text-xs">d3dd0f26-fe07-4c50-a992-…</code>, not the original name, since
					that's never captured.
				</li>
				<li>
					Because everything funnels into one shared pool, it's easy to click the wrong thumbnail
					when picking "Choose from library" somewhere else — a product photo and a bespoke cake
					photo can sit right next to each other in the grid, looking similar at a glance. Hover a
					thumbnail first to check its title (shown as a tooltip) before picking, especially once
					there are a lot of images in here.
				</li>
				<li>
					Every image — here and anywhere else in admin — is stored in the database itself, not as a
					file on the server. That matters in practice: it means an upload survives every future
					deploy rather than being at risk of quietly disappearing.
				</li>
			</ul>
		</section>

		<section id="enquiries" use:registerSection={'enquiries'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Enquiries</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a href="/contact" target="_blank" rel="noreferrer" class="text-pink-deep hover:underline"
						>Front page &#8599;</a
					>
					<a
						href="/admin/enquiries"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Bespoke cake requests, sent through either the Contact page or the dedicated <code
					class="text-xs">/bespoke-cakes</code
				> page — both post to the same form and land here identically.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>New enquiries are highlighted on the Dashboard as soon as they come in.</li>
				<li>
					An email also goes out straight away to <code class="text-xs"
						>alanah@smashinbakes.co.uk</code
					>
					(see the note on this under
					<a href="#orders" class="text-pink-deep hover:underline">Orders</a>) — so a new enquiry
					doesn't rely on someone happening to check this list.
				</li>
				<li>
					Mark each one <strong>Contacted</strong> or <strong>Archived</strong> as you work through it,
					so the "new" count on the Dashboard stays a true to-do list rather than a running total.
				</li>
			</ul>
		</section>

		<section id="subscribers" use:registerSection={'subscribers'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Subscribers</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a
						href="/newsletter"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Front page &#8599;</a
					>
					<a
						href="/admin/subscribers"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Everyone who's signed up for specials and offers, via the footer, homepage or the <code
					class="text-xs">/newsletter</code
				> page.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Everyone who signs up sees the same welcome offer on screen straight away — change what it
					says any time on the <a href="#settings" class="text-pink-deep hover:underline"
						>Settings</a
					> page.
				</li>
				<li>
					Signing up can optionally include a birthday — shown as a 🎂 badge in the list, so staff
					can spot who's due their birthday treat.
				</li>
				<li>
					A new signup also emails <code class="text-xs">alanah@smashinbakes.co.uk</code> straight away.
				</li>
				<li>
					"Mark redeemed" tracks who's already used their welcome offer at pickup, so it doesn't get
					used twice.
				</li>
				<li>
					"Export CSV" downloads the full list (email, name, birthday, source, date, redeemed
					status).
				</li>
				<li>
					This list, plus any customer account with marketing opted in, is exactly who a Newsletter
					goes to.
				</li>
			</ul>
		</section>

		<section id="customers" use:registerSection={'customers'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Customers</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a
						href="/account/register"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Front page &#8599;</a
					>
					<a
						href="/admin/customers"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Everyone with a full account — created when someone registers to vote, pick a local
				business, or check out.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Different from <strong>Subscribers</strong>: these are people who created a
					password-protected account, not just an email on the list.
				</li>
				<li>
					The <strong>Marketing OK</strong> badge reflects the opt-in checkbox they ticked when they registered.
				</li>
				<li>
					A customer can reset their own forgotten password from the login page — nothing for staff
					to do there unless they ask for help.
				</li>
				<li>
					"Export CSV" downloads the list (name, email, marketing opt-in, join date) — the same
					on-ramp to email tools as the Subscribers export.
				</li>
			</ul>
		</section>

		<section id="staff" use:registerSection={'staff'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Staff accounts</h2>
				<a
					href="/admin/staff"
					target="_blank"
					rel="noreferrer"
					class="text-pink-deep hover:underline">Admin page &#8599;</a
				>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Who can log into this admin area — only visible to admins, under <strong
					>People &rarr; Staff</strong
				>.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Creating an account generates a password shown once on screen — there's no email sending
					set up for this, so you'll need to pass it on to the new person yourself.
				</li>
				<li>
					They can change it afterwards from the account link in the top-right (their name), under <strong
						>My account</strong
					>.
				</li>
				<li>
					<strong>Admin</strong> vs <strong>Staff</strong> role only currently controls who can manage
					staff accounts — both roles can otherwise do everything else in here.
				</li>
				<li>
					Deactivating an account blocks login without deleting it; you can't deactivate, change the
					role of, or delete your own account.
				</li>
				<li>
					Click a name (or "Edit") to change their name/email/role/active status in one place, or
					delete their account entirely.
				</li>
				<li>
					If someone loses or mistypes their password and can't log in, use <strong
						>Reset password</strong
					>
					on their edit page to generate a fresh one — it replaces the old one immediately and signs them
					out of anywhere they were still logged in. This is blocked for a
					<a href="#security" class="text-pink-deep hover:underline">protected account</a> — only its
					own owner can act on it.
				</li>
				<li>
					Staff can also reset their own password without anyone's help, via
					<strong>Forgot your password?</strong> on the login page — a one-hour emailed link, the same
					pattern customer accounts already use.
				</li>
			</ul>
		</section>

		<section id="activity-log" use:registerSection={'activity-log'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Activity log</h2>
				<a
					href="/admin/activity"
					target="_blank"
					rel="noreferrer"
					class="text-pink-deep hover:underline">Admin page &#8599;</a
				>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Who logged in (or failed to), logged out, and every change made to a staff account —
				admin-only, under <strong>People &rarr; Activity log</strong>.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					Shows the most recent 200 events: successful and failed logins (with a reason — wrong
					password, locked out, deactivated, no such account), logouts, and every staff-management
					action (account created, role changed, activated/deactivated, deleted, password reset).
				</li>
				<li>
					Exists specifically so "is someone else on my account" or "did my login just fail
					repeatedly" is answerable from evidence rather than guesswork.
				</li>
			</ul>
		</section>

		<section id="settings" use:registerSection={'settings'} class="scroll-mt-6 p-6 sm:p-8">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="font-display text-2xl text-ink">Settings</h2>
				<div class="flex shrink-0 gap-4 text-sm font-semibold">
					<a href="/" target="_blank" rel="noreferrer" class="text-pink-deep hover:underline"
						>Front page &#8599;</a
					>
					<a
						href="/admin/settings"
						target="_blank"
						rel="noreferrer"
						class="text-pink-deep hover:underline">Admin page &#8599;</a
					>
				</div>
			</div>
			<p class="mt-1 text-base text-ink-soft">
				Site-wide settings that show up on the public site.
			</p>
			<ul class="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
				<li>
					The newsletter welcome offer shown on signup — a short label plus what it actually means —
					is entirely free text, so it can say whatever offer you're actually running (e.g. "TREAT
					CLUB — a free coffee every month, plus a free bake on your birthday"). Staff currently
					honour it manually in person; there's no automatic redemption system.
				</li>
				<li>
					The three overlapping photo cards next to the homepage headline can each be replaced with
					a real photo — upload or choose from the library, one slot at a time. Leave any blank and
					it falls back to the built-in illustration.
				</li>
			</ul>
		</section>

		<section id="security" use:registerSection={'security'} class="scroll-mt-6 p-6 sm:p-8">
			<h2 class="font-display text-2xl text-ink">Security</h2>
			<p class="mt-1 text-base leading-relaxed text-ink-soft">
				A technical rundown of what's actually protecting this site and the people who use it —
				every item below is a real, verifiable mechanism in the code, not a policy statement.
			</p>

			<div class="mt-5 space-y-5">
				<div>
					<h3 class="font-semibold text-ink">Passwords &amp; sessions</h3>
					<ul class="mt-2 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
						<li>
							<strong
								>Password hashing (<a
									href="https://en.wikipedia.org/wiki/Scrypt"
									target="_blank"
									rel="noreferrer"
									class="text-pink-deep hover:underline">scrypt</a
								>).</strong
							> Every password — staff and customer — is run through scrypt with a unique per-user random
							salt before storage, and compared using a timing-safe check on login. The raw password is
							never stored, and the process can't be reversed even with full database access.
						</li>
						<li>
							<strong>Session tokens, not passwords, drive "logged in."</strong> A random session
							token is set as an
							<a
								href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies"
								target="_blank"
								rel="noreferrer"
								class="text-pink-deep hover:underline">httpOnly</a
							>
							(unreadable by JavaScript), <code class="text-xs">secure</code> (HTTPS-only) cookie
							with a strict <code class="text-xs">sameSite</code> policy. The database only ever
							stores a
							<a
								href="https://en.wikipedia.org/wiki/SHA-2"
								target="_blank"
								rel="noreferrer"
								class="text-pink-deep hover:underline">SHA-256</a
							> hash of that token — the same principle as password storage — so a database leak alone
							can't be used to forge a session.
						</li>
						<li>
							<strong>Staff logins stay signed in for up to 14 days</strong>, extended automatically
							("sliding expiration") each time it's more than half expired and still in use — so an
							admin who logs in regularly will, in practice, never see it expire on its own. That's
							a deliberate convenience trade-off, not an oversight, and the cookie protections above
							(httpOnly, secure, hashed token) mean it can't just be read out of the browser or
							forged from a database leak. Where it does matter: on a
							<em>shared or public computer</em>, whoever's physically at that browser has full
							admin access for as long as the session lasts. There's currently no idle/inactivity
							timeout, and no self-service "sign out everywhere" — the only way to kill a session
							early today is resetting the password on that account from
							<strong>Staff accounts</strong>
							(or your own, from <strong>My account</strong>), which signs out every device at once.
							Worth deciding, once there's a real team using this: is 14 days with no idle timeout
							the right balance for how this admin area is actually used, or should it be tightened?
						</li>
						<li>
							<strong>Staff lockout.</strong> 5 wrong password attempts locks a staff account for 15 minutes,
							stopping unlimited automated guessing. Customer accounts don't have this yet — see What's
							next.
						</li>
						<li>
							<strong>Staff and customer auth are fully separate systems</strong> — independent logins,
							sessions and storage, so a problem in one can't reach the other.
						</li>
						<li>
							<strong>Self-service password reset</strong> uses a one-hour, single-use, SHA-256-hashed
							token (never the raw token itself is stored), and the response is identical whether or not
							the email actually matches an account — so the flow can't be used to find out who has an
							account.
						</li>
						<li>
							<strong>Protected staff accounts.</strong> By default, any admin can reset the
							password, change the role, deactivate, or delete <em>any other</em> staff account — including
							another admin. A staff account can be flagged (directly in the database, not through any
							button in the UI — so it can't be granted or revoked by anyone through the admin area itself)
							so that every one of those actions is refused for everyone except the account's own owner,
							logged in as themselves.
						</li>
					</ul>
				</div>

				<div>
					<h3 class="font-semibold text-ink">
						<a
							href="https://owasp.org/www-community/attacks/csrf"
							target="_blank"
							rel="noreferrer"
							class="text-pink-deep hover:underline">CSRF (Cross-Site Request Forgery)</a
						>
					</h3>
					<p class="mt-2 text-base leading-relaxed text-ink-soft">
						<a
							href="https://svelte.dev/docs/kit"
							target="_blank"
							rel="noreferrer"
							class="text-pink-deep hover:underline">SvelteKit</a
						>
						checks the
						<a
							href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin"
							target="_blank"
							rel="noreferrer"
							class="text-pink-deep hover:underline">Origin header</a
						>
						on every form submission by default and rejects anything that didn't originate from this site
						— this is on for every form here, nothing had to be added or configured, and nothing turns
						it off.
					</p>
				</div>

				<div>
					<h3 class="font-semibold text-ink">
						<a
							href="https://owasp.org/www-community/attacks/xss/"
							target="_blank"
							rel="noreferrer"
							class="text-pink-deep hover:underline">XSS (Cross-Site Scripting)</a
						>
						&amp;
						<a
							href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
							target="_blank"
							rel="noreferrer"
							class="text-pink-deep hover:underline">HTML escaping</a
						>
					</h3>
					<p class="mt-2 text-base leading-relaxed text-ink-soft">
						Every dynamic value rendered on the site is auto-escaped by
						<a
							href="https://svelte.dev"
							target="_blank"
							rel="noreferrer"
							class="text-pink-deep hover:underline">Svelte</a
						>
						by default — a product description or a customer's name can never be interpreted as HTML or
						a script, only ever as plain text. There are exactly two places on the whole site that ever
						bypass that auto-escaping (both for structured data Google reads, never for anything a visitor
						types), and both are passed through a small helper that neutralises the one character sequence
						(<code class="text-xs">&lt;/script&gt;</code>) that could otherwise break out of it.
					</p>
				</div>

				<div>
					<h3 class="font-semibold text-ink">
						<a
							href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS"
							target="_blank"
							rel="noreferrer"
							class="text-pink-deep hover:underline">CORS (Cross-Origin Resource Sharing)</a
						>
					</h3>
					<p class="mt-2 text-base leading-relaxed text-ink-soft">
						No CORS headers are configured anywhere on the site, which means the default, most
						restrictive browser behaviour applies: no other website can make an authenticated
						request to this site on a visitor's behalf. There's no API exposed for another origin to
						call.
					</p>
				</div>

				<div>
					<h3 class="font-semibold text-ink">
						<a
							href="https://owasp.org/www-community/attacks/SQL_Injection"
							target="_blank"
							rel="noreferrer"
							class="text-pink-deep hover:underline">SQL injection</a
						>
					</h3>
					<p class="mt-2 text-base leading-relaxed text-ink-soft">
						Every database query on the site goes through
						<a
							href="https://orm.drizzle.team"
							target="_blank"
							rel="noreferrer"
							class="text-pink-deep hover:underline">Drizzle ORM</a
						>'s parameterised query builder — submitted data is always passed as a bound value,
						never concatenated into a raw SQL string. This rules out SQL injection, one of the most
						common ways sites get hacked, structurally rather than by careful handling of each
						individual query.
					</p>
				</div>

				<div>
					<h3 class="font-semibold text-ink">Other things worth knowing about</h3>
					<ul class="mt-2 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-ink-soft">
						<li>
							<strong>Open-redirect protection.</strong> Anywhere the site redirects somewhere after an
							action (e.g. back to the page you were on before logging in), it only ever accepts a same-site
							relative path — never an arbitrary external URL — so a link can't be crafted to bounce someone
							off this site to a lookalike phishing page after a real login.
						</li>
						<li>
							<strong>Spam honeypots.</strong> The contact form and newsletter signup both have a hidden
							field invisible to a real visitor but that automated bots tend to fill in anyway — any submission
							that fills it in is quietly dropped.
						</li>
						<li>
							<strong>Unsubscribe links require a confirm step.</strong> Rather than unsubscribing on
							a bare click of a link, it requires submitting a form on the page that link opens. This
							defeats the common problem of email security scanners automatically "clicking" every link
							in an email (including unsubscribe links) the moment it arrives, which would otherwise unsubscribe
							people who never actually asked to be.
						</li>
						<li>
							<strong>The scheduled-newsletter endpoint needs a secret.</strong> It's disabled outright
							until a secret key is configured, and rejects any request that doesn't include the matching
							key — so it can't be triggered by anyone finding the URL.
						</li>
						<li>
							<strong>Uploaded images are validated and stored in the database.</strong> Only JPG/PNG/WEBP
							are accepted, files are capped at 5MB and renamed on upload (an uploaded file's name is
							never trusted or reused), and the bytes themselves live in the database rather than as files
							on disk.
						</li>
						<li>
							<strong>Everything runs over HTTPS.</strong> All traffic between a visitor's browser and
							the server is encrypted in transit.
						</li>
						<li>
							<strong>Secrets stay out of the codebase.</strong> API keys and database credentials live
							only in server-side environment variables, never committed to the code itself.
						</li>
					</ul>
				</div>
			</div>

			<div class="mt-6 rounded-xl border border-dashed border-ink/10 p-5">
				<p class="text-base leading-relaxed text-ink-soft">
					Nothing here is a substitute for the basics on your end: use a proper password for your
					admin account and don't share logins between staff. See <a
						href="#whats-next"
						class="text-pink-deep hover:underline">What's next</a
					>
					for the handful of things that could still be tightened up.
				</p>
			</div>
		</section>

		<section id="whats-next" use:registerSection={'whats-next'} class="scroll-mt-6 p-6 sm:p-8">
			<h2 class="font-display text-2xl text-ink">What's next</h2>
			<p class="mt-1 text-base leading-relaxed text-ink-soft">
				A punch-list for a future tidy-up pass, not a list of live problems — nothing here is
				critical or urgent.
			</p>

			<div class="mt-5 space-y-8">
				<div>
					<h3 class="font-semibold text-ink">Security</h3>
					<div class="mt-3 divide-y divide-ink/10 rounded-2xl border border-ink/10">
						<div class="p-4">
							<div class="flex items-start justify-between gap-3">
								<p class="text-base font-medium text-ink">
									Customer logins don't lock out after repeated wrong guesses
								</p>
								<span
									class="shrink-0 rounded-full bg-pink/10 px-2.5 py-0.5 text-xs font-semibold text-pink-deep"
									>Recommended next</span
								>
							</div>
							<p class="mt-1.5 text-base leading-relaxed text-ink-soft">
								Staff logins already lock for 15 minutes after 5 wrong attempts; customer logins
								don't have the same protection yet.
							</p>
						</div>
						<div class="p-4">
							<div class="flex items-start justify-between gap-3">
								<p class="text-base font-medium text-ink-soft">
									Uploaded photos are trusted to be what they claim to be
								</p>
								<span
									class="shrink-0 rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold text-ink-soft"
									>Low priority</span
								>
							</div>
							<p class="mt-1.5 text-base leading-relaxed text-ink-soft">
								Only JPG/PNG/WEBP are accepted and files are renamed on upload, so real-world risk
								is low — but the file's actual content isn't double-checked against what it claims
								to be.
							</p>
						</div>
						<div class="p-4">
							<div class="flex items-start justify-between gap-3">
								<p class="text-base font-medium text-ink-soft">
									No idle timeout or "sign out everywhere" for staff sessions
								</p>
								<span
									class="shrink-0 rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold text-ink-soft"
									>Worth a decision</span
								>
							</div>
							<p class="mt-1.5 text-base leading-relaxed text-ink-soft">
								Staff sessions last up to 14 days and renew automatically while in use, with no
								inactivity cutoff — see <strong>Passwords &amp; sessions</strong> above for the full picture.
								Fine for trusted devices; worth revisiting if the admin area will ever be used on a shared
								or public computer.
							</p>
						</div>
					</div>
				</div>

				<div>
					<h3 class="font-semibold text-ink">The bigger pieces</h3>
					<div class="mt-3 divide-y divide-ink/10 rounded-2xl border border-ink/10">
						<div class="p-4">
							<div class="flex items-start justify-between gap-3">
								<p class="text-base font-medium text-ink">No online payment yet</p>
								<span
									class="shrink-0 rounded-full bg-pink/10 px-2.5 py-0.5 text-xs font-semibold text-pink-deep"
									>Recommended next</span
								>
							</div>
							<p class="mt-1.5 text-base leading-relaxed text-ink-soft">
								Quick-buy orders are placed and paid for in person at pickup/delivery — connecting a
								real payment provider (SumUp, per the shop owner's request) would let customers
								actually pay online. Blocked on SumUp API credentials from whoever holds the SumUp
								business account; nothing to build until those exist.
							</p>
						</div>
						<div class="p-4">
							<div class="flex items-start justify-between gap-3">
								<p class="text-base font-medium text-ink-soft">The domain isn't pointed here yet</p>
								<span
									class="shrink-0 rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold text-ink-soft"
									>Waiting on you</span
								>
							</div>
							<p class="mt-1.5 text-base leading-relaxed text-ink-soft">
								The site is still on its Hostinger subdomain — <code class="text-xs"
									>smashinbakes.co.uk</code
								>
								is registered at GoDaddy and just needs pointing here. Once that's done and you're ready
								to actually launch, flip <code class="text-xs">PUBLIC_SITE_LIVE</code> on so search engines
								can index it.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>
