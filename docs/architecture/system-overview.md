# System Overview

## Purpose

ForgeBoard is a multi-tenant project/work-management SaaS built as a learning laboratory for senior engineering practices. The application must simultaneously deliver production-grade correctness while providing educational value for Next.js + TypeScript + Terraform.

## High-Level Architecture

### Core Application Stack

- **Frontend**: Next.js 16.3 (App Router, Server Components, Server Actions)
- **Backend**: PostgreSQL with Prisma ORM, Redis for caching/queue
- **Auth**: Auth.js (NextAuth v5) with RBAC and MFA
- **Validation**: Zod schema validation at all boundaries
- **Caching**: Multi-layer: in-memory, Redis, Next.js server caching
- **Observability**: OpenTelemetry + structured JSON logging
- **Storage**: AWS S3 for attachments with signed URLs
- **Infrastructure**: AWS VPC with private subnets, RDS, ECS/Fargate, ALB

### Data Flow

```
Browser (Next.js)
  ↓ Authenticated Request
Next.js Server Components / Route Handlers
  ↓ Server Actions / API Endpoints
Prisma ORM (PostgreSQL)
  ↓
Redis Cache / Background Jobs
  ↓
S3 Object Storage
```

## Key Properties

### Multi-Tenant Architecture
- **Tenant isolation** enforced at the database layer
- **Organization-based** access control
- **Database separation** per environment (dev/staging/prod)

### Production Correctness
- **TypeScript strict mode** throughout
- **Server-side authorization** only (no client trust)
- **Security headers**, CSP, rate limiting
- **Audit trails** for all mutations
- **Structured logging** with request IDs
- **Performance budgets** and monitoring

### Learning Value
- **Lab sections** for Next.js App Router features
- **Cache demonstrations** in `/lab/caching`
- **Experimental APIs** isolated in `/lab/experimental`
- **Architecture decision records** (ADRs) documented
- **Security threat modeling** and hardening

## Deployment Model

### Environments
- **Local**: Docker compose with PostgreSQL, Redis
- **Dev/Staging**: Separate AWS accounts/tenants, automated CI/CD
- **Production**: Multi-AZ, auto-scaling, disaster recovery

### Infrastructure as Code
- Terraform with separate environments
- Modules for network, security, compute, database, cache, storage
- Remote state with encryption and locking
- CI/CD pipelines for both application and infrastructure

## Security Model

### Authentication
- Password-based with bcrypt + salt
- OAuth 2.0 (Google/GitHub optional)
- Email verification + MFA/TOTP
- Secure cookies (HttpOnly, SameSite, Secure)

### Authorization
- Role-Based Access Control (RBAC)
- Organization membership with roles
- Server-side checks at data/action boundaries
- Least privilege principle enforced

### Data Protection
- Field-level encryption for sensitive data
- Audit logging for all access
- Regular backups and disaster recovery
- Network isolation (private subnets)

## Observability

### Logging
- Structured JSON logs with request correlation
- Pino logger (JSON format)
- Log at appropriate grain size (operation, error, audit)
- Never log secrets or credentials

### Metrics
- Request counts, latency, error rates
- Database query performance
- Cache hit/miss ratios
- Job queue depth and failures

### Tracing
- OpenTelemetry for distributed tracing
- Correlate spans across services
- Track user flows through the system

## High Availability & Disaster Recovery

### Availability Goals
- **RPO**: 0 (no data loss)
- **RTO**: 30 minutes for full recovery

### Backup Strategy
- PostgreSQL automated backups (30-day retention)
- S3 versioning + lifecycle policies
- Terraform state backup in S3

### Recovery Procedures
- Documented runbooks for database recovery
- Application rollback procedures
- Incident response for high-error-rate scenarios
- Queue failure handling and recovery

## Learning Objectives

### For Developers
- Deep understanding of Next.js App Router capabilities
- Production practices for TypeScript and Node.js
- Terraform module design and AWS best practices
- Security hardening from threat modeling
- Performance engineering and optimization

### For Operations
- Infrastructure as code with Terraform
- CI/CD pipeline design with approval gates
- Monitoring and alerting strategies
- Disaster recovery procedures
- Security compliance and audit preparation

## Success Metrics

### Application Quality
- 100% test coverage for core features
- Zero security vulnerabilities in production
- Performance budgets met (LCP < 2.5s, CLS < 0.1)
- 99.9% uptime (after Phase 21+)

### Operational Excellence
- Automated testing at every gate
- Controlled production deployments
- Comprehensive runbooks
- Regular recovery drills

## References

- [plan.md](plan.md) — Detailed 30-phase implementation plan
- [docs/adr/] — Architecture Decision Records
- [docs/learning/] — Learning notes for complex topics
- [docs/security/] — Security documentation
- [docs/runbooks/] — Operational runbooks