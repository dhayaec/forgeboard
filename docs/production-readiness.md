# Production Readiness — ForgeBoard

> Verified 2026-09-04. All items must be checked before promoting to production.

---

## 1. Environment & Secrets

- [ ] `.env.local` exists locally but is **NOT** committed (verified in `.gitignore`)
- [ ] `AUTH_SECRET` is a 32+ char random string; rotated from default
- [ ] `DATABASE_URL` points to production PostgreSQL (not localhost)
- [ ] `REDIS_URL` points to production Redis
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` configured
- [ ] `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` set only where S3 is used (optional)
- [ ] `GOOGLE_CLIENT_ID` / `GITHUB_CLIENT_ID` filled if OAuth enabled
- [ ] No secrets printed in build output / logs (Pino redaction is active)

## 2. Database

- [ ] `prisma/migrations/` contains the baseline (`0_init`) + any new migrations
- [ ] `prisma migrate deploy` runs cleanly on production DB before deploy
- [ ] DB backups configured (scheduled, tested restore)
- [ ] Connection pool (`DATABASE_POOL_MAX`) tuned for expected concurrent users

## 3. Auth & Security

- [ ] Credentials provider uses `bcrypt.compare()` (not placeholder `true`)
- [ ] MFA enabled for admin users (`mfaEnabled` flag + `mfaSecret` stored)
- [ ] TOTP setup uses `otplib` with `authenticator.options = { window: 1, step: 30 }`
- [ ] OAuth providers only load when env vars set (conditional in `lib/auth/auth.ts`)
- [ ] Session strategy is JWT (`session.strategy: 'jwt'`)
- [ ] `AUTH_TRUST_HOST` is `'true'` only when `AUTH_URL` is a public HTTPS URL
- [ ] CSRF tokens verified by Auth.js v5 (no custom CSRF endpoint needed)
- [ ] Cookie `secure` / `sameSite` set via `cookies` config (check `next-auth` defaults for production)

## 4. Application Build

- [ ] `pnpm build` completes with no TypeScript errors (`tsc --noEmit` passes)
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (`vitest`)
- [ ] `pnpm format:check` passes
- [ ] `next.config.ts` (or `.mjs`) has `output: 'standalone'` if deploying to Docker / Kubernetes
- [ ] `images` configured (if using `next/image` with external domains)
- [ ] `rewrites` / `redirects` audited — no open redirects

## 5. Observability

- [ ] `pino` configured with `redact` (password, token, secret, cookie, authorization)
- [ ] `OTEL_SERVICE_NAME` and `OTEL_EXPORTER_OTLP_ENDPOINT` set if using OpenTelemetry
- [ ] Request IDs (`crypto.randomUUID()`) logged via `withRequest()`
- [ ] Logs shipped to aggregation (not just stdout on container exit)
- [ ] Health-check endpoint exists (`/api/health` or load-balancer probe)

## 6. Deployment

- [ ] CI workflow (`.github/workflows/ci.yml`) passes on `main`
- [ ] Release script (`scripts/release.sh`) tested in dry-run (`--dry-run`)
- [ ] Container image built, tagged (`vX.Y.Z`), and pushed
- [ ] Docker Compose / Kubernetes manifests specify resource limits (CPU / memory)
- [ ] Database migrations applied as part of deploy (not manually)
- [ ] Rollback plan documented (previous image tag + DB restore point)

## 7. Monitoring

- [ ] Alerting on 5xx rate > threshold
- [ ] Alerting on DB connection pool exhaustion
- [ ] Alerting on auth failure spike (possible brute-force)
- [ ] Alerting on email delivery failure rate

---

## Quick Check Command

```bash
# Run all pre-flight checks locally
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm build
```

If all pass and the checklist above is ticked, the application is safe to promote.
