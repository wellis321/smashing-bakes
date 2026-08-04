import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import {
	categories,
	products,
	productImages,
	promotions,
	promotionSteps,
	weeklyMenus,
	menuSections,
	menuItems,
	posters,
	flavorPolls,
	flavorPollOptions,
	customers,
	staffSessions,
	staffUsers
} from '../schema';
import { hashPassword } from '../../auth/password';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(client, { mode: 'default' });

type SeedProduct = {
	name: string;
	slug: string;
	description: string;
	pricePence: number;
	salePricePence?: number;
	badge?: 'none' | 'sale' | 'new';
	isFeatured?: boolean;
};

type SeedCategory = {
	name: string;
	slug: string;
	description: string;
	products: SeedProduct[];
};

const catalog: SeedCategory[] = [
	{
		name: 'Cupcakes',
		slug: 'cupcakes',
		description: 'Hand-decorated cupcakes baked fresh for weekend pickup.',
		products: [
			{
				name: 'Kinder Bueno Cupcake',
				slug: 'kinder-bueno-cupcake',
				description:
					'Vanilla sponge filled with hazelnut cream, topped with Kinder Bueno buttercream and a chunk of the real thing.',
				pricePence: 350,
				badge: 'new',
				isFeatured: true
			},
			{
				name: '99 Flake Cupcake',
				slug: '99-flake-cupcake',
				description:
					'Soft vanilla cupcake with a swirl of whipped buttercream, a Cadbury Flake and a drizzle of raspberry sauce.',
				pricePence: 325
			},
			{
				name: 'Calvin Harris Cupcake',
				slug: 'calvin-harris-cupcake',
				description:
					'Our best-selling salted caramel cupcake — rich caramel sponge, salted caramel buttercream and a caramel drizzle.',
				pricePence: 350,
				salePricePence: 300,
				badge: 'sale',
				isFeatured: true
			}
		]
	},
	{
		name: 'Brownies',
		slug: 'brownies',
		description: 'Fudgy, gooey-centred brownies cut thick.',
		products: [
			{
				name: 'Rolo Brownie',
				slug: 'rolo-brownie',
				description: 'Dense chocolate brownie loaded with Rolos and a caramel ribbon through the middle.',
				pricePence: 375
			},
			{
				name: 'Nutella Swirl Brownie',
				slug: 'nutella-swirl-brownie',
				description: 'Chocolate brownie batter swirled with Nutella and baked until just set in the centre.',
				pricePence: 375,
				badge: 'new'
			},
			{
				name: 'Salted Caramel Brownie',
				slug: 'salted-caramel-brownie',
				description: 'Rich brownie base with a salted caramel core and a scatter of sea salt flakes.',
				pricePence: 375
			}
		]
	},
	{
		name: 'Cookies',
		slug: 'cookies',
		description: 'Thick, chewy cookies stuffed with all the good stuff.',
		products: [
			{
				name: 'Twix Stuffed Cookie',
				slug: 'twix-stuffed-cookie',
				description: 'Chunky cookie dough stuffed with whole Twix bars, baked until golden.',
				pricePence: 300,
				badge: 'new'
			},
			{
				name: 'Snickers Stuffed Cookie',
				slug: 'snickers-stuffed-cookie',
				description: 'Chocolate chip cookie dough wrapped around a whole Snickers bar.',
				pricePence: 300
			},
			{
				name: 'White Chocolate & Raspberry Cookie',
				slug: 'white-chocolate-raspberry-cookie',
				description: 'Soft-baked cookie loaded with white chocolate chunks and freeze-dried raspberry.',
				pricePence: 300
			}
		]
	},
	{
		name: 'Pies',
		slug: 'pies',
		description: 'Classic fruit pies, baked in small batches.',
		products: [
			{
				name: 'Classic Apple Pie Slice',
				slug: 'apple-pie-slice',
				description: 'Spiced apple filling in a all-butter shortcrust pastry, served warm or cold.',
				pricePence: 400
			},
			{
				name: 'Mixed Berry Pie Slice',
				slug: 'mixed-berry-pie-slice',
				description: 'A generous mix of berries in a buttery lattice-topped pastry.',
				pricePence: 400
			},
			{
				name: 'Lemon Meringue Pie Slice',
				slug: 'lemon-meringue-pie-slice',
				description: 'Sharp lemon curd under a torched Italian meringue on a crisp pastry base.',
				pricePence: 425,
				badge: 'new'
			}
		]
	},
	{
		name: 'Cheesecakes',
		slug: 'cheesecakes',
		description: 'Baked and no-bake cheesecakes, thick slices only.',
		products: [
			{
				name: 'Biscoff Cheesecake Slice',
				slug: 'biscoff-cheesecake-slice',
				description: 'Biscoff biscuit base, creamy no-bake filling, topped with Biscoff sauce and crumb.',
				pricePence: 450,
				salePricePence: 399,
				badge: 'sale',
				isFeatured: true
			},
			{
				name: 'Oreo Cheesecake Slice',
				slug: 'oreo-cheesecake-slice',
				description: 'Oreo cookie base with a chunky cookies-and-cream filling.',
				pricePence: 450
			},
			{
				name: 'Classic New York Cheesecake Slice',
				slug: 'new-york-cheesecake-slice',
				description: 'Baked New York-style cheesecake, dense and rich, served plain or with berry compote.',
				pricePence: 425
			}
		]
	},
	{
		name: 'Cake Slices',
		slug: 'cake-slices',
		description: 'Full-size layer cakes, sold by the slice.',
		products: [
			{
				name: 'Victoria Sponge Slice',
				slug: 'victoria-sponge-slice',
				description: 'Classic vanilla sponge, raspberry jam and buttercream, dusted with icing sugar.',
				pricePence: 375
			},
			{
				name: 'Red Velvet Slice',
				slug: 'red-velvet-slice',
				description: 'Cocoa sponge with cream cheese frosting between every layer.',
				pricePence: 400,
				badge: 'new'
			},
			{
				name: 'Chocolate Fudge Cake Slice',
				slug: 'chocolate-fudge-cake-slice',
				description: 'Triple-layer chocolate sponge with a rich chocolate fudge frosting.',
				pricePence: 400
			}
		]
	}
];

