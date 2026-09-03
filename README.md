# ForgeBoard

> **Production-grade multi-tenant project/work-management SaaS** — built as a Next.js + TypeScript + AWS + Terraform learning laboratory.

[![Status](https://img.shields.io/badge/status-Phase%200-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![Terraform](https://img.shields.io/badge/Terraform-1.9+-purple)](https://www.terraform.io)

ForgeBoard is an intentionally complex full-stack application designed to teach the architecture, implementation, testing, security, observability, CI/CD, and infrastructure practices expected from a senior/lead engineer.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Start supporting services (PostgreSQL, Redis)
docker compose up -d postgres redis

# 4. Run database migrations
pnpm prisma migrate dev

# 5. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 What This Project Is

A **small production SaaS** that doubles as a **learning laboratory** for:

- **Next.js 16** App Router, Server Components, Server Actions, streaming, caching
- **TypeScript** strict mode, branded types, discriminated unions
- **PostgreSQL** multi-tenant schema with Prisma
- **Auth.js** + RBAC + MFA
- **S3** presigned uploads
- **Background jobs** with Redis
- **OpenTelemetry** tracing, structured logging
- **Docker** production image
- **Terraform** for AWS infra (VPC, RDS, ECS, ALB, S3, CloudFront)
- **GitHub Actions** CI/CD with approval-controlled deploys

---

## 🏗️ Architecture

```text
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
```

See [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md) for the full architecture document.

---

## 🧰 Tech Stack

| Layer            | Tool                                    |
| ---------------- | --------------------------------------- |
| Framework        | Next.js 16.3 (App Router, RSC)          |
| Language         | TypeScript 5.6 (strict)                 |
| Database         | PostgreSQL 16 + Prisma 6                |
| Cache / Jobs     | Redis 7                                 |
| Auth             | Auth.js (NextAuth) v5                   |
| Validation       | Zod                                     |
| Styling          | Tailwind CSS 3                          |
| Testing          | Vitest + Testing Library + Playwright   |
| Lint/Format      | ESLint 9 + Prettier 3                   |
| Logging          | Pino (structured JSON)                  |
| Tracing          | OpenTelemetry                           |
| Container        | Docker (multi-stage, non-root)          |
| IaC              | Terraform 1.9+                          |
| Cloud            | AWS (VPC, RDS, ECS, ALB, S3, CloudFront)|
| CI/CD            | GitHub Actions                          |

---

## 📂 Repository Layout

```
forgeboard/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public marketing pages
│   ├── (auth)/             # Authentication flows
│   ├── (app)/              # Authenticated app
│   ├── api/                # Route Handlers
│   └── lab/                # Learning laboratory
├── components/             # Shared UI primitives
├── features/               # Domain modules
│   ├── auth/
│   ├── organizations/
│   ├── projects/
│   ├── tasks/
│   └── ...
├── lib/                    # Cross-cutting libraries
│   ├── auth/               # Session/JWT helpers
│   ├── db/                 # Prisma client
│   ├── cache/              # Redis client
│   ├── validation/         # Zod schemas
│   └── ...
├── prisma/                 # Database schema + migrations
├── terraform/              # Infrastructure as code
│   ├── modules/
│   └── environments/
├── tests/                  # Unit, integration, e2e tests
├── docs/                   # Documentation
│   ├── architecture/
│   ├── adr/                # Architecture Decision Records
│   ├── runbooks/
│   └── learning/
└── .github/workflows/      # CI/CD pipelines
```

---

## 🚀 Development Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm typecheck    # TypeScript strict check
pnpm test         # Run unit + integration tests
pnpm test:e2e     # Run Playwright e2e tests
pnpm format       # Prettier write
pnpm format:check # Prettier check
```

---

## 📚 Documentation

- [System Architecture](docs/architecture/system-overview.md)
- [Architecture Decision Records](docs/adr/)
- [Threat Model](docs/security/threat-model.md)
- [Runbooks](docs/runbooks/local-development.md)
- [Next.js Feature Matrix](docs/next-feature-matrix.md)
- [Learning Notes](docs/learning/)

---

## 🗺️ Project Phases

This project follows a 30-phase implementation plan (see [plan.md](plan.md)):

| Phase | Topic                  | Status |
| ----- | ---------------------- | ------ |
| 0     | Architecture           | 🚧     |
| 1     | Developer Experience   | 🚧     |
| 2     | Routing Lab            | ⏳     |
| 3     | Database + Domain      | ⏳     |
| 4     | Auth + RBAC            | ⏳     |
| 5     | Core CRUD              | ⏳     |
| ...   | ...                    | ⏳     |
| 29    | Production Readiness   | ⏳     |

`🚧 In progress` · `⏳ Upcoming` · `✅ Complete`

---

## 🛡️ Security

ForgeBoard follows security-by-design principles. See [docs/security/threat-model.md](docs/security/threat-model.md) for the full threat model and [docs/security/security-checklist.md](docs/security/security-checklist.md) for the review checklist.

**Never commit secrets.** This repo's `.gitignore` blocks `.env`, `.env.local`, `*.tfstate`, `*.tfvars`, and credential files.

---

## 📄 License

MIT (or your preferred license)

---

## 🙏 Acknowledgments

Built as a learning project following the [Next.js 16 documentation](https://nextjs.org/docs), [Terraform best practices](https://developer.hashicorp.com/terraform/docs), and the [OWASP guidelines](https://owasp.org).
