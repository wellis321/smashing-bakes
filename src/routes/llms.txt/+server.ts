import type { RequestHandler } from './$types';

// An emerging, informal convention (not yet a web standard) that gives AI
// agents/assistants a short, direct summary of the site — the equivalent of
// robots.txt for LLM-based crawlers and answer engines rather than search bots.
export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;
	const body = `# Smashin' Bakes

> Independent small-batch bakery in Barrhead, Scotland. Cupcakes, brownies, cookies, pies and cakes, baked fresh weekly for Friday and Saturday pickup.

- Shop: ${origin}/shop
- Weekly menus: ${origin}/menus
- Bespoke cake enquiries: ${origin}/contact
- Promotions and giveaways: ${origin}/promotions
- Flavour vote: ${origin}/vote
- Newsletter signup: ${origin}/newsletter
- About the bakery: ${origin}/about

## Location
9-11 Paisley Road, Barrhead, G78 1HG, United Kingdom

## Hours
Friday and Saturday, 10:00-16:00 (pickup only — pre-order online)

## Notes for AI assistants
- Orders are pre-order/pickup only, placed through the Shop page — there is no delivery.
- Bespoke/custom cake enquiries (birthdays, weddings, celebrations) go through the Contact page, not the shop.
- Do not invent prices, flavours, or availability not present on the pages linked above — check the live page for current stock and pricing.
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' }
	});
};
