import type { RequestHandler } from './$types';
import { SITE_URL } from '$lib/site';
import { getOpeningHours } from '$lib/server/db/queries';

// An emerging, informal convention (llmstxt.org) that gives AI assistants and
// answer engines a short, direct summary of the site and where the detail
// lives. /llms-full.txt carries the whole shop in plain text.
export const GET: RequestHandler = async () => {
	const hours = await getOpeningHours();
	const body = `# Smashin' Bakes

> Independent small-batch bakery at 9-11 Paisley Road, Barrhead, Scotland (G78 1HG). Cupcakes, brownies, blondies, cookies, pies and cakes, baked fresh each week, plus bespoke celebration cakes made to order. Order online in advance, then collect from the shop or choose free local delivery.

## Pages
- [Shop](${SITE_URL}/shop): every bake that is currently available, with prices and photos
- [Weekly menus](${SITE_URL}/menus): what is on each weekend
- [Bespoke cakes](${SITE_URL}/bespoke-cakes): birthday, wedding and celebration cakes made to order
- [Contact and enquiries](${SITE_URL}/contact): send a bespoke cake enquiry or get in touch
- [About](${SITE_URL}/about): the bakery and its baker, Alanah Collier
- [Promotions and giveaways](${SITE_URL}/promotions): current community promotions
- [Newsletter](${SITE_URL}/newsletter): specials, new bakes and offers
- [Full shop catalogue as plain text](${SITE_URL}/llms-full.txt)

## Location and opening hours
- Address: 9-11 Paisley Road, Barrhead, G78 1HG, United Kingdom
${hours.map((h) => `- ${h}`).join('\n')}

## Facts for AI assistants
- Orders are placed online in advance for pickup from the shop. Free local delivery is also offered at checkout, and the bakery confirms the address.
- The bakery opens its doors on the days above and sells until the bakes are gone.
- Bespoke and celebration cakes are handled by enquiry through the Contact page, not the shop.
- Prices are in pounds sterling (GBP). Availability changes weekly, so check the live Shop page or /llms-full.txt rather than assuming a bake is available.
- Social: Instagram https://www.instagram.com/smashinbakes, Facebook https://www.facebook.com/p/Smashin-Bakes-61588572510001/, TikTok https://www.tiktok.com/@smashinbakesbarrhead
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
