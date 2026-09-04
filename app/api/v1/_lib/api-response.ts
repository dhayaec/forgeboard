/**
 * Shared API utilities — request ID, typed errors, pagination helpers.
 * All Route Handlers use these for consistent shape.
 */

import { headers } from 'next/headers';
import { randomUUID } from 'crypto';

/** Generate or extract a request-scoped ID for tracing. */
export async function getRequestId(): Promise<string> {
  const h = await headers();
  return h.get('x-request-id') ?? randomUUID();
}

/** Consistent error envelope. */
export function apiError(code: string, message: string, requestId: string, details?: unknown) {
  return Response.json(
    {
      error: {
        code,
        message,
        requestId,
        ...(details ? { details } : {}),
      },
    },
    { status: statusFromCode(code) }
  );
}

/** Map error codes to HTTP status codes. */
function statusFromCode(code: string): number {
  const map: Record<string, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    RATE_LIMITED: 429,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    BAD_REQUEST: 400,
  };
  return map[code] ?? 500;
}

/** Pagination meta helper. */
export function paginatedMeta(total: number, page: number, perPage: number, requestId: string) {
  const pages = Math.ceil(total / perPage);
  return {
    pagination: {
      total,
      page,
      perPage,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
      requestId,
    },
  };
}
