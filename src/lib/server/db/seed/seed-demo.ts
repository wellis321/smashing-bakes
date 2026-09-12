// Adds realistic sample data throughout the site so it feels like it's been
// running for a while — enquiries, weekly menu history, extra promotions and
// posters, more media, plus the People-page data (subscribers, customers,
// staff, business/poll entries). Unlike seed.ts, this is safe to re-run
// against an already-seeded database: every insert checks first.
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { and, eq } from 'drizzle-orm';
import * as schema from '../schema';
import {
	customers,
	staffUsers,
	newsletterSubscribers,
	mediaLibraryItems,
	promotions,
	promotionSteps,
	localBusinesses,
	businessChoices,
	flavorPolls,
	flavorPollOptions,
	flavorPollVotes,
	flavorPollVoteSelections,
	bespokeOrderEnquiries,
	weeklyMenus,
	menuSections,
	menuItems,
	posters
} from '../schema';
import { hashPassword } from '../../auth/password';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(client, { schema, mode: 'default' });

function todayIso() {
	return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d;
}

function dateIsoDaysAgo(n: number): string {
	return daysAgo(n).toISOString().slice(0, 10);
}

async function seedStaff() {
	console.log('Seeding extra staff accounts...');
	const demoStaff = [
		{ name: 'Priya Shah', email: 'priya@smashinbakes.com', role: 'staff' as const, daysAgo: 38 },
		{ name: 'Tom Baxter', email: 'tom@smashinbakes.com', role: 'admin' as const, daysAgo: 21 }
	];
	for (const s of demoStaff) {
		const existing = await db.query.staffUsers.findFirst({ where: eq(staffUsers.email, s.email) });
		if (existing) {
			await db.update(staffUsers).set({ createdAt: daysAgo(s.daysAgo) }).where(eq(staffUsers.id, existing.id));
			console.log(`  skipped ${s.email} (already exists) — backdated`);
			continue;
		}
		await db
			.insert(staffUsers)
			.values({ name: s.name, email: s.email, role: s.role, passwordHash: await hashPassword('DemoPass123!'), createdAt: daysAgo(s.daysAgo) });
		console.log(`  added ${s.email} / DemoPass123! (${s.role})`);
	}
}

async function seedCustomers() {
	console.log('Seeding extra customer accounts...');
	const demoCustomers = [
		{ name: 'Alex Morrison', email: 'alex.morrison@example.com', marketingOptIn: true, daysAgo: 52 },
		{ name: 'Priya Nair', email: 'priya.nair@example.com', marketingOptIn: true, daysAgo: 45 },
		{ name: 'Liam O’Connor', email: 'liam.oconnor@example.com', marketingOptIn: false, daysAgo: 30 },
		{ name: 'Sophie Ahmed', email: 'sophie.ahmed@example.com', marketingOptIn: true, daysAgo: 12 }
	];
	const created: { id: number; email: string }[] = [];
	for (const c of demoCustomers) {
		const existing = await db.query.customers.findFirst({ where: eq(customers.email, c.email) });
		if (existing) {
			await db.update(customers).set({ createdAt: daysAgo(c.daysAgo) }).where(eq(customers.id, existing.id));
			created.push({ id: existing.id, email: existing.email });
			console.log(`  skipped ${c.email} (already exists) — backdated`);
			continue;
		}
		const [{ insertId }] = await db
			.insert(customers)
			.values({ name: c.name, email: c.email, marketingOptIn: c.marketingOptIn, passwordHash: await hashPassword('DemoPass123!'), createdAt: daysAgo(c.daysAgo) });
		created.push({ id: insertId, email: c.email });
		console.log(`  added ${c.email} / DemoPass123!`);
	}
	return created;
}

