/**
 * Shared email layout — wraps content in a consistent header/footer.
 */
import { envClient } from '@/lib/env';

export function wrapEmail(content: string): string {
  const appName = envClient.NEXT_PUBLIC_APP_NAME;
  const appUrl = envClient.NEXT_PUBLIC_APP_URL;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${appName}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:32px 32px 24px;border-bottom:1px solid #e4e4e7;">
                <a href="${appUrl}" style="font-size:20px;font-weight:700;color:#18181b;text-decoration:none;">${appName}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-size:15px;line-height:1.6;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;">
                &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
