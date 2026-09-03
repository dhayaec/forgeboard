# Production-Ready Next.js + TypeScript + Terraform Learning Project

## 0. Purpose

Build a production-grade, full-stack application that is intentionally
complex enough to teach the architecture, implementation, testing,
security, observability, CI/CD, and infrastructure practices expected
from a senior/lead engineer.

**Application:** `ForgeBoard` --- a multi-tenant project/work-management
SaaS.

The application should exercise the major capabilities of modern Next.js
App Router, React Server Components, TypeScript, PostgreSQL,
authentication/authorization, caching, forms/actions, API endpoints,
file uploads, background jobs, observability, Docker, AWS, Terraform,
and CI/CD.

Use **Next.js 16.x Active LTS** unless the official documentation
indicates a newer stable/LTS release when implementation begins. Pin
versions and document all selected versions.

Next.js currently documents App Router, layouts/pages, Server
Components, data fetching, streaming, mutations, error handling,
authentication, metadata, and optimization as core application-building
capabilities. Next.js 16.3 also adds/expands instant navigations and
partial prefetching. See the official documentation before implementing
version-sensitive features.

------------------------------------------------------------------------

# 1. Instructions to the Coding Agent

You are the primary implementation agent.

## Non-negotiable rules

1.  Work **phase by phase** in the exact order below.
2.  Do not implement later-phase features early unless a dependency
    makes it unavoidable.
3.  Before starting a phase:
    -   inspect the current repository;
    -   inspect existing architecture and tests;
    -   read the relevant official Next.js/React/TypeScript/Terraform
        documentation;
    -   create/update a short implementation plan.
4.  After each phase:
    -   run formatting;
    -   run lint;
    -   run type checking;
    -   run unit/integration tests;
    -   run the production build where applicable;
    -   update documentation;
    -   update the phase checklist.
5.  Never leave broken TypeScript, lint errors, failing tests, or known
    security vulnerabilities at a phase boundary.
6.  Prefer simple, explicit architecture over unnecessary abstraction.
7.  Server Components should be the default. Add `"use client"` only
    when client-side interactivity/browser APIs are genuinely required.
8.  Never expose secrets to the browser.
9.  Validate all untrusted input at system boundaries.
10. Do not trust authorization performed only in the UI.
11. Do not put secrets, tokens, passwords, or credentials in Git.
12. Never commit Terraform state, plan files, `.terraform/`, or
    sensitive `.tfvars`.
13. Infrastructure changes must use `terraform fmt`,
    `terraform validate`, `terraform plan`, and automated Terraform
    tests where appropriate.
14. Do not use `any` unless there is a documented, justified exception.
15. Do not suppress TypeScript/ESLint errors merely to make the build
    pass.
16. Every production feature needs tests appropriate to its risk.
17. Every database schema change must have a migration.
18. Every externally visible API must have documented
    request/response/error behavior.
19. Every significant architectural decision must be recorded in
    `/docs/adr/`.
20. Keep the application deployable at every phase after Phase 2.

## Agent operating loop

For every phase:

``` text
READ → PLAN → IMPLEMENT → TEST → SECURITY REVIEW → PERFORMANCE REVIEW → DOCUMENT → VERIFY → COMMIT
```

At the end of every phase, report:

``` text
Phase:
Implemented:
Files changed:
Tests:
Security checks:
Performance checks:
Known limitations:
Next phase:
```

------------------------------------------------------------------------

# 2. Learning Outcomes

By completing this project, the learner should understand:

### Next.js

-   App Router
-   layouts and nested layouts
-   route groups
-   dynamic routes
-   catch-all routes
-   parallel routes
-   intercepted routes
-   loading UI
-   error boundaries
-   `notFound`
-   redirects
-   Server Components
-   Client Components
-   Suspense
-   streaming
-   Server Actions / Server Functions
-   forms and progressive enhancement
-   URL search params
-   Route Handlers
-   cookies and headers
-   Proxy
-   caching and revalidation
-   `use cache` / Cache Components where appropriate for the selected
    Next.js version
-   static vs dynamic rendering
-   request-time data
-   `revalidateTag` / `updateTag` / `revalidatePath` as appropriate for
    the selected version
-   metadata API
-   OG images
-   `next/image`
-   `next/font`
-   `next/link`
-   typed routes
-   middleware/proxy-style request interception
-   instrumentation
-   OpenTelemetry
-   environment variables
-   security headers
-   CSP
-   image optimization
-   bundle optimization
-   production builds
-   Docker/self-hosting
-   health/readiness endpoints
-   graceful failure
-   deployment architecture
-   React 19.x features supported by the selected Next.js version

### TypeScript

-   strict mode
-   discriminated unions
-   generics
-   utility types
-   branded/domain types
-   type-safe API contracts
-   type-safe environment configuration
-   type-safe database access
-   narrowing
-   `unknown` vs `any`
-   exhaustive checking
-   typed errors
-   DTOs
-   schema-derived types
-   module boundaries

### Backend

-   PostgreSQL
-   ORM/query layer
-   migrations
-   transactions
-   indexes
-   pagination
-   filtering
-   full-text search
-   optimistic concurrency
-   idempotency
-   background jobs
-   rate limiting
-   audit logging
-   object storage
-   email
-   webhooks
-   API versioning
-   observability

