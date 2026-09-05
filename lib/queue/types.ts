/**
 * Background job queue backed by Redis (BullMQ-compatible interface).
 *
 * Jobs are stored in a Redis list. A worker dequeues, executes, and
 * handles retries with exponential backoff. Failed jobs go to a dead-letter list.
 *
 * Key design decisions:
 * - Idempotent: each job has a unique key; duplicate enqueues are ignored.
 * - Retries: failed jobs retry up to `maxAttempts` with exponential backoff.
 * - Logging: all job events are structured and traceable.
 */

import { envServer } from '@/lib/env';
import { logger } from '@/lib/logging/logger';

export type JobStatus = 'pending' | 'active' | 'completed' | 'failed' | 'retry';

export type JobPayload = Record<string, unknown>;

export type JobHandler = (payload: JobPayload, meta: JobMeta) => Promise<void>;

export type JobMeta = {
  id: string;
  queue: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  scheduledFor?: string;
};

export type JobDefinition = {
  name: string;
  maxAttempts?: number;
  backoff?: { type: 'exponential' | 'fixed'; delay: number };
  retryDelaySeconds?: number;
};

// ── Redis client (lazy singleton) ────────────────────────────────────────────

let _redis: import('ioredis').Redis | null = null;

async function getRedis(): Promise<import('ioredis').Redis> {
  if (_redis) return _redis;
  const { default: Redis } = await import('ioredis');
  _redis = new Redis(envServer.REDIS_URL, { maxRetriesPerRequest: 3 });
  _redis.on('error', (err: unknown) => logger.error({ event: 'redis.error', err }));
  return _redis;
}

// ── Queue helpers ─────────────────────────────────────────────────────────────

function queueKey(queue: string) {
  return `forgeboard:queue:${queue}`;
}
function jobKey(jobId: string) {
  return `forgeboard:job:${jobId}`;
}
function deadLetterKey(queue: string) {
  return `forgeboard:deadletter:${queue}`;
}
function processingKey(queue: string) {
  return `forgeboard:processing:${queue}`;
}

/**
 * Enqueue a job. Returns the job ID.
 * If a job with the same idempotencyKey already exists (and is not failed),
 * returns the existing job ID instead of creating a duplicate.
 */
export async function enqueue(
  queue: string,
  name: string,
  payload: JobPayload,
  options: { idempotencyKey?: string; scheduledFor?: string; maxAttempts?: number; backoffDelay?: number } = {}
): Promise<string> {
  const redis = await getRedis();
  const id = options.idempotencyKey ?? crypto.randomUUID();
  const now = Date.now();

  // Idempotency check — only enqueue if no active job with this key exists
  if (options.idempotencyKey) {
    const existing = await redis.get(`forgeboard:job:${options.idempotencyKey}:status`);
    if (existing && existing !== 'failed') {
      logger.debug({ event: 'job.duplicate', idempotencyKey: options.idempotencyKey }, 'Duplicate job skipped');
      return options.idempotencyKey;
    }
  }

  const job: QueuedJob = {
    id,
    queue,
    name,
    payload,
    status: 'pending',
    attempts: 0,
    maxAttempts: options.maxAttempts ?? 3,
    backoffDelay: options.backoffDelay ?? 1000,
    scheduledFor: options.scheduledFor ? new Date(options.scheduledFor).getTime() : now,
    createdAt: now,
    lastError: null,
  };

  const serialized = JSON.stringify(job);
  await redis.hset(jobKey(id), {
    data: serialized,
    status: 'pending',
  });
  await redis.lpush(queueKey(queue), id);

  logger.info({ event: 'job.enqueued', jobId: id, queue, name }, 'Job enqueued');
  return id;
}

/** Internal type matching what's stored in Redis. */
type QueuedJob = {
  id: string;
  queue: string;
  name: string;
  payload: JobPayload;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  backoffDelay: number;
  scheduledFor: number;
  createdAt: number;
  lastError: string | null;
};

/** Get a job by ID. */
export async function getJob(id: string): Promise<(QueuedJob & { status: string }) | null> {
  const redis = await getRedis();
  const data = await redis.hgetall(jobKey(id));
  if (!data?.data) return null;
  return JSON.parse(data.data) as QueuedJob & { status: string };
}

