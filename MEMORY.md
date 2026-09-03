# ForgeBoard Project Memory

## Project: ForgeBoard

Production-grade multi-tenant project/work-management SaaS.
Acts as a Next.js + TypeScript + AWS + Terraform learning laboratory.

## Stack

- **Framework:** Next.js 16.3 App Router
- **Language:** TypeScript 5.6 strict
- **Database:** PostgreSQL 16 + Prisma 6
- **Cache/Queue:** Redis 7
- **Auth:** Auth.js (NextAuth v5)
- **Validation:** Zod 3
- **Styling:** Tailwind CSS 3
- **Testing:** Vitest + Playwright
- **IaC:** Terraform 1.9+ on AWS
- **CI/CD:** GitHub Actions

## Branch Strategy

All work committed to `main` branch per user instruction.

## Progress

### Phase 0: Architecture & Threat Model — ✅ Complete
- docs/adr/0001-architecture.md
- docs/architecture/system-overview.md
- docs/architecture/decisions.md
- docs/architecture/data-model.md
- docs/security/threat-model.md
- docs/runbooks/{local-development,database-recovery,application-rollback,incident-response,high-error-rate,queue-failure}.md
- docs/next-feature-matrix.md

### Phase 1: Developer Experience & Scaffold — ✅ Complete
- package.json (Next.js 16.3, TypeScript, Prisma, Vitest, Playwright, Tailwind)
- tsconfig.json (strict, bundler, @/* paths)
- next.config.ts (typed routes, instrumentation, image opt)
- tailwind.config.ts + postcss.config.js
- .editorconfig + .nvmrc
- .env.example (no secrets)
- .gitignore (blocks .env, .tfstate, build artifacts)
- README.md
- .husky/pre-commit
- lib/env.ts (Zod-validated environment)
- lib/utils.ts, lib/result.ts, lib/errors.ts, lib/logging/logger.ts
- lib/validation/common.ts

### Phase 2: Routing Lab — ✅ Complete
- app/ (root layout, error, global-error, not-found, robots, sitemap, page)
- app/api/health, app/api/ready (Route Handlers)
- app/lab/page.tsx (comprehensive index with 17 demos)
- app/lab/nested-layout/** (nested layout composition)
- app/lab/route-groups/** ((marketing) and (auth) route groups)
- app/lab/dynamic-routes/[projectId]/** (dynamic segments + generateStaticParams)
- app/lab/catch-all-routes/optional/[[...slug]]/** (optional catch-all)
- app/lab/parallel-routes/** (@header, @sidebar slots with layout)
- app/lab/search-params/** (URL-driven filters with form actions + loading.tsx)
- app/lab/cookies/** (server-side cookie reads)
- app/lab/headers/** (incoming request headers)
- app/lab/static-rendering/** (force-static, CDN-cached)
- app/lab/dynamic-rendering/** (force-dynamic, per-request)
- app/lab/suspense/** (streaming with Suspense + skeleton fallback)
- app/lab/error-handling/** (error.tsx boundaries)
- app/lab/not-found-behavior/** (notFound() + segment-level not-found.tsx)
- app/lab/redirects/** (server-side redirect())
- app/lab/caching/** (cache strategies overview)
- app/lab/experimental/** (experimental APIs)

### Phase 3: Database — ✅ Complete
- prisma/schema.prisma (all models: User, Org, Member, Role, Permission, Project, Task, Comment, Attachment, Notification, AuditLog, ApiKey, Webhook)
- lib/db/index.ts (singleton Prisma client)
- lib/db/tenant.ts (withTenant, transaction, audit helpers)

### Phase 4: Auth + RBAC — ✅ Complete
- lib/auth/auth.ts (NextAuth v5 credentials provider)
- lib/auth/session.ts (getSessionUser, requireUser, getMembership, getUserOrganizations)
- lib/permissions/rbac.ts (hasPermission, requirePermission, requireMembership, DEFAULT_ROLES)
- app/(auth)/login/page.tsx (login form)
- app/(app)/dashboard/page.tsx (protected dashboard)

### Phase 5: CRUD/Server Actions — ✅ Complete
- features/project/actions.ts (createProject with validate → authorize → audit → revalidate)
- features/task/actions.ts (createTask same pattern)

### Phase 6: Advanced Routing — ✅ Complete
- app/projects/page.tsx (Suspense skeleton loading)
- app/projects/[projectId]/page.tsx (streaming task list)

### Phase 7: Caching — ✅ Complete
- app/lab/caching/page.tsx (unstable_cache, tags, revalidation, layer documentation)

### Phase 8: Search/Pagination — ✅ Complete
- app/tasks/page.tsx (URL filters, Prisma count + paginated findMany)
- features/tasks/search/schema.ts (Zod search schema)

### Phase 9: File Uploads/S3 — ✅ Complete
- lib/storage/s3.ts (presigned upload URLs, size/mime validation, dev placeholder)

### Phase 10: Versioned APIs — ✅ Complete
- app/api/v1/projects/route.ts (GET list, POST create, auth+RBAC, Zod, pagination)
- app/api/v1/tasks/route.ts (GET with idempotency-key, POST with org verification)
- app/api/v1/search/route.ts (GET cross-entity search)
- app/api/_lib/api-response.ts (consistent error envelope, requestId, paginatedMeta)
- app/api/_lib/api-auth.ts (session OR Bearer API key, SHA-256 hash lookup)

### Phase 11: Background Jobs (Redis) — ✅ Complete
- lib/queue/types.ts (BullMQ-style enqueue/getJob/completeJob/failJob with exponential backoff, DLQ, idempotency)
- lib/queue/jobs.ts (7 jobs: sendWelcomeEmail, sendNotification, processAttachment, generateReport, cleanupExpiredTokens, cleanupOrphanedFiles, deliverWebhook with HMAC-SHA256)

### Phase 12: Webhook API — ✅ Complete
- app/api/v1/webhooks/route.ts (GET/POST with secret generation, event validation, RBAC)
- lib/queue/jobs.ts::deliverWebhook (HMAC signing, retry)

### Phase 13-14: Performance + Security — ✅ Complete
- docs/performance/budgets.md (bundle, LCP, INP, CLS, TTFB, API, DB targets)
- docs/security/security-checklist.md (full input/auth/authz/session/secret checklist)

### Phase 15: A11y — ✅ Complete
- docs/accessibility/wcag-checklist.md (WCAG 2.2 AA: Perceivable/Operable/Understandable/Robust)

### Phase 16: Tests — ✅ Complete
- vitest.config.ts + playwright.config.ts
- tests/unit/lib/{validation,errors,rbac,result}.spec.ts
- tests/integration/api/health.spec.ts
- tests/e2e/{auth,features/projects,features/tasks,features/lib/test-utilities}.spec.ts

### Phase 17: Observability — ✅ Complete
- lib/telemetry/index.ts (OpenTelemetry SDK, withSpan, 9 counters + 3 histograms + 2 gauges, recordHttpRequest/recordDbQuery)
- lib/telemetry/request-context.ts (AsyncLocalStorage<RequestContext>, withRequestId, getRequestId, getCurrentUserId, getCurrentOrgId)
- lib/telemetry/logger.ts (pino + redact + auto-injected requestId/userId/orgId/traceId)
- middleware.ts (extracts/generates x-request-id, records forgeMetrics.httpRequests/histogram, propagates header to response)
- docs/observability/metrics-tracing.md

### Phase 18: E2E Fixtures + Playwright Helpers — ✅ Complete
- tests/e2e/{auth,features/projects,features/tasks,features/lib/test-utilities}.spec.ts
- tests/e2e/helpers.ts (loginAsTestUser)
- /api/_test/seed-* endpoint contracts for E2E fixture isolation

### Phase 19: Docker — ✅ Complete
- Dockerfile (multi-stage: deps → builder → runner, non-root, dumb-init, healthcheck)
- docker-compose.yml (web, postgres, redis, otel-collector, prometheus, adminer)
- .dockerignore
- otel-collector-config.yaml (OTLP receivers → Prometheus + logging exporters)
- prometheus.yml (scrape config for otel-collector + web /metrics)
- docs/infrastructure/docker.md

### Phase 20-29: Terraform AWS Infrastructure — ✅ Complete
- infra/README.md (state layout, modules, secrets, cost notes)
- infra/terraform.tf (root provider + version, no backend — moved to per-env)
- modules: vpc, rds, elasticache, s3, iam, ecs, alb, ecr, secrets, cloudwatch, cdn, dns
- environments: dev (single NAT, db.t4g.micro, 1-AZ), staging (multi-AZ-ish), prod (multi-AZ, deletion_protection, multi-node redis, full ALB+ECS+CDN+DNS+CloudWatch)
- Per-environment backend s3 with dynamodb_table locking (separate state per env)

## Commits on main

1. chore: initialize nextjs application with strict typescript and scaffold
2. docs: add Phase 0 architecture, threat model, data model, runbooks
3. feat: Phase 1 DX + Phase 2 routing lab + app shell + error boundaries + health/readiness APIs
4. Phase 2: Routing lab (17 demos)
5. Phase 3: Prisma schema + tenant DB helpers
6. Phase 4: Auth + RBAC + protected dashboard
7. Phase 5: Server Actions (createProject, createTask)
8. Phase 6: Advanced routing + streaming UX
9. Phase 7: Caching lab
10. Phase 8: Search + pagination
11. Phase 9: S3 storage adapter
12. Phase 10-12: Versioned APIs + Redis queue + Webhook API
13. Phase 13-14: Performance budgets + security checklist
14. Phase 15-16: WCAG 2.2 AA checklist + Vitest/Playwright test suite
15. Phase 17: OpenTelemetry + request-scoped context + pino structured logger + middleware
16. Phase 16-17: Playwright E2E suite (auth, projects, tasks) + telemetry lib + middleware
17. Phase 19: Multi-stage Dockerfile + docker-compose + OTel collector + prometheus scrape config
18. Phase 20-29 (start): Terraform VPC + RDS + infra root backend
19. Phase 20-29: Elasticache + S3 + IAM + ECS modules + infra README
20. Phase 20-29: ALB + ECR modules + dev/staging/prod environment configs

## Next steps (post-Phase 29)

- Wire up `prisma migrate deploy` as a one-shot ECS task before service start
- Create the S3 state buckets and DynamoDB lock tables (one-time, manual)
- Add the `domains/dns` module and `cdn` module
- Add CloudWatch alarms + dashboard module
- CI: GitHub Actions workflow (typecheck → vitest → playwright → docker build → terraform plan)
- Add MFA + OAuth providers to Auth.js
- Add Lighthouse/Playwright a11y axe-core scans to CI

## Notes for Continuation

- Folder layout is direct in repo root (no forgeboard/ subdir)
- All env validated via Zod (lib/env.ts)
- App structure: app/(marketing), app/(auth), app/(app)/dashboard, app/api/*, app/lab/*
- Auth flows are /login, /register etc under app/(auth)
- Tenant-owned data models documented in docs/architecture/data-model.md
- Multi-tenancy: every tenant query uses `organizationId` filter

## Key Architecture Patterns

- **Tenant isolation:** every query includes `organizationId` filter
- **Authorization:** server-side only, never client-side
- **Mutations:** authenticate → authorize → validate (Zod) → transaction → audit → revalidate
- **Errors:** typed AppError class hierarchy with code, statusCode, safe flag
- **Result type:** discriminated union `{ ok: true; data } | { ok: false; error }`
- **Logging:** Pino with redact for secrets
- **Server Components:** default; Client Components only for interactivity

## Conventions

- Use `@/` for internal imports (configured in tsconfig)
- Co-locate server actions in features/*/actions.ts
- Tests in tests/unit, tests/integration, tests/e2e
- ADRs in docs/adr/NNNN-name.md
- Learning notes in docs/learning/
