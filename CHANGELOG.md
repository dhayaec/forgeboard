# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Google and GitHub OAuth providers (Phase 4)
- TOTP MFA with QR code setup (`lib/auth/auth.ts`, `generateMfaSetup`, `verifyMfaToken`)
- SMTP email delivery with nodemailer (Phase 12)
  - Welcome, password-reset, and invite email templates
  - Log-only transport for dev/preview environments
- GitHub Actions CI/CD workflow (Phase 26)
  - Lint, type-check, test (with Postgres 16), and build jobs
- Release script `scripts/release.sh` (Phase 27)
  - Dry-run mode, version bumping, Docker tagging, and git tagging
- Prisma baseline migration (`prisma/migrations/0_init/`)

### Changed
- Auth.js v5 credentials provider now uses real bcrypt comparison
- Auth pages moved from `app/(auth)/` to `app/auth/` route group

---

## [0.1.0] — YYYY-MM-DD

### Added
- Project scaffolding with Next.js 16, TypeScript, and Tailwind CSS
- Prisma schema with full multi-tenant data model (users, organizations, projects, tasks, roles, permissions, API keys, webhooks, notifications, audit logs)
- Auth.js v5 with JWT session strategy
- Register, login, forgot-password, and logout pages
- Dashboard, projects, tasks, settings pages (UI scaffold)
- Pino structured logging with redaction
- OpenTelemetry instrumentation (traces + metrics)
- Docker Compose for local Postgres 16 + Redis 7
