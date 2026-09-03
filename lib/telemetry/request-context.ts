/**
 * Request-scoped context using AsyncLocalStorage.
 *
 * Lets us propagate the per-request `requestId` (and any other context-bound
 * values) through Server Components, Server Actions, and route handlers
 * without threading it manually through every function signature.
 *
 * This is consumed by the OpenTelemetry instrumentation to attach `request.id`
 * to every span, and by the structured logger so every log line is tagged
 * with the same request id.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
  userId?: string;
  organizationId?: string;
  userAgent?: string;
  ip?: string;
  startTime: number;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Initialise request-scoped context for the duration of `fn`. */
export function withRequestId<T>(ctx: RequestContext, fn: () => Promise<T> | T): Promise<T> | T {
  return storage.run(ctx, fn);
}

/** Get the active request context, or undefined if called outside a request. */
export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

/** Convenience: just the requestId. */
export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

/** Convenience: just the userId, or undefined. */
export function getCurrentUserId(): string | undefined {
  return storage.getStore()?.userId;
}

/** Convenience: just the organizationId, or undefined. */
export function getCurrentOrgId(): string | undefined {
  return storage.getStore()?.organizationId;
}

/** Build a fresh RequestContext (called once per request). */
export function buildRequestContext(params: {
  requestId: string;
  userId?: string;
  organizationId?: string;
  userAgent?: string;
  ip?: string;
}): RequestContext {
  return { ...params, startTime: Date.now() };
}
