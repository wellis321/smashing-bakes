import { SITE_URL } from '$lib/site';

// Instant checks that need nothing but the live site: each page is fetched like
// a visitor would, then marked on search basics, accessibility basics and
// speed. They are quick and free, and they run the same way every time, so the
// scores can be compared from one run to the next.

export type Check = {
	id: string;
	area: 'seo' | 'accessibility' | 'performance' | 'practice';
	label: string;
	pass: boolean;
	detail?: string;
};

export type PageAudit = {
	path: string;
	status: number;
	checks: Check[];
	scores: { performance: number; accessibility: number; bestPractices: number | null; seo: number };
	metrics: { ttfbMs: number; totalMs: number; htmlKb: number; imageKb: number; images: number };
};

const pct = (checks: Check[]) =>
	checks.length === 0
		? 100
		: Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);

async function timedFetch(url: string, init: RequestInit = {}) {
	const started = performance.now();
	const res = await fetch(url, {
		...init,
		headers: {
			'user-agent': 'SmashinBakes-SiteHealth/1.0',
			'accept-encoding': 'gzip, br',
			...(init.headers ?? {})
		},
		signal: AbortSignal.timeout(20000)
	});
	const ttfbMs = Math.round(performance.now() - started);
	return { res, ttfbMs, started };
}

function tag(html: string, re: RegExp): string | undefined {
	return html.match(re)?.[1]?.trim();
}

