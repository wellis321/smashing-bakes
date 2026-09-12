import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from '$lib/server/db';
import { uploadedFiles } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');

const CONTENT_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp'
};

// Every new upload is saved to the database (see $lib/server/uploads.ts), but
// this route still checks disk as a fallback for anything uploaded before
// that switch — those files only exist wherever they happened to land on the
// server's local disk, nowhere else, so dropping this early would 404 them
// immediately rather than letting them keep working until naturally replaced.
async function readFromDisk(requestedPath: string): Promise<{ data: Buffer; contentType: string } | null> {
	const resolved = path.normalize(path.join(UPLOAD_ROOT, requestedPath));
	if (!resolved.startsWith(UPLOAD_ROOT)) return null;

	const contentType = CONTENT_TYPES[path.extname(resolved).toLowerCase()];
	if (!contentType) return null;

	try {
		return { data: await readFile(resolved), contentType };
	} catch {
		return null;
	}
}

export const GET: RequestHandler = async ({ params }) => {
	const requestedPath = params.file ?? '';

	const row = await db.query.uploadedFiles.findFirst({ where: eq(uploadedFiles.path, requestedPath) });
	const file = row ? { data: Buffer.from(row.data), contentType: row.contentType } : await readFromDisk(requestedPath);

	if (!file) throw error(404, 'Not found');

	return new Response(new Uint8Array(file.data), {
		headers: {
			'content-type': file.contentType,
			'cache-control': 'public, max-age=31536000, immutable'
		}
	});
};
