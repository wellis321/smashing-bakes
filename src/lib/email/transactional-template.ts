// Simple one-off transactional emails (password reset, etc.) — same
// table-based, inline-style approach as the newsletter template, since email
// clients don't reliably support external stylesheets or CSS variables.
import { COLOR, escapeHtml } from './newsletter-template';

export function renderPasswordResetEmail(resetUrl: string): string {
	return `
<!doctype html>
<html>
	<body style="margin:0;padding:0;background-color:${COLOR.creamDim};font-family:Georgia,'Times New Roman',serif;">
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR.creamDim};">
			<tr>
				<td align="center" style="padding:32px 16px;">
					<table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background-color:${COLOR.cream};border-radius:16px;overflow:hidden;">
						<tr>
							<td style="padding:32px 32px 24px 32px;">
								<p style="margin:0 0 4px 0;font-size:22px;font-weight:700;color:${COLOR.pinkDeep};">Smashin' Bakes</p>
								<h1 style="margin:16px 0 12px 0;font-size:20px;color:${COLOR.ink};">Reset your password</h1>
								<p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:${COLOR.inkSoft};">
									We got a request to reset the password on your account. Click the button below to
									choose a new one — this link works once and expires in an hour.
								</p>
								<table role="presentation" cellpadding="0" cellspacing="0" border="0">
									<tr>
										<td style="border-radius:999px;background-color:${COLOR.pink};">
											<a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:${COLOR.cream};text-decoration:none;">Reset password</a>
										</td>
									</tr>
								</table>
								<p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:${COLOR.inkSoft};">
									Didn't request this? You can safely ignore this email — your password won't change.
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
