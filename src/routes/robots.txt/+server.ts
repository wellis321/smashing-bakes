import { env } from '$env/dynamic/public';
import { SITE_URL, isCanonicalHost, requestedHost } from '$lib/site';
import type { RequestHandler } from './$types';

// Search and AI crawlers that read the site to answer people's questions or to
// list it in their results. They are welcomed by name so the intent is clear.
// Remove a name here to opt that crawler out.
const AI_AND_SEARCH_BOTS = [
	'Googlebot',
	'Bingbot',
	'Applebot',
	'DuckDuckBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'GPTBot',
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended',
	'Amazonbot',
	'meta-externalagent',
	'DuckAssistBot',
	'CCBot'
];

const PRIVATE_PATHS = ['/admin', '/account', '/cart', '/checkout', '/unsubscribe'];

// Dynamic rather than a static file so the host check and Sitemap line are
// always right. The free hostingersite.com address is blocked outright so it
// can never compete with the real domain.
export const GET: RequestHandler = async ({ request }) => {
	const live = env.PUBLIC_SITE_LIVE !== 'false' && isCanonicalHost(requestedHost(request.headers));

	const disallow = PRIVATE_PATHS.map((p) => `Disallow: ${p}`).join('\n');
	const body = live
		? `# Smashin' Bakes — everyone is welcome to read the public pages.
# The staff area, accounts, cart and checkout are private.

User-agent: *
${disallow}

${AI_AND_SEARCH_BOTS.map((bot) => `User-agent: ${bot}\n${disallow}`).join('\n\n')}

Sitemap: ${SITE_URL}/sitemap.xml
`
		: `# This address is not the public site — see ${SITE_URL}
User-agent: *
Disallow: /
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' }
	});
};
