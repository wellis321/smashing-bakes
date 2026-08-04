/** Only allow same-site relative paths as post-login redirect targets. */
export function safeRedirectTarget(value: string | null | undefined, fallback: string): string {
	if (!value) return fallback;
	if (!value.startsWith('/') || value.startsWith('//')) return fallback;
	return value;
}
