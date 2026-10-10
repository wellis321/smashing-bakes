// A small in-memory limiter for public forms and logins. It lives in the
// running Node process, so it resets on a restart and isn't shared between
// servers — fine for one small site, and it needs no database. Keys are
// things like "login:someone@example.com" rather than IP addresses, because
// behind Hostinger's proxy every visitor can look like the same address.
const hits = new Map<string, number[]>();

function recent(key: string, windowMs: number, now: number) {
	const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
	if (list.length === 0) hits.delete(key);
	else hits.set(key, list);
	return list;
}

// Counts this attempt (unless `consume` is false, which only looks) and says
// whether it is within `max` attempts per `windowMs`.
export function rateLimit(key: string, max: number, windowMs: number, consume = true) {
	const now = Date.now();
	const list = recent(key, windowMs, now);
	if (list.length >= max) {
		return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - list[0])) / 1000) };
	}
	if (consume) hits.set(key, [...list, now]);
	return { ok: true, retryAfterSec: 0 };
}

export function resetRateLimit(key: string) {
	hits.delete(key);
}

// Keep the map from growing forever on a long-running server.
setInterval(
	() => {
		const now = Date.now();
		for (const [key, list] of hits) {
			if (now - list[list.length - 1] > 60 * 60 * 1000) hits.delete(key);
		}
	},
	10 * 60 * 1000
).unref?.();
