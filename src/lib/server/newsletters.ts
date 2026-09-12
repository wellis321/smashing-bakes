import { asc, eq } from 'drizzle-orm';
import { db } from './db';
import { newsletters, newsletterHighlights } from './db/schema';
import { getNewsletterAudience } from './db/queries';
import { isEmailConfigured, sendNewsletterBatch } from './email/resend';
import { renderNewsletterHtml } from '$lib/email/newsletter-template';

export class NewsletterSendError extends Error {}

// Shared by the admin "Send now" action and the scheduled-dispatch endpoint,
// so there's exactly one place that renders, sends and marks a newsletter sent.
export async function dispatchNewsletter(id: number, siteUrl: string): Promise<{ sent: number; failed: number }> {
	if (!isEmailConfigured()) throw new NewsletterSendError("Email sending isn't configured (RESEND_API_KEY / RESEND_FROM_EMAIL).");

	const newsletter = await db.query.newsletters.findFirst({ where: eq(newsletters.id, id) });
	if (!newsletter) throw new NewsletterSendError('Newsletter not found.');
	if (newsletter.status === 'sent') throw new NewsletterSendError('Already sent.');

	const highlights = await db.query.newsletterHighlights.findMany({
		where: eq(newsletterHighlights.newsletterId, id),
		orderBy: [asc(newsletterHighlights.sortOrder)]
	});

	const audience = await getNewsletterAudience();
	if (audience.length === 0) throw new NewsletterSendError('No subscribers to send to.');

	const recipients = audience.map((r) => ({
		email: r.email,
		html: renderNewsletterHtml(newsletter, highlights, { siteUrl, unsubscribeUrl: `${siteUrl}/unsubscribe?token=${r.unsubscribeToken}` })
	}));

	const results = await sendNewsletterBatch(recipients, newsletter.subject);
	const sent = results.filter((r) => r.success).length;
	const failed = results.length - sent;

	await db.update(newsletters).set({ status: 'sent', sentAt: new Date(), recipientCount: sent }).where(eq(newsletters.id, id));

	return { sent, failed };
}
