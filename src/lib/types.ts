export interface ProductImage {
	url: string;
	altText: string | null;
}

export interface ProductCardData {
	slug: string;
	name: string;
	description: string | null;
	basePricePence: number;
	salePricePence: number | null;
	badge: 'none' | 'sale' | 'new';
	images: ProductImage[];
}

export interface CategorySummary {
	id: number;
	name: string;
	slug: string;
	description: string | null;
}
