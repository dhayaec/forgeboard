# Final Architecture Review — ForgeBoard

> These 35 questions document the key architectural decisions and explain how ForgeBoard addresses them.

---

## Next.js & Rendering

### 1. Why are most components Server Components?
Server Components eliminate the JavaScript bundle sent to the browser for purely data-driven UI. ForgeBoard's project/task lists, dashboard panels, and read-heavy pages are Server Components — the browser receives HTML with minimal JS. Client Components are only added when `useState`, `useEffect`, browser APIs, or event handlers are required (e.g., the login form, task modal, or notification bell). This reduces Time to Interactive and improves performance on low-bandwidth devices.

### 2. Where are Client Components required?
- `app/auth/login/page.tsx` — `useState` for form fields, `signIn()` call
- `app/auth/register/page.tsx` — form submission
- `app/(app)/layout.tsx` — `usePathname` for active nav, notification bell state
- Any `<Modal>` that intercepts routes — needs client-side event handling

Rule: start Server, add `"use client"` only when the component cannot function as a Server Component.

### 3. How does caching work?
ForgeBoard uses layered caching:
- **Request memoization** (`fetch` deduplication within a render) — automatic in Next.js
- **`unstable_cache`** — wraps DB queries for known-stable data (org roles, labels) with a TTL
- **Tag-based invalidation** (`revalidateTag`) — after mutations, invalidate the affected resource tag so next request fetches fresh data
- **`revalidatePath`** — invalidates all caches for a route segment (e.g., `/dashboard`)
- **React `cache()`** — memoizes repeated calls within a single request

Cached resources have documented TTL, owner, and invalidation trigger in `app/lab/caching/`.

### 4. How is cache invalidated?
After every mutation (Server Action or Route Handler):
1. Execute the database transaction
2. Call `revalidateTag(resource)` for the affected resource type (e.g., `'projects'`, `'tasks'`)
3. Call `revalidatePath(route)` for the affected URL path
4. Return the typed result

No cache is invalidated before the DB transaction succeeds.

### 5. How is tenant isolation guaranteed?
**Every database query** includes an `organizationId` filter. There is no query path that omits this filter — `getCurrentOrganization()` is called in every Server Action/Route Handler before any query. Prisma's type system makes it easy to accidentally write `where: { id: taskId }` instead of `where: { id: taskId, project: { organizationId } }` — all queries are audited in review.

## Auth & Security

### 6. Where is authorization enforced?
Authorization is enforced at three layers:
1. **Middleware** (`proxy.ts`) — validates session cookie, redirects unauthenticated users
2. **Server Actions** — calls `assertPermission(user, 'resource', 'action')` before any mutation
3. **Route Handlers** — checks `session.user` + org membership before returning data

UI-level authorization (hiding buttons) is cosmetic and never trusted.

### 7. How are Server Actions secured?
Server Actions receive the serialized form data + a cryptographically signed request origin token (handled by Next.js + React). On the server, each action re-validates authentication via `auth()` and checks authorization via `assertPermission()`. Tokens are not user-supplied.

### 8. When should Route Handlers be used vs Server Actions?
- **Server Actions** — form mutations, page-level CRUD, anything triggered by user interaction within the app
- **Route Handlers** — external API calls, webhooks, `/api/v1/*` public endpoints, anything that needs HTTP method semantics or returns structured JSON

### 9. Why is Proxy used?
`proxy.ts` intercepts every request before it reaches a route. This allows:
- Session validation at the edge (before hitting Lambda/ECS)
- Adding `X-Request-ID` correlation header
- Early 401/403 responses for unauthenticated requests
- Rate limiting counters

Proxy runs in Edge Runtime for low latency.

### 10. How does authentication work?
Auth.js v5 (NextAuth) with JWT sessions:
1. User submits credentials → `signIn('credentials')`
2. Auth.js validates bcrypt hash → issues signed JWT stored in `HttpOnly` cookie
3. Every subsequent request — middleware reads cookie → verifies JWT → populates `session`
4. `auth()` call in Server Components/Server Actions returns the full session

OAuth (Google, GitHub) uses the same flow — OAuth provider issues token, Auth.js creates JWT.

### 11. How does MFA work?
1. User visits `/settings/security` → clicks "Enable TOTP MFA"
2. Server calls `generateMfaSetup()` → creates `otplib` secret + generates `otpauth://` URI + QR code data URL
3. User scans QR in authenticator app → server stores `mfaSecret` (encrypted) on the user record
4. On next login → if `mfaEnabled = true`, user is prompted for TOTP code
5. `verifyMfaToken(code, mfaSecret)` validates against `otplib`