async function seedNewsletterSubscribers() {
	console.log('Seeding newsletter subscribers...');
	const demoSubscribers = [
		{ email: 'hannah.reid@example.com', name: 'Hannah Reid', source: 'footer', redeemed: true, daysAgo: 47 },
		{ email: 'jamie.brown@example.com', name: 'Jamie Brown', source: 'homepage', redeemed: false, daysAgo: 40 },
		{ email: 'megan.clarke@example.com', name: null, source: 'newsletter-page', redeemed: false, daysAgo: 33 },
		{ email: 'ryan.walsh@example.com', name: 'Ryan Walsh', source: 'footer', redeemed: true, daysAgo: 24 },
		{ email: 'olivia.grant@example.com', name: 'Olivia Grant', source: 'homepage', redeemed: false, daysAgo: 15 },
		{ email: 'dan.mitchell@example.com', name: null, source: 'footer', redeemed: false, daysAgo: 4 }
	];
	for (const s of demoSubscribers) {
		const existing = await db.query.newsletterSubscribers.findFirst({ where: eq(newsletterSubscribers.email, s.email) });
		if (existing) {
			await db
				.update(newsletterSubscribers)
				.set({ subscribedAt: daysAgo(s.daysAgo) })
				.where(eq(newsletterSubscribers.id, existing.id));
			console.log(`  skipped ${s.email} (already exists) — backdated`);
			continue;
		}
		await db.insert(newsletterSubscribers).values({
			email: s.email,
			name: s.name,
			source: s.source,
			welcomeCodeRedeemedAt: s.redeemed ? daysAgo(Math.max(0, s.daysAgo - 2)) : null,
			subscribedAt: daysAgo(s.daysAgo)
		});
		console.log(`  added ${s.email}`);
	}
}

async function seedMediaLibrary() {
	console.log('Seeding media library items...');
	const demoItems = [
		{ url: '/images/placeholder/cupcakes.svg', filename: 'cupcakes-display.svg', altText: 'A tray of decorated cupcakes', daysAgo: 50 },
		{ url: '/images/placeholder/brownies.svg', filename: 'brownie-stack.svg', altText: 'A stack of fudgy brownies', daysAgo: 44 },
		{ url: '/images/placeholder/cheesecakes.svg', filename: 'cheesecake-slice.svg', altText: 'A slice of baked cheesecake', daysAgo: 37 },
		{ url: '/images/placeholder/cake-slices.svg', filename: 'celebration-cake.svg', altText: 'A slice of celebration cake', daysAgo: 29 },
		{ url: '/images/placeholder/cookies.svg', filename: 'fresh-cookies.svg', altText: 'A batch of fresh cookies', daysAgo: 19 },
		{ url: '/images/placeholder/pies.svg', filename: 'fresh-pies.svg', altText: 'A freshly baked pie', daysAgo: 8 }
	];
	for (const item of demoItems) {
		const existing = await db.query.mediaLibraryItems.findFirst({ where: eq(mediaLibraryItems.filename, item.filename) });
		if (existing) {
			await db.update(mediaLibraryItems).set({ uploadedAt: daysAgo(item.daysAgo) }).where(eq(mediaLibraryItems.id, existing.id));
			console.log(`  skipped ${item.filename} (already exists) — backdated`);
			continue;
		}
		await db.insert(mediaLibraryItems).values({ url: item.url, filename: item.filename, altText: item.altText, uploadedAt: daysAgo(item.daysAgo) });
		console.log(`  added ${item.filename}`);
	}
}