### Production engineering

-   security
-   accessibility
-   performance
-   reliability
-   scalability
-   availability
-   disaster recovery
-   backups
-   monitoring
-   alerting
-   structured logging
-   tracing
-   CI/CD
-   release management
-   feature flags
-   infrastructure as code

### Terraform/AWS

-   Terraform modules
-   environments
-   remote state
-   state locking
-   IAM
-   VPC
-   public/private subnets
-   security groups
-   ECS/Fargate
-   ALB
-   ECR
-   RDS PostgreSQL
-   ElastiCache/Redis
-   S3
-   CloudFront
-   Route 53
-   ACM
-   Secrets Manager
-   CloudWatch
-   autoscaling
-   backups
-   deployment strategies
-   least privilege
-   Terraform testing
-   plan/apply workflow

------------------------------------------------------------------------

# 3. Product Definition

## 3.1 Core product

ForgeBoard is a multi-tenant work-management platform.

Users can:

-   register/login/logout;
-   use social login;
-   enable MFA;
-   belong to organizations;
-   have roles and permissions;
-   create projects;
-   create tasks;
-   assign tasks;
-   comment;
-   upload attachments;
-   use labels;
-   filter/search/sort;
-   receive notifications;
-   view activity/audit history;
-   view dashboards;
-   manage organization members;
-   manage API keys;
-   configure webhooks;
-   export data;
-   manage profile/settings.

## 3.2 Roles

Implement:

-   Owner
-   Admin
-   Manager
-   Member
-   Viewer

Authorization must be enforced server-side.

## 3.3 Main routes

``` text
/
├── marketing
│   ├── /features
│   ├── /pricing
│   ├── /docs
│   └── /blog
│
├── /login
├── /register
├── /forgot-password
├── /reset-password
├── /verify-email
├── /mfa
│
├── /app
│   ├── /dashboard
│   ├── /projects
│   │   ├── /new
│   │   └── /[projectId]
│   ├── /tasks
│   ├── /calendar
│   ├── /notifications
│   ├── /reports
│   └── /search
│
├── /settings
│   ├── /profile
│   ├── /security
│   ├── /members
│   ├── /roles
│   ├── /api-keys
│   ├── /webhooks
│   └── /billing
│
└── /api
    ├── /health
    ├── /ready
    ├── /v1/...
    └── /webhooks/...
```

------------------------------------------------------------------------

# 4. Target Architecture

``` text
                         ┌────────────────────┐
                         │     CloudFront     │
                         └─────────┬──────────┘
                                   │
                         ┌─────────▼──────────┐
                         │        ALB         │
                         └─────────┬──────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │       ECS Fargate            │
                    │      Next.js application     │
                    └───────┬──────────┬──────────┘
                            │          │
               ┌────────────▼───┐  ┌──▼─────────────┐
               │ RDS PostgreSQL │  │ Redis/Cache    │
               └────────────────┘  └────────────────┘
                            │
                    ┌───────▼────────┐
                    │       S3       │
                    │ attachments    │
                    └────────────────┘

 Supporting services:
 - ECR
 - Secrets Manager
 - CloudWatch Logs
 - CloudWatch Metrics/Alarms
 - Route 53
 - ACM
 - IAM
 - VPC
```

Use AWS because the goal is not merely to deploy Next.js, but to learn
production infrastructure and Terraform.

------------------------------------------------------------------------

# 5. Repository Structure

Target structure:

``` text
forgeboard/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (app)/
│   ├── api/
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── manifest.ts
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── data-table/
│   └── charts/
│
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── projects/
│   ├── tasks/
│   ├── comments/
│   ├── notifications/
│   ├── search/
│   ├── files/
│   └── audit/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── cache/
│   ├── validation/
│   ├── security/
│   ├── logging/
│   ├── telemetry/
│   ├── email/
│   ├── storage/
│   ├── queue/
│   └── utils/
│
├── types/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── terraform/
│   ├── modules/
│   │   ├── network/
│   │   ├── security/
│   │   ├── database/
│   │   ├── cache/
│   │   ├── storage/
│   │   ├── compute/
│   │   ├── cdn/
│   │   ├── dns/
│   │   ├── observability/
│   │   └── iam/
│   │
│   └── environments/
│       ├── dev/
│       ├── staging/
│       └── prod/
│
├── .github/
│   └── workflows/
│
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── runbooks/
│   ├── security/
│   └── api/
│
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── package.json
└── README.md
```

The agent may refine this structure if a better architecture is
justified, but should document the reason.

------------------------------------------------------------------------

# 6. Technology Baseline

Use:

-   Next.js 16.x Active LTS
-   React version required by selected Next.js release
-   TypeScript strict mode
-   Node.js version required by selected Next.js release
-   pnpm
-   PostgreSQL
-   Prisma
-   Redis
-   Zod
-   Auth.js / NextAuth-compatible current release
-   Tailwind CSS
-   accessible UI primitives
-   Vitest or Jest for unit tests
-   React Testing Library
-   Playwright for E2E
-   MSW for external API mocking where useful
-   Pino-compatible structured logging or equivalent
-   OpenTelemetry
-   Docker
-   GitHub Actions
-   Terraform
-   AWS

