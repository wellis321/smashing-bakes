import type { PageServerLoad } from './$types';
import {
	getVisibleCategories,
	getActivePoster,
	getFeaturedProducts,
	getFeaturedPromotion,
	getHeroImages,
	getAllActiveProductsWithCategory
} from '$lib/server/db/queries';

// One photographed bake from each category, picked at random, for the Browse by
// bake plates. Real photos are preferred over the built-in placeholder pictures.
function pickCategoryPhotos(
	categories: { id: number; imageUrl: string | null }[],
	products: { categoryId: number; images: { url: string }[] }[]
): Record<number, string> {
	const photos: Record<number, string> = {};
	for (const category of categories) {
		if (category.imageUrl) continue;
		const withImage = products
			.filter((p) => p.categoryId === category.id && p.images[0])
			.map((p) => p.images[0].url);
		const real = withImage.filter((url) => !url.endsWith('.svg'));
		const pool = real.length > 0 ? real : withImage;
		if (pool.length > 0) photos[category.id] = pool[Math.floor(Math.random() * pool.length)];
	}
	return photos;
}

export const load: PageServerLoad = async () => {
	const [categories, allProducts] = await Promise.all([
		getVisibleCategories(),
		getAllActiveProductsWithCategory()
	]);
	return {
		categoryPhotos: pickCategoryPhotos(categories, allProducts),
		categories,
		featured: await getFeaturedProducts(),
		promotion: await getFeaturedPromotion(),
		poster: await getActivePoster(),
		heroImages: await getHeroImages()
	};
};
