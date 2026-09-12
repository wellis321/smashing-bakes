import type { RequestHandler } from './$types';

// Dynamic rather than a static file so the Sitemap: line is always correct —
// this currently serves from the Hostinger subdomain and will serve from the
// real domain once that's pointed here, with no file to remember to update.
export const GET: RequestHandler = async ({ url }) => {
	const body = `# allow crawling everything except the staff admin area and account/auth pages
User-agent: *
Disallow: /admin
Disallow: /account
Disallow: /unsubscribe

Sitemap: ${url.origin}/sitemap.xml
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' }
	});
};