Recovery codes are hashed and stored in the `recovery_codes` table.

### 12. How are sessions protected?
- `HttpOnly` — not accessible to JavaScript (XSS cannot read it)
- `Secure` — only sent over HTTPS in production
- `SameSite=Lax` — not sent on cross-site GET requests (CSRF resistant)
- JWT signed with `AUTH_SECRET` (256-bit random) — cannot be forged
- `SESSION_MAX_AGE_SECONDS = 2592000` (30 days) — sliding window, refreshed on activity
- `SESSION_UPDATE_AGE_SECONDS = 86400` (1 day) — JWT rewritten only once per day

## Storage & Background Jobs

### 13. How are uploads secured?
1. Client requests a signed upload URL from `/api/v1/upload`
2. Server generates a pre-signed S3 PUT URL (valid 5 minutes, restricted MIME type, max size)
3. Client uploads directly to S3 — file never touches the application server
4. On completion, client notifies the server with the S3 key
5. Server validates the key, records the attachment in the DB, creates an audit log

This avoids proxying large files through Next.js.

### 14. How are background jobs made idempotent?
Every job carries an `idempotencyKey` (UUID generated at enqueue time). The worker checks `SELECT FOR UPDATE` on the job record before processing. If the job already has a status (running/completed/failed), it skips processing. Dead-letter jobs are retried up to 5 times with exponential backoff.

### 15. How are webhooks authenticated?
When registering a webhook, the server generates a random HMAC secret. Delivery sends `X-ForgeBoard-Signature: sha256=<hmac>` header. The receiver computes `HMAC-SHA256(requestBody, secret)` and compares in constant time. Replay protection: webhooks include a timestamp; receivers should reject events older than 5 minutes.

## Infrastructure

### 16. How is rate limiting implemented?
`proxy.ts` middleware uses Redis `INCR` + `EXPIRE` per IP + endpoint path. Sliding window counter with configurable `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`. Returns `429 Too Many Requests` when exceeded.

### 17. How are database connections managed?
Prisma's connection pool is configured via `DATABASE_POOL_MIN` (2) and `DATABASE_POOL_MAX` (10). Pool sizing is tuned for ECS task memory (512 MB heap) and expected concurrency. `prisma migrate deploy` uses its own connection — separate from the app pool.

### 18. What indexes exist and why?
Indexes are defined on every foreign key, every `where` filter column, and every `orderBy` column:
- `tasks(projectId, status)` — board view (filter by column)
- `tasks(assigneeId, status)` — my tasks view
- `tasks(projectId, deletedAt)` — soft-delete queries
- `users(email)` — login lookup
- `api_keys(keyHash)` — key lookup (hashed for security)
- `sessions(sessionToken)` — session validation
- `organizations(slug)` — org lookup

Indexes are added via Prisma migrations. `EXPLAIN ANALYZE` is used before adding indexes to verify they help.

### 19. How does the application scale horizontally?
ECS Fargate runs multiple tasks behind an ALB. Sessions are stored in JWT (stateless) — no sticky sessions required. Redis is shared across all tasks — job queue and rate limiting work across tasks. Database connection pool per task; total connections = `poolMax × taskCount` — kept below PostgreSQL `max_connections`.

### 20. What happens when Redis is unavailable?
- **Rate limiting**: `proxy.ts` catches Redis errors and allows requests through (fail open — prefer availability over rate limiting)
- **Job queue**: Worker catches Redis errors; jobs remain in the queue; retry on next poll
- **Cache reads**: Return `null` (cache miss) — falls back to database
- **Cache writes**: Fail silently — data is served fresh from DB

### 21. What happens when PostgreSQL is unavailable?
Next.js returns a 503 via the error boundary (`app/error.tsx`). ECS health checks fail → ALB stops routing traffic. OpenTelemetry metrics show `db.error` spike → alerting fires. RTO target: < 5 minutes (RDS Multi-AZ failover). RPO: < 1 hour (automated daily snapshots).

### 22. What happens when an external API is slow?
- S3 pre-signed URLs have a 5-minute timeout — client uploads directly
- Webhook delivery has a 30-second timeout; retries with backoff
- HTTP calls from Next.js use `AbortController` with a 10-second timeout
- Circuit breaker: if an external service fails 5 times, skip it for 60 seconds

## Observability

### 23. How are errors observed?
- `app/error.tsx` and `app/global-error.tsx` catch React error boundaries → log with `requestId`, render user-friendly message
- `proxy.ts` wraps every request in try/catch → logs 5xx with duration, requestId, userId
- `lib/logging/logger.ts` uses Pino with ISO timestamps → ships to CloudWatch / log aggregation
- OpenTelemetry auto-instruments HTTP and Prisma — errors appear as span events with attributes

