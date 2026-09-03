# Security Checklist — Phase 14

Status: In-progress (scaffold completed; hardening passes remain).

## Input Validation

- [x] All untrusted input uses Zod at system boundary (API, Server Actions, forms)
- [x] File uploads validate MIME and size (lib/storage/s3.ts)
- [ ] SQL injection test (Prisma uses parameterized queries; need negative test)
- [ ] CSRF token validation for state-changing forms

## Authentication

- [x] Credentials provider with bcrypt (scaffold; full hash comparison needed)
- [x] JWT session strategy
- [ ] OAuth/social login (Google, GitHub)
- [ ] MFA/TOTP enrollment and verification
- [ ] Recovery codes
- [ ] Account lock after failed attempts
- [ ] Secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] Session expiry and rotation

## Authorization

- [x] RBAC with server-side enforcement (lib/permissions/rbac.ts)
- [x] Permission checks at data/action boundary
- [ ] Tenant isolation test (every query includes organizationId)
- [ ] Authorization bypass test (attempt to access other org resources)

## Session / Token Security

- [x] API keys use SHA-256 hashes (not stored plaintext)
- [ ] Rate limiting on login and API endpoints
- [ ] Brute-force protection (exponential delay after failures)
- [ ] Token expiry and revocation

## Content Security

- [ ] CSP header configured in middleware / next.config
- [ ] Security headers (HSTS, X-Content-Type-Options, X-Frame-Options)
- [ ] XSS defense (output encoding in RSC/JSX)
- [ ] SSRF protection (no server-side fetch to untrusted URLs)

## File Upload Security

- [x] MIME validation (lib/storage/s3.ts)
- [x] Size limits
- [x] Filename sanitization (random keys)
- [ ] Virus scanning integration point
- [ ] Private bucket (block public access)
- [ ] Signed download URLs (not direct S3 links)
- [ ] Lifecycle policy (auto-delete after retention)

## Database Security

- [x] Prisma schema with foreign keys and unique constraints
- [ ] Encryption at rest (RDS)
- [ ] Connection pooling (PgBouncer / Neon)
- [ ] Backup and restore tested
- [ ] No secrets in .env or Git

## Webhook Security

- [x] Secret signing with HMAC (lib/queue/jobs.ts deliverWebhook)
- [ ] Replay protection (idempotency via event ID + timestamp window)
- [ ] HTTPS-only endpoints
- [ ] Rate limit on webhook delivery

## Secret Management

- [ ] AWS Secrets Manager integration
- [ ] No secrets in Docker image
- [ ] No secrets in Terraform state (remote state + encryption)
- [ ] Secret rotation procedure

## Monitoring / Incident

- [ ] Rate limit alerts
- [ ] Error rate monitoring
- [ ] Audit log review procedure