async function seedEnquiries() {
	console.log('Seeding bespoke order enquiries...');
	const demoEnquiries = [
		{
			name: 'Fiona Grant',
			email: 'fiona.grant@example.com',
			phone: '07700 900111',
			details: 'Hi! Could I order a 2-tier birthday cake for 20 people, chocolate sponge with a caramel filling? Needed for the 14th.',
			wantsNewsletter: true,
			status: 'archived' as const,
			daysAgo: 55
		},
		{
			name: 'Callum Reid',
			email: 'callum.reid@example.com',
			phone: null,
			details: 'Do you do dairy-free brownies? Looking for a tray of 12 for an office leaving do next Friday.',
			wantsNewsletter: false,
			status: 'archived' as const,
			daysAgo: 41
		},
		{
			name: 'Nadia Hussain',
			email: 'nadia.hussain@example.com',
			phone: '07700 900222',
			details: 'Wondering if you could make a gender-reveal cake — pink or blue sponge inside, plain white icing outside. Serves about 15.',
			wantsNewsletter: true,
			status: 'contacted' as const,
			daysAgo: 26
		},
		{
			name: 'Grace Simpson',
			email: 'grace.simpson@example.com',
			phone: '07700 900333',
			details: 'Looking for a wedding cake consultation — three tiers, roughly 60 guests, sometime in the spring. What’s your process?',
			wantsNewsletter: true,
			status: 'contacted' as const,
			daysAgo: 18
		},
		{
			name: 'Owen Pickering',
			email: 'owen.pickering@example.com',
			phone: null,
			details: 'Could I get a dozen mixed cupcakes for a school fundraiser this Saturday? Happy to collect.',
			wantsNewsletter: false,
			status: 'new' as const,
			daysAgo: 6
		},
		{
			name: 'Beth Underwood',
			email: 'beth.underwood@example.com',
			phone: '07700 900444',
			details: 'Hi, do you cater for corporate events? Need something for ~40 people, finger-food style bakes if possible.',
			wantsNewsletter: true,
			status: 'new' as const,
			daysAgo: 2
		},
		{
			name: 'Marcus Bell',
			email: 'marcus.bell@example.com',
			phone: null,
			details: 'My daughter loved the Kinder Bueno cupcakes — could you do a whole cake in that flavour for her birthday?',
			wantsNewsletter: false,
			status: 'new' as const,
			daysAgo: 0
		}
	];
	for (const e of demoEnquiries) {
		const existing = await db.query.bespokeOrderEnquiries.findFirst({ where: eq(bespokeOrderEnquiries.email, e.email) });
		if (existing) {
			console.log(`  skipped ${e.email} (already exists)`);
			continue;
		}
		await db.insert(bespokeOrderEnquiries).values({
			name: e.name,
			email: e.email,
			phone: e.phone,
			details: e.details,
			wantsNewsletter: e.wantsNewsletter,
			status: e.status,
			createdAt: daysAgo(e.daysAgo)
		});
		console.log(`  added enquiry from ${e.name}`);
	}
}

async function seedWeeklyMenuHistory() {
	console.log('Seeding historical weekly menus...');
	const historicalMenus = [
		{
			daysAgo: 15,
			noteText: 'A quieter week but these still went fast — thank you!',
			sections: [
				{ title: 'Old Favourites', items: ['Old School Cake', 'Empire Biscuits'] },
				{ title: 'Brownies', items: ['Kinder Bueno Brownies', 'Wispa Brownies', 'Biscoff Brownies'] },
				{ title: 'Blondies', items: ['Mars Bar Blondies'] },
				{ title: 'Mini Cheesecakes', items: ['Biscoff', 'Terry’s Chocolate Orange'] }
			]
		},
		{
			daysAgo: 22,
			noteText: 'Back with a bigger menu this week — something for everyone!',
			sections: [
				{ title: 'Old Favourites', items: ['Old School Cake', 'Caramel Shortbread'] },
				{ title: 'Brownies', items: ['Oreo Brownies', 'Rolo Brownies', 'Caramel Wafer Brownies'] },
				{ title: 'Cookie Pie', items: ['Malteser Cookie Pie', 'Mini Egg Cookie Pie'] },
				{ title: 'Stuffed Cookies', items: ['Twix Cookies', 'Nutella Cookies', 'Kinder Cookies'] },
				{ title: 'Crookies', items: ['Biscoff Crookies'] }
			]
		},
		{
			daysAgo: 29,
			noteText: 'Bank holiday weekend menu — a couple of new flavours to try!',
			sections: [
				{ title: 'Old Favourites', items: ['Empire Biscuits'] },
				{ title: 'Brownies', items: ['Mini Egg Brownies', 'Terry’s Chocolate Orange Brownies'] },
				{ title: 'Blondies', items: ['Cherry Bakewell Blondies'] },
				{ title: 'Cookie Slice', items: ['Crunchie Cookie Slice', 'Caramel Egg Cookie Slice'] },
				{ title: 'Mini Cheesecakes', items: ['Milkybar', 'Oreo'] }
			]
		},
		{
			daysAgo: 36,
			noteText: 'First menu of the month — Kinder Bueno cupcakes made their debut!',
			sections: [
				{ title: 'Old Favourites', items: ['Old School Cake', 'Empire Biscuits', 'Caramel Shortbread'] },
				{ title: 'Brownies', items: ['Kinder Bueno Brownies', 'Wispa Brownies'] },
				{ title: 'Stuffed Cookies', items: ['Apple Pie Cookies', 'Picnic Cookies'] },
				{ title: 'Crookies', items: ['Wispa Gold Crookies', 'Biscoff Crookies'] }
			]
		},
		{
			daysAgo: 43,
			noteText: 'Smaller batch this week while we tested a few new recipes.',
			sections: [
				{ title: 'Old Favourites', items: ['Old School Cake'] },
				{ title: 'Brownies', items: ['Biscoff Brownies', 'Oreo Brownies'] },
				{ title: 'Blondies', items: ['Mars Bar Blondies', 'Cherry Bakewell Blondies'] },
				{ title: 'Mini Cheesecakes', items: ['Biscoff', 'Milkybar'] }
			]
		}
	];

	for (const menu of historicalMenus) {
		const menuDate = dateIsoDaysAgo(menu.daysAgo);
		const existing = await db.query.weeklyMenus.findFirst({ where: eq(weeklyMenus.menuDate, menuDate) });
		if (existing) {
			console.log(`  skipped ${menuDate} (already exists)`);
			continue;
		}
		const [{ insertId: menuId }] = await db.insert(weeklyMenus).values({
			menuDate,
			openingHoursText: 'Open Friday and Saturday 10am-4pm',
			noteText: menu.noteText,
			isPublished: true
		});
		for (const [sectionIndex, section] of menu.sections.entries()) {
			const [{ insertId: sectionId }] = await db.insert(menuSections).values({ menuId, title: section.title, sortOrder: sectionIndex });
			for (const [itemIndex, itemName] of section.items.entries()) {
				await db.insert(menuItems).values({ sectionId, name: itemName, sortOrder: itemIndex });
			}
		}
		console.log(`  added menu for ${menuDate}`);
	}
}

