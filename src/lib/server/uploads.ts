import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { uploadedFiles } from '$lib/server/db/schema';

const ALLOWED_TYPES: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// Stored in the database rather than on local disk — Hostinger rebuilds this
// app from git on every deploy, so plain files written to process.cwd() at
// runtime don't survive the next push. The database is the one thing here
// that reliably does.
export async function saveUploadedImage(
	file: File,
	folder: 'products' | 'promotions' | 'posters' | 'media'
): Promise<string> {
	const extension = ALLOWED_TYPES[file.type];
	if (!extension) {
		throw new Error('Unsupported image type. Please upload a JPG, PNG or WEBP file.');
	}
	if (file.size > MAX_SIZE_BYTES) {
		throw new Error('Image is too large. Please upload a file under 5MB.');
	}

	const filename = `${randomUUID()}.${extension}`;
	const relativePath = `${folder}/${filename}`;
	const buffer = Buffer.from(await file.arrayBuffer());

	await db.insert(uploadedFiles).values({ path: relativePath, contentType: file.type, data: buffer });

	return `/uploads/${relativePath}`;
}

export async function saveProductImage(file: File): Promise<string> {
	return saveUploadedImage(file, 'products');
}

// Deletes a file previously returned by saveUploadedImage. Only ever called
// with urls we generated ourselves (stored in our own DB rows).
export async function deleteUploadedImage(url: string): Promise<void> {
	if (!url.startsWith('/uploads/')) return;
	const relativePath = url.slice('/uploads/'.length);
	await db.delete(uploadedFiles).where(eq(uploadedFiles.path, relativePath));
}
