import { wrapEmail, escapeHtml } from '../common';

export function renderWelcomeEmail(name: string, appUrl: string): string {
  return wrapEmail(`
    <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">Welcome, ${escapeHtml(name)}!</h1>
    <p>Thanks for joining <strong>ForgeBoard</strong>. You can start creating projects right away.</p>
    <p style="margin-top:16px;">
      <a href="${appUrl}/dashboard" style="display:inline-block;padding:10px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Go to dashboard</a>
    </p>
  `);
}
