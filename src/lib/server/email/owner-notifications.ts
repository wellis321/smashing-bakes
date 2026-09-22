import { env } from '$env/dynamic/private';
import { isEmailConfigured, sendTestEmail } from './resend';
import { COLOR, escapeHtml } from '$lib/email/newsletter-template';

// Who hears about a new order/subscriber/enquiry — overridable via env so
// this doesn't need a code change if the shop wants a different inbox (or
// several, comma-separated) later.
function ownerRecipients(): string[] {
	const raw = env.NOTIFY_OWNER_EMAIL || 'alanah@smashinbakes.co.uk';
	return raw
		.split(',')
		.map((e) => e.trim())
		.filter(Boolean);
}

function renderNotificationEmail(
	heading: string,
	rows: [string, string][],
	footerHtml: string
): string {
	const rowsHtml = rows
		.map(
			([label, value]) => `
				<tr>
					<td style="padding:4px 12px 4px 0;font-size:14px;color:${COLOR.inkSoft};white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
					<td style="padding:4px 0;font-size:14px;color:${COLOR.ink};">${value}</td>
				</tr>`
		)
		.join('');

	return `
<!doctype html>
<html>
	<body style="margin:0;padding:0;background-color:${COLOR.creamDim};font-family:Georgia,'Times New Roman',serif;">
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR.creamDim};">
			<tr>
				<td align="center" style="padding:32px 16px;">
					<table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;background-color:${COLOR.cream};border-radius:16px;overflow:hidden;">
						<tr>
							<td style="padding:32px 32px 24px 32px;">
								<p style="margin:0 0 4px 0;font-size:22px;font-weight:700;color:${COLOR.pinkDeep};">Smashin' Bakes</p>
								<h1 style="margin:16px 0 16px 0;font-size:20px;color:${COLOR.ink};">${escapeHtml(heading)}</h1>
								<table role="presentation" cellpadding="0" cellspacing="0" border="0">${rowsHtml}</table>
								<p style="margin:20px 0 0 0;font-size:13px;line-height:1.6;color:${COLOR.inkSoft};">${footerHtml}</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`;
}

// Best-effort: a notification failing (or not being configured at all) must
// never break the customer-facing action it's attached to.
async function notifyOwner(subject: string, html: string): Promise<void> {
	const recipients = ownerRecipients();
	if (recipients.length === 0) return;

	if (!isEmailConfigured()) {
		console.log(
			`[owner notification] email not configured; would have sent "${subject}" to ${recipients.join(', ')}`
		);
		return;
	}
	for (const to of recipients) {
		try {
			await sendTestEmail(to, subject, html);
		} catch (err) {
			console.error(`Failed to send owner notification "${subject}" to ${to}:`, err);
		}
	}
}

export async function notifyOwnerOfOrder(order: {
	id: number;
	guestName: string;
	guestEmail: string;
	totalPence: number;
	pickupDate: string;
	fulfilmentMethod: 'pickup' | 'delivery';
	deliveryAddress: string | null;
}): Promise<void> {
	const date = new Intl.DateTimeFormat('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	}).format(new Date(`${order.pickupDate}T00:00:00`));
	const rows: [string, string][] = [
		['Order', `#${order.id}`],
		['From', `${escapeHtml(order.guestName)} (${escapeHtml(order.guestEmail)})`],
		['Total', `£${(order.totalPence / 100).toFixed(2)}`],
		[order.fulfilmentMethod === 'delivery' ? 'Delivery' : 'Pickup', escapeHtml(date)]
	];
	if (order.fulfilmentMethod === 'delivery' && order.deliveryAddress) {
		rows.push(['Address', escapeHtml(order.deliveryAddress).replace(/\n/g, '<br>')]);
	}

	await notifyOwner(
		`New order #${order.id} — £${(order.totalPence / 100).toFixed(2)}`,
		renderNotificationEmail('New order', rows, 'See the full order in the admin area under Orders.')
	);
}

export async function notifyOwnerOfSubscriber(email: string, name: string | null): Promise<void> {
	const rows: [string, string][] = [['Email', escapeHtml(email)]];
	if (name) rows.push(['Name', escapeHtml(name)]);

	await notifyOwner(
		'New newsletter subscriber',
		renderNotificationEmail(
			'New newsletter subscriber',
			rows,
			'They’re now in Subscribers in the admin area.'
		)
	);
}

export async function notifyOwnerOfEnquiry(enquiry: {
	name: string;
	email: string;
	phone: string | null;
	details: string;
}): Promise<void> {
	const rows: [string, string][] = [
		['From', `${escapeHtml(enquiry.name)} (${escapeHtml(enquiry.email)})`],
		...(enquiry.phone ? ([['Phone', escapeHtml(enquiry.phone)]] as [string, string][]) : []),
		['Details', escapeHtml(enquiry.details).replace(/\n/g, '<br>')]
	];

	await notifyOwner(
		'New bespoke cake enquiry',
		renderNotificationEmail(
			'New bespoke cake enquiry',
			rows,
			'See it in the admin area under Enquiries.'
		)
	);
}
