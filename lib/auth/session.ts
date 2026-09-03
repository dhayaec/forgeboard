/**
 * Server-side session helpers.
 *
 * Use `requireUser()` in server actions and route handlers when the
 * caller must be authenticated. Throws UnauthorizedError otherwise.
 */

import { auth } from './auth';
import { UnauthorizedError } from '@/lib/errors';
import { db } from '@/lib/db';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? null,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new UnauthorizedError('You must be signed in');
  }
  return user;
}

/**
 * Get the current user's membership in an organization, including their role.
 * Returns null if not a member.
 */
export async function getMembership(userId: string, organizationId: string) {
  return db.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
}

/**
 * Get all organizations the user belongs to.
 */
export async function getUserOrganizations(userId: string) {
  return db.organizationMember.findMany({
    where: { userId },
    include: { organization: true, role: true },
    orderBy: { createdAt: 'asc' },
  });
}