Avoid adding libraries merely because they are popular. Every dependency
must have a purpose.

------------------------------------------------------------------------

# 7. Phase Plan

# Phase 0 --- Requirements, Architecture and Agent Contract

## Goals

Create the project specification before writing application code.

## Deliverables

Create:

``` text
README.md
docs/architecture/system-overview.md
docs/architecture/decisions.md
docs/adr/0001-architecture.md
docs/security/threat-model.md
docs/runbooks/local-development.md
```

Define:

-   functional requirements;
-   non-functional requirements;
-   architecture;
-   environments;
-   security model;
-   data model;
-   deployment model;
-   testing strategy;
-   observability strategy;
-   disaster-recovery assumptions.

## Gate

Do not begin Phase 1 until the architecture is documented.

------------------------------------------------------------------------

# Phase 1 --- Repository and Developer Experience

## Goals

Create a clean, production-oriented TypeScript/Next.js foundation.

## Implement

-   Next.js App Router
-   TypeScript strict mode
-   pnpm
-   ESLint
-   formatting
-   pre-commit hooks
-   commit conventions
-   environment variable validation
-   path aliases
-   typed configuration
-   basic UI system
-   error handling foundation
-   README
-   `.gitignore`
-   `.env.example`

## Scripts

Provide:

``` bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm format
pnpm format:check
```

## Gate

A clean clone must be able to install, lint, typecheck, test, and build.

------------------------------------------------------------------------

# Phase 2 --- Next.js Routing and Rendering Laboratory

Build a dedicated `/lab` area specifically to demonstrate Next.js
capabilities.

Implement examples for:

-   nested layouts;
-   route groups;
-   dynamic routes;
-   catch-all routes;
-   optional catch-all routes;
-   loading UI;
-   error UI;
-   not-found;
-   redirects;
-   parallel routes;
-   intercepted routes;
-   search params;
-   cookies;
-   headers;
-   static rendering;
-   dynamic rendering;
-   Suspense;
-   streaming.

Document each example.

## Learning requirement

Every example must explain:

``` text
What it does
Why it exists
When to use it
When not to use it
Server vs Client behavior
Caching implications
```

------------------------------------------------------------------------

# Phase 3 --- Database and Domain Model

Implement PostgreSQL + Prisma.

## Core entities

``` text
User
Organization
OrganizationMember
Role
Permission
Project
Task
TaskLabel
Comment
Attachment
Notification
AuditLog
ApiKey
Webhook
Session
VerificationToken
PasswordResetToken
```

## Requirements

-   migrations;
-   seed data;
-   indexes;
-   foreign keys;
-   unique constraints;
-   soft deletion where justified;
-   timestamps;
-   transaction boundaries;
-   tenant isolation;
-   pagination;
-   optimistic concurrency where appropriate.

## Database rules

Never query tenant-owned data without tenant context.

Create reusable server-side helpers such as:

``` ts
getCurrentUser()
getCurrentOrganization()
assertPermission()
```

Do not make these client-side checks.

------------------------------------------------------------------------

# Phase 4 --- Authentication, Sessions and Authorization

Implement:

-   registration;
-   login;
-   logout;
-   password hashing;
-   email verification;
-   password reset;
-   OAuth/social login;
-   session management;
-   session expiry;
-   MFA/TOTP;
-   recovery codes;
-   account lock/rate protection;
-   Proxy-based request protection where appropriate;
-   server-side authorization;
-   RBAC;
-   organization membership.

## Security requirements

-   secure cookies;
-   HttpOnly;
-   SameSite;
-   Secure in production;
-   CSRF considerations;
-   brute-force protection;
-   password policy;
-   no password logging;
-   no tokens in URLs unless unavoidable and short-lived;
-   authorization must be checked at the data/action/API boundary.

------------------------------------------------------------------------

# Phase 5 --- Core CRUD with Server Components and Server Actions

Implement:

-   projects;
-   tasks;
-   comments;
-   labels;
-   assignments.

Use Server Components for read-heavy pages.

Use Server Actions/Server Functions for mutations where appropriate.

Every mutation must:

1.  authenticate;
2.  authorize;
3.  validate input;
4.  execute a safe transaction;
5.  invalidate/revalidate affected data;
6.  return typed success/error state;
7.  write an audit record where appropriate.

Use `useActionState` or the current React/Next.js equivalent for robust
form state.

------------------------------------------------------------------------

# Phase 6 --- Advanced Routing, Streaming and UX

Implement:

-   dashboard layout;
-   project layout;
-   task detail;
-   modal task detail through intercepted routes;
-   parallel dashboard panels;
-   loading skeletons;
-   streaming;
-   optimistic UI;
-   pending states;
-   error boundaries;
-   retry behavior.

Demonstrate a case where:

``` text
Fast shell
   ↓
Immediate navigation
   ↓
Streaming data
   ↓
Slow component
```

Use the current Next.js navigation/caching model rather than reproducing
obsolete patterns.

------------------------------------------------------------------------

# Phase 7 --- Caching and Data-Fetching Laboratory

