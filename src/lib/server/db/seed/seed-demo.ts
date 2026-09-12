// Adds realistic sample data for the newer admin features (subscribers,
// customer accounts, staff, media library, plus a few business/poll entries
// so the "People" pages don't look empty) — unlike seed.ts, this is safe to
// run against an already-seeded database: every insert checks first.
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
	localBusinesses,
	businessChoices,
	flavorPolls,
	flavorPollOptions,
	flavorPollVotes,
	flavorPollVoteSelections
} from '../schema';
import { hashPassword } from '../../auth/password';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(client, { schema, mode: 'default' });

function todayIso() {
	return new Date().toISOString().slice(0, 10);
}

async function seedStaff() {
	console.log('Seeding extra staff accounts...');
	const demoStaff = [
		{ name: 'Priya Shah', email: 'priya@smashinbakes.com', role: 'staff' as const },
		{ name: 'Tom Baxter', email: 'tom@smashinbakes.com', role: 'admin' as const }
	];
	for (const s of demoStaff) {
		const existing = await db.query.staffUsers.findFirst({ where: eq(staffUsers.email, s.email) });
		if (existing) {
			console.log(`  skipped ${s.email} (already exists)`);
			continue;
		}
		await db.insert(staffUsers).values({ ...s, passwordHash: await hashPassword('DemoPass123!') });
		console.log(`  added ${s.email} / DemoPass123! (${s.role})`);
	}
}

async function seedCustomers() {
	console.log('Seeding extra customer accounts...');
	const demoCustomers = [
		{ name: 'Alex Morrison', email: 'alex.morrison@example.com', marketingOptIn: true },
		{ name: 'Priya Nair', email: 'priya.nair@example.com', marketingOptIn: true },
		{ name: 'Liam O’Connor', email: 'liam.oconnor@example.com', marketingOptIn: false },
		{ name: 'Sophie Ahmed', email: 'sophie.ahmed@example.com', marketingOptIn: true }
	];
	const created: { id: number; email: string }[] = [];
	for (const c of demoCustomers) {
		const existing = await db.query.customers.findFirst({ where: eq(customers.email, c.email) });
		if (existing) {
			created.push({ id: existing.id, email: existing.email });
			console.log(`  skipped ${c.email} (already exists)`);
			continue;
		}
		const [{ insertId }] = await db.insert(customers).values({ ...c, passwordHash: await hashPassword('DemoPass123!') });
		created.push({ id: insertId, email: c.email });
		console.log(`  added ${c.email} / DemoPass123!`);
	}
	return created;
}

async function seedNewsletterSubscribers() {
	console.log('Seeding newsletter subscribers...');
	const demoSubscribers = [
		{ email: 'hannah.reid@example.com', name: 'Hannah Reid', source: 'footer', redeemed: true },
		{ email: 'jamie.brown@example.com', name: 'Jamie Brown', source: 'homepage', redeemed: false },
		{ email: 'megan.clarke@example.com', name: null, source: 'newsletter-page', redeemed: false },
		{ email: 'ryan.walsh@example.com', name: 'Ryan Walsh', source: 'footer', redeemed: true },
		{ email: 'olivia.grant@example.com', name: 'Olivia Grant', source: 'homepage', redeemed: false },
		{ email: 'dan.mitchell@example.com', name: null, source: 'footer', redeemed: false }
	];
	for (const s of demoSubscribers) {
		const existing = await db.query.newsletterSubscribers.findFirst({ where: eq(newsletterSubscribers.email, s.email) });
		if (existing) {
			console.log(`  skipped ${s.email} (already exists)`);
			continue;
		}
		await db.insert(newsletterSubscribers).values({
			email: s.email,
			name: s.name,
			source: s.source,
			welcomeCodeRedeemedAt: s.redeemed ? new Date() : null
		});
		console.log(`  added ${s.email}`);
	}
}

async function seedMediaLibrary() {
	console.log('Seeding media library items...');
	const demoItems = [
		{ url: '/images/placeholder/cupcakes.svg', filename: 'cupcakes-display.svg', altText: 'A tray of decorated cupcakes' },
		{ url: '/images/placeholder/brownies.svg', filename: 'brownie-stack.svg', altText: 'A stack of fudgy brownies' },
		{ url: '/images/placeholder/cheesecakes.svg', filename: 'cheesecake-slice.svg', altText: 'A slice of baked cheesecake' },
		{ url: '/images/placeholder/cake-slices.svg', filename: 'celebration-cake.svg', altText: 'A slice of celebration cake' },
		{ url: '/images/placeholder/cookies.svg', filename: 'fresh-cookies.svg', altText: 'A batch of fresh cookies' }
	];
	for (const item of demoItems) {
		const existing = await db.query.mediaLibraryItems.findFirst({ where: eq(mediaLibraryItems.filename, item.filename) });
		if (existing) {
			console.log(`  skipped ${item.filename} (already exists)`);
			continue;
		}
		await db.insert(mediaLibraryItems).values(item);
		console.log(`  added ${item.filename}`);
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
