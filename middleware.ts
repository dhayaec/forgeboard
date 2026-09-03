/**
 * Next.js middleware — runs before every route.
 *
 * Edge-runtime safe (no Node-only imports here).
 *
 * Responsibilities:
 *   1. Extract or generate `x-request-id` and attach it to the response
 *   2. Forward the header onto downstream handlers
 *
 * Telemetry / metrics are recorded inside route handlers (Node runtime)
 * via recordHttpRequest() from @/lib/telemetry, not here.
 */

import { NextRequest, NextResponse } from 'next/server';

function newRequestId(): string {
  return crypto.randomUUID();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)'],
};

export function middleware(req: NextRequest): NextResponse {
  const requestId = req.headers.get('x-request-id') ?? newRequestId();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-request-id', requestId);
  return response;
}
