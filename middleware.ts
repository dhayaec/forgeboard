/**
 * Next.js middleware — runs before every route.
 *
 * Responsibilities:
 *   1. Extract or generate `x-request-id`
 *   2. Build `RequestContext` and run the rest of the request through `withRequestId`
 *   3. Record `forgeMetrics.httpRequests` counter and histogram
 *   4. Attach `x-request-id` to the response headers
 *   5. Propagate context into Server Actions and route handlers via AsyncLocalStorage
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequestId, buildRequestContext } from '@/lib/telemetry/request-context';
import { forgeMetrics } from '@/lib/telemetry/index';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)'],
};

export async function middleware(req: NextRequest): Promise<Response> {
  const requestId = req.headers.get('x-request-id') ?? randomUUID();
  const startTime = Date.now();

  // Resolve userId from session cookie if available (server-side only)
  // We defer actual auth resolution to the route handler; here we just pass the header
  const context = buildRequestContext({
    requestId,
    userAgent: req.headers.get('user-agent') ?? undefined,
    ip: getClientIp(req),
  });

  // Wrap the remainder of the request chain with our AsyncLocalStorage context
  return withRequestId(context, async () => {
    const response = await fetch(req, {
      // Reconstruct the request so the headers are preserved
      headers: req.headers,
    });

    const durationMs = Date.now() - startTime;
    const durationSec = durationMs / 1000;

    // Record HTTP metrics (check response is accessible on NextResponse)
    const statusCode = response.status;
    const method = req.method;
    const path = normalizePath(req.nextUrl.pathname);

    forgeMetrics.httpRequests.add(1, {
      method,
      path,
      status_code: statusCode,
    });
    forgeMetrics.httpRequestDuration.record(durationSec, {
      method,
      path,
      status_code: statusCode,
    });

    // Propagate request ID to the response
    const headers = new Headers(response.headers);
    headers.set('x-request-id', requestId);

    return new Response(response.body, {
      status: statusCode,
      statusText: response.statusText,
      headers,
    });
  });
}

function getClientIp(req: NextRequest): string | undefined {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    req.headers.get('cf-connecting-ip') ?? // Cloudflare
    undefined
  );
}

function normalizePath(pathname: string): string {
  // Collapse IDs into placeholders to keep cardinality manageable
  // e.g. /projects/prj_abc123/tasks/tsk_xyz789  →  /projects/:id/tasks/:id
  return pathname
    .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/:id')
    .replace(/\/proj_[a-z0-9]{13,}/gi, '/:id')
    .replace(/\/tsk_[a-z0-9]{13,}/gi, '/:id')
    .replace(/\/org_[a-z0-9]{13,}/gi, '/:id')
    .replace(/\/usr_[a-z0-9]{13,}/gi, '/:id');
}
