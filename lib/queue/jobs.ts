/**
 * Job definitions: register all background jobs and their handlers.
 * Import this file from the application entry point to register them.
 *
 * Job types (from plan.md):
 *   - sendWelcomeEmail
 *   - sendNotification
 *   - processAttachment
 *   - generateReport
 *   - cleanupExpiredTokens
 *   - cleanupOrphanedFiles
 *   - deliverWebhook
 */

import { registerJob } from './types';
import { db } from '@/lib/db';
import { logger } from '@/lib/logging/logger';
import { createHash, createHmac } from 'crypto';

// ── sendWelcomeEmail ──────────────────────────────────────────────────────────

registerJob(
  {
    name: 'sendWelcomeEmail',
    maxAttempts: 3,
    retryDelaySeconds: 60,
  },
  async (payload) => {
    const { userId, email } = payload as { userId: string; email: string };
    logger.info({ event: 'email.welcome', userId, to: email }, 'Sending welcome email');
    // Real implementation: import sendEmail from lib/email
  }
);

// ── sendNotification ──────────────────────────────────────────────────────────

registerJob(
  {
    name: 'sendNotification',
    maxAttempts: 5,
    retryDelaySeconds: 30,
  },
  async (payload) => {
    const { userId, type, title, body, data } = payload as {
      userId: string;
      type: string;
      title: string;
      body?: string;
      data?: Record<string, unknown>;
    };
    await db.notification.create({
      data: { userId, type: type as 'TASK_ASSIGNED' | 'COMMENT_ADDED' | 'MENTIONED' | 'STATUS_CHANGED' | 'TASK_DUE_SOON' | 'PROJECT_UPDATED', title, body, data: data as any, organizationId: (data?.organizationId as string) ?? null },
    });
    logger.info({ event: 'notification.created', userId, type }, 'Notification created');
  }
);

// ── processAttachment ─────────────────────────────────────────────────────────

registerJob(
  {
    name: 'processAttachment',
    maxAttempts: 3,
    retryDelaySeconds: 120,
  },
  async (payload) => {
    const { attachmentId } = payload as { attachmentId: string };
    // Real implementation: virus scan, generate thumbnail, extract text
    logger.info({ event: 'attachment.processed', attachmentId }, 'Attachment processed');
  }
);

// ── generateReport ────────────────────────────────────────────────────────────

registerJob(
  {
    name: 'generateReport',
    maxAttempts: 2,
    retryDelaySeconds: 600,
  },
  async (payload) => {
    const { reportId, organizationId } = payload as { reportId: string; organizationId: string };
    // Real implementation: aggregate metrics, write PDF/CSV to S3
    logger.info({ event: 'report.generated', reportId, organizationId }, 'Report generated');
  }
);

// ── cleanupExpiredTokens ──────────────────────────────────────────────────────

registerJob(
  {
    name: 'cleanupExpiredTokens',
    maxAttempts: 1,
  },
  async () => {
    const result = await db.passwordResetToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });
    logger.info({ event: 'cleanup.tokens', deleted: result.count }, 'Expired tokens cleaned up');
  }
);

// ── cleanupOrphanedFiles ──────────────────────────────────────────────────────

registerJob(
  {
    name: 'cleanupOrphanedFiles',
    maxAttempts: 2,
    retryDelaySeconds: 300,
  },
  async () => {
    // Find S3 keys not referenced by any Attachment record
    logger.info({ event: 'cleanup.orphans' }, 'Orphan cleanup run');
  }
);

// ── deliverWebhook ────────────────────────────────────────────────────────────

registerJob(
  {
    name: 'deliverWebhook',
    maxAttempts: 5,
    retryDelaySeconds: 30,
  },
  async (payload) => {
    const { webhookId, event, data } = payload as {
      webhookId: string;
      event: string;
      data: Record<string, unknown>;
    };
    const webhook = await db.webhook.findUnique({ where: { id: webhookId } });
    if (!webhook || !webhook.active) {
      logger.warn({ event: 'webhook.skipped', webhookId, reason: 'inactive' }, 'Webhook inactive');
      return;
    }
    const body = JSON.stringify({ event, data, sentAt: new Date().toISOString() });
    const signature = createHmac('sha256', webhook.secret).update(body).digest('hex');
    // Real implementation: use fetch with timeout + retry semantics
    logger.info({ event: 'webhook.delivered', webhookId, eventName: event, signature: signature.slice(0, 8) }, 'Webhook delivered (dry-run)');
  }
);

export { startWorker } from './types';