async function seedExtraPromotions() {
	console.log('Seeding extra promotions...');
	const existingPast = await db.query.promotions.findFirst({ where: eq(promotions.slug, 'free-cupcake-friday') });
	if (!existingPast) {
		const [{ insertId }] = await db.insert(promotions).values({
			title: 'Free Cupcake Friday',
			slug: 'free-cupcake-friday',
			tagline: 'One lucky follower got a free box, on us!',
			introText: 'To say thanks for an amazing first month, we gave away a free box of cupcakes to one random follower who liked, commented and shared our launch post.',
			prizeDescription: 'A free box of six cupcakes, any flavour.',
			areaText: 'Barrhead and surrounding areas',
			deadlineText: 'Winner announced — thanks for taking part!',
			isPublished: true,
			isFeaturedOnHomepage: false,
			mechanic: 'manual',
			heroImageUrl: '/images/placeholder/cupcakes.svg',
			createdAt: daysAgo(50)
		});
		const steps = [
			{ label: 'Like', description: 'Like our launch post' },
			{ label: 'Comment', description: 'Tell us your favourite flavour' },
			{ label: 'Share', description: 'Share it to your story' }
		];
		for (const [i, step] of steps.entries()) {
			await db.insert(promotionSteps).values({ promotionId: insertId, ...step, sortOrder: i });
		}
		console.log('  added "Free Cupcake Friday" (past, published)');
	} else {
		console.log('  skipped "Free Cupcake Friday" (already exists)');
	}

	const existingDraft = await db.query.promotions.findFirst({ where: eq(promotions.slug, 'summer-fete-giveaway') });
	if (!existingDraft) {
		await db.insert(promotions).values({
			title: 'Summer Fete Giveaway',
			slug: 'summer-fete-giveaway',
			tagline: 'Coming soon — details TBC',
			introText: 'Planning something for the summer fete — check back soon for how to enter.',
			isPublished: false,
			isFeaturedOnHomepage: false,
			mechanic: 'manual',
			createdAt: daysAgo(3)
		});
		console.log('  added "Summer Fete Giveaway" (draft, unpublished)');
	} else {
		console.log('  skipped "Summer Fete Giveaway" (already exists)');
	}
}

