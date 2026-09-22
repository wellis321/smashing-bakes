import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const settings = await db.query.siteSettings.findFirst({
		columns: { bespokeCakesImageUrl: true, bespokeCakesHeading: true, bespokeCakesIntro: true }
	});

	return {
		heading: settings?.bespokeCakesHeading ?? "Bespoke cakes for your Smashin' occasion",
		intro:
			settings?.bespokeCakesIntro ??
			'Birthdays, celebrations, anything worth marking with something a bit special — tell us what you have in mind and our baker Alanah will help bring it to life.',
		imageUrl: settings?.bespokeCakesImageUrl ?? null
	};
};
