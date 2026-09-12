import type { RequestHandler } from './$types';
import { getActiveCategories, getAllActiveProductsWithCategory, getPublishedMenus, getPublishedPromotions } from '$lib/server/db/queries';

const STATIC_PATHS = ['/', '/shop', '/menus', '/promotions', '/about', '/contact', '/vote', '/newsletter'];

function urlEntry(loc: string, changefreq: string, priority: string) {
	return `<url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;

	const [categories, products, menus, promotions] = await Promise.all([
		getActiveCategories(),
		getAllActiveProductsWithCategory(),
		getPublishedMenus(),
		getPublishedPromotions()
	]);

	const entries = [
		...STATIC_PATHS.map((path) => urlEntry(`${origin}${path}`, 'weekly', path === '/' ? '1.0' : '0.7')),
		...categories.map((c) => urlEntry(`${origin}/shop/${c.slug}`, 'weekly', '0.6')),
		...products.map((p) => urlEntry(`${origin}/product/${p.slug}`, 'weekly', '0.6')),
		...menus.map((m) => urlEntry(`${origin}/menus/${m.menuDate}`, 'monthly', '0.4')),
		...promotions.map((p) => urlEntry(`${origin}/promotions/${p.slug}`, 'weekly', '0.5'))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