Create `/lab/caching`.

Demonstrate and document:

-   request memoization where applicable;
-   React cache patterns;
-   Next.js server caching;
-   Cache Components / `use cache` where supported by the selected
    release;
-   time-based revalidation;
-   tag-based invalidation;
-   path-based invalidation;
-   dynamic request data;
-   cache boundaries;
-   stale data trade-offs;
-   cache invalidation after mutation.

Build an actual dashboard using multiple strategies.

For every cached resource document:

``` text
Owner
TTL
Invalidation trigger
Consistency requirement
Failure behavior
Cost implication
```

------------------------------------------------------------------------

# Phase 8 --- Search, Pagination and Data Tables

Implement production-grade task/project search.

Requirements:

-   URL-driven filters;
-   sorting;
-   pagination;
-   cursor pagination where useful;
-   debounced search;
-   database indexes;
-   full-text search where justified;
-   accessible table;
-   empty states;
-   loading states;
-   error states.

URL should be shareable:

``` text
/app/tasks?status=open&assignee=123&sort=priority&page=2
```

No important filter state should exist only inside React component
state.

------------------------------------------------------------------------

# Phase 9 --- File Uploads and Object Storage

Implement attachment support.

Architecture:

``` text
Browser
  ↓
Request signed upload URL
  ↓
Next.js server
  ↓
S3 pre-signed URL
  ↓
S3
```

Requirements:

-   MIME validation;
-   size limits;
-   filename sanitization;
-   random object keys;
-   virus-scanning integration point;
-   private bucket;
-   signed download URLs;
-   lifecycle policy;
-   audit trail;
-   orphan cleanup strategy.

Never proxy large files unnecessarily through the Next.js server.

------------------------------------------------------------------------

# Phase 10 --- APIs and Integrations

Build versioned Route Handlers:

``` text
/api/v1/projects
/api/v1/projects/:id
/api/v1/tasks
/api/v1/tasks/:id
/api/v1/search
/api/v1/webhooks
```

Requirements:

-   request validation;
-   response schemas;
-   consistent error format;
-   authentication;
-   authorization;
-   rate limiting;
-   idempotency;
-   pagination;
-   request IDs;
-   API versioning;
-   OpenAPI documentation.

Example error:

``` json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task was not found.",
    "requestId": "..."
  }
}
```

Never return internal stack traces in production.

------------------------------------------------------------------------

# Phase 11 --- Background Jobs and Reliability

Introduce a queue.

Use Redis-backed jobs or an AWS-managed equivalent.

Jobs:

``` text
sendWelcomeEmail
sendNotification
processAttachment
generateReport
cleanupExpiredTokens
cleanupOrphanedFiles
deliverWebhook
```

Implement:

-   retries;
-   exponential backoff;
-   dead-letter handling;
-   idempotency;
-   job status;
-   structured logs;
-   failure alerts.

The web request must not wait for slow/non-critical work.

------------------------------------------------------------------------

# Phase 12 --- Notifications, Webhooks and Audit Logging

Implement:

## Notifications

-   in-app;
-   email;
-   read/unread;
-   notification preferences.

## Webhooks

-   endpoint registration;
-   secret signing;
-   event types;
-   retries;
-   exponential backoff;
-   delivery logs;
-   replay support.

## Audit

Record:

``` text
actor
organization
action
entity
entityId
timestamp
requestId
metadata
IP information where appropriate
```

Audit logs must be append-oriented and protected from ordinary users.

------------------------------------------------------------------------

# Phase 13 --- Performance Engineering

Measure before optimizing.

Implement:

-   bundle analysis;
-   dynamic imports;
-   image optimization;
-   font optimization;
-   route prefetching;
-   caching;
-   streaming;
-   database indexes;
-   query profiling;
-   N+1 prevention;
-   pagination;
-   CDN strategy.

Define budgets:

``` text
Initial JS budget
Largest contentful paint target
API p95 target
Database query p95 target
Error rate target
```

Create a performance document with before/after measurements.

------------------------------------------------------------------------

# Phase 14 --- Security Hardening

Perform a threat-model-driven security pass.

## Implement/check

-   CSP;
-   security headers;
-   XSS defenses;
-   CSRF protections;
-   SSRF considerations;
-   SQL injection prevention;
-   authorization bypass testing;
-   tenant isolation testing;
-   rate limiting;
-   brute-force protection;
-   secure cookies;
-   secret management;
-   dependency scanning;
-   audit logging;
-   safe error messages;
-   file-upload security;
-   webhook signature validation;
-   replay protection;
-   API abuse controls.

Create:

``` text
docs/security/security-checklist.md
docs/security/threat-model.md
```

Add negative security tests.

------------------------------------------------------------------------

# Phase 15 --- Accessibility

Target WCAG 2.2 AA principles.

Test:

-   keyboard navigation;
-   focus management;
-   focus trapping in modals;
-   semantic HTML;
-   screen-reader labels;
-   form errors;
-   live regions;
-   color contrast;
-   reduced motion;
-   responsive behavior.

Use automated accessibility tests plus manual keyboard testing.

------------------------------------------------------------------------

# Phase 16 --- Testing Strategy

