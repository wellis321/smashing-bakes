import { error } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

// Temporary diagnostic: shows which address the database sees this site
// connecting from, so the database's remote-access list can be narrowed from
// "any host" to just that address. Admin-only and not linked from the menu.
// Delete this folder once the address is known.
export const load: PageServerLoad = async ({ locals }) => {
	if (locals.staff?.role !== 'admin') throw error(403, 'Admins only.');

	let userAs = '';
	let grantedAs = '';
	let dbError = '';
	try {
		const result = await db.execute(sql`SELECT USER() AS u, CURRENT_USER() AS c`);
		// mysql2 returns [rows, fields]
		const rows = (Array.isArray(result) ? result[0] : result) as unknown as {
			u: string;
			c: string;
		}[];
		userAs = rows?.[0]?.u ?? '';
		grantedAs = rows?.[0]?.c ?? '';
	} catch (err) {
		dbError = err instanceof Error ? err.message : 'Query failed';
	}

	// The address the wider internet sees this server as — usually the same.
	let outboundIp = '';
	try {
		const res = await fetch('https://api.ipify.org', { signal: AbortSignal.timeout(4000) });
		outboundIp = (await res.text()).trim();
	} catch {
		outboundIp = '';
	}

	return { userAs, grantedAs, dbError, outboundIp };
};