async function seed() {
	console.log('Clearing existing catalog + staff data...');
	await db.delete(productImages);
	await db.delete(products);
	await db.delete(categories);
	await db.delete(promotionSteps);
	await db.delete(promotions);
	await db.delete(menuItems);
	await db.delete(menuSections);
	await db.delete(weeklyMenus);
	await db.delete(posters);
	await client.query('DELETE FROM flavor_poll_vote_selections');
	await client.query('DELETE FROM flavor_poll_votes');
	await db.delete(flavorPollOptions);
	await db.delete(flavorPolls);
	await client.query('DELETE FROM customer_sessions');
	await db.delete(customers);
	await db.delete(staffSessions);
	await db.delete(staffUsers);

	// Reset auto-increment counters so re-seeding gives predictable, stable IDs.
	for (const table of [
		'product_images',
		'products',
		'categories',
		'promotion_steps',
		'promotions',
		'menu_items',
		'menu_sections',
		'weekly_menus',
		'posters',
		'flavor_poll_vote_selections',
		'flavor_poll_votes',
		'flavor_poll_options',
		'flavor_polls',
		'customer_sessions',
		'customers',
		'staff_sessions',
		'staff_users'
	]) {
		await client.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
	}

	console.log('Seeding categories & products...');
	for (const [categoryIndex, cat] of catalog.entries()) {
		const [{ insertId: categoryId }] = await db.insert(categories).values({
			name: cat.name,
			slug: cat.slug,
			description: cat.description,
			sortOrder: categoryIndex
		});

		for (const [productIndex, p] of cat.products.entries()) {
			const [{ insertId: productId }] = await db.insert(products).values({
				categoryId,
				name: p.name,
				slug: p.slug,
				description: p.description,
				basePricePence: p.pricePence,
				salePricePence: p.salePricePence ?? null,
				badge: p.badge ?? 'none',
				isFeatured: p.isFeatured ?? false,
				sortOrder: productIndex
			});

			await db.insert(productImages).values({
				productId,
				url: `/images/placeholder/${cat.slug}.svg`,
				altText: p.name,
				sortOrder: 0,
				isPrimary: true
			});
		}
	}

	console.log('Seeding a promotion...');
	const [{ insertId: promotionId }] = await db.insert(promotions).values({
		title: 'Supporting Local Businesses',
		slug: 'supporting-local-businesses',
		tagline: "Let's lift each other up!",
		introText:
			'Tag a local business in the comments that deserves a FREE mixed cake box — it could be an office, a salon, a garage, a shop, a care home, a school, or any local team who deserves a Friday treat.',
		prizeDescription:
			"We'll choose one lucky business at random to receive a delicious mixed cake box from Smashin Bakes! A little treat for a team that deserves it.",
		areaText: 'Barrhead and surrounding areas',
		deadlineText: 'Winner announced this Friday!',
		heroImageUrl: '/images/placeholder/cake-slices.svg',
		isPublished: true,
		isFeaturedOnHomepage: true
	});
	await db.insert(promotionSteps).values([
		{ promotionId, label: 'Like', description: 'this post', sortOrder: 0 },
		{ promotionId, label: 'Tag', description: 'a local business (or more!)', sortOrder: 1 },
		{ promotionId, label: 'Share', description: 'this post to help spread the love', sortOrder: 2 }
	]);

	console.log('Seeding weekly menus...');
	function nextFriday(fromToday: number): string {
		const d = new Date();
		const day = d.getDay();
		const daysToFriday = ((5 - day + 7) % 7) + fromToday * 7;
		d.setDate(d.getDate() + daysToFriday);
		return d.toISOString().slice(0, 10);
	}

	const weeklyMenuSeeds = [
		{
			menuDate: nextFriday(0),
			openingHoursText: 'Open Friday and Saturday 10am-4pm',
			noteText: "Menu for this weekend! Subject to change! Comment which cake you fancy trying this weekend!",
			sections: [
				{ title: 'Old Favourites', items: ['Old School Cake', 'Empire Biscuits', 'Caramel Shortbread'] },
				{ title: 'Brownies', items: ['Mini Egg Brownies', 'Oreo Brownies', 'Wispa Brownies', 'Caramel Wafer Brownies'] },
				{ title: 'Blondies', items: ['Cherry Bakewell Blondies', 'Mars Bar Blondies'] },
				{ title: 'Cookie Pie', items: ['Mini Egg Cookie Pie', 'Malteser Cookie Pie'] },
				{ title: 'Cookie Slice', items: ['Caramel Egg Cookie Slice', 'Crunchie Cookie Slice'] },
				{ title: 'Stuffed Cookies', items: ['Picnic Cookies', 'Caramel Egg Cookies', 'Apple Pie Cookies', 'Kinder Cookies'] },
				{ title: 'Crookies', items: ['Wispa Gold Crookies', 'Biscoff Crookies'] },
				{ title: 'Mini Cheesecakes', items: ['Milkybar', 'TBC'] }
			]
		},
		{
			menuDate: nextFriday(-1),
			openingHoursText: 'Open Friday and Saturday 10am-4pm',
			noteText: 'Last weekend’s menu — sold out fast, thank you all!',
			sections: [
				{ title: 'Old Favourites', items: ['Old School Cake', 'Empire Biscuits'] },
				{ title: 'Brownies', items: ['Rolo Brownies', 'Biscoff Brownies', 'Terry’s Chocolate Orange Brownies'] },
				{ title: 'Stuffed Cookies', items: ['Twix Cookies', 'Nutella Cookies'] },
				{ title: 'Mini Cheesecakes', items: ['Biscoff', 'Oreo'] }
			]
		}
	];

	for (const menuSeed of weeklyMenuSeeds) {
		const [{ insertId: menuId }] = await db.insert(weeklyMenus).values({
			menuDate: menuSeed.menuDate,
			openingHoursText: menuSeed.openingHoursText,
			noteText: menuSeed.noteText,
			isPublished: true
		});

		for (const [sectionIndex, section] of menuSeed.sections.entries()) {
			const [{ insertId: sectionId }] = await db.insert(menuSections).values({
				menuId,
				title: section.title,
				sortOrder: sectionIndex
			});
			for (const [itemIndex, itemName] of section.items.entries()) {
				await db.insert(menuItems).values({ sectionId, name: itemName, sortOrder: itemIndex });
			}
		}
	}

	console.log('Seeding a poster...');
	await db.insert(posters).values({
		heading: 'Caramel Cornflake Brownie',
		message:
			"Honestly can't believe how fast these sold out! Thank you so much for all the love — don't worry if you missed out, they'll be making an appearance again this weekend.",
		style: 'sold-out',
		ctaLabel: "See this week's menu",
		ctaUrl: '/menus',
		isActive: true
	});

	console.log('Seeding a flavour poll...');
	const [{ insertId: pollId }] = await db.insert(flavorPolls).values({
		title: "Help us pick this weekend's brownie flavour!",
		description:
			"We've made all of these before... but we want to know: which brownie flavour NEEDS to make a comeback this weekend?",
		prizeDescription: 'A free box of your winning flavour',
		deadlineText: 'Voting closes Sunday night',
		isActive: true
	});
	const pollOptionNames = [
		'Kinder',
		'Twix',
		'Oreo',
		'Toffee Crisp',
		'Rolo',
		"Terry's Choc Orange",
		'Caramel Cornflake',
		'Nutella and MnM',
		'Galaxy',
		'Mint Aero',
		'Ripple',
		'Biscoff'
	];
	for (const [index, name] of pollOptionNames.entries()) {
		await db.insert(flavorPollOptions).values({ pollId, name, sortOrder: index });
	}

	console.log('Seeding a demo customer account...');
	const customerEmail = 'jess@example.com';
	const customerPassword = 'TestPass123!';
	await db.insert(customers).values({
		name: 'Jess Cameron',
		email: customerEmail,
		passwordHash: await hashPassword(customerPassword),
		marketingOptIn: true
	});

	console.log('Seeding staff admin account...');
	const email = 'admin@smashinbakes.com';
	const password = 'ChangeMe123!';
	const passwordHash = await hashPassword(password);
	await db.insert(staffUsers).values({
		email,
		passwordHash,
		name: 'Admin',
		role: 'admin'
	});

	console.log('\nSeed complete.');
	console.log(`Staff login → ${email} / ${password} (change this after first login)`);
	console.log(`Customer login → ${customerEmail} / ${customerPassword}`);

	await client.end();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