Implement all levels.

## Unit

Test:

-   validation;
-   authorization rules;
-   domain functions;
-   parsers;
-   utility functions.

## Integration

Test:

-   database operations;
-   transactions;
-   Server Actions;
-   Route Handlers;
-   authentication;
-   authorization;
-   tenant isolation.

## E2E

Use Playwright.

Critical flows:

``` text
registration
login
logout
password reset
MFA
create organization
invite member
create project
create task
edit task
comment
upload attachment
search
filter
notifications
permission denial
```

## Required CI quality gate

``` text
lint
typecheck
unit
integration
e2e
build
dependency/security scan
```

------------------------------------------------------------------------

# Phase 17 --- Observability

Implement:

## Logging

Structured JSON logs:

``` json
{
  "level": "info",
  "timestamp": "...",
  "requestId": "...",
  "userId": "...",
  "organizationId": "...",
  "route": "/api/v1/tasks",
  "durationMs": 42
}
```

Never log:

-   passwords;
-   session tokens;
-   API secrets;
-   sensitive request bodies.

## Metrics

Track:

-   request count;
-   latency;
-   error rate;
-   database latency;
-   queue depth;
-   job failures;
-   cache hit/miss;
-   authentication failures.

## Tracing

Use OpenTelemetry where supported.

Trace:

``` text
HTTP request
 → Server Component / Route Handler
 → database
 → cache
 → external API
```

------------------------------------------------------------------------

# Phase 18 --- Next.js Production Features

Create a `/lab/next-features` section demonstrating production-relevant
features.

Cover as applicable to the selected Next.js release:

-   Metadata API;
-   dynamic metadata;
-   sitemap;
-   robots;
-   manifest;
-   OG images;
-   `next/image`;
-   `next/font`;
-   typed routes;
-   instrumentation;
-   client instrumentation;
-   Proxy;
-   Route Handlers;
-   Server Actions/Functions;
-   streaming;
-   Suspense;
-   cache APIs;
-   revalidation;
-   request APIs;
-   error boundaries;
-   `after`/post-response work if applicable;
-   custom 404/500 behavior;
-   production runtime configuration;
-   self-hosting;
-   Docker;
-   health checks;
-   graceful shutdown.

Do not force experimental features into the production path.
Experimental APIs may be placed in `/lab/experimental`.

------------------------------------------------------------------------

# Phase 19 --- Docker and Local Production Environment

Create a production Docker image.

Requirements:

-   multi-stage build;
-   minimal runtime image;
-   non-root user;
-   healthcheck;
-   environment configuration;
-   no secrets baked into image;
-   deterministic dependency installation;
-   production-only dependencies where appropriate.

Create:

``` text
docker-compose.yml
```

with:

``` text
Next.js
PostgreSQL
Redis
```

Local production smoke test:

``` bash
docker compose up
curl /api/health
curl /api/ready
```

------------------------------------------------------------------------

# Phase 20 --- Terraform Foundation

Create Terraform structure:

``` text
terraform/
├── modules/
│   ├── network/
│   ├── iam/
│   ├── database/
│   ├── cache/
│   ├── storage/
│   ├── compute/
│   ├── cdn/
│   ├── dns/
│   └── observability/
│
└── environments/
    ├── dev/
    ├── staging/
    └── prod/
```

Rules:

-   pin Terraform version;
-   pin provider versions;
-   use modules;
-   use meaningful variables;
-   validate variables;
-   use outputs;
-   tag AWS resources;
-   document modules;
-   avoid giant `main.tf`;
-   separate environment state;
-   never commit state.

Terraform's official guidance recommends modules for
organizing/encapsulating complex infrastructure, and recommends
separating environment configuration/state when environments differ.
Remote state is preferred for team collaboration, with state locking
where supported.

------------------------------------------------------------------------

# Phase 21 --- AWS Networking

Provision:

-   VPC;
-   availability zones;
-   public subnets;
-   private application subnets;
-   private database subnets;
-   route tables;
-   NAT strategy;
-   internet gateway;
-   security groups;
-   network ACLs only where justified.

Desired topology:

``` text
Internet
   ↓
CloudFront / ALB
   ↓
Private ECS services
   ↓
Private RDS / Redis
```

Database must not be publicly reachable.

------------------------------------------------------------------------

# Phase 22 --- AWS Data Layer

Provision:

## RDS PostgreSQL

-   private subnet;
-   encryption;
-   backups;
-   deletion protection in production;
-   monitoring;
-   parameter configuration;
-   maintenance window;
-   backup window.

## Redis

Use managed Redis-compatible service where justified.

Configure:

-   encryption;
-   private networking;
-   authentication;
-   monitoring.

## S3

Buckets:

``` text
attachments
backups/export
```

Requirements:

-   block public access;
-   encryption;
-   lifecycle rules;
-   versioning where useful;
-   least-privilege IAM.

------------------------------------------------------------------------

# Phase 23 --- AWS Compute and Deployment

Provision:

-   ECR;
-   ECS cluster;
-   ECS/Fargate service;
-   task definition;
-   IAM task role;
-   execution role;
-   ALB;
-   target group;
-   health checks;
-   autoscaling.

