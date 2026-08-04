import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from './$types';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');

const CONTENT_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp'
};

export const GET: RequestHandler = async ({ params }) => {
	const requestedPath = params.file ?? '';
	const resolved = path.normalize(path.join(UPLOAD_ROOT, requestedPath));

	// Prevent path traversal outside the uploads root.
	if (!resolved.startsWith(UPLOAD_ROOT)) {
		throw error(400, 'Invalid path');
	}

	const contentType = CONTENT_TYPES[path.extname(resolved).toLowerCase()];
	if (!contentType) throw error(404, 'Not found');

	try {
		const data = await readFile(resolved);
		return new Response(new Uint8Array(data), {
			headers: {
				'content-type': contentType,
				'cache-control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		throw error(404, 'Not found');
	}
};
