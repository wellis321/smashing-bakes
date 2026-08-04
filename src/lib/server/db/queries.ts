import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from './index';
import {
	categories,
	productImages,
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
	return db.query.products.findMany({
		where: and(eq(products.categoryId, categoryId), eq(products.isActive, true)),
		orderBy: [asc(products.sortOrder)],
		with: { images: { orderBy: [asc(productImages.sortOrder)] } }
	});
}

export async function getFeaturedProducts() {
	return db.query.products.findMany({
		where: and(eq(products.isFeatured, true), eq(products.isActive, true)),
		orderBy: [asc(products.sortOrder)],
		with: { images: { orderBy: [asc(productImages.sortOrder)] }, category: true }
	});
}

export async function getAllActiveProductsWithCategory() {
	return db.query.products.findMany({
		where: eq(products.isActive, true),
		orderBy: [asc(products.sortOrder)],
		with: { images: { orderBy: [asc(productImages.sortOrder)] }, category: true }
	});
}

export async function getProductBySlug(slug: string) {
	return db.query.products.findFirst({
		where: and(eq(products.slug, slug), eq(products.isActive, true)),
		with: {
			images: { orderBy: [asc(productImages.sortOrder)] },
			variants: true,
			category: true
		}
	});
}

export async function getPublishedPromotions() {
	return db.query.promotions.findMany({
		where: eq(promotions.isPublished, true),
		orderBy: [desc(promotions.createdAt)]
	});
}

export async function getPromotionBySlug(slug: string) {
	return db.query.promotions.findFirst({
		where: and(eq(promotions.slug, slug), eq(promotions.isPublished, true)),
		with: { steps: { orderBy: [asc(promotionSteps.sortOrder)] } }
	});
}

export async function getFeaturedPromotion() {
	return db.query.promotions.findFirst({
		where: and(eq(promotions.isPublished, true), eq(promotions.isFeaturedOnHomepage, true)),
		orderBy: [desc(promotions.createdAt)]
	});
}

export async function getPublishedMenus() {
	return db.query.weeklyMenus.findMany({
		where: eq(weeklyMenus.isPublished, true),
		orderBy: [desc(weeklyMenus.menuDate)],
		with: {
			sections: {
				orderBy: [asc(menuSections.sortOrder)],
				with: { items: { orderBy: [asc(menuItems.sortOrder)] } }
			}
		}
	});
}

export async function getMenuByDate(menuDate: string) {
	return db.query.weeklyMenus.findFirst({
		where: and(eq(weeklyMenus.menuDate, menuDate), eq(weeklyMenus.isPublished, true)),
		with: {
			sections: {
				orderBy: [asc(menuSections.sortOrder)],
				with: { items: { orderBy: [asc(menuItems.sortOrder)] } }
			}
		}
	});
}

export async function getActivePoster() {
	return db.query.posters.findFirst({ where: eq(posters.isActive, true) });
}

export async function getActivePoll() {
	return db.query.flavorPolls.findFirst({
		where: eq(flavorPolls.isActive, true),
		with: { options: { orderBy: [asc(flavorPollOptions.sortOrder)] } }
	});
}

export async function getLatestPublishedMenu() {
	return db.query.weeklyMenus.findFirst({
		where: eq(weeklyMenus.isPublished, true),
		orderBy: [desc(weeklyMenus.menuDate)],
		with: {
			sections: {
				orderBy: [asc(menuSections.sortOrder)],
				with: { items: { orderBy: [asc(menuItems.sortOrder)] } }
			}
		}
	});
}