Container flow:

``` text
GitHub Actions
      ↓
Docker build
      ↓
ECR
      ↓
ECS deployment
      ↓
ALB
      ↓
Next.js
```

------------------------------------------------------------------------

# Phase 24 --- CDN, DNS, TLS and Security

Provision:

-   Route 53;
-   ACM certificate;
-   CloudFront where appropriate;
-   HTTPS;
-   redirect HTTP → HTTPS;
-   security headers;
-   origin protection;
-   cache policy.

Document which content is:

``` text
browser cached
CDN cached
Next.js cached
database-backed
real-time
```

------------------------------------------------------------------------

# Phase 25 --- Secrets and Configuration

Use AWS Secrets Manager or an equivalent managed secret system.

Secrets include:

``` text
DATABASE_URL
AUTH_SECRET
OAuth secrets
SMTP/API credentials
Webhook secrets
Redis credentials
```

Rules:

-   no secrets in Git;
-   no secrets in Docker images;
-   no secrets in Terraform variables committed to source;
-   no secret values in logs;
-   use least privilege;
-   rotate where practical.

Remember that sensitive values referenced by Terraform can still end up
in Terraform state; design the secret-management boundary accordingly.

------------------------------------------------------------------------

# Phase 26 --- Terraform CI/CD

Create GitHub Actions workflows:

``` text
ci.yml
terraform-plan.yml
terraform-apply-dev.yml
deploy-staging.yml
deploy-production.yml
```

## Pull request

Run:

``` text
terraform fmt -check
terraform validate
terraform test
terraform plan
application tests
```

## Production

Use an approval-controlled workflow:

``` text
PR
 ↓
review
 ↓
merge
 ↓
build image
 ↓
deploy staging
 ↓
smoke tests
 ↓
approval
 ↓
production deployment
```

Never automatically destroy production infrastructure.

Terraform's plan/apply workflow is specifically designed to preview
infrastructure changes and make automated application consistent with an
approved plan.

------------------------------------------------------------------------

# Phase 27 --- Release Engineering

Implement:

-   semantic versioning;
-   changelog;
-   release tags;
-   migration strategy;
-   rollback procedure;
-   deployment health checks;
-   feature flags;
-   backward-compatible database migrations.

Deployment should follow:

``` text
Build
 ↓
Test
 ↓
Security scan
 ↓
Push image
 ↓
Deploy staging
 ↓
Smoke test
 ↓
Approval
 ↓
Deploy production
 ↓
Verify
```

------------------------------------------------------------------------

# Phase 28 --- Reliability and Disaster Recovery

Document and test:

## Backup

-   PostgreSQL backups;
-   S3 versioning/lifecycle;
-   infrastructure recovery.

## Recovery

Define:

``` text
RPO
RTO
```

Create runbooks:

``` text
docs/runbooks/database-recovery.md
docs/runbooks/application-rollback.md
docs/runbooks/incident-response.md
docs/runbooks/high-error-rate.md
docs/runbooks/queue-failure.md
```

Run at least one simulated recovery exercise.

------------------------------------------------------------------------

# Phase 29 --- Production Readiness Review

Create a checklist covering:

## Application

-   [ ] no TypeScript errors
-   [ ] no lint errors
-   [ ] tests passing
-   [ ] production build passing
-   [ ] accessibility reviewed
-   [ ] security reviewed
-   [ ] performance budgets measured

## Database

-   [ ] migrations tested
-   [ ] indexes reviewed
-   [ ] backup configured
-   [ ] restore tested
-   [ ] connection pooling reviewed

## Infrastructure

-   [ ] Terraform validated
-   [ ] state remote
-   [ ] state locking enabled where supported
-   [ ] least privilege IAM
-   [ ] private database
-   [ ] encryption enabled
-   [ ] HTTPS enabled
-   [ ] monitoring configured

## Operations

-   [ ] health endpoint
-   [ ] readiness endpoint
-   [ ] logs
-   [ ] metrics
-   [ ] traces
-   [ ] alerts
-   [ ] rollback procedure
-   [ ] incident runbooks

------------------------------------------------------------------------

# 8. Required Next.js Feature Matrix

The agent must maintain:

``` text
docs/next-feature-matrix.md
```

Use this structure:

  Feature                   Implemented Location   Production Use   Notes
  ----------------------- ------------- ---------- ---------------- -------
  App Router                                                        
  Layouts                                                           
  Route Groups                                                      
  Dynamic Routes                                                    
  Catch-all Routes                                                  
  Parallel Routes                                                   
  Intercepted Routes                                                
  Server Components                                                 
  Client Components                                                 
  Suspense                                                          
  Streaming                                                         
  Server Actions                                                    
  Route Handlers                                                    
  Proxy                                                             
  Caching                                                           
  Revalidation                                                      
  Metadata                                                          
  OG Images                                                         
  Image Optimization                                                
  Font Optimization                                                 
  Typed Routes                                                      
  Instrumentation                                                   
  OpenTelemetry                                                     
  Error Boundaries                                                  
  notFound                                                          
  Loading UI                                                        
  Redirects                                                         
  Cookies                                                           
  Headers                                                           
  Environment Variables                                             
  Docker/Self Hosting                                               

