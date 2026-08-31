import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
	return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [salt, key] = storedHash.split(':');
	if (!salt || !key) return false;
	const keyBuffer = Buffer.from(key, 'hex');
	const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
	if (derivedKey.length !== keyBuffer.length) return false;
	return timingSafeEqual(derivedKey, keyBuffer);
}

// Used for staff accounts created/reset by an admin — there's no email
// sending, so this is shown once on screen rather than delivered anywhere.
export function generateTempPassword(): string {
	// Base64url, trimmed to something easy enough to read aloud/type — still
	// well over the entropy a brute-force lockout needs to make guessing moot.
	return randomBytes(9).toString('base64url');
}