### 24. How are traces correlated with request IDs?
`proxy.ts` generates `requestId = crypto.randomUUID()` at request start, stores it in a `x-request-id` response header and a logging context child. The `lib/telemetry/` instrumentation propagates this as the trace ID. Every log line, database query, and external call shares this ID — searchable in CloudWatch Logs Insights.

### 25. How does the deployment roll back?
1. Previous Docker image tag is known (`:previous`, `:v1.x.y`)
2. `docker-compose.yml` or ECS task definition is updated to use the previous image tag
3. `docker compose up` or ECS service update deploys previous version
4. DB migrations are forward-only — rollback is restoring from snapshot, not reversing migrations
5. Rollback procedure documented in `docs/runbooks/application-rollback.md`

### 26. How does Terraform state remain safe?
- State stored in S3 with DynamoDB state locking (prevents concurrent `terraform apply`)
- State is never committed to Git
- Backend configured in `terraform/backend.tf`
- Only CI/CD service role can access state (least privilege IAM)
- State versioning enabled on S3 for recovery

### 27. Why are environments separated?
- **dev** — local Docker, shared PostgreSQL/Redis for fast iteration
- **staging** — isolated infra, mirrors production config, used for smoke tests before deploy
- **prod** — isolated account, deletion protection, restricted access
- Separate Terraform state per environment prevents a staging change from affecting production

### 28. How are secrets managed?
- Local development: `.env.local` (never committed)
- CI/CD: GitHub Actions secrets injected as environment variables
- Production: AWS Secrets Manager — ECS task role has IAM permission to read specific secrets
- `AUTH_SECRET` is 256-bit random, stored in Secrets Manager, rotated annually
- No secrets in Docker images, Terraform state, or application logs

## Data & Recovery

### 29. What is the RPO?
Recovery Point Objective = 1 hour. Automated RDS snapshots taken daily, transaction logs retained for point-in-time recovery within the retention window. S3 versioning + lifecycle rules protect attachments and database backups.

### 30. What is the RTO?
Recovery Time Objective = 5 minutes. Multi-AZ RDS failover (< 60 seconds). ECS tasks are stateless — redeployment takes ~2 minutes. Health checks verify the app responds correctly before ALB routes traffic.

### 31. What are the application's primary performance bottlenecks?
- **Database queries without indexes** — mitigated by explicit indexes on every query path
- **N+1 queries** — mitigated by Prisma `include` for relations; `DataLoader`-style batching where needed
- **Large JS bundle** — mitigated by Server Components by default; dynamic imports for heavy charts/maps
- **Cold starts** — mitigated by ECS minimum 2 tasks always running; warm pools
- **S3 upload latency** — mitigated by pre-signed URLs; direct browser → S3 upload

### 32. What are the highest-risk security boundaries?
- **Tenant isolation** — every DB query must include `organizationId`; automated test (`tests/integration/tenant-isolation.test.ts`) verifies cross-tenant access is blocked
- **Authorization bypass** — `assertPermission()` is called in every mutation; tested in unit tests
- **Webhook signature validation** — external callers must HMAC-verify every delivery
- **API key exposure** — keys are hashed before storage; only prefix shown in UI
- **File upload** — MIME/size validation + pre-signed URLs prevent server-side execution

### 33. Which Next.js features are production-critical?
- **Server Components** — reduce client JS, improve performance
- **Server Actions** — type-safe mutations with built-in security
- **Route Handlers** — API surface for external callers
- **Middleware** — auth, rate limiting, correlation IDs at the edge
- **Streaming + Suspense** — fast shell + streaming data for perceived performance
- **Metadata API** — SEO, OG images, robots, sitemap
- **`revalidateTag`** — consistent cache invalidation after mutations
- **`next/image`** — automatic WebP/AVIF, lazy loading, size optimization

### 34. Which Next.js features are learning-only?
- **`app/lab/`** — routing, streaming, caching, and experimental features demonstrated here
- **Intercepted routes** — learning example; modal task detail is not yet in production
- **Optional catch-all routes** — learning example only
- **Parallel routes** — learning example for `/lab/parallel`

### 35. Which parts should eventually become separate services?
- **Background job queue** — could move to AWS SQS/SNS or a dedicated worker service if job volume grows
- **Webhook delivery** — separate service with its own scaling and retry queue
- **File processing** (virus scan, thumbnail generation) — separate Lambda/service triggered by S3 events
- **Email sending** — could use SES directly instead of nodemailer SMTP for higher volume

The monolith is appropriate until one of these components becomes a bottleneck or team conflict hotspot.
