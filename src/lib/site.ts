// The one public address of the site. Hostinger's proxy tells the app it is
// being served from the free *.hostingersite.com address, so anything that
// must name the real site (canonical links, sitemap, structured data, emails)
// uses this instead of the request's own origin.
export const SITE_URL = 'https://smashinbakes.com';
const SITE_HOSTS = ['smashinbakes.com', 'www.smashinbakes.com'];

// The host the visitor actually typed, which may arrive in a forwarded header.
export function requestedHost(headers: Headers): string {
	return (headers.get('x-forwarded-host') ?? headers.get('host') ?? '').toLowerCase();
}

export function isCanonicalHost(host: string): boolean {
	const bare = host.split(':')[0];
	return SITE_HOSTS.includes(bare);
}

// Local development keeps using localhost so links in test emails still work.
export function publicBase(url: URL): string {
	return url.hostname === 'localhost' || url.hostname === '127.0.0.1' ? url.origin : SITE_URL;
}
