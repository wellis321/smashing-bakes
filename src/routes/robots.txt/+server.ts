import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

// Dynamic rather than a static file so the Sitemap: line is always correct —
// this currently serves from the Hostinger subdomain and will serve from the
// real domain once that's pointed here, with no file to remember to update.
export const GET: RequestHandler = async ({ url }) => {
	// Defaults to blocking everything until PUBLIC_SITE_LIVE=true is set — the
	// site isn't publicly launched yet, so nothing should be crawled at all.
	// SeoHead's per-page noindex meta tag is the same switch, belt and braces.
	const siteIsLive = env.PUBLIC_SITE_LIVE === 'true';

	const body = siteIsLive
		? `# allow crawling everything except the staff admin area and account/auth pages
User-agent: *
Disallow: /admin
Disallow: /account
Disallow: /unsubscribe

Sitemap: ${url.origin}/sitemap.xml
`
		: `# Not launched yet — block everything until PUBLIC_SITE_LIVE=true is set.
User-agent: *
Disallow: /
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' }
	});
};
