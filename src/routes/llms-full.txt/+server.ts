import type { RequestHandler } from './$types';
import { SITE_URL } from '$lib/site';
import { formatPence } from '$lib/utils/money';
import {
	getAllActiveProductsWithCategory,
	getOpeningHours,
	getVisibleCategories
} from '$lib/server/db/queries';

// The whole shop in plain text, kept in step with the database, so an AI
// assistant can answer "what do they sell and how much is it?" accurately.
export const GET: RequestHandler = async () => {
	const [categories, products, hours] = await Promise.all([
		getVisibleCategories(),
		getAllActiveProductsWithCategory(),
		getOpeningHours()
	]);

	const sections = categories
		.map((category) => {
			const items = products.filter((p) => p.categoryId === category.id);
			if (items.length === 0) return '';
			const lines = items.map((p) => {
				const onSale = p.badge === 'sale' && p.salePricePence != null;
				const price = onSale
					? `${formatPence(p.salePricePence!)} (on sale, usually ${formatPence(p.basePricePence)})`
					: formatPence(p.basePricePence);
				const desc = p.description ? `: ${p.description.replace(/\s+/g, ' ').trim()}` : '';
				return `- [${p.name}](${SITE_URL}/product/${p.slug}) — ${price}${desc}`;
			});
			return `## ${category.name}\n${category.description ? `${category.description}\n` : ''}${lines.join('\n')}`;
		})
		.filter(Boolean)
		.join('\n\n');

	const body = `# Smashin' Bakes — full shop catalogue

> Independent small-batch bakery at 9-11 Paisley Road, Barrhead, Scotland (G78 1HG). Order in advance for pickup, or choose free local delivery at checkout. Prices in GBP. See ${SITE_URL}/llms.txt for a short summary.

Opening hours:
${hours.map((h) => `- ${h}`).join('\n')}

${sections}

Bespoke celebration cakes are made to order: send an enquiry at ${SITE_URL}/contact.
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