/** Get all jobs for a queue, optionally filtered by status. */
export async function getJobs(queue: string, status?: JobStatus): Promise<QueuedJob[]> {
  const redis = await getRedis();
  const ids = await redis.lrange(queueKey(queue), 0, -1);
  const jobs: QueuedJob[] = [];
  for (const id of ids) {
    const data = await redis.hgetall(jobKey(id));
    if (!data?.data) continue;
    const job = JSON.parse(data.data) as QueuedJob;
    if (!status || job.status === status) jobs.push(job);
  }
  return jobs;
}

/**
 * Mark a job as completed and remove it from processing.
 * Returns the next job in the queue (or null).
 */
export async function completeJob(id: string): Promise<void> {
  const redis = await getRedis();
  await redis.hset(jobKey(id), { status: 'completed' });
  await redis.srem(processingKey('default'), id);
  logger.info({ event: 'job.completed', jobId: id }, 'Job completed');
}

/**
 * Mark a job as failed. If retries remain, re-enqueue with backoff.
 * Otherwise, move to dead-letter list.
 */
export async function failJob(id: string, error: string): Promise<void> {
  const redis = await getRedis();
  const raw = await redis.hget(jobKey(id), 'data');
  if (!raw) return;
  const job = JSON.parse(raw) as QueuedJob;

  job.attempts += 1;
  job.lastError = error;

  if (job.attempts < job.maxAttempts) {
    // Exponential backoff: delay * 2^(attempts-1), capped at 1 hour
    const delay = Math.min(job.backoffDelay * Math.pow(2, job.attempts - 1), 3600_000);
    job.scheduledFor = Date.now() + delay;
    job.status = 'retry';
    await redis.hset(jobKey(id), { data: JSON.stringify(job), status: 'retry' });
    logger.warn({ event: 'job.retry', jobId: id, attempts: job.attempts, maxAttempts: job.maxAttempts, delayMs: delay }, 'Job scheduled for retry');
  } else {
    job.status = 'failed';
    await redis.hset(jobKey(id), { data: JSON.stringify(job), status: 'failed' });
    await redis.lpush(deadLetterKey(job.queue), JSON.stringify({ ...job, failedAt: Date.now() }));
    await redis.srem(processingKey(job.queue), id);
    logger.error({ event: 'job.deadletter', jobId: id, error }, 'Job moved to dead-letter');
  }
}

// ── Worker ────────────────────────────────────────────────────────────────────

type RegisteredHandler = {
  handler: JobHandler;
  definition: JobDefinition;
};

const handlers = new Map<string, RegisteredHandler>();

export function registerJob(definition: JobDefinition, handler: JobHandler) {
  handlers.set(definition.name, { definition, handler });
  logger.debug({ event: 'job.registered', name: definition.name }, 'Job handler registered');
}

export async function startWorker(pollIntervalMs = 500) {
  const redis = await getRedis();
  logger.info({ event: 'worker.started', pollIntervalMs }, 'Job worker started');

  while (true) {
    // Pick a random queue to process (round-robin across registered queues)
    const queues = Array.from(handlers.keys());
    if (queues.length === 0) {
      await sleep(pollIntervalMs);
      continue;
    }

    for (const queue of queues) {
      const reg = handlers.get(queue);
      if (!reg) continue;

      // Atomically dequeue: LPOP from list
      const id = await redis.rpoplpush(queueKey(queue), processingKey(queue));
      if (!id) continue;

      const raw = await redis.hget(jobKey(id), 'data');
      if (!raw) { await redis.srem(processingKey(queue), id); continue; }

      const job = JSON.parse(raw) as QueuedJob;
      const now = Date.now();

      // Skip if scheduled for the future
      if (job.scheduledFor > now) {
        await redis.rpoplpush(processingKey(queue), queueKey(queue));
        continue;
      }

      // Execute the handler
      job.status = 'active';
      await redis.hset(jobKey(id), { data: JSON.stringify(job), status: 'active' });

      try {
        await reg.handler(job.payload, {
          id,
          queue,
          attempts: job.attempts,
          maxAttempts: job.maxAttempts,
          createdAt: new Date(job.createdAt).toISOString(),
          scheduledFor: job.scheduledFor ? new Date(job.scheduledFor).toISOString() : undefined,
        });
        await completeJob(id);
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        await failJob(id, error);
      }
    }

    await sleep(pollIntervalMs);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
