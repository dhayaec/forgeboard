import { describe, it, expect } from 'vitest';
import { hasPermission, PERMISSIONS, DEFAULT_ROLES } from '@/lib/permissions/rbac';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

describe('RBAC', () => {
  it('Owner has manage permission for all resources', () => {
    expect(DEFAULT_ROLES.Owner).toContain(PERMISSIONS.PROJECTS_CREATE);
    expect(DEFAULT_ROLES.Owner).toContain(PERMISSIONS.BILLING_MANAGE);
    expect(DEFAULT_ROLES.Owner).toContain(PERMISSIONS.API_KEYS_MANAGE);
  });

  it('Viewer has only read permissions', () => {
    expect(DEFAULT_ROLES.Viewer).toContain(PERMISSIONS.PROJECTS_READ);
    expect(DEFAULT_ROLES.Viewer).not.toContain(PERMISSIONS.PROJECTS_CREATE);
    expect(DEFAULT_ROLES.Viewer).not.toContain(PERMISSIONS.PROJECTS_DELETE);
  });

  it('Member can create tasks but not manage members', () => {
    expect(DEFAULT_ROLES.Member).toContain(PERMISSIONS.TASKS_CREATE);
    expect(DEFAULT_ROLES.Member).not.toContain(PERMISSIONS.MEMBERS_INVITE);
  });

  it('returns false for non-existent membership', async () => {
    const userId = 'user_' + randomUUID();
    const orgId = 'org_' + randomUUID();
    const result = await hasPermission(userId, orgId, PERMISSIONS.PROJECTS_READ);
    expect(result).toBe(false);
  });
});
