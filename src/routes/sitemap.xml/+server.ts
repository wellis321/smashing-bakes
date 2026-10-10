import type { RequestHandler } from './$types';
import { SITE_URL } from '$lib/site';
import {
	getVisibleCategories,
	getAllActiveProductsWithCategory,
	getPublishedMenus,
	getPublishedPromotions
} from '$lib/server/db/queries';

const STATIC_PATHS = [
	'/',
	'/shop',
	'/menus',
	'/promotions',
	'/bespoke-cakes',
	'/about',
	'/contact',
	'/vote',
	'/newsletter'
];

function urlEntry(path: string, changefreq: string, priority: string, lastmod?: Date | null) {
	const mod = lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
	return `<url><loc>${SITE_URL}${path}</loc>${mod}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export const GET: RequestHandler = async () => {
	const [categories, products, menus, promotions] = await Promise.all([
		getVisibleCategories(),
		getAllActiveProductsWithCategory(),
		getPublishedMenus(),
		getPublishedPromotions()
	]);

	const entries = [
		...STATIC_PATHS.map((path) => urlEntry(path, 'weekly', path === '/' ? '1.0' : '0.7')),
		...categories.map((c) => urlEntry(`/shop/${c.slug}`, 'weekly', '0.6')),
		...products.map((p) => urlEntry(`/product/${p.slug}`, 'weekly', '0.6', p.updatedAt)),
		...menus.map((m) => urlEntry(`/menus/${m.menuDate}`, 'monthly', '0.4')),
		...promotions.map((p) => urlEntry(`/promotions/${p.slug}`, 'weekly', '0.5'))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }
	});
};
