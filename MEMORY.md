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
- app/lab (and partial examples for nested-layout, route-groups, dynamic-routes, parallel-routes, catch-all-routes)

### Phase 3: Database — ⏳ Pending

### Phase 4: Auth + RBAC — ⏳ Pending

## Commits on main

1. chore: initialize nextjs application with strict typescript and scaffold
2. docs: add Phase 0 architecture, threat model, data model, runbooks
3. feat: Phase 1 DX + Phase 2 routing lab + app shell + error boundaries + health/readiness APIs

## Notes for Continuation

- Folder layout is direct in repo root (no forgeboard/ subdir)
- All env validated via Zod (lib/env.ts)
- App structure: app/(marketing), app/(auth), app/(app)/dashboard, app/api/*, app/lab/*
- Auth flows are /login, /register etc under app/(auth)
- Tenant-owned data models documented in docs/architecture/data-model.md

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