For every feature, distinguish:

``` text
Implemented for production
Implemented as learning lab
Not applicable
Experimental only
```

------------------------------------------------------------------------

# 9. Required TypeScript Standards

`tsconfig.json` must use strict checking.

Prefer:

``` ts
unknown
```

over:

``` ts
any
```

Use discriminated unions for typed outcomes:

``` ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };
```

Use domain types:

``` ts
type OrganizationId = string & {
  readonly __brand: "OrganizationId";
};
```

Use schema validation at boundaries:

``` ts
const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
});
```

Do not assume TypeScript validates runtime input.

------------------------------------------------------------------------

# 10. Database Standards

Every query must answer:

``` text
Which tenant?
Which authorization rule?
Which index?
What is the expected cardinality?
What happens at 10x data?
```

Avoid:

``` text
SELECT *
```

when a narrower projection is sufficient.

Every important query should be examined with realistic data volume.

------------------------------------------------------------------------

# 11. API Standards

All APIs must have:

``` text
Authentication
Authorization
Validation
Rate limiting
Request ID
Structured errors
Logging
Metrics
Documentation
```

Use consistent HTTP semantics.

Examples:

``` text
400 invalid input
401 unauthenticated
403 unauthorized
404 resource not found
409 conflict
422 semantic validation error where appropriate
429 rate limited
500 unexpected server error
503 dependency unavailable
```

------------------------------------------------------------------------

# 12. Error Handling Standards

Implement:

``` text
app/error.tsx
app/global-error.tsx
app/not-found.tsx
```

Errors must be:

-   user-friendly;
-   observable;
-   traceable;
-   safe;
-   actionable.

Production responses must not leak:

-   stack traces;
-   SQL;
-   credentials;
-   internal file paths;
-   provider secrets.

------------------------------------------------------------------------

# 13. Environment Strategy

Use:

``` text
local
dev
staging
production
```

Each environment must have:

-   separate configuration;
-   separate database;
-   separate secrets;
-   separate infrastructure state;
-   separate observability boundaries.

Never point local development at production resources.

------------------------------------------------------------------------

# 14. Definition of Done

A phase is complete only when:

``` text
[ ] Feature implemented
[ ] TypeScript passes
[ ] Lint passes
[ ] Tests pass
[ ] Build passes
[ ] Security reviewed
[ ] Performance impact considered
[ ] Documentation updated
[ ] No secrets committed
[ ] Migration added if needed
[ ] ADR added if architecture changed
[ ] README updated where appropriate
```

------------------------------------------------------------------------

# 15. Final Acceptance Criteria

The finished system must:

1.  Run locally with Docker.
2.  Run all automated tests.
3.  Build successfully in production mode.
4.  Support authenticated multi-tenant usage.
5.  Enforce RBAC server-side.
6.  Demonstrate major Next.js App Router capabilities.
7.  Use Server Components by default.
8.  Use Client Components intentionally.
9.  Demonstrate streaming and Suspense.
10. Demonstrate caching and invalidation.
11. Provide Server Actions/Functions.
12. Provide versioned Route Handlers.
13. Provide secure file uploads.
14. Provide background jobs.
15. Provide notifications.
16. Provide webhooks.
17. Provide audit logs.
18. Provide structured logging.
19. Provide metrics.
20. Provide tracing.
21. Pass accessibility checks.
22. Pass security tests.
23. Have Docker production images.
24. Have Terraform-managed infrastructure.
25. Have dev/staging/prod separation.
26. Have remote Terraform state and locking where supported.
27. Have CI/CD.
28. Have staging smoke tests.
29. Have controlled production deployment.
30. Have rollback documentation.
31. Have database backup/recovery documentation.
32. Have operational runbooks.

------------------------------------------------------------------------

# 16. Suggested Commit Strategy

Use small, meaningful commits:

``` text
chore: initialize nextjs application
chore: configure strict typescript
feat: add application shell
feat: add organization domain model
feat: add authentication
feat: add rbac authorization
feat: add project management
feat: add task management
feat: add server action validation
feat: add task search
feat: add file uploads
feat: add background jobs
feat: add audit logging
feat: add observability
feat: add production docker image
feat: add terraform network module
feat: add terraform database module
feat: add ecs deployment
ci: add application pipeline
ci: add terraform plan pipeline
ci: add production deployment workflow
docs: add production runbooks
```

------------------------------------------------------------------------

# 17. What the Agent Must NOT Do

Do not:

-   build everything in one pass;
-   create a giant monolithic file;
-   put all logic in `page.tsx`;
-   turn every component into a Client Component;
-   expose database access to the browser;
-   trust client-side authorization;
-   store secrets in source control;
-   commit Terraform state;
-   use production credentials locally;
-   skip migrations;
-   ignore database indexes;
-   use unbounded queries;
-   upload large files through the application server without
    justification;
-   swallow exceptions;
-   use `console.log` for production observability;
-   disable security checks to make tests pass;
-   disable TypeScript strictness;
-   add dependencies without documenting why;
-   use experimental Next.js APIs in the critical production path
    without an ADR;
-   create unnecessary microservices.

------------------------------------------------------------------------

