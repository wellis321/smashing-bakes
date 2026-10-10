import { createHash, randomBytes } from 'node:crypto';
import { and, count, gte, lt, ne, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders, siteVisits } from '$lib/server/db/schema';

// A privacy-friendly visitor counter. It sets no cookies and stores no IP
// addresses or other personal details: only anonymous daily totals ("42 visits
// today, 120 page views, 18 on phones, 9 from Google"). To tell visitors apart
// it makes a throw-away fingerprint from the day, IP and browser, keeps it in
// memory only (never in the database) and forgets it by the next day.

const salt = randomBytes(16).toString('hex');
const BOT =
	/bot|crawl|spider|slurp|preview|lighthouse|pagespeed|headless|python|curl|wget|uptime|monitor|gtmetrix|SmashinBakes-SiteHealth|facebookexternalhit|axios|node-fetch|go-http/i;
const SKIP_PATHS = [
	'/admin',
	'/uploads',
	'/_app',
	'/api',
	'/account',
	'/unsubscribe',
	'/robots.txt',
	'/sitemap.xml',
	'/llms',
	'/favicon'
];

const day = (d = new Date()) => d.toISOString().slice(0, 10);

// ---- Counting (in memory, saved to the database every minute) ----

type Tally = { day: string; kind: string; name: string; views: number; visitors: number };
const buffer = new Map<string, Tally>();
const seen = new Map<string, Set<string>>(); // day -> fingerprints already counted
let started = false;
let warned = false;

function add(d: string, kind: string, name: string, views: number, visitors: number) {
	const key = `${d}|${kind}|${name.slice(0, 200)}`;
	const row = buffer.get(key) ?? { day: d, kind, name: name.slice(0, 200), views: 0, visitors: 0 };
	row.views += views;
	row.visitors += visitors;
	buffer.set(key, row);
}

function firstTime(d: string, token: string): boolean {
	let set = seen.get(d);
	if (!set) {
		set = new Set();
		seen.set(d, set);
		for (const old of seen.keys()) if (old !== d) seen.delete(old); // forget earlier days
	}
	if (set.has(token)) return false;
	set.add(token);
	return true;
}

function stepOf(path: string): string | null {
	if (path === '/') return 'Home page';
	if (path.startsWith('/product/')) return 'Looked at a bake';
	if (path === '/cart') return 'Opened the cart';
	if (path === '/checkout') return 'Reached checkout';
	if (path.startsWith('/checkout/confirmation')) return 'Placed an order';
	return null;
}

function sourceOf(referer: string | null, search: string, ownHost: string): string {
	const utm = new URLSearchParams(search).get('utm_source');
	if (utm) return utm.slice(0, 40);
	if (!referer) return 'Direct';
	let host = '';
	try {
		host = new URL(referer).hostname.replace(/^www\./, '');
	} catch {
		return 'Direct';
	}
	if (!host || host.includes(ownHost) || host.includes('smashinbakes')) return 'Direct';
	const map: [RegExp, string][] = [
		[/google\./, 'Google'],
		[/bing\./, 'Bing'],
		[/duckduckgo/, 'DuckDuckGo'],
		[/yahoo\./, 'Yahoo'],
		[/ecosia/, 'Ecosia'],
		[/facebook\.|fb\.com|fb\.me/, 'Facebook'],
		[/instagram\./, 'Instagram'],
		[/tiktok\./, 'TikTok'],
		[/(^|\.)t\.co$|twitter\.|(^|\.)x\.com$/, 'X / Twitter'],
		[/chatgpt|openai|perplexity|claude\.ai|copilot|gemini/, 'AI assistants']
	];
	for (const [re, label] of map) if (re.test(host)) return label;
	return host.slice(0, 60);
}

export function recordVisit(input: {
	path: string;
	search: string;
	ip: string;
	userAgent: string;
	referer: string | null;
	host: string;
}) {
	try {
		const { path, userAgent } = input;
		if (!userAgent || BOT.test(userAgent)) return;
		if (SKIP_PATHS.some((p) => path.startsWith(p))) return;

		const d = day();
		const person = createHash('sha256')
			.update(`${salt}|${d}|${input.ip}|${userAgent}`)
			.digest('hex')
			.slice(0, 24);
		const cleanPath = path.length > 1 ? path.replace(/\/$/, '') : path;

		add(d, 'all', '*', 1, firstTime(d, `${person}|all`) ? 1 : 0);
		add(d, 'page', cleanPath, 1, firstTime(d, `${person}|p|${cleanPath}`) ? 1 : 0);

		const step = stepOf(cleanPath);
		if (step) add(d, 'step', step, 0, firstTime(d, `${person}|s|${step}`) ? 1 : 0);

		// Where they came from and what they use: counted once per visitor per day.
		if (firstTime(d, `${person}|src`)) {
			add(d, 'source', sourceOf(input.referer, input.search, input.host), 0, 1);
			add(
				d,
				'device',
				/mobile|android|iphone|ipad/i.test(userAgent) ? 'Phone or tablet' : 'Computer',
				0,
				1
			);
		}

		ensureFlusher();
	} catch {
		/* counting must never break a page */
	}
}

