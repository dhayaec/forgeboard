/**
 * RBAC permission helpers.
 *
 * Resource/action pairs follow the format: `<resource>:<action>`.
 * Examples: "projects:read", "tasks:create", "members:manage".
 *
 * All checks are server-side. Never trust client-supplied authorization.
 */

import { db } from '@/lib/db';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';
import { getMembership, requireUser } from './session';
import type { OrganizationMember } from '@prisma/client';

export type Permission = `${string}:${string}`;

export const PERMISSIONS = {
  PROJECTS_READ: 'projects:read',
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_UPDATE: 'projects:update',
  PROJECTS_DELETE: 'projects:delete',
  TASKS_READ: 'tasks:read',
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  MEMBERS_READ: 'members:read',
  MEMBERS_INVITE: 'members:invite',
  MEMBERS_REMOVE: 'members:remove',
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  BILLING_MANAGE: 'billing:manage',
  API_KEYS_MANAGE: 'api_keys:manage',
  WEBHOOKS_MANAGE: 'webhooks:manage',
  AUDIT_READ: 'audit:read',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Default system roles and their permissions.
 * These are seeded for every new organization.
 */
export const DEFAULT_ROLES: Record<string, Permission[]> = {
  Owner: [
    PERMISSIONS.PROJECTS_READ, PERMISSIONS.PROJECTS_CREATE, PERMISSIONS.PROJECTS_UPDATE, PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.TASKS_READ, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_UPDATE, PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.MEMBERS_READ, PERMISSIONS.MEMBERS_INVITE, PERMISSIONS.MEMBERS_REMOVE,
    PERMISSIONS.SETTINGS_READ, PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.API_KEYS_MANAGE, PERMISSIONS.WEBHOOKS_MANAGE,
    PERMISSIONS.AUDIT_READ,
  ],
  Admin: [
    PERMISSIONS.PROJECTS_READ, PERMISSIONS.PROJECTS_CREATE, PERMISSIONS.PROJECTS_UPDATE, PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.TASKS_READ, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_UPDATE, PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.MEMBERS_READ, PERMISSIONS.MEMBERS_INVITE, PERMISSIONS.MEMBERS_REMOVE,
    PERMISSIONS.SETTINGS_READ, PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.API_KEYS_MANAGE, PERMISSIONS.WEBHOOKS_MANAGE,
    PERMISSIONS.AUDIT_READ,
  ],
  Manager: [
    PERMISSIONS.PROJECTS_READ, PERMISSIONS.PROJECTS_CREATE, PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.TASKS_READ, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_UPDATE, PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.MEMBERS_READ,
  ],
  Member: [
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.TASKS_READ, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_UPDATE,
  ],
  Viewer: [
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.TASKS_READ,
  ],
};

/**
 * Check whether a user (by their membership) has a specific permission.
 * Returns true if the user is a member with a role that grants the permission.
 */
export async function hasPermission(
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<boolean> {
  const membership = await getMembership(userId, organizationId);
  if (!membership) return false;
  return membership.role.permissions.some(
    (rp) =>
      `${rp.permission.resource}:${rp.permission.action}` === permission
  );
}

/**
 * Assert a user has a specific permission. Throws ForbiddenError otherwise.
 */
export async function requirePermission(
  organizationId: string,
  permission: Permission
): Promise<{ userId: string; membership: OrganizationMember }> {
  const user = await requireUser();
  const membership = await getMembership(user.id, organizationId);
  if (!membership) {
    throw new ForbiddenError('You are not a member of this organization');
  }
  const has = membership.role.permissions.some(
    (rp) =>
      `${rp.permission.resource}:${rp.permission.action}` === permission
  );
  if (!has) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
  return { userId: user.id, membership };
}

/**
 * Check whether a user is a member of an organization.
 * Returns true if yes, false otherwise.
 */
export async function isMember(userId: string, organizationId: string): Promise<boolean> {
  const m = await db.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  return !!m;
}

/**
 * Require membership. Throws ForbiddenError otherwise.
 */
export async function requireMembership(organizationId: string) {
  const user = await requireUser();
  const m = await isMember(user.id, organizationId);
  if (!m) throw new ForbiddenError('You are not a member of this organization');
  return user;
}
