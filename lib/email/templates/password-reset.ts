import { wrapEmail, escapeHtml } from '../common';

export function renderPasswordResetEmail(name: string, resetUrl: string): string {
  return wrapEmail(`
    <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">Reset your password</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>We received a request to reset your password. Click the button below to set a new one:</p>
    <p style="margin-top:16px;">
      <a href="${resetUrl}" style="display:inline-block;padding:10px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Reset password</a>
    </p>
    <p style="font-size:13px;color:#71717a;margin-top:16px;">If you didn't request this, you can safely ignore this email.</p>
  `);
}
