// Client-only cart, persisted to localStorage — there's no server-side cart
// (guest checkout is the norm here), so this module is a singleton that's
// only ever mutated from the browser. It's imported during SSR too (where
// localStorage doesn't exist), but nothing server-side calls its mutators,
// so the SSR instance just stays permanently empty and harmless.
export type CartItem = {
	productId: number;
	variantId: number | null;
	slug: string;
	name: string;
	variantName: string | null;
	unitPricePence: number;
	imageUrl: string | null;
	quantity: number;
};

const STORAGE_KEY = 'smashin-bakes-cart';

function loadInitial(): CartItem[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

class CartStore {
	items = $state<CartItem[]>(loadInitial());

	count = $derived(this.items.reduce((sum, i) => sum + i.quantity, 0));
	subtotalPence = $derived(this.items.reduce((sum, i) => sum + i.unitPricePence * i.quantity, 0));

	#persist() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
		} catch {
			// Private browsing / storage disabled — cart still works for this
			// page view, it just won't survive a reload. Not worth surfacing.
		}
	}

	add(item: Omit<CartItem, 'quantity'>, quantity = 1) {
		const existing = this.items.find((i) => i.productId === item.productId && i.variantId === item.variantId);
		if (existing) {
			existing.quantity += quantity;
		} else {
			this.items.push({ ...item, quantity });
		}
		this.#persist();
	}

	setQuantity(productId: number, variantId: number | null, quantity: number) {
		if (quantity <= 0) {
			this.remove(productId, variantId);
			return;
		}
		const item = this.items.find((i) => i.productId === productId && i.variantId === variantId);
		if (!item) return;
		item.quantity = quantity;
		this.#persist();
	}

	remove(productId: number, variantId: number | null) {
		this.items = this.items.filter((i) => !(i.productId === productId && i.variantId === variantId));
		this.#persist();
	}

	clear() {
		this.items = [];
		this.#persist();
	}
}

export const cart = new CartStore();
