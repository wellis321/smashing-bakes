import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const UPLOAD_BASE = path.join(process.cwd(), 'uploads');

const ALLOWED_TYPES: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function saveUploadedImage(
	file: File,
	folder: 'products' | 'promotions' | 'posters'
): Promise<string> {
	const extension = ALLOWED_TYPES[file.type];
	if (!extension) {
		throw new Error('Unsupported image type. Please upload a JPG, PNG or WEBP file.');
	}
	if (file.size > MAX_SIZE_BYTES) {
		throw new Error('Image is too large. Please upload a file under 5MB.');
	}

	const dir = path.join(UPLOAD_BASE, folder);
	await mkdir(dir, { recursive: true });

	const filename = `${randomUUID()}.${extension}`;
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(path.join(dir, filename), buffer);

	return `/uploads/${folder}/${filename}`;
}

export async function saveProductImage(file: File): Promise<string> {
	return saveUploadedImage(file, 'products');
}
