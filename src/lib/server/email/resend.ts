import { env } from '$env/dynamic/private';

export class EmailNotConfiguredError extends Error {
	constructor() {
		super('Email sending isn\'t configured yet — set RESEND_API_KEY and RESEND_FROM_EMAIL.');
		this.name = 'EmailNotConfiguredError';
	}
}

function getSenderConfig() {
	if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) throw new EmailNotConfiguredError();
	const fromName = env.RESEND_FROM_NAME || "Smashin' Bakes";
	return { apiKey: env.RESEND_API_KEY, from: `${fromName} <${env.RESEND_FROM_EMAIL}>` };
}

export function isEmailConfigured(): boolean {
	return Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
}

type SendResult = { to: string; success: boolean; error?: string };

async function resendRequest(path: string, apiKey: string, body: unknown) {
	const response = await fetch(`https://api.resend.com${path}`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(`Resend API error (${response.status}): ${text.slice(0, 300)}`);
	}
	return response.json();
}

export async function sendTestEmail(to: string, subject: string, html: string): Promise<void> {
	const { apiKey, from } = getSenderConfig();
	await resendRequest('/emails', apiKey, { from, to, subject, html });
}

// Resend's batch endpoint accepts up to 100 emails per request and each
// recipient gets their own message (not a visible group send) — sent in
// chunks so a very large list doesn't hit that limit.
export async function sendNewsletterBatch(
	recipients: { email: string; html: string }[],
	subject: string
): Promise<SendResult[]> {
	const { apiKey, from } = getSenderConfig();
	const results: SendResult[] = [];
	const chunkSize = 100;

	for (let i = 0; i < recipients.length; i += chunkSize) {
		const chunk = recipients.slice(i, i + chunkSize);
		try {
			await resendRequest(
				'/emails/batch',
				apiKey,
				chunk.map((r) => ({ from, to: r.email, subject, html: r.html }))
			);
			for (const r of chunk) results.push({ to: r.email, success: true });
		} catch (err) {
			for (const r of chunk) results.push({ to: r.email, success: false, error: err instanceof Error ? err.message : 'Send failed' });
		}
	}

	return results;
}
