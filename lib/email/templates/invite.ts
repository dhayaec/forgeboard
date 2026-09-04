import { wrapEmail, escapeHtml } from '../common';

export function renderInviteEmail(
  inviterName: string,
  organizationName: string,
  inviteUrl: string
): string {
  return wrapEmail(`
    <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">You're invited to ${escapeHtml(organizationName)}</h1>
    <p>${escapeHtml(inviterName)} has invited you to join <strong>${escapeHtml(organizationName)}</strong> on ForgeBoard.</p>
    <p style="margin-top:16px;">
      <a href="${inviteUrl}" style="display:inline-block;padding:10px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Accept invitation</a>
    </p>
    <p style="font-size:13px;color:#71717a;margin-top:16px;">This invite will expire in 7 days.</p>
  `);
}
