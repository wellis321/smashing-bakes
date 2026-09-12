// Renders a newsletter as a self-contained, email-client-safe HTML document —
// table-based layout, inline styles, no external stylesheet or CSS variables
// (email clients, especially Outlook, don't support either reliably). Colors
// below are manually-converted sRGB hex equivalents of the site's own oklch
// design tokens (src/routes/layout.css) — kept in sync by eye, not a build step.
export const COLOR = {
	cream: '#fcf6ed',
	creamDim: '#f3eadd',
	ink: '#2d1a10',
	inkSoft: '#503e34',
	blush: '#fad2d8',
	pink: '#e98095',
	pinkDeep: '#ba4764'
};

export type NewsletterHighlight = {
	imageUrl: string | null;
	title: string;
	description: string | null;
	linkUrl: string | null;
};

export type NewsletterContent = {
	subject: string;
	preheader: string | null;
	heroImageUrl: string | null;
	heading: string;
	intro: string | null;
	ctaLabel: string | null;
	ctaUrl: string | null;
	signOff: string | null;
};

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

// Plain text with line breaks (intro/description fields) — escape then turn
// newlines into <br>, rather than allowing arbitrary HTML input.
function escapeMultiline(value: string): string {
	return escapeHtml(value).replace(/\n/g, '<br>');
}

function absoluteUrl(url: string | null, siteUrl: string): string | null {
	if (!url) return null;
	if (/^https?:\/\//.test(url)) return url;
	return `${siteUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}

function renderHighlight(h: NewsletterHighlight, siteUrl: string): string {
	const link = absoluteUrl(h.linkUrl, siteUrl);
	const image = absoluteUrl(h.imageUrl, siteUrl);
	const titleHtml = link
		? `<a href="${link}" style="color:${COLOR.ink};text-decoration:none;">${escapeHtml(h.title)}</a>`
		: escapeHtml(h.title);

	return `
		<tr>
			<td style="padding:0 0 24px 0;">
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
					<tr>
						${
							image
								? `<td width="96" valign="top" style="padding-right:16px;">
									<a href="${link ?? '#'}"><img src="${image}" width="96" height="96" alt="" style="display:block;border-radius:12px;object-fit:cover;width:96px;height:96px;" /></a>
								</td>`
								: ''
						}
						<td valign="top">
							<p style="margin:0 0 4px 0;font-size:17px;font-weight:700;color:${COLOR.ink};">${titleHtml}</p>
							${h.description ? `<p style="margin:0;font-size:14px;line-height:1.5;color:${COLOR.inkSoft};">${escapeMultiline(h.description)}</p>` : ''}
							${link ? `<p style="margin:6px 0 0 0;"><a href="${link}" style="font-size:13px;font-weight:600;color:${COLOR.pinkDeep};text-decoration:none;">See more &rarr;</a></p>` : ''}
						</td>
					</tr>
				</table>
			</td>
		</tr>`;
}

export function renderNewsletterHtml(
	content: NewsletterContent,
	highlights: NewsletterHighlight[],
	options: { siteUrl: string; unsubscribeUrl: string }
): string {
	const { siteUrl, unsubscribeUrl } = options;
	const heroImage = absoluteUrl(content.heroImageUrl, siteUrl);
	const ctaUrl = absoluteUrl(content.ctaUrl, siteUrl);

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(content.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.creamDim};font-family:Georgia,'Times New Roman',serif;">
	${content.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.preheader)}</div>` : ''}
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.creamDim};padding:32px 16px;">
		<tr>
			<td align="center">
				<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${COLOR.cream};border-radius:24px;overflow:hidden;">
					<tr>
						<td style="padding:28px 32px;text-align:center;border-bottom:1px solid ${COLOR.blush};">
							<span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:${COLOR.pinkDeep};letter-spacing:0.5px;">SMASHIN' BAKES</span>
						</td>
					</tr>
					${
						heroImage
							? `<tr><td><img src="${heroImage}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;" /></td></tr>`
							: ''
					}
					<tr>
						<td style="padding:36px 32px 8px 32px;">
							<h1 style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:28px;line-height:1.2;color:${COLOR.ink};">${escapeHtml(content.heading)}</h1>
							${content.intro ? `<p style="margin:0;font-size:15px;line-height:1.6;color:${COLOR.inkSoft};">${escapeMultiline(content.intro)}</p>` : ''}
						</td>
					</tr>
					${
						highlights.length > 0
							? `<tr><td style="padding:20px 32px 4px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${highlights.map((h) => renderHighlight(h, siteUrl)).join('')}</table></td></tr>`
							: ''
					}
					${
						content.ctaLabel && ctaUrl
							? `<tr><td style="padding:8px 32px 32px 32px;text-align:center;">
								<a href="${ctaUrl}" style="display:inline-block;background:${COLOR.pink};color:${COLOR.cream};font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:999px;">${escapeHtml(content.ctaLabel)}</a>
							</td></tr>`
							: ''
					}
					${
						content.signOff
							? `<tr><td style="padding:0 32px 32px 32px;"><p style="margin:0;font-size:14px;line-height:1.6;color:${COLOR.inkSoft};font-style:italic;">${escapeMultiline(content.signOff)}</p></td></tr>`
							: ''
					}
					<tr>
						<td style="padding:20px 32px;background:${COLOR.ink};text-align:center;">
							<p style="margin:0 0 6px 0;font-size:12px;color:#c9bdb2;">9&ndash;11 Paisley Road, Barrhead, G78 1HG</p>
							<p style="margin:0;font-size:12px;">
								<a href="${siteUrl}" style="color:#c9bdb2;text-decoration:underline;">Visit the site</a>
								&nbsp;&middot;&nbsp;
								<a href="${unsubscribeUrl}" style="color:#c9bdb2;text-decoration:underline;">Unsubscribe</a>
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
}
