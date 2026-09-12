import { randomBytes } from 'node:crypto';
import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from './index';
import {
	categories,
	productImages,
	productVariants,
	products,
	promotions,
	promotionSteps,
	weeklyMenus,
	menuSections,
	menuItems,
	posters,
	flavorPolls,
	flavorPollOptions,
	siteSettings,
	mediaLibraryItems,
	customers,
	newsletterSubscribers
} from './schema';

// Used to populate the "choose from library" picker on every admin image
// field (products, promotions, posters) — one query shared across all of them.
export async function getMediaLibraryItems() {
	return db.query.mediaLibraryItems.findMany({ orderBy: [desc(mediaLibraryItems.uploadedAt)] });
}

export type NewsletterRecipient = { email: string; name: string | null; unsubscribeToken: string };

// Everyone a newsletter send should reach: newsletter-only subscribers, plus
// customer accounts that opted into marketing — deduped by email (a customer
// who's also on the newsletter list only gets one copy).
export async function getNewsletterAudience(): Promise<NewsletterRecipient[]> {
	// Backfill any missing unsubscribe tokens first (older rows created before
	// the column existed) so every recipient has one before a send goes out.
	const subscribersWithoutToken = await db.query.newsletterSubscribers.findMany({
		where: isNull(newsletterSubscribers.unsubscribeToken)
	});
	for (const s of subscribersWithoutToken) {
		await db
			.update(newsletterSubscribers)
			.set({ unsubscribeToken: randomBytes(24).toString('hex') })
			.where(eq(newsletterSubscribers.id, s.id));
	}
	const customersWithoutToken = await db.query.customers.findMany({
		where: and(eq(customers.marketingOptIn, true), isNull(customers.unsubscribeToken))
	});
	for (const c of customersWithoutToken) {
		await db.update(customers).set({ unsubscribeToken: randomBytes(24).toString('hex') }).where(eq(customers.id, c.id));
	}

	const [subscribers, optedInCustomers] = await Promise.all([
		db.query.newsletterSubscribers.findMany(),
		db.query.customers.findMany({ where: eq(customers.marketingOptIn, true) })
	]);

	const byEmail = new Map<string, NewsletterRecipient>();
	for (const c of optedInCustomers) {
		if (c.unsubscribeToken) byEmail.set(c.email, { email: c.email, name: c.name, unsubscribeToken: c.unsubscribeToken });
	}
	// Subscriber rows go last so a plain newsletter signup doesn't overwrite a
	// customer's real account name if the same email is on both lists.
	for (const s of subscribers) {
		if (!byEmail.has(s.email) && s.unsubscribeToken) {
			byEmail.set(s.email, { email: s.email, name: s.name, unsubscribeToken: s.unsubscribeToken });
		}
	}

	return [...byEmail.values()];
}

// MariaDB (used by our Hostinger hosting) doesn't support the LATERAL JOIN +
// JSON_ARRAYAGG SQL that Drizzle's relational `with:` API generates for every
// related-table fetch, one-to-one or one-to-many (drizzle-team/drizzle-orm#1100).
// These helpers do two flat queries and merge in JS instead, which works everywhere.
function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
	const map = new Map<K, T[]>();
	for (const item of items) {
		const key = keyFn(item);
		const list = map.get(key);
		if (list) list.push(item);
		else map.set(key, [item]);
	}
	return map;
}

function indexBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T> {
	const map = new Map<K, T>();
	for (const item of items) map.set(keyFn(item), item);
	return map;
}

async function attachImages<T extends { id: number }>(rows: T[]) {
	if (rows.length === 0) return [] as (T & { images: (typeof productImages.$inferSelect)[] })[];
	const images = await db.query.productImages.findMany({
		where: inArray(
			productImages.productId,
			rows.map((r) => r.id)
		),
		orderBy: [asc(productImages.sortOrder)]
	});
	const byProduct = groupBy(images, (img) => img.productId);
	return rows.map((r) => ({ ...r, images: byProduct.get(r.id) ?? [] }));
}

async function attachCategory<T extends { categoryId: number }>(rows: T[]) {
	if (rows.length === 0) return [] as (T & { category: typeof categories.$inferSelect })[];
	const categoryIds = [...new Set(rows.map((r) => r.categoryId))];
	const cats = await db.query.categories.findMany({ where: inArray(categories.id, categoryIds) });
	const byId = indexBy(cats, (c) => c.id);
	// categoryId is a NOT NULL FK and category deletion is blocked while products
	// reference it, so the category is always present here.
	return rows.map((r) => ({ ...r, category: byId.get(r.categoryId)! }));
}

type MenuSectionWithItems = typeof menuSections.$inferSelect & { items: (typeof menuItems.$inferSelect)[] };

