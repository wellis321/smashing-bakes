import { eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	bespokeCakeGalleryItems,
	categories,
	newsletterHighlights,
	newsletters,
	posters,
	productImages,
	promotions,
	siteSettings,
	uploadedFiles
} from '$lib/server/db/schema';

// Everywhere on the site that can point at an uploaded photo. This is the one
// list used to protect photos from being deleted while in use, to carry them
// along when they are renamed, and to spot any that have gone missing.

const PREFIX = '/uploads/';

type Place = { label: string; urls: () => Promise<string[]> };

const places: Place[] = [
	{
		label: 'a product photo',
		urls: async () =>
			(await db.select({ u: productImages.url }).from(productImages)).map((r) => r.u)
	},
	{
		label: 'a category photo',
		urls: async () =>
			(await db.select({ u: categories.imageUrl }).from(categories)).map((r) => r.u ?? '')
	},
	{
		label: 'a promotion',
		urls: async () =>
			(await db.select({ u: promotions.heroImageUrl }).from(promotions)).map((r) => r.u ?? '')
	},
	{
		label: 'a poster',
		urls: async () => (await db.select({ u: posters.imageUrl }).from(posters)).map((r) => r.u ?? '')
	},
	{
		label: 'the bespoke cakes gallery',
		urls: async () =>
			(await db.select({ u: bespokeCakeGalleryItems.imageUrl }).from(bespokeCakeGalleryItems)).map(
				(r) => r.u
			)
	},
	{
		label: 'a newsletter (including ones already sent)',
		urls: async () =>
			(await db.select({ u: newsletters.heroImageUrl }).from(newsletters)).map((r) => r.u ?? '')
	},
	{
		label: 'a newsletter highlight',
		urls: async () =>
			(await db.select({ u: newsletterHighlights.imageUrl }).from(newsletterHighlights)).map(
				(r) => r.u ?? ''
			)
	},
	{
		label: 'the homepage or bespoke page photos in Settings',
		urls: async () => {
			const rows = await db
				.select({
					a: siteSettings.heroImage1Url,
					b: siteSettings.heroImage2Url,
					c: siteSettings.heroImage3Url,
					d: siteSettings.bespokeCakesImageUrl
				})
				.from(siteSettings);
			return rows.flatMap((r) => [r.a, r.b, r.c, r.d]).map((u) => u ?? '');
		}
	}
];

// The places still using this photo, by name (empty = nothing uses it).
export async function photoUsage(url: string): Promise<string[]> {
	const used: string[] = [];
	for (const place of places) {
		const urls = await place.urls();
		if (urls.includes(url)) used.push(place.label);
	}
	return used;
}

// Photos that something points at but that no longer exist.
export async function findBrokenPhotos(): Promise<{ place: string; url: string }[]> {
	const existing = new Set(
		(await db.select({ p: uploadedFiles.path }).from(uploadedFiles)).map((r) => `${PREFIX}${r.p}`)
	);
	const broken: { place: string; url: string }[] = [];
	for (const place of places) {
		for (const url of new Set(await place.urls())) {
			if (url.startsWith(PREFIX) && !existing.has(url)) broken.push({ place: place.label, url });
		}
	}
	return broken;
}

// When a photo gets a new name, everything that used the old name follows it —
// except newsletters, because emails already sent still point at the old address.
export async function repointPhoto(oldUrl: string, newUrl: string): Promise<void> {
	await db.update(categories).set({ imageUrl: newUrl }).where(eq(categories.imageUrl, oldUrl));
	await db
		.update(promotions)
		.set({ heroImageUrl: newUrl })
		.where(eq(promotions.heroImageUrl, oldUrl));
	await db.update(posters).set({ imageUrl: newUrl }).where(eq(posters.imageUrl, oldUrl));
	await db
		.update(bespokeCakeGalleryItems)
		.set({ imageUrl: newUrl })
		.where(eq(bespokeCakeGalleryItems.imageUrl, oldUrl));
	await db
		.update(newsletterHighlights)
		.set({ imageUrl: newUrl })
		.where(eq(newsletterHighlights.imageUrl, oldUrl));
	await db.execute(
		sql`update site_settings set hero_image_1_url = if(hero_image_1_url = ${oldUrl}, ${newUrl}, hero_image_1_url), hero_image_2_url = if(hero_image_2_url = ${oldUrl}, ${newUrl}, hero_image_2_url), hero_image_3_url = if(hero_image_3_url = ${oldUrl}, ${newUrl}, hero_image_3_url), bespoke_cakes_image_url = if(bespoke_cakes_image_url = ${oldUrl}, ${newUrl}, bespoke_cakes_image_url)`
	);
}
