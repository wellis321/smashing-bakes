import { and, asc, desc, eq, inArray } from 'drizzle-orm';
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
	flavorPollOptions
} from './schema';

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