async function seedExtraPosters() {
	console.log('Seeding extra (inactive) posters...');
	const demoPosters = [
		{
			heading: 'Back after a summer break',
			message: 'We took a short break to recharge — back now with a full weekly menu and lots of new flavours to try.',
			style: 'announcement' as const,
			ctaLabel: 'See what\'s new',
			ctaUrl: '/menus',
			imageUrl: '/images/placeholder/cake-slices.svg',
			daysAgo: 40
		},
		{
			heading: 'We hit 500 followers!',
			message: 'Thank you so much for the support — as a little celebration, keep an eye out for a surprise this weekend.',
			style: 'celebration' as const,
			ctaLabel: null,
			ctaUrl: null,
			imageUrl: null,
			daysAgo: 25
		}
	];
	for (const p of demoPosters) {
		const existing = await db.query.posters.findFirst({ where: eq(posters.heading, p.heading) });
		if (existing) {
			console.log(`  skipped "${p.heading}" (already exists)`);
			continue;
		}
		await db.insert(posters).values({
			heading: p.heading,
			message: p.message,
			style: p.style,
			ctaLabel: p.ctaLabel,
			ctaUrl: p.ctaUrl,
			imageUrl: p.imageUrl,
			isActive: false,
			createdAt: daysAgo(p.daysAgo)
		});
		console.log(`  added "${p.heading}" (inactive)`);
	}
}

async function seedBusinessChoices(demoCustomerIds: number[]) {
	console.log('Seeding a few local-business picks...');
	const promotion = await db.query.promotions.findFirst({ where: eq(promotions.mechanic, 'business_picker') });
	const businesses = await db.query.localBusinesses.findMany({ where: eq(localBusinesses.isActive, true) });
	if (!promotion || businesses.length === 0 || demoCustomerIds.length === 0) {
		console.log('  skipped — no business_picker promotion or businesses to link to');
		return;
	}
	const date = todayIso();
	for (const [i, customerId] of demoCustomerIds.entries()) {
		const business = businesses[i % businesses.length];
		const existing = await db.query.businessChoices.findFirst({
			where: and(eq(businessChoices.promotionId, promotion.id), eq(businessChoices.customerId, customerId), eq(businessChoices.choiceDate, date))
		});
		if (existing) continue;
		await db.insert(businessChoices).values({ promotionId: promotion.id, customerId, businessId: business.id, choiceDate: date });
		console.log(`  added a pick for customer ${customerId} -> ${business.name}`);
	}
}

async function seedPollVotes(demoCustomerIds: number[]) {
	console.log('Seeding a few flavour poll votes...');
	const poll = await db.query.flavorPolls.findFirst({ where: eq(flavorPolls.isActive, true) });
	if (!poll || demoCustomerIds.length === 0) {
		console.log('  skipped — no active poll to vote in');
		return;
	}
	const options = await db.query.flavorPollOptions.findMany({ where: eq(flavorPollOptions.pollId, poll.id) });
	if (options.length === 0) return;

	for (const [i, customerId] of demoCustomerIds.entries()) {
		const existing = await db.query.flavorPollVotes.findFirst({
			where: and(eq(flavorPollVotes.pollId, poll.id), eq(flavorPollVotes.customerId, customerId))
		});
		if (existing) continue;
		const [{ insertId: voteId }] = await db.insert(flavorPollVotes).values({ pollId: poll.id, customerId });
		// Each demo customer votes for 1-3 options, cycling through the list.
		const pickCount = (i % 3) + 1;
		for (let j = 0; j < pickCount; j++) {
			const option = options[(i + j) % options.length];
			await db.insert(flavorPollVoteSelections).values({ voteId, optionId: option.id });
		}
		console.log(`  added a vote for customer ${customerId} (${pickCount} pick${pickCount === 1 ? '' : 's'})`);
	}
}

async function run() {
	await seedStaff();
	const demoCustomers = await seedCustomers();
	await seedNewsletterSubscribers();
	await seedMediaLibrary();
	await seedEnquiries();
	await seedWeeklyMenuHistory();
	await seedExtraPromotions();
	await seedExtraPosters();
	const demoCustomerIds = demoCustomers.map((c) => c.id);
	await seedBusinessChoices(demoCustomerIds);
	await seedPollVotes(demoCustomerIds);

	console.log('\nDemo data seed complete.');
	console.log('Extra staff logins → priya@smashinbakes.com / tom@smashinbakes.com, password DemoPass123!');
	console.log('Extra customer logins → any of the emails above, password DemoPass123!');

	await client.end();
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
