# Architecture Decision Record 0001: Project Foundation

## Context

We are building ForgeBoard, a production-grade multi-tenant SaaS that also serves as a learning laboratory for senior engineering practices. The project must balance production correctness with educational value.

## Decision

- Use **Next.js 16.3.0** (current Active LTS) with App Router as the primary framework.
- Use **TypeScript strict mode** (noEmit, strict: true, isolatedModules) as the default.
- Use **pnpm** as the package manager (not npm or yarn) for faster installs and deterministic resolution.
- Use **Tailwind CSS** for styling (utility-first, accessible primitives).
- Use **Prisma** as the ORM/query layer with PostgreSQL.
- Use **Zod** for runtime validation at all system boundaries.
- Use **Auth.js** (NextAuth-compatible) for authentication and session management.
- Use **Redis** for caching and background job queue.
- Follow the 30-phase plan defined in `plan.md` without skipping or merging phases.

## Consequences

- Project will be deployable after Phase 2 but must pass all quality gates at each phase boundary.
- Server Components are the default. Client Components (`"use client"`) are used only when browser APIs or interactivity genuinely require them.
- Every mutation uses Server Actions with authentication + authorization + validation + transaction + audit + cache invalidation.
- All API endpoints must have authentication, authorization, validation, rate limiting, request IDs, structured errors, logging, metrics, and documentation.
- Terraform modules organize infrastructure by concern (network, compute, database, storage, etc.) with separate environments (dev/staging/prod) and remote state locking.
- No secrets are committed to Git; `.env.local` and `.tfvars` are excluded by `.gitignore`.
- Experimental APIs are isolated in `/lab/experimental` and not used in production paths without an ADR.

## Status

Accepted (Phase 0). Implementation proceeds phase by phase.
