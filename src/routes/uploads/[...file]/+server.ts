import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { uploadedFiles } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const requestedPath = params.file ?? '';

	const row = await db.query.uploadedFiles.findFirst({ where: eq(uploadedFiles.path, requestedPath) });
	if (!row) throw error(404, 'Not found');

	return new Response(new Uint8Array(row.data), {
		headers: {
			'content-type': row.contentType,
			'cache-control': 'public, max-age=31536000, immutable'
		}
	});
};
