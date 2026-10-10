import { IMAGE_WIDTHS } from '$lib/utils/img';

// Smaller, compressed copies of uploaded photos, made on request and kept in
// memory. The original is never touched. If the image library can't run for
// any reason, callers fall back to serving the original, so a problem here can
// never take photos offline.
const MAX_CACHE_BYTES = 96 * 1024 * 1024;
const cache = new Map<string, Buffer>();
const inFlight = new Map<string, Promise<Buffer | null>>();
let cacheBytes = 0;

// Snap any requested width to the nearest allowed size, so the cache can't be
// filled with endless odd sizes.
export function snapWidth(requested: number): number {
	const wanted = Number.isFinite(requested) ? requested : 640;
	return IMAGE_WIDTHS.find((w) => w >= wanted) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
}

function remember(key: string, data: Buffer) {
	cache.set(key, data);
	cacheBytes += data.length;
	for (const [oldKey, oldData] of cache) {
		if (cacheBytes <= MAX_CACHE_BYTES) break;
		cache.delete(oldKey);
		cacheBytes -= oldData.length;
	}
}

export function peekVariant(key: string, width: number): Buffer | undefined {
	return cache.get(`${key}@${width}`);
}

export async function resizedWebp(
	key: string,
	original: Buffer,
	width: number
): Promise<Buffer | null> {
	const cacheKey = `${key}@${width}`;
	const hit = cache.get(cacheKey);
	if (hit) return hit;

	let pending = inFlight.get(cacheKey);
	if (!pending) {
		pending = (async () => {
			try {
				const { default: sharp } = await import('sharp');
				const out = await sharp(original, { failOn: 'none' })
					.rotate() // respect the camera's orientation
					.resize({ width, withoutEnlargement: true })
					.webp({ quality: 74, effort: 4, smartSubsample: true })
					.toBuffer();
				remember(cacheKey, out);
				return out;
			} catch (err) {
				console.error('[image] could not resize', key, err);
				return null;
			} finally {
				inFlight.delete(cacheKey);
			}
		})();
		inFlight.set(cacheKey, pending);
	}
	return pending;
}

// Used at upload time: stop huge camera originals (often 5-10 MB) being stored
// and served. Anything under 2000px wide is left exactly as uploaded.
export async function limitOriginalSize(
	data: Buffer,
	contentType: string
): Promise<{ data: Buffer; contentType: string }> {
	try {
		const { default: sharp } = await import('sharp');
		const meta = await sharp(data, { failOn: 'none' }).metadata();
		if (!meta.width || meta.width <= 2000) return { data, contentType };
		const pipeline = sharp(data, { failOn: 'none' }).rotate().resize({ width: 2000 });
		const out =
			contentType === 'image/png'
				? await pipeline.png({ compressionLevel: 9 }).toBuffer()
				: contentType === 'image/webp'
					? await pipeline.webp({ quality: 85 }).toBuffer()
					: await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
		return out.length < data.length ? { data: out, contentType } : { data, contentType };
	} catch {
		return { data, contentType };
	}
}