function metaContent(html: string, attr: string, name: string): string | undefined {
	// The value may contain apostrophes (Smashin' Bakes), so match the same quote that opened it.
	const re1 = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*content=(["'])(.*?)\\1`, 'i');
	const re2 = new RegExp(`<meta[^>]*content=(["'])(.*?)\\1[^>]*${attr}=["']${name}["']`, 'i');
	return html.match(re1)?.[2] ?? html.match(re2)?.[2];
}

export async function auditPage(base: string, path: string): Promise<PageAudit> {
	const url = `${base}${path}`;
	const { res, ttfbMs, started } = await timedFetch(url);
	const html = await res.text();
	const totalMs = Math.round(performance.now() - started);
	const htmlKb = Math.round(Buffer.byteLength(html) / 1024);

	const title = tag(html, /<title[^>]*>([^<]*)<\/title>/i) ?? '';
	const description = metaContent(html, 'name', 'description') ?? '';
	const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
	const canonical = tag(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ?? '';
	const expectedCanonical = `${SITE_URL}${path === '/' ? '/' : path}`;
	const robotsMeta = metaContent(html, 'name', 'robots') ?? '';
	const xRobots = res.headers.get('x-robots-tag') ?? '';
	const viewport = metaContent(html, 'name', 'viewport') ?? '';
	const lang = tag(html, /<html[^>]*\slang=["']([^"']*)["']/i) ?? '';
	const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
	const imgsWithoutAlt = imgTags.filter((t) => !/\salt=/i.test(t)).length;
	const hasJsonLd = /application\/ld\+json/i.test(html);

	// Weigh the pictures the page loads by default (one copy of each).
	const imageSrcs = [
		...new Set(
			imgTags
				.map((t) => t.match(/\ssrc=["']([^"']+)["']/i)?.[1])
				.filter((s): s is string => !!s && !s.startsWith('data:'))
		)
	].slice(0, 40);
	const sizes = await Promise.all(
		imageSrcs.map(async (src) => {
			try {
				const abs = src.startsWith('http') ? src : `${base}${src}`;
				const r = await fetch(abs, { signal: AbortSignal.timeout(20000) });
				return (await r.arrayBuffer()).byteLength;
			} catch {
				return 0;
			}
		})
	);
	const imageKb = Math.round(sizes.reduce((a, b) => a + b, 0) / 1024);
	const encoding = res.headers.get('content-encoding') ?? '';

	const checks: Check[] = [
		{
			id: 'status',
			area: 'practice',
			label: 'Page loads without an error',
			pass: res.status === 200,
			detail: `Status ${res.status}`
		},
		{
			id: 'title',
			area: 'seo',
			label: 'Has a clear page title (15–70 characters)',
			pass: title.length >= 15 && title.length <= 70,
			detail: title ? `“${title}” is ${title.length} characters` : 'No title'
		},
		{
			id: 'description',
			area: 'seo',
			label: 'Has a description for search results (70–170 characters)',
			pass: description.length >= 70 && description.length <= 170,
			detail: description ? `${description.length} characters` : 'No description'
		},
		{
			id: 'h1',
			area: 'seo',
			label: 'Has exactly one main heading',
			pass: h1Count === 1,
			detail: `${h1Count} main headings`
		},
		{
			id: 'canonical',
			area: 'seo',
			label: 'Tells search engines its real address',
			pass: canonical === expectedCanonical,
			detail: canonical ? `Says ${canonical}` : 'No canonical address'
		},
		{
			id: 'indexable',
			area: 'seo',
			label: 'Can be listed by search engines',
			pass: !/noindex/i.test(robotsMeta) && !/noindex/i.test(xRobots),
			detail: robotsMeta || xRobots || undefined
		},
		{
			id: 'social',
			area: 'seo',
			label: 'Has a picture and title for sharing on social media',
			pass:
				!!metaContent(html, 'property', 'og:image') && !!metaContent(html, 'property', 'og:title')
		},
		{
			id: 'jsonld',
			area: 'seo',
			label: 'Has structured data for search engines and AI',
			pass: hasJsonLd
		},
		{
			id: 'lang',
			area: 'accessibility',
			label: 'Page language is set',
			pass: lang.length >= 2,
			detail: lang || 'Missing'
		},
		{
			id: 'alt',
			area: 'accessibility',
			label: 'Every picture has alt text (even if empty for decoration)',
			pass: imgsWithoutAlt === 0,
			detail: `${imgsWithoutAlt} of ${imgTags.length} pictures have none`
		},
		{
			id: 'viewport',
			area: 'accessibility',
			label: 'Works on phones and allows zooming',
			pass:
				/width=device-width/i.test(viewport) &&
				!/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/i.test(viewport),
			detail: viewport || 'No viewport setting'
		},
		{
			id: 'ttfb',
			area: 'performance',
			label: 'Server answers quickly (under 800 ms)',
			pass: ttfbMs < 800,
			detail: `${ttfbMs} ms`
		},
		{
			id: 'load',
			area: 'performance',
			label: 'Page text arrives in under 2 seconds',
			pass: totalMs < 2000,
			detail: `${totalMs} ms`
		},
		{
			id: 'html',
			area: 'performance',
			label: 'Page code is a sensible size (under 200 KB)',
			pass: htmlKb < 200,
			detail: `${htmlKb} KB`
		},
		{
			id: 'images',
			area: 'performance',
			label: 'Pictures are light (under 1.5 MB in total)',
			pass: imageKb < 1536,
			detail: `${imageKb} KB across ${imageSrcs.length} pictures`
		},
		{
			id: 'compression',
			area: 'performance',
			label: 'Page is compressed for the journey',
			pass: /br|gzip/i.test(encoding),
			detail: encoding || 'Not compressed'
		}
	];

	const pick = (area: Check['area']) => checks.filter((c) => c.area === area);
	return {
		path,
		status: res.status,
		checks,
		scores: {
			performance: pct(pick('performance')),
			accessibility: pct(pick('accessibility')),
			bestPractices: null,
			seo: pct(pick('seo'))
		},
		metrics: { ttfbMs, totalMs, htmlKb, imageKb, images: imageSrcs.length }
	};
}

// Things that are true of the whole site, not one page.
export async function auditSite(base: string): Promise<{ checks: Check[]; score: number }> {
	const checks: Check[] = [];
	const add = (c: Check) => checks.push(c);
	const get = async (path: string, init?: RequestInit) => {
		try {
			return (await timedFetch(`${base}${path}`, init)).res;
		} catch {
			return null;
		}
	};

	const robots = await get('/robots.txt');
	const robotsText = robots ? await robots.text() : '';
	add({
		id: 'robots',
		area: 'seo',
		label: 'robots.txt welcomes search engines and names the sitemap',
		pass:
			!!robots?.ok &&
			/sitemap:/i.test(robotsText) &&
			!/^disallow:\s*\/\s*$/im.test(robotsText.split('User-agent')[1] ?? ''),
		detail: robots ? `Status ${robots.status}` : 'Could not be reached'
	});

	const sitemap = await get('/sitemap.xml');
	const sitemapText = sitemap ? await sitemap.text() : '';
	const urls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
	add({
		id: 'sitemap',
		area: 'seo',
		label: 'Sitemap lists every page using the real address',
		pass: !!sitemap?.ok && urls.length > 0 && urls.every((u) => u.startsWith(SITE_URL)),
		detail: `${urls.length} pages`
	});

	for (const [id, path, label] of [
		['llms', '/llms.txt', 'AI summary file (llms.txt) is published'],
		['llmsfull', '/llms-full.txt', 'Full AI catalogue (llms-full.txt) is published']
	] as const) {
		const r = await get(path);
		add({
			id,
			area: 'seo',
			label,
			pass: !!r?.ok,
			detail: r ? `Status ${r.status}` : 'Could not be reached'
		});
	}

	const missing = await get('/this-page-does-not-exist-check');
	add({
		id: '404',
		area: 'practice',
		label: 'Unknown addresses show a proper “not found” page',
		pass: missing?.status === 404,
		detail: missing ? `Status ${missing.status}` : 'Could not be reached'
	});

	const home = await get('/');
	const h = (name: string) => home?.headers.get(name) ?? '';
	add({
		id: 'headers',
		area: 'practice',
		label: 'Security protections are switched on in the browser',
		pass:
			!!h('strict-transport-security') &&
			/nosniff/i.test(h('x-content-type-options')) &&
			!!h('x-frame-options') &&
			!!h('referrer-policy'),
		detail:
			[
				h('strict-transport-security') ? '' : 'no HTTPS-only rule',
				h('x-content-type-options') ? '' : 'no content-type rule',
				h('x-frame-options') ? '' : 'no framing rule',
				h('referrer-policy') ? '' : 'no referrer rule'
			]
				.filter(Boolean)
				.join(', ') || undefined
	});

	if (base.startsWith('https://')) {
		try {
			const plain = await fetch(base.replace('https://', 'http://'), {
				redirect: 'manual',
				signal: AbortSignal.timeout(15000)
			});
			add({
				id: 'https',
				area: 'practice',
				label: 'Plain http:// addresses move to secure https://',
				pass:
					[301, 302, 307, 308].includes(plain.status) &&
					(plain.headers.get('location') ?? '').startsWith('https://'),
				detail: `Status ${plain.status}`
			});
		} catch {
			add({
				id: 'https',
				area: 'practice',
				label: 'Plain http:// addresses move to secure https://',
				pass: false,
				detail: 'Could not be tested'
			});
		}
	}

	// A sample photo should be cacheable for a long time.
	const imgSrc = (await (home?.text() ?? Promise.resolve(''))).match(
		/\ssrc=["'](\/uploads\/[^"']+)["']/i
	)?.[1];
	if (imgSrc) {
		const img = await get(imgSrc);
		add({
			id: 'imgcache',
			area: 'performance',
			label: 'Photos are saved by the browser for repeat visits',
			pass: /max-age=(\d{6,})/i.test(img?.headers.get('cache-control') ?? ''),
			detail: img?.headers.get('cache-control') ?? 'No caching rule'
		});
		add({
			id: 'imgwebp',
			area: 'performance',
			label: 'Photos are served in a modern, small format',
			pass: /webp|avif/i.test(img?.headers.get('content-type') ?? ''),
			detail: img?.headers.get('content-type') ?? undefined
		});
	}

	return { checks, score: pct(checks) };
}
