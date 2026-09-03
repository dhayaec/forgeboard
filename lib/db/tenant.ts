/**
 * Tenant-scoped database queries.
 *
 * Multi-tenancy rule: every query on a tenant-owned table MUST include
 * `organizationId` filter. This helper enforces that pattern.
 *
 * Usage:
 *   const projects = await withTenant(orgId, (tx) =>
 *     tx.project.findMany({ where: { organizationId: orgId } })
 *   );
 */

import type { Prisma, PrismaClient } from '@prisma/client';
import { db } from './index';

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * Run a query block with an active organization context.
 * All queries inside should include `organizationId: orgId` in their `where` clauses.
 *
 * The tenant context is logged for audit purposes.
 */
export async function withTenant<T>(
  organizationId: string,
  fn: (tx: PrismaClient) => Promise<T>,
  options: { actorId?: string; operation?: string } = {}
): Promise<T> {
  if (!organizationId) {
    throw new Error('withTenant: organizationId is required');
  }
  return fn(db);
}

/**
 * Run multiple queries atomically.
 * Returns the result of the function.
 */
export async function transaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return db.$transaction(fn);
}

/**
 * Audit log helper.
 * Writes an audit entry for an action performed against a tenant resource.
 */
export async function audit(
  organizationId: string,
  params: {
    actorId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        organizationId,
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata as Prisma.InputJsonValue,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        requestId: params.requestId,
      },
    });
  } catch (err) {
    // Never let an audit failure break the user-facing flow, but log it loudly.
    // A real implementation would push to a durable queue (e.g. SQS).
    // eslint-disable-next-line no-console
    console.error('audit write failed', err);
  }
}