# 18. Learning Mode Requirement

Because this project is intended as a learning system, the agent must
add concise educational notes beside difficult architectural decisions.

Example:

``` text
docs/learning/
├── server-vs-client-components.md
├── nextjs-caching.md
├── server-actions.md
├── route-handlers.md
├── authentication-vs-authorization.md
├── tenant-isolation.md
├── postgres-indexing.md
├── redis-and-background-jobs.md
├── observability.md
├── docker-production.md
├── terraform-state.md
├── terraform-modules.md
└── aws-architecture.md
```

Each document should include:

``` text
Concept
Why it matters
How ForgeBoard implements it
Common mistakes
Production considerations
Interview questions
```

------------------------------------------------------------------------

# 19. Final Architecture Review Questions

Before declaring the project complete, the agent must answer these
questions in:

``` text
docs/architecture/final-review.md
```

1.  Why are most components Server Components?
2.  Where are Client Components required?
3.  How does caching work?
4.  How is cache invalidated?
5.  How is tenant isolation guaranteed?
6.  Where is authorization enforced?
7.  How are Server Actions secured?
8.  When should Route Handlers be used?
9.  Why is Proxy used?
10. How does authentication work?
11. How does MFA work?
12. How are sessions protected?
13. How are uploads secured?
14. How are background jobs made idempotent?
15. How are webhooks authenticated?
16. How is rate limiting implemented?
17. How are database connections managed?
18. What indexes exist and why?
19. How does the application scale horizontally?
20. What happens when Redis is unavailable?
21. What happens when PostgreSQL is unavailable?
22. What happens when an external API is slow?
23. How are errors observed?
24. How are traces correlated with request IDs?
25. How does the deployment roll back?
26. How does Terraform state remain safe?
27. Why are environments separated?
28. How are secrets managed?
29. What is the RPO?
30. What is the RTO?
31. What are the application's primary performance bottlenecks?
32. What are the highest-risk security boundaries?
33. Which Next.js features are production-critical?
34. Which Next.js features are learning-only?
35. Which parts should eventually become separate services, if any?

------------------------------------------------------------------------

# 20. Recommended Build Order Summary

``` text
Phase 0   Architecture
   ↓
Phase 1   Developer Experience
   ↓
Phase 2   Next.js Routing/Rendering Lab
   ↓
Phase 3   PostgreSQL + Prisma
   ↓
Phase 4   Auth + RBAC
   ↓
Phase 5   CRUD + Server Actions
   ↓
Phase 6   Streaming + Advanced Routing
   ↓
Phase 7   Caching
   ↓
Phase 8   Search + Pagination
   ↓
Phase 9   S3 Uploads
   ↓
Phase 10  APIs
   ↓
Phase 11  Background Jobs
   ↓
Phase 12  Notifications/Webhooks/Audit
   ↓
Phase 13  Performance
   ↓
Phase 14  Security
   ↓
Phase 15  Accessibility
   ↓
Phase 16  Testing
   ↓
Phase 17  Observability
   ↓
Phase 18  Next.js Feature Laboratory
   ↓
Phase 19  Docker
   ↓
Phase 20  Terraform Foundation
   ↓
Phase 21  AWS Networking
   ↓
Phase 22  AWS Data
   ↓
Phase 23  ECS/Fargate
   ↓
Phase 24  CDN/DNS/TLS
   ↓
Phase 25  Secrets
   ↓
Phase 26  Terraform CI/CD
   ↓
Phase 27  Release Engineering
   ↓
Phase 28  Disaster Recovery
   ↓
Phase 29  Production Readiness
```

------------------------------------------------------------------------

# 21. Primary Reference Documentation

The coding agent must prefer official documentation for
version-sensitive implementation decisions.

-   Next.js documentation: https://nextjs.org/docs
-   Next.js Learn: https://nextjs.org/learn
-   Next.js release information: https://nextjs.org/blog
-   Terraform documentation:
    https://developer.hashicorp.com/terraform/docs
-   Terraform state:
    https://developer.hashicorp.com/terraform/language/state
-   Terraform modules:
    https://developer.hashicorp.com/terraform/tutorials/modules/module
-   Terraform style/recommended practices:
    https://developer.hashicorp.com/terraform/language/style

Important: documentation URLs above are references for the coding agent.
When implementation begins, verify current versions and APIs against
official documentation rather than blindly copying examples from older
releases.

------------------------------------------------------------------------

# 22. Success Definition

This project is successful when it is not merely a functioning CRUD
application.

It should feel like a **small production SaaS platform** and
simultaneously act as a **Next.js + TypeScript + AWS + Terraform
learning laboratory**.

The final repository should allow a senior frontend/full-stack engineer
to explain:

``` text
How Next.js renders
How React Server Components work
How caching works
How mutations work
How authentication works
How authorization works
How data is isolated per tenant
How APIs are designed
How files are stored
How jobs are processed
How failures are handled
How the system is observed
How the application scales
How AWS infrastructure is provisioned
How Terraform state is managed
How CI/CD promotes releases
How production incidents are handled
```

The agent should optimize for **production correctness, security,
maintainability, observability, and learning value**, not for the
shortest implementation.
