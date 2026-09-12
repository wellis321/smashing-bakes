// Serializes a JSON-LD object for embedding in an inline <script> tag via
// {@html}. Escaping "</script" is defense in depth — the values going in are
// staff-entered admin content, not public user input, but a literal
// "</script>" in a name/description would otherwise close the tag early.
export function safeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
}
