import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

function createDb() {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
	const client = mysql.createPool(env.DATABASE_URL);
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