export async function attachMenuSections<T extends { id: number }>(
	menu: T
): Promise<T & { sections: MenuSectionWithItems[] }>;
export async function attachMenuSections<T extends { id: number }>(
	menu: T | undefined
): Promise<(T & { sections: MenuSectionWithItems[] }) | undefined>;
export async function attachMenuSections<T extends { id: number }>(menu: T | undefined) {
	if (!menu) return undefined;
	const sections = await db.query.menuSections.findMany({
		where: eq(menuSections.menuId, menu.id),
		orderBy: [asc(menuSections.sortOrder)]
	});
	if (sections.length === 0) return { ...menu, sections: [] };
	const items = await db.query.menuItems.findMany({
		where: inArray(
			menuItems.sectionId,
			sections.map((s) => s.id)
		),
		orderBy: [asc(menuItems.sortOrder)]
	});
	const itemsBySection = groupBy(items, (i) => i.sectionId);
	return { ...menu, sections: sections.map((s) => ({ ...s, items: itemsBySection.get(s.id) ?? [] })) };
}

export async function getActiveCategories() {
	return db.query.categories.findMany({
		where: eq(categories.isActive, true),
		orderBy: [asc(categories.sortOrder)]
	});
}

export async function getCategoryBySlug(slug: string) {
	return db.query.categories.findFirst({
		where: and(eq(categories.slug, slug), eq(categories.isActive, true))
	});
}

export async function getProductsForCategory(categoryId: number) {
	const rows = await db.query.products.findMany({
		where: and(eq(products.categoryId, categoryId), eq(products.isActive, true)),
		orderBy: [asc(products.sortOrder)]
	});
	return attachImages(rows);
}

export async function getFeaturedProducts() {
	const rows = await db.query.products.findMany({
		where: and(eq(products.isFeatured, true), eq(products.isActive, true)),
		orderBy: [asc(products.sortOrder)]
	});
	return attachCategory(await attachImages(rows));
}

export async function getAllActiveProductsWithCategory() {
	const rows = await db.query.products.findMany({
		where: eq(products.isActive, true),
		orderBy: [asc(products.sortOrder)]
	});
	return attachCategory(await attachImages(rows));
}

export async function getProductBySlug(slug: string) {
	const row = await db.query.products.findFirst({
		where: and(eq(products.slug, slug), eq(products.isActive, true))
	});
	if (!row) return undefined;
	const [images, variants, category] = await Promise.all([
		db.query.productImages.findMany({
			where: eq(productImages.productId, row.id),
			orderBy: [asc(productImages.sortOrder)]
		}),
		db.query.productVariants.findMany({ where: eq(productVariants.productId, row.id) }),
		db.query.categories.findFirst({ where: eq(categories.id, row.categoryId) })
	]);
	// categoryId is a NOT NULL FK and category deletion is blocked while products
	// reference it, so the category is always present here.
	return { ...row, images, variants, category: category! };
}

export async function getPublishedPromotions() {
	return db.query.promotions.findMany({
		where: eq(promotions.isPublished, true),
		orderBy: [desc(promotions.createdAt)]
	});
}

export async function getPromotionBySlug(slug: string) {
	const row = await db.query.promotions.findFirst({
		where: and(eq(promotions.slug, slug), eq(promotions.isPublished, true))
	});
	if (!row) return undefined;
	const steps = await db.query.promotionSteps.findMany({
		where: eq(promotionSteps.promotionId, row.id),
		orderBy: [asc(promotionSteps.sortOrder)]
	});
	return { ...row, steps };
}

const DEFAULT_WELCOME_OFFER = { code: 'WELCOME10', description: '10% off your next pickup order' };

// Falls back to a default rather than throwing if the settings row is
// somehow missing — the newsletter signup CTA shouldn't break the whole
// page over an optional row not existing yet.
export async function getWelcomeOffer(): Promise<{ code: string; description: string }> {
	const row = await db.query.siteSettings.findFirst();
	if (!row) return DEFAULT_WELCOME_OFFER;
	return { code: row.welcomeOfferCode, description: row.welcomeOfferDescription };
}

export async function getFeaturedPromotion() {
	return db.query.promotions.findFirst({
		where: and(eq(promotions.isPublished, true), eq(promotions.isFeaturedOnHomepage, true)),
		orderBy: [desc(promotions.createdAt)]
	});
}

export async function getPublishedMenus() {
	const menus = await db.query.weeklyMenus.findMany({
		where: eq(weeklyMenus.isPublished, true),
		orderBy: [desc(weeklyMenus.menuDate)]
	});
	return Promise.all(menus.map((m) => attachMenuSections(m)));
}

export async function getMenuByDate(menuDate: string) {
	const menu = await db.query.weeklyMenus.findFirst({
		where: and(eq(weeklyMenus.menuDate, menuDate), eq(weeklyMenus.isPublished, true))
	});
	return attachMenuSections(menu);
}

export async function getActivePoster() {
	return db.query.posters.findFirst({ where: eq(posters.isActive, true) });
}

export async function getActivePoll() {
	const poll = await db.query.flavorPolls.findFirst({ where: eq(flavorPolls.isActive, true) });
	if (!poll) return undefined;
	const options = await db.query.flavorPollOptions.findMany({
		where: eq(flavorPollOptions.pollId, poll.id),
		orderBy: [asc(flavorPollOptions.sortOrder)]
	});
	return { ...poll, options };
}

export async function getLatestPublishedMenu() {
	const menu = await db.query.weeklyMenus.findFirst({
		where: eq(weeklyMenus.isPublished, true),
		orderBy: [desc(weeklyMenus.menuDate)]
	});
	return attachMenuSections(menu);
}
