import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

function createDb() {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
	// The hosting plan allows only 500 NEW connections per hour for this database
	// user. A small pool that keeps its connections open and reuses them (rather
	// than closing idle ones after a minute and reopening them for the next
	// burst of visitors) keeps well under that, even with crawlers and restarts.
	const client = mysql.createPool({
		uri: env.DATABASE_URL,
		connectionLimit: 6,
		maxIdle: 6,
		idleTimeout: 30 * 60 * 1000,
		enableKeepAlive: true,
		keepAliveInitialDelay: 10_000,
		connectTimeout: 10_000
	});
	return drizzle(client, { schema, mode: 'default' });
}

type Db = ReturnType<typeof createDb>;

let instance: Db | undefined;

// Lazy: SvelteKit's build-time "analyse" step imports this module without a
// runtime env available, so connecting eagerly at module load crashes the build.
function getDb(): Db {
	if (!instance) instance = createDb();
	return instance;
}

export const db: Db = new Proxy({} as Db, {
	get(_target, prop) {
		const real = getDb();
		const value = Reflect.get(real, prop);
		return typeof value === 'function' ? value.bind(real) : value;
	}
});
