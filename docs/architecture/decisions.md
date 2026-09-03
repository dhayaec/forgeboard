# Architecture Decisions

This document captures the high-level decisions made for ForgeBoard. Each decision has an ADR in `docs/adr/`.

## Stack

| Layer            | Choice                       | Reason                                         |
| ---------------- | ---------------------------- | ---------------------------------------------- |
| Framework        | Next.js 16.3 App Router      | Active LTS, RSC, Server Actions, typed routes  |
| Language         | TypeScript 5.6 strict        | Industry standard for production Next.js       |
| Package manager  | pnpm                         | Fast, deterministic, monorepo-friendly         |
| Database         | PostgreSQL 16                | Multi-tenant patterns, JSONB, FTS, mature      |
| ORM              | Prisma 6                     | Type-safe, transactional, migrations           |
| Cache / Queue    | Redis 7                      | Ubiquitous, supports BullMQ                    |
| Auth             | Auth.js (NextAuth v5)        | Stable, OAuth providers, edge-compatible       |
| Validation       | Zod                          | Schema → TypeScript inference, single source   |
| Styling          | Tailwind CSS 3               | Utility-first, design-token friendly           |
| Lint / Format    | ESLint 9 + Prettier 3        | Flat config, Next.js preset                    |
| Testing          | Vitest + Testing Library     | Fast, Jest-compatible API                      |
| E2E              | Playwright                   | Cross-browser, parallel, trace viewer          |
| Logging          | Pino                         | Structured JSON, fast                          |
| Tracing          | OpenTelemetry                | Vendor-neutral, future-proof                   |
| Container        | Docker multi-stage           | Reproducible builds, non-root runtime          |
| IaC              | Terraform 1.9                | Module-based, state locking, broad provider    |
| Cloud            | AWS                          | Broadest support, learning value               |
| CI/CD            | GitHub Actions               | Tight GitHub integration, OIDC                 |

## Environments

| Env       | Branch       | Database         | AWS Account  |
| --------- | ------------ | ---------------- | ------------ |
| local     | any          | docker-compose   | n/a          |
| dev       | `develop`    | shared RDS       | `forge-dev`  |
| staging   | `main`       | dedicated RDS    | `forge-stg`  |
| production| tagged `v*`  | dedicated RDS    | `forge-prd`  |

## Multi-Tenancy

- Single database, shared schema, `organizationId` column on every tenant-owned table.
- All queries scoped by `organizationId` via server-side helpers.
- Tests include negative cases attempting to access another tenant's data.

## Caching Layers

1. **In-memory** (per request) — React `cache()` for request-level dedup.
2. **Server cache** (Next.js) — `fetch` cache, `unstable_cache`/`use cache` for cross-request.
3. **Redis** — multi-instance, explicit invalidation by tag/key.
4. **HTTP/CDN** — Cache-Control headers, CloudFront cache policies.

## API Style

- **Internal UI:** Server Actions with typed inputs/outputs.
- **External API:** Route Handlers under `/api/v1/*` with versioned, documented contracts.
- **Webhooks:** HMAC-signed, idempotent, with retry/backoff.

## Error Model

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; requestId: string } };
```

## Security Posture

- Authentication: Auth.js with cookies; MFA via TOTP.
- Authorization: RBAC at server boundary, no client trust.
- Tenant isolation: enforced at query layer.
- Secrets: AWS Secrets Manager in production, `.env.local` locally.
- Headers: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- Rate limiting: per-IP and per-user via Redis sliding window.

## Future Considerations

- WebSockets for real-time notifications (Phase 12+)
- WebAuthn as alternative to TOTP (later phase)
- gRPC for internal service-to-service if services split (unlikely in this project)