async function flush() {
	if (buffer.size === 0) return;
	const rows = [...buffer.values()];
	buffer.clear();
	try {
		await db
			.insert(siteVisits)
			.values(rows)
			.onDuplicateKeyUpdate({
				set: {
					views: sql`${siteVisits.views} + values(${siteVisits.views})`,
					visitors: sql`${siteVisits.visitors} + values(${siteVisits.visitors})`
				}
			});
	} catch (err) {
		// e.g. the table has not been created yet: drop this batch rather than grow forever.
		if (!warned) {
			warned = true;
			console.error('[analytics] could not save visitor counts', err);
		}
	}
}

function ensureFlusher() {
	if (started) return;
	started = true;
	setInterval(flush, 60 * 1000).unref();
	process.once('SIGTERM', () => void flush());
}

// ---- Reporting ----

export type VisitorReport = {
	visits: { now: number; before: number };
	views: { now: number; before: number };
	orders: { now: number; before: number };
	conversion: { now: number | null; before: number | null };
	daily: { day: string; visitors: number }[];
	pages: { name: string; views: number }[];
	sources: { name: string; visitors: number }[];
	devices: { name: string; visitors: number }[];
	funnel: { name: string; visitors: number }[];
};

const FUNNEL_ORDER = [
	'Home page',
	'Looked at a bake',
	'Opened the cart',
	'Reached checkout',
	'Placed an order'
];

export async function getVisitorReport(): Promise<VisitorReport> {
	const DAY = 24 * 60 * 60 * 1000;
	const now = new Date();
	const from = day(new Date(now.getTime() - 29 * DAY));
	const prevFrom = day(new Date(now.getTime() - 59 * DAY));
	const prevTo = day(new Date(now.getTime() - 30 * DAY));

	const rows = await db.select().from(siteVisits).where(gte(siteVisits.day, prevFrom));
	const current = rows.filter((r) => r.day >= from);
	const previous = rows.filter((r) => r.day >= prevFrom && r.day <= prevTo);
	const sum = (list: typeof rows, kind: string, key: 'views' | 'visitors', name?: string) =>
		list
			.filter((r) => r.kind === kind && (name == null || r.name === name))
			.reduce((a, r) => a + r[key], 0);

	const ordersIn = async (a: string, b: string) => {
		const [r] = await db
			.select({ n: count() })
			.from(orders)
			.where(
				and(
					ne(orders.status, 'cancelled'),
					gte(orders.createdAt, new Date(`${a}T00:00:00Z`)),
					lt(orders.createdAt, new Date(`${b}T00:00:00Z`))
				)
			);
		return Number(r?.n ?? 0);
	};
	const tomorrow = day(new Date(now.getTime() + DAY));
	const [ordersNow, ordersBefore] = await Promise.all([
		ordersIn(from, tomorrow),
		ordersIn(prevFrom, from)
	]);

	const visitsNow = sum(current, 'all', 'visitors');
	const visitsBefore = sum(previous, 'all', 'visitors');

	const byDay = new Map(current.filter((r) => r.kind === 'all').map((r) => [r.day, r.visitors]));
	const daily = Array.from({ length: 30 }, (_, i) => {
		const d = day(new Date(now.getTime() - (29 - i) * DAY));
		return { day: d, visitors: byDay.get(d) ?? 0 };
	});

	const group = (kind: string, key: 'views' | 'visitors') => {
		const totals = new Map<string, number>();
		for (const r of current.filter((x) => x.kind === kind))
			totals.set(r.name, (totals.get(r.name) ?? 0) + r[key]);
		return [...totals.entries()].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n);
	};

	return {
		visits: { now: visitsNow, before: visitsBefore },
		views: { now: sum(current, 'all', 'views'), before: sum(previous, 'all', 'views') },
		orders: { now: ordersNow, before: ordersBefore },
		conversion: {
			now: visitsNow ? Math.round((ordersNow / visitsNow) * 1000) / 10 : null,
			before: visitsBefore ? Math.round((ordersBefore / visitsBefore) * 1000) / 10 : null
		},
		daily,
		pages: group('page', 'views')
			.slice(0, 10)
			.map((p) => ({ name: p.name, views: p.n })),
		sources: group('source', 'visitors')
			.slice(0, 8)
			.map((p) => ({ name: p.name, visitors: p.n })),
		devices: group('device', 'visitors').map((p) => ({ name: p.name, visitors: p.n })),
		funnel: FUNNEL_ORDER.map((name) => ({ name, visitors: sum(current, 'step', 'visitors', name) }))
	};
}
