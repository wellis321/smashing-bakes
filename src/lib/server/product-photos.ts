import { and, asc, desc, eq, ne, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { mediaLibraryItems, productImages, products, uploadedFiles } from '$lib/server/db/schema';
import { photoUsage, repointPhoto } from '$lib/server/photo-usage';

// Every product photo gets a file name and alt text taken from the product's
// own name, so staff never have to type either:
//   Toffee Crisp Blondie  ->  /uploads/products/toffee-crisp-blondie.jpg
//                             alt "Toffee Crisp Blondie"
// Extra photos become toffee-crisp-blondie-2.jpg ("... – photo 2"), and a name
// that is already taken gets a number added, so no two photos ever share one.
//
// A renamed photo is a *copy* under the new name. The old file is only removed
// once nothing at all still points at it (sent emails, posters, promotions...),
// so no existing page or email can lose its picture.

const EXTENSIONS: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

const PREFIX = '/uploads/';

async function pathIsFree(path: string): Promise<boolean> {
	return (await db.$count(uploadedFiles, eq(uploadedFiles.path, path))) === 0;
}

// An alt text that no other product photo already has.
async function uniqueAlt(wanted: string, imageId: number): Promise<string> {
	let alt = wanted;
	for (let n = 2; n < 50; n++) {
		const taken = await db.$count(
			productImages,
			and(eq(productImages.altText, alt), ne(productImages.id, imageId))
		);
		if (taken === 0) return alt;
		alt = `${wanted} (${n})`;
	}
	return alt;
}

export async function tidyProductPhotos(productId: number): Promise<number> {
	const product = await db.query.products.findFirst({ where: eq(products.id, productId) });
	if (!product) return 0;

	const images = await db.query.productImages.findMany({
		where: eq(productImages.productId, productId),
		orderBy: [desc(productImages.isPrimary), asc(productImages.sortOrder), asc(productImages.id)]
	});

	let renamed = 0;
	for (const [index, image] of images.entries()) {
		const number = index + 1;
		const wantedAlt = number === 1 ? product.name : `${product.name} – photo ${number}`;
		const alt = await uniqueAlt(wantedAlt, image.id);

		// Photos that live elsewhere (or no longer exist) only get alt text.
		if (!image.url.startsWith(PREFIX)) {
			if (image.altText !== alt) {
				await db.update(productImages).set({ altText: alt }).where(eq(productImages.id, image.id));
			}
			continue;
		}

		const currentPath = image.url.slice(PREFIX.length);
		const file = await db.query.uploadedFiles.findFirst({
			where: eq(uploadedFiles.path, currentPath),
			columns: { path: true, contentType: true }
		});
		if (!file) {
			if (image.altText !== alt) {
				await db.update(productImages).set({ altText: alt }).where(eq(productImages.id, image.id));
			}
			continue;
		}

		const extension = EXTENSIONS[file.contentType] ?? 'jpg';
		const baseName = number === 1 ? product.slug : `${product.slug}-${number}`;

		// Find a name nobody else is using (our own current name counts as ours).
		let desiredPath = `products/${baseName}.${extension}`;
		for (
			let n = 2;
			desiredPath !== currentPath && !(await pathIsFree(desiredPath)) && n < 50;
			n++
		) {
			desiredPath = `products/${baseName}-${n}.${extension}`;
		}
		const fileName = desiredPath.slice('products/'.length);
		const newUrl = `${PREFIX}${desiredPath}`;

		if (desiredPath === currentPath) {
			await db.update(productImages).set({ altText: alt }).where(eq(productImages.id, image.id));
			await db
				.update(mediaLibraryItems)
				.set({ filename: fileName, altText: alt })
				.where(eq(mediaLibraryItems.url, image.url));
			continue;
		}

		// Copy inside the database (the picture itself never passes through the app).
		await db.execute(
			sql`insert into uploaded_files (path, content_type, data) select ${desiredPath}, content_type, data from uploaded_files where path = ${currentPath}`
		);
		await db
			.update(productImages)
			.set({ url: newUrl, altText: alt })
			.where(eq(productImages.id, image.id));

		// Everything else that used the old photo (poster, gallery, categories...)
		// moves to the new name too, so nothing is left pointing at the old one.
		await repointPhoto(image.url, newUrl);

		// The old file is only removed once nothing at all still uses it.
		// (Newsletters already sent keep it.)
		const stillUsed = (await photoUsage(image.url)).length;
		const libraryRows = await db.query.mediaLibraryItems.findMany({
			where: eq(mediaLibraryItems.url, image.url)
		});
		if (stillUsed === 0) {
			if (libraryRows.length > 0) {
				await db
					.update(mediaLibraryItems)
					.set({ url: newUrl, filename: fileName, altText: alt })
					.where(eq(mediaLibraryItems.url, image.url));
			} else {
				await db
					.insert(mediaLibraryItems)
					.values({ url: newUrl, filename: fileName, altText: alt });
			}
			await db.delete(uploadedFiles).where(eq(uploadedFiles.path, currentPath));
		} else {
			await db.insert(mediaLibraryItems).values({ url: newUrl, filename: fileName, altText: alt });
		}
		renamed++;
	}
	return renamed;
}

export async function tidyAllProductPhotos(): Promise<{ products: number; renamed: number }> {
	const rows = await db.query.products.findMany({ columns: { id: true } });
	let renamed = 0;
	for (const row of rows) renamed += await tidyProductPhotos(row.id);
	return { products: rows.length, renamed };
}
