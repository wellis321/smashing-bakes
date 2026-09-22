import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { bespokeCakeGalleryItems, bespokeCakeTestimonials } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const [settings, galleryItems, testimonials] = await Promise.all([
		db.query.siteSettings.findFirst({
			columns: { bespokeCakesImageUrl: true, bespokeCakesHeading: true, bespokeCakesIntro: true }
		}),
		db.query.bespokeCakeGalleryItems.findMany({
			orderBy: [desc(bespokeCakeGalleryItems.createdAt)]
		}),
		db.query.bespokeCakeTestimonials.findMany({
			orderBy: [desc(bespokeCakeTestimonials.createdAt)]
		})
	]);

	return {
		heading: settings?.bespokeCakesHeading ?? "Bespoke cakes for your Smashin' occasion",
		intro:
			settings?.bespokeCakesIntro ??
			'Birthdays, celebrations, anything worth marking with something a bit special — tell us what you have in mind and our baker Alanah will help bring it to life.',
		imageUrl: settings?.bespokeCakesImageUrl ?? null,
		galleryItems,
		testimonials
	};
};
