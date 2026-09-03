# Threat Model

## Purpose

This document identifies the assets, threats, and mitigations that drive the security architecture of ForgeBoard. It is maintained alongside the system architecture and updated as the application evolves.

## Assets

### Primary
1. **User credentials** (passwords, MFA secrets, OAuth tokens)
2. **Session tokens** (JWT/cookie)
3. **Personal data** (email, profile fields)
4. **Tenant data** (organizations, projects, tasks, comments, attachments)
5. **API keys** issued to users for programmatic access
6. **Webhook secrets** for outbound webhook delivery
7. **S3 objects** (attachments, exports, backups)
8. **Database credentials** (PostgreSQL, Redis)
9. **Infrastructure secrets** (AWS, Terraform state)

### Secondary
- Audit logs (high integrity, no PII unless explicitly required)
- Application logs (no secrets, structured)
- Telemetry data
- Email content

## Trust Boundaries

```
                    [Public Internet]
                          │
                          │ HTTPS / TLS
                          ▼
                    [ALB / CloudFront]   ◄── untrusted
                          │
                          ▼
                [ECS Fargate — App]    ◄── trusted inside VPC
                /          |          \
               /           |           \
        [RDS PG]    [Redis]    [S3]
```

### Boundary 1: Internet → ALB
**Threats:** DDoS, TLS downgrade, malicious requests, header injection
**Mitigations:** AWS WAF, CloudFront, ALB TLS termination, strict request size limits, rate limiting at edge

### Boundary 2: ALB → App
**Threats:** SSRF, slowloris, malicious file uploads, malformed payloads
**Mitigations:** ALB idle timeout, WAF rules, validation at handler boundary, file MIME sniffing, request body size limits

### Boundary 3: App → Database
**Threats:** SQL injection, unauthorized access, credential theft
**Mitigations:** Prisma parameterized queries (no string concatenation), TLS connections, IAM database authentication where possible, principle of least privilege on DB user, tenant isolation via `organizationId` filters in every query

### Boundary 4: App → S3
**Threats:** Unauthorized uploads, malware, denial of wallet attacks
**Mitigations:** Pre-signed URLs (no app proxying), MIME validation, virus scanning hook, size limits, lifecycle rules, budget alarms

### Boundary 5: App → Outbound Webhooks
**Threats:** SSRF, replay attacks, leaks
**Mitigations:** Per-webhook HMAC signing, replay window enforcement, allowlist for known hosts, structured timeouts

## Threat Categories (STRIDE)

### Spoofing
- **Threats:** Session hijacking, credential stuffing, MFA bypass
- **Mitigations:** Secure session cookies (HttpOnly, Secure, SameSite=Lax), bcrypt for passwords, MFA/TOTP with rate limiting, OAuth state validation, brute-force lockout (5 attempts → 15 min cooldown)

### Tampering
- **Threats:** Data manipulation, request replay, MITM
- **Mitigations:** TLS everywhere, Idempotency-Key header on mutations, audit logging, version columns for optimistic concurrency

### Repudiation
- **Threats:** User denies taking an action
- **Mitigations:** Append-only audit log with actor, IP, request ID, timestamp; tamper-evident (out-of-band hash chain in later phases)

### Information Disclosure
- **Threats:** Data leak, PII exposure, error messages leaking internals
- **Mitigations:** Tenant-isolated queries, structured error format (no stack traces), security headers, CSP, field-level encryption for PII at rest (future), proper logging redaction

### Denial of Service
- **Threats:** Resource exhaustion, expensive queries, large file uploads
- **Mitigations:** Rate limiting (per-IP and per-user), pagination caps, file size limits, query timeouts, request body size limits, CloudWatch alarms

### Elevation of Privilege
- **Threats:** Auth bypass, RBAC bypass, tenant escape
- **Mitigations:** Server-side authorization on every action, no client-side role checks, explicit permission tests, IDOR prevention (server-side scope checks)

## Specific Risks and Decisions

### R1: Tenant Isolation
- **Risk:** A user from org A accesses org B data
- **Mitigation:** Every tenant-owned query includes `where: { organizationId: ctx.organizationId }`. Tested with negative tests.

### R2: Server Actions Security
- **Risk:** CSRF, missing auth, missing authorization
- **Mitigation:** Every Server Action validates: (1) session present, (2) user is org member, (3) user has required permission, (4) input passes Zod schema, (5) mutation in transaction, (6) audit log written.

### R3: File Uploads
- **Risk:** Malware, oversized files, public bucket
- **Mitigation:** Pre-signed S3 PUT (no proxy through app), MIME sniff, max 50MB, antivirus hook, private bucket, signed GET URLs with short TTL.

### R4: Webhook Delivery
- **Risk:** Replay, MITM
- **Mitigation:** HMAC-SHA256 signature header, 5-minute timestamp window, exponential backoff retries, delivery log.

### R5: Session Management
- **Risk:** Token theft, fixation
- **Mitigation:** HttpOnly Secure SameSite=Lax, server-side session validation, sliding expiration, rotation on privilege escalation.

### R6: Secrets at Rest
- **Risk:** Database dump exposes secrets
- **Mitigation:** Auth.js JWT secret in AWS Secrets Manager, OAuth secrets in Secrets Manager, webhooks secrets encrypted at rest in DB (AES-GCM with KMS-managed key in later phases).

### R7: CI/CD Pipeline
- **Risk:** Compromised build, leaked secrets
- **Mitigation:** GitHub OIDC to AWS (no long-lived keys), required status checks, signed images, manual approval for production, dependency review on PRs.

## Security Headers

Always applied (set in `next.config.ts` or middleware):

```
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP is documented in the security checklist and refined per environment.

## Operational Security

- **Backups:** RDS automated (30 days), S3 versioning, Terraform state in S3 with encryption.
- **Recovery:** Documented runbooks (database-recovery, application-rollback, incident-response).
- **Logging:** Structured JSON, request correlation IDs, never log secrets, passwords, or PII.
- **Alerting:** CloudWatch alarms for auth failures, error rate, queue depth, DB connections.

## Future Hardening (Phases 14+)

- Field-level encryption for PII
- WAF rules (OWASP top 10)
- Rate limiting distributed via Redis (sliding window)
- Adaptive MFA (new device, impossible travel)
- Anomaly detection on audit log
- Penetration testing before production launch

## Acceptance Criteria

The application must:
- Pass OWASP Top 10 review
- Pass dependency vulnerability scan (no high/critical)
- Demonstrate tenant isolation with negative tests
- Demonstrate authorization bypass attempts fail
- Demonstrate webhook signature validation
- Demonstrate secure session lifecycle

See `docs/security/security-checklist.md` (Phase 14) for the executable checklist.
