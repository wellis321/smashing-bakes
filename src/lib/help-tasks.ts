// Short, plain-English "how do I…" guides. Shown at /admin/help/<slug>, linked
// from the "Staff help" buttons on the public site and the "I want to…" list
// on the main help page. `section` points at the long-form reference for the
// same feature. Screenshots live in static/images/help/<name>.jpg.
export type Step = { text: string; image?: string };

export type HelpTask = {
	slug: string;
	group: string;
	title: string;
	summary: string;
	steps: Step[];
	tip?: string;
	goTo: { href: string; label: string };
	section: string;
};

const s = (text: string, image?: string): Step => ({ text, image });

export const helpTasks: HelpTask[] = [
	// ── The homepage ────────────────────────────────────────────────
	{
		slug: 'hero-photos',
		group: 'The homepage',
		title: 'Change the photos at the top of the homepage',
		summary: 'The three overlapping photos next to the big headline.',
		steps: [
			s('Press the pink button below to open Settings. The “Homepage photos” box opens for you.'),
			s(
				'For each photo you want to change, press “Choose from library” to pick one you’ve already uploaded, or the upload button (it says “Browse…” or “Choose file”, depending on your browser) to add a new one from your computer.',
				'hero-photos-2'
			),
			s('Press “Save changes”.', 'hero-photos-3'),
			s('Open the homepage and refresh the page to see the new photos.')
		],
		tip: 'Square photos work best. Any photo you leave alone stays as it is.',
		goTo: { href: '/admin/settings#hero-images', label: 'Go to Homepage photos' },
		section: 'settings'
	},
	{
		slug: 'banner',
		group: 'The homepage',
		title: 'Change the homepage banner and its writing',
		summary: 'The banner under the top of the homepage (the “tacos” one, for example).',
		steps: [
			s('Press the pink button below to open Posters.'),
			s(
				'Find the banner that is marked Active. That’s the one showing on the site. Press “Edit”.',
				'banner-2'
			),
			s('Change the heading, the message, the button wording or the photo.'),
			s('Press “Save changes”, then refresh the homepage to check it.')
		],
		tip: 'Only one banner shows at a time. To switch to a different one, make that one Active instead.',
		goTo: { href: '/admin/posters', label: 'Go to Posters' },
		section: 'posters'
	},
	{
		slug: 'new-banner',
		group: 'The homepage',
		title: 'Add a new homepage banner',
		summary: 'Make a fresh announcement banner and switch it on.',
		steps: [
			s('Open the Marketing menu at the top and choose Posters, then press “+ New poster”.'),
			s(
				'Fill in the “Heading” and the “Message”. Pick a “Style” (General, Announcement, Sold out or Celebration). You can add a photo too.',
				'new-banner-2'
			),
			s('Press “Create poster”.'),
			s(
				'Back on the list, press “Set active” next to your new banner. It now shows on the homepage and the old one switches off.',
				'banner-2'
			)
		],
		tip: 'A new banner starts switched off. To show no banner at all, press the “Active” pill on the one that’s showing.',
		goTo: { href: '/admin/posters/new', label: 'Add a banner' },
		section: 'posters'
	},
	{
		slug: 'this-weeks-bakes',
		group: 'The homepage',
		title: 'Choose what shows in “This week’s bakes”',
		summary: 'The photo cards in the middle of the homepage.',
		steps: [
			s('Press the pink button below to open Products.'),
			s(
				'Find a bake you want on the homepage and press the “★ This week’s bake” button on its row. Solid pink means it’s showing.',
				'this-weeks-bakes-2'
			),
			s('To take a bake off the homepage, press the same button again.'),
			s('Refresh the homepage to see the change.')
		],
		tip: 'Want three photos? Switch it on for three bakes. A bake also has to be Active (not Hidden) to show.',
		goTo: { href: '/admin/products', label: 'Go to Products' },
		section: 'products'
	},
	{
		slug: 'category-photos',
		group: 'The homepage',
		title: 'Change a category’s photo on the homepage',
		summary: 'The tiles in “Browse by bake”, such as Cupcakes or Classics.',
		steps: [
			s('Press the pink button below to open Categories.'),
			s('Press the category you want to change.', 'category-photos-2'),
			s(
				'Under “Homepage tile photo”, choose a photo from the library or upload a new one.',
				'category-photos-3'
			),
			s('Press “Save changes”.')
		],
		tip: 'No photo? The site uses a built-in picture. To go back to it, tick “Remove my photo” and save.',
		goTo: { href: '/admin/categories', label: 'Go to Categories' },
		section: 'categories'
	},
	{
		slug: 'opening-hours',
		group: 'The homepage',
		title: 'Change the opening hours',
		summary: 'Shown in the banner at the very top, the footer, the homepage and the Contact page.',
		steps: [
			s('Press the pink button below to open Settings. The “Opening hours” box opens for you.'),
			s(
				'Type each day or range on its own line, just as you want it to read, for example “Friday 10am – 4pm”.',
				'opening-hours-2'
			),
			s('Press “Save changes”.', 'opening-hours-3')
		],
		tip: 'Clear the box and save to go back to the usual Friday and Saturday hours.',
		goTo: { href: '/admin/settings#opening-hours', label: 'Go to Opening hours' },
		section: 'settings'
	},
	{
		slug: 'welcome-offer',
		group: 'The homepage',
		title: 'Change the newsletter welcome offer',
		summary: 'What people are told they get when they join the mailing list.',
		steps: [
			s(
				'Press the pink button below to open Settings. The “Newsletter welcome offer” box opens for you.'
			),
			s(
				'Change the short label (for example “TREAT CLUB”) and the sentence that explains the offer.',
				'welcome-offer-2'
			),
			s('Press “Save changes”.')
		],
		tip: 'Staff give this out in person. There’s no automatic code, so only promise what you’re happy to hand over.',
		goTo: { href: '/admin/settings#welcome-offer', label: 'Go to Welcome offer' },
		section: 'settings'
	},
	{
		slug: 'hide-page',
		group: 'The homepage',
		title: 'Hide a page from the site',
		summary: 'For example, taking the Vote page down between polls.',
		steps: [
			s('Press the pink button below to open Settings. “Show or hide pages” opens for you.'),
			s('Untick the page you want to hide.', 'hide-page-2'),
			s('Press “Save changes”.', 'hide-page-3')
		],
		tip: 'The page disappears from the menu and visitors who find it get “page not found”. Tick it again and save to bring it back.',
		goTo: { href: '/admin/settings#page-visibility', label: 'Go to Show or hide pages' },
		section: 'settings'
	},
	{
		slug: 'bespoke-page',
		group: 'The homepage',
		title: 'Edit the top of the Bespoke cakes page',
		summary: 'The heading, intro text and main photo.',
		steps: [
			s('Press the pink button below to open the Bespoke cakes page editor.'),
			s(
				'Change the “Heading”, the “Intro text” or the “Hero photo” in the first box.',
				'bespoke-page-2'
			),
			s(
				'If your photo is upright (most cake photos are), choose “Tall” under “Photo shape”. The photo then sits beside the heading so the whole cake shows. “Wide banner” is for landscape photos.',
				'bespoke-page-3'
			),
			s('Press “Save changes” in that box.')
		],
		tip: 'Drag the pink frame and use Zoom to choose which part of the photo shows. “Fit whole photo” shows all of it. The gallery and quotes further down have their own guide.',
		goTo: { href: '/admin/bespoke-cakes', label: 'Go to Bespoke cakes' },
		section: 'bespoke-cakes'
	},
	{
		slug: 'bespoke-gallery',
		group: 'The homepage',
		title: 'Add or remove a cake in the gallery',
		summary: 'The sliding “Past designs” photos on the Bespoke cakes page.',
		steps: [
			s('Open the Marketing menu at the top and choose Bespoke cakes.'),
			s(
				'Find “Cake gallery”. Choose a photo, add a caption if you like, and press “Add to gallery”.',
				'bespoke-gallery-2'
			),
			s(
				'To change which part of a photo shows, press “Adjust” under it. (See “Choose which part of a photo shows” for how.)'
			),
			s('To take a cake out of the gallery, press “Remove” under it.')
		],
		tip: 'Photos go live straight away, newest first. Upright photos suit the gallery well because its cards are tall.',
		goTo: { href: '/admin/bespoke-cakes', label: 'Go to Bespoke cakes' },
		section: 'bespoke-cakes'
	},

	// ── Products and the shop ───────────────────────────────────────
	{
		slug: 'bespoke-quotes',
		group: 'The homepage',
		title: 'Add, change or remove a customer quote',
		summary: 'The kind words shown on the Bespoke cakes page.',
		steps: [
			s('Open the Marketing menu at the top and choose Bespoke cakes.'),
			s(
				'Find “Customer quotes”. Type the “Quote” and, if you like, who it’s from under “Attributed to”, then press “Add quote”.',
				'bespoke-quotes-2'
			),
			s(
				'To fix a quote, press “Edit” under it, change the words, then press “Save”.',
				'bespoke-quotes-3'
			),
			s('To take one down, press “Delete” under it.')
		],
		tip: 'Newest quotes come first. The first one sits under the main photo, the second further down the page, and any more are grouped together near the bottom as “More kind words”.',
		goTo: { href: '/admin/bespoke-cakes', label: 'Go to Bespoke cakes' },
		section: 'bespoke-cakes'
	},
	{
		slug: 'add-product',
		group: 'Products and the shop',
		title: 'Add a new product',
		summary: 'Put a new bake on the shop.',
		steps: [
			s('Press the pink button below to start a new product.'),
			s('Fill in the name, choose a category and set the price.', 'add-product-2'),
			s('Add a photo if you have one. You can add it later too.'),
			s('Press save. It appears in the shop straight away.')
		],
		tip: 'Want it on the homepage too? Switch on “★ This week’s bake” for it in the Products list.',
		goTo: { href: '/admin/products/new', label: 'Add a product' },
		section: 'products'
	},
	{
		slug: 'edit-product',
		group: 'Products and the shop',
		title: 'Change a product’s name, price or photo',
		summary: 'Update something that’s already in the shop.',
		steps: [
			s('Open the Shop menu at the top and choose Products.'),
			s('Press the product’s name, or its “Edit” link, to open it.'),
			s('Change the “Product name” or the “Price (£)”.', 'edit-product-2'),
			s(
				'To change the main photo, use “Choose from library” or the upload button under “Product photo”. Leave it alone to keep the current photo. Then press “Save changes”.',
				'edit-product-3'
			)
		],
		tip: 'Leave “URL slug” alone. It’s the web address of the page and it doesn’t change when you rename the product.',
		goTo: { href: '/admin/products', label: 'Go to Products' },
		section: 'products'
	},
	{
		slug: 'product-photos',
		group: 'Products and the shop',
		title: 'Add extra photos to a product',
		summary: 'Small photos shown under the main one on the product page.',
		steps: [
			s('Open the Shop menu, choose Products, then press the product to edit it.'),
			s('Scroll down to the “Additional photos” box underneath the main form.', 'product-photos-2'),
			s(
				'Under “Add a photo”, choose or upload a photo, then press “Add photo”. It saves straight away.'
			),
			s('To take one away, press “Remove” under it.')
		],
		tip: 'You can add up to 3. Once there are three, the add box disappears until you remove one.',
		goTo: { href: '/admin/products', label: 'Go to Products' },
		section: 'products'
	},
	{
		slug: 'put-on-sale',
		group: 'Products and the shop',
		title: 'Put a product on sale',
		summary: 'Show a lower price with a “Sale” label.',
		steps: [
			s('Open the Shop menu, choose Products, then press the product to edit it.'),
			s(
				'Type the new price in “Sale price (£, optional)” and set “Badge” to “On sale”.',
				'put-on-sale-2'
			),
			s('Press “Save changes”.'),
			s('To end the sale, set “Badge” back to “None” and save.')
		],
		tip: 'You need both the sale price and the “On sale” badge. One without the other shows nothing.',
		goTo: { href: '/admin/products', label: 'Go to Products' },
		section: 'products'
	},
	{
		slug: 'hide-product',
		group: 'Products and the shop',
		title: 'Hide a product without deleting it',
		summary: 'Handy for seasonal bakes you’ll bring back later.',
		steps: [
			s('Open the Shop menu at the top and choose Products.'),
			s(
				'Press the grey “Active” pill on that product’s row. It turns pink and says “Hidden”.',
				'hide-product-2'
			),
			s('Press it again whenever you want it back in the shop.')
		],
		tip: 'It saves instantly. Avoid the red “Delete” link, which can’t be undone. A hidden bake won’t show in “This week’s bakes” either.',
		goTo: { href: '/admin/products', label: 'Go to Products' },
		section: 'products'
	},
	{
		slug: 'add-category',
		group: 'Products and the shop',
		title: 'Add a new category',
		summary: 'A new group in the shop, like “Blondies”.',
		steps: [
			s(
				'Open the Shop menu at the top, choose Categories, then press “+ New category”.',
				'add-category-2'
			),
			s(
				'Type a “Category name”. A description is optional. Then press “Create category”.',
				'add-category-3'
			),
			s('The new category now appears in the “Category” list when you add a product.')
		],
		tip: 'Want a photo for its homepage tile? Open the category afterwards and add one. See “Change a category’s photo”.',
		goTo: { href: '/admin/categories/new', label: 'Add a category' },
		section: 'categories'
	},
	{
		slug: 'weekly-menu',
		group: 'Products and the shop',
		title: 'Publish a weekly menu',
		summary: 'The specials list for the weekend.',
		steps: [
			s('Open the Shop menu at the top, choose Weekly menus, then press “+ New menu”.'),
			s(
				'Choose the “Weekend date”. Give the first section a title (for example “Brownies”) and type one item per line underneath.',
				'weekly-menu-2'
			),
			s('Press “+ Add section” if you need more sections.'),
			s('Tick “Published (visible on site)” and press “Create menu”.', 'weekly-menu-3')
		],
		tip: 'Leave “Published” unticked to save it as a draft. On the list, press the Published or Draft pill to switch it.',
		goTo: { href: '/admin/menus/new', label: 'Add a weekly menu' },
		section: 'weekly-menus'
	},
	{
		slug: 'placeholder-images',
		group: 'Products and the shop',
		title: 'Download the built-in pictures',
		summary: 'The pictures the site uses when a category or product has no photo.',
		steps: [
			s('Press the pink button below to open the Media library.'),
			s('Under “Built-in pictures”, press “Download” on the one you want.', 'placeholder-images-2'),
			s('Upload the downloaded picture wherever you’d use a photo, for example on a product.')
		],
		tip: 'They download as PNG files, which the site accepts. The originals are a different type (SVG) that can’t be uploaded.',
		goTo: { href: '/admin/media#illustrations', label: 'Go to Built-in pictures' },
		section: 'media'
	},
	{
		slug: 'media-library',
		group: 'Products and the shop',
		title: 'Upload photos and rename them',
		summary: 'Keep your pictures in one place so you can reuse them.',
		steps: [
			s('Open the Marketing menu at the top and choose Media.'),
			s('Under “Add images”, choose one or more photos and press “Upload”.', 'media-library-2'),
			s(
				'To rename a photo, click in the “Title” box under it, type a new name and press Enter (or click away). It saves by itself.'
			)
		],
		tip: 'JPG, PNG or WEBP, up to 5MB each. A good title makes the photo easy to find later in “Choose from library”.',
		goTo: { href: '/admin/media', label: 'Go to Media' },
		section: 'media'
	},

	// ── Orders ──────────────────────────────────────────────────────
	{
		slug: 'manage-orders',
		group: 'Orders and customers',
		title: 'See an order and mark it ready',
		summary: 'Check what’s been ordered and update its progress.',
		steps: [
			s('Press “Orders” in the top bar.'),
			s('Press an order to open it.', 'manage-orders-2'),
			s(
				'In the Status box, change “Order status” (for example to “Ready for pickup”) and “Payment” (to “Paid (in person)” once they’ve paid), then press “Save changes”.',
				'manage-orders-3'
			)
		],
		tip: 'Customers aren’t emailed when you change the status, so use their email or phone link on the order if you need to tell them. Finished orders drop off the default list. Press “All” to see them.',
		goTo: { href: '/admin/orders', label: 'Go to Orders' },
		section: 'orders'
	},
	{
		slug: 'bespoke-enquiries',
		group: 'Orders and customers',
		title: 'Deal with a bespoke cake enquiry',
		summary: 'Enquiries from the form on the Bespoke cakes and Contact pages.',
		steps: [
			s('Open the People menu at the top and choose Enquiries.'),
			s(
				'Each box shows what the customer wrote. Press their email address or phone number to get in touch.',
				'bespoke-enquiries-2'
			),
			s('Once you’ve replied, change the status on that box to “Contacted”.')
		],
		tip: 'There’s no reply button inside the site, so you reply from your own email. “Archived” enquiries stay in the list.',
		goTo: { href: '/admin/enquiries', label: 'Go to Enquiries' },
		section: 'enquiries'
	},

	// ── Marketing ───────────────────────────────────────────────────
	{
		slug: 'add-promotion',
		group: 'Marketing',
		title: 'Create a promotion or giveaway',
		summary: 'A page for a competition, offer or giveaway.',
		steps: [
			s('Open the Marketing menu at the top, choose Promotions, then press “+ New promotion”.'),
			s('Type a “Promotion title” and choose “How people take part”.', 'add-promotion-2'),
			s('Fill in whichever of the intro, prize, steps and deadline you need.'),
			s(
				'Tick “Published (visible on site)” (and “Feature on homepage” if you want it there), then press “Create promotion”.'
			)
		],
		tip: '“Feature on homepage” only works once the promotion is published.',
		goTo: { href: '/admin/promotions/new', label: 'Add a promotion' },
		section: 'promotions'
	},
	{
		slug: 'flavour-poll',
		group: 'Marketing',
		title: 'Run a flavour vote and see the results',
		summary: 'Let customers vote for next week’s flavours.',
		steps: [
			s('Open the Marketing menu at the top, choose Polls, then press “+ New poll”.'),
			s('Type a “Poll title” and fill in at least two “Flavour options”.', 'flavour-poll-2'),
			s('Press “Create poll”.'),
			s(
				'On the Polls list, press “Set active” on your poll so it shows on the Vote page.',
				'flavour-poll-3'
			),
			s(
				'To see how it’s going, press “Edit” on the poll and scroll down to “Results”. There’s a “Pick random winner” button there too.'
			)
		],
		tip: 'Only one poll can be active at a time. Customers need to be logged in to vote, and get one vote each. You can’t change the options once voting has started.',
		goTo: { href: '/admin/polls', label: 'Go to Polls' },
		section: 'polls'
	},
	{
		slug: 'send-newsletter',
		group: 'Marketing',
		title: 'Write and send a newsletter',
		summary: 'Email everyone on your mailing list.',
		steps: [
			s('Open the Marketing menu at the top, choose Newsletters, then press “+ New newsletter”.'),
			s(
				'Fill in the “Subject line”, the “Heading” and an intro. You can add photos and highlight cards too. The preview on the right updates as you go.',
				'send-newsletter-2'
			),
			s('Press “Save draft”.'),
			s('Press “Send test” to email it to yourself first and check it looks right.'),
			s('When you’re happy, press “Send now”.')
		],
		tip: 'A sent newsletter can’t be edited or sent again. A scheduled date is only a reminder, so you still press “Send now” on the day.',
		goTo: { href: '/admin/newsletters/new', label: 'Write a newsletter' },
		section: 'newsletters'
	},
	{
		slug: 'subscribers',
		group: 'Marketing',
		title: 'See or download your newsletter subscribers',
		summary: 'Everyone who has joined the mailing list.',
		steps: [
			s('Open the People menu at the top and choose Subscribers.'),
			s('Press “Export CSV” to download everyone as a spreadsheet.', 'subscribers-2'),
			s('On each person’s row, press “Mark redeemed” once they’ve had their welcome offer.')
		],
		tip: 'The file opens in Excel or Numbers.',
		goTo: { href: '/admin/subscribers', label: 'Go to Subscribers' },
		section: 'subscribers'
	},
	{
		slug: 'add-business',
		group: 'Marketing',
		title: 'Add local businesses',
		summary: 'For the “choose a local business” promotion.',
		steps: [
			s('Open the Marketing menu at the top and choose Local businesses.'),
			s(
				'Type one business per line. To give it a type, add a bar and the type, like “Cafe 136 | Cafe”.',
				'add-business-2'
			),
			s('Press “Add businesses”.')
		],
		tip: 'Names already in the list are skipped. Businesses only show on the site if a published promotion is set to “Choose a local business”.',
		goTo: { href: '/admin/businesses', label: 'Go to Local businesses' },
		section: 'local-businesses'
	},

	// ── People and your account ─────────────────────────────────────
	{
		slug: 'add-staff',
		group: 'People and your account',
		title: 'Add a staff member or reset a password',
		summary: 'Give someone a login, or help them get back in.',
		steps: [
			s('Open the People menu at the top and choose Staff. (Only admins can see it.)'),
			s(
				'Type their “Name” and “Email”, choose a “Role”, and press “Create account”.',
				'add-staff-2'
			),
			s('A temporary password appears. Press “Copy” and pass it to them yourself.'),
			s(
				'To reset a forgotten password, press the person in the list and then “Generate new password”.'
			)
		],
		tip: 'A password is only shown once, and the old one stops working straight away. You can’t reset your own here. Use “My account” for that.',
		goTo: { href: '/admin/staff', label: 'Go to Staff' },
		section: 'staff'
	},
	{
		slug: 'change-password',
		group: 'People and your account',
		title: 'Change your password',
		summary: 'Choose a new password for your own login.',
		steps: [
			s('Press your name at the top right of the admin bar to open “My account”.'),
			s('Type your “Current password”, then your “New password” twice.', 'change-password-2'),
			s('Press “Change password”.')
		],
		tip: 'It needs to be at least 8 characters.',
		goTo: { href: '/admin/account', label: 'Go to My account' },
		section: 'security'
	},
	// ── More guides ─────────────────────────────────────────────────
	{
		slug: 'adjust-photo',
		group: 'The homepage',
		title: 'Choose which part of a photo shows',
		summary: 'Drag a frame over your photo to pick the part you want, such as in the cake gallery.',
		steps: [
			s(
				'Open the Marketing menu at the top and choose Bespoke cakes. Under “Cake gallery”, choose or upload a photo. Your whole photo appears with a pink frame on it.'
			),
			s(
				'Drag the pink frame over the part of the photo you want people to see. You can also click on the photo to move the frame there. The “How it will look” picture on the right shows the result.',
				'adjust-photo-2'
			),
			s(
				'Use the “Zoom” slider to get closer (slide right) or to show more of the photo (slide left). The frame gets smaller or bigger to match.'
			),
			s('Add a caption if you like, then press “Add to gallery”.'),
			s(
				'For a photo that’s already there, press “Adjust” under it, change the frame and zoom the same way, and press “Save”.'
			)
		],
		tip: 'The “How it will look” picture is the same shape as the real thing, so what you see there is what visitors get. Press “Fit whole photo” to see all of it (the gaps fill with a soft blur), or “Reset” to start again. On a keyboard, click the frame and use the arrow keys.',
		goTo: { href: '/admin/bespoke-cakes', label: 'Go to Bespoke cakes' },
		section: 'bespoke-cakes'
	},
	{
		slug: 'find-product',
		group: 'Products and the shop',
		title: 'Find a product quickly',
		summary: 'Search and filter the product list.',
		steps: [
			s('Open the Shop menu at the top and choose Products.'),
			s(
				'Type part of the name in the search box, or use the drop-downs to narrow the list by category, by Active or Hidden, or by badge (for example “On sale only”).',
				'find-product-2'
			),
			s('Use the “Sort” menu on the right to change the order, for example by price.'),
			s('To see everything again, clear the search box and set the drop-downs back to “All…”.')
		],
		tip: 'The small line above the list tells you how many products are showing out of the total.',
		goTo: { href: '/admin/products', label: 'Go to Products' },
		section: 'products'
	},
	{
		slug: 'hide-category',
		group: 'Products and the shop',
		title: 'Hide a category',
		summary: 'Take a whole category off the shop without deleting it.',
		steps: [
			s('Open the Shop menu at the top and choose Categories.'),
			s(
				'Press the grey “Active” pill on that category’s row. It turns pink and says “Hidden”.',
				'hide-category-2'
			),
			s('Press it again whenever you want it back.')
		],
		tip: 'A hidden category disappears from the menus and the homepage tiles. A category can’t be deleted while it still has products in it.',
		goTo: { href: '/admin/categories', label: 'Go to Categories' },
		section: 'categories'
	},
	{
		slug: 'edit-menu',
		group: 'Products and the shop',
		title: 'Change or hide a weekly menu',
		summary: 'Fix a typo, add an item or take a menu down.',
		steps: [
			s('Open the Shop menu at the top and choose Weekly menus.'),
			s(
				'To hide a menu, press its “Published” pill so it says “Draft”. Press it again to show it.',
				'edit-menu-2'
			),
			s(
				'To change what’s on it, press the menu, change the sections or items (one item per line), then press “Save changes”.',
				'edit-menu-3'
			)
		],
		tip: 'When a menu is published, a “View live page” link at the top of its edit page shows how it looks to customers.',
		goTo: { href: '/admin/menus', label: 'Go to Weekly menus' },
		section: 'weekly-menus'
	},
	{
		slug: 'cancel-order',
		group: 'Orders and customers',
		title: 'Cancel an order or find a finished one',
		summary: 'Look back at old orders, or cancel one.',
		steps: [
			s('Press “Orders” in the top bar.'),
			s(
				'The list only shows orders still to do. Press “All” to include collected and cancelled ones.',
				'cancel-order-2'
			),
			s(
				'To cancel an order, open it, change “Order status” to “Cancelled” and press “Save changes”.',
				'cancel-order-3'
			)
		],
		tip: 'The customer isn’t told automatically, so contact them yourself. Avoid the red “Delete this order” link, which removes the record for good.',
		goTo: { href: '/admin/orders', label: 'Go to Orders' },
		section: 'orders'
	},
	{
		slug: 'customers',
		group: 'Orders and customers',
		title: 'See and download your customers',
		summary: 'People who have made a full account on the site.',
		steps: [
			s('Open the People menu at the top and choose Customers.'),
			s('The page shows how many accounts there are and how many agreed to marketing emails.'),
			s('Press “Export CSV” to download the list as a spreadsheet.', 'customers-2')
		],
		tip: 'These are people with a full account (from voting or the local business picker). Newsletter subscribers are a separate list.',
		goTo: { href: '/admin/customers', label: 'Go to Customers' },
		section: 'customers'
	},
	{
		slug: 'edit-promotion',
		group: 'Marketing',
		title: 'Switch a promotion on or off, or show it on the homepage',
		summary: 'Control whether a promotion is live and where it appears.',
		steps: [
			s('Open the Marketing menu at the top and choose Promotions.'),
			s(
				'To switch one off quickly, press its “Published” pill so it says “Draft”. Press it again to bring it back.',
				'edit-promotion-2'
			),
			s(
				'To put it on the homepage, press the promotion, tick “Published (visible on site)” and “Feature on homepage”, then press “Save changes”.',
				'edit-promotion-3'
			)
		],
		tip: 'It only shows on the homepage if it’s published too. A small “Featured” label appears on its row when it’s on the homepage.',
		goTo: { href: '/admin/promotions', label: 'Go to Promotions' },
		section: 'promotions'
	},
	{
		slug: 'pick-winner',
		group: 'Marketing',
		title: 'Pick a random winner',
		summary: 'For the local business draw or a flavour vote prize.',
		steps: [
			s(
				'For the local business draw, open the Marketing menu, choose Local businesses, and press “Pick random winner” under “This week’s entries”.',
				'pick-winner-2'
			),
			s(
				'For a flavour vote, choose Polls instead, press “Edit” on the poll, scroll down to “Results” and press “Pick random winner”.'
			),
			s('The winner’s name and email appear on the screen. Make a note of them.')
		],
		tip: 'The winner isn’t emailed automatically, so get in touch yourself. Local business entries start again every Monday.',
		goTo: { href: '/admin/businesses', label: 'Go to Local businesses' },
		section: 'local-businesses'
	},
	{
		slug: 'activity-log',
		group: 'People and your account',
		title: 'See who has logged in and what changed',
		summary: 'A record of staff logins and changes to staff accounts.',
		steps: [
			s('Open the People menu at the top and choose Activity log. (Only admins can see it.)'),
			s(
				'The newest entries are at the top. Each line shows when it happened, what it was (such as “Logged in” or “Login failed”) and who did it.'
			),
			s('A “Login failed” line means someone tried to sign in with the wrong password or email.')
		],
		tip: 'It records logins and staff account changes. It doesn’t record changes to products or orders.',
		goTo: { href: '/admin/activity', label: 'Go to Activity log' },
		section: 'activity-log'
	}
];

export const helpTaskBySlug = new Map(helpTasks.map((t) => [t.slug, t]));

export const helpTaskGroups = [...new Set(helpTasks.map((t) => t.group))].map((group) => ({
	group,
	tasks: helpTasks.filter((t) => t.group === group)
}));
