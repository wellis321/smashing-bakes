import { getAllActiveProductsWithCategory } from '$lib/server/db/queries';

// Menu items are just names ("Biscoff Cake"). Where a name matches a bake in the
// shop, the menu shows its photo and price and links to it. Names are compared by
// their meaningful words, so "Jam & Coconut" finds "Jam Coconut Cake" and
// "Brownies" finds "Brownie". Anything without a clear match stays plain text.

export type MenuProduct = {
	slug: string;
	name: string;
	imageUrl: string | null;
	zoom: number;
	focal: string;
	pricePence: number;
	onSale: boolean;
};

const STOP = new Set(['the', 'and', 'a', 'of', 'with', 'mini', 'box', 'boxes']);

function words(name: string): string[] {
	return name
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9 ]/g, ' ')
		.split(/\s+/)
		.filter(Boolean)
		.map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w))
		.filter((w) => !STOP.has(w));
}

function score(a: string[], b: string[]): number {
	if (a.length === 0 || b.length === 0) return 0;
	const setB = new Set(b);
	const shared = a.filter((w) => setB.has(w)).length;
	return shared / Math.max(a.length, b.length);
}

type MenuLike = {
	sections: { items: { id: number; name: string }[] }[];
};

export async function attachMenuProducts<
	M extends MenuLike,
	S extends M['sections'][number],
	I extends S['items'][number]
>(menus: M[]) {
	const products = await getAllActiveProductsWithCategory();
	const index = products.map((p) => ({ p, w: words(p.name) }));

	const find = (name: string): MenuProduct | null => {
		const w = words(name);
		let best: { p: (typeof products)[number]; s: number } | null = null;
		for (const entry of index) {
			const s = score(w, entry.w);
			if (s >= 0.6 && (!best || s > best.s)) best = { p: entry.p, s };
		}
		if (!best) return null;
		const p = best.p;
		const onSale = p.badge === 'sale' && p.salePricePence != null;
		const image = p.images[0];
		return {
			slug: p.slug,
			name: p.name,
			imageUrl: image?.url ?? null,
			zoom: image?.zoom ?? 100,
			focal: image?.focalPoint ?? 'center',
			pricePence: onSale ? p.salePricePence! : p.basePricePence,
			onSale
		};
	};

	return menus.map((menu) => {
		const sections = menu.sections.map((section) => ({
			...section,
			items: section.items.map((item) => ({ ...(item as I), product: find(item.name) }))
		}));
		// Up to three different photos for a small preview of the menu.
		const seen = new Set<string>();
		const thumbs: MenuProduct[] = [];
		for (const section of sections) {
			for (const item of section.items) {
				const prod = item.product;
				if (prod?.imageUrl && !seen.has(prod.slug) && thumbs.length < 3) {
					seen.add(prod.slug);
					thumbs.push(prod);
				}
			}
		}
		return { ...menu, sections, thumbs };
	});
}
