// Short, plain-English "how do I…" guides. Shown at /admin/help/<slug>, linked
// from the "Staff help" buttons on the public site and the "I want to…" list
// on the main help page. `section` points at the long-form reference for the
// same feature.
export type HelpTask = {
	slug: string;
	title: string;
	summary: string;
	steps: string[];
	tip?: string;
	goTo: { href: string; label: string };
	section: string;
};

export const helpTasks: HelpTask[] = [
	{
		slug: 'hero-photos',
		title: 'Change the photos at the top of the homepage',
		summary: 'The three overlapping photos next to the big headline.',
		steps: [
			'Press the pink button below to open Settings. The “Homepage photos” box opens for you.',
			'For each photo you want to change, press “Choose from library” to pick one you’ve already uploaded, or “Browse…” to upload a new one from your computer.',
			'Press “Save changes”.',
			'Open the homepage and refresh the page to see the new photos.'
		],
		tip: 'Square photos work best. Any photo you leave alone stays as it is.',
		goTo: { href: '/admin/settings#hero-images', label: 'Go to Homepage photos' },
		section: 'settings'
	},
	{
		slug: 'opening-hours',
		title: 'Change the opening hours',
		summary: 'Shown in the footer, on the homepage and on the Contact page.',
		steps: [
			'Press the pink button below to open Settings. The “Opening hours” box opens for you.',
			'Type each day or range on its own line, just as you want it to read, for example “Friday 10am – 4pm”.',
			'Press “Save changes”.'
		],
		tip: 'Clear the box and save to go back to the usual Friday and Saturday hours.',
		goTo: { href: '/admin/settings#opening-hours', label: 'Go to Opening hours' },
		section: 'settings'
	},
	{
		slug: 'welcome-offer',
		title: 'Change the newsletter welcome offer',
		summary: 'What people are told they get when they join the mailing list.',
		steps: [
			'Press the pink button below to open Settings. The “Welcome offer” box opens for you.',
			'Change the short label (for example “TREAT CLUB”) and the sentence that explains the offer.',
			'Press “Save changes”.'
		],
		tip: 'Staff give this out in person. There’s no automatic code, so only promise what you’re happy to hand over.',
		goTo: { href: '/admin/settings#welcome-offer', label: 'Go to Welcome offer' },
		section: 'settings'
	},
	{
		slug: 'banner',
		title: 'Change the homepage banner and its writing',
		summary: 'The banner under the top of the homepage (the “tacos” one, for example).',
		steps: [
			'Press the pink button below to open Posters.',
			'Find the banner that is marked Active. That’s the one showing on the site. Press “Edit”.',
			'Change the heading, the message, the button wording or the photo.',
			'Press “Save changes”, then refresh the homepage to check it.'
		],
		tip: 'Only one banner shows at a time. To switch to a different one, make that one Active instead.',
		goTo: { href: '/admin/posters', label: 'Go to Posters' },
		section: 'posters'
	},
	{
		slug: 'this-weeks-bakes',
		title: 'Choose what shows in “This week’s bakes”',
		summary: 'The photo cards in the middle of the homepage.',
		steps: [
			'Press the pink button below to open Products.',
			'Find a bake you want on the homepage and press the “★ This week’s bake” button on its row. Solid pink means it’s showing.',
			'To take a bake off the homepage, press the same button again.',
			'Refresh the homepage to see the change.'
		],
		tip: 'Want three photos? Switch it on for three bakes. A bake also has to be Active (not Hidden) to show.',
		goTo: { href: '/admin/products', label: 'Go to Products' },
		section: 'products'
	},
	{
		slug: 'category-photos',
		title: 'Change a category’s photo on the homepage',
		summary: 'The tiles in “Browse by bake”, such as Cupcakes or Classics.',
		steps: [
			'Press the pink button below to open Categories.',
			'Press the category you want to change.',
			'Under “Homepage tile photo”, choose a photo from the library or upload a new one.',
			'Press “Save changes”.'
		],
		tip: 'No photo? The site uses a built-in picture. To go back to it, tick “Remove my photo” and save.',
		goTo: { href: '/admin/categories', label: 'Go to Categories' },
		section: 'categories'
	},
	{
		slug: 'placeholder-images',
		title: 'Download the built-in pictures',
		summary: 'The pictures the site uses when a category or product has no photo.',
		steps: [
			'Press the pink button below to open the Media library.',
			'Under “Built-in pictures”, press “Download” on the one you want.',
			'Upload the downloaded picture wherever you’d use a photo, for example on a product.'
		],
		tip: 'They download as PNG files, which the site accepts. The originals are a different type (SVG) that can’t be uploaded.',
		goTo: { href: '/admin/media#illustrations', label: 'Go to Built-in pictures' },
		section: 'media'
	},
	{
		slug: 'hide-page',
		title: 'Hide a page from the site',
		summary: 'For example, taking the Vote page down between polls.',
		steps: [
			'Press the pink button below to open Settings. “Show or hide pages” opens for you.',
			'Untick the page you want to hide.',
			'Press “Save changes”.'
		],
		tip: 'The page disappears from the menu and visitors who find it get “page not found”. Tick it again and save to bring it back.',
		goTo: { href: '/admin/settings#page-visibility', label: 'Go to Show or hide pages' },
		section: 'settings'
	},
	{
		slug: 'bespoke-page',
		title: 'Edit the Bespoke cakes page',
		summary: 'The heading, photo, design gallery and customer quotes.',
		steps: [
			'Press the pink button below to open the Bespoke cakes page editor.',
			'Change the top section (heading, intro and photo), or scroll down to add to the cake gallery and the customer quotes.',
			'Press the Save button in the part you changed.'
		],
		tip: 'You can zoom and move each photo so it fits its frame nicely.',
		goTo: { href: '/admin/bespoke-cakes', label: 'Go to Bespoke cakes' },
		section: 'bespoke-cakes'
	},
	{
		slug: 'add-product',
		title: 'Add a new product',
		summary: 'Put a new bake on the shop.',
		steps: [
			'Press the pink button below to start a new product.',
			'Fill in the name, choose a category and set the price.',
			'Add a photo if you have one. You can add it later too.',
			'Press save. It appears in the shop straight away.'
		],
		tip: 'Want it on the homepage too? Switch on “★ This week’s bake” for it in the Products list.',
		goTo: { href: '/admin/products/new', label: 'Add a product' },
		section: 'products'
	}
];

export const helpTaskBySlug = new Map(helpTasks.map((t) => [t.slug, t]));
