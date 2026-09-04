/**
 * API key authentication for /api/v1/*.
 * Validates `Authorization: Bearer <key>` against the ApiKey table.
 * Returns the organization context on success.
 */

import { db } from '@/lib/db';
import { createHash } from 'crypto';
import { requireUser } from '@/lib/auth/session';
import type { OrganizationMember } from '@prisma/client';

export type ApiAuth =
  | { type: 'session'; userId: string; email: string }
  | { type: 'api_key'; organizationId: string; keyId: string };

export async function authenticateRequest(): Promise<ApiAuth | null> {
  // 1. Try session first (used by web app's internal calls if any)
  try {
    const user = await requireUser();
    return { type: 'session', userId: user.id, email: user.email };
  } catch {
    // fall through to API key auth
  }

  // 2. Try API key
  const { headers } = await import('next/headers');
  const h = await headers();
  const auth = h.get('authorization') ?? '';
  const match = auth.match(/^Bearer\s+([A-Za-z0-9_-]+)$/);
  if (!match) return null;

  const keyHash = createHash('sha256').update(match[1]).digest('hex');
  const apiKey = await db.apiKey.findUnique({ where: { keyHash } });
  if (!apiKey) return null;

  // Update last-used
  await db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;
  return { type: 'api_key', organizationId: apiKey.organizationId, keyId: apiKey.id };
}

/**
 * Resolve the active organization for an authenticated request.
 * For API keys: returns the org the key was issued under.
 * For session: returns the first org the user is a member of (or selected via header).
 */
export async function resolveOrganization(auth: ApiAuth): Promise<{ id: string; membership?: OrganizationMember } | null> {
  if (auth.type === 'api_key') {
    return { id: auth.organizationId };
  }
  const member = await db.organizationMember.findFirst({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'asc' },
  });
  if (!member) return null;
  return { id: member.organizationId, membership: member };
}
