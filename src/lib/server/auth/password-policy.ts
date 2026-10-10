// Rules for passwords people choose themselves. Length matters most; the
// extra checks only stop the passwords attackers try first.
export const CUSTOMER_MIN_LENGTH = 10;
export const STAFF_MIN_LENGTH = 12;

const COMMON = new Set([
	'password',
	'password1',
	'password123',
	'passw0rd',
	'qwertyuiop',
	'qwerty123',
	'1234567890',
	'123456789',
	'12345678',
	'iloveyou',
	'letmein123',
	'welcome123',
	'admin1234',
	'abc123456',
	'smashinbakes',
	'smashingbakes',
	'bakery1234'
]);

// Returns a message to show the person, or null if the password is fine.
export function checkPassword(password: string, minLength: number, email = ''): string | null {
	if (password.length < minLength) {
		return `Your password needs to be at least ${minLength} characters.`;
	}
	const lower = password.toLowerCase();
	const compact = lower.replace(/[^a-z0-9]/g, '');
	if (COMMON.has(lower) || COMMON.has(compact) || /^(.)\1+$/.test(password)) {
		return 'That password is too easy to guess. Try a few unrelated words together.';
	}
	const local = email.split('@')[0]?.toLowerCase() ?? '';
	if (local.length >= 4 && compact.includes(local.replace(/[^a-z0-9]/g, ''))) {
		return 'Your password shouldn’t contain your email address.';
	}
	return null;
}
