# Local Development Runbook

## Purpose

Bring up ForgeBoard locally for development with all supporting services.

## Prerequisites

- Node.js 20+ (see `.nvmrc`)
- pnpm 10+ (install via `npm i -g pnpm` or `corepack enable && corepack prepare pnpm@latest --activate`)
- Docker 24+ and Docker Compose
- Git
- An OpenSSL tool (for generating secrets)

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> forgeboard
cd forgeboard

# 2. Install dependencies
pnpm install

# 3. Copy and edit environment file
cp .env.example .env.local
# Edit .env.local — at minimum set AUTH_SECRET to a 32-byte random value:
#   openssl rand -base64 32

# 4. Start supporting services
docker compose up -d postgres redis

# 5. Wait for services to be healthy
docker compose ps

# 6. Run database migrations
pnpm prisma migrate dev

# 7. Seed the database (optional)
pnpm prisma db seed

# 8. Start the dev server
pnpm dev
```

Open <http://localhost:3000>.

## Common Tasks

### Run a single test file
```bash
pnpm test -- tests/unit/foo.test.ts
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Run Playwright e2e tests
```bash
pnpm test:e2e
```

### Reset the database
```bash
docker compose down -v postgres
docker compose up -d postgres
pnpm prisma migrate dev
pnpm prisma db seed
```

### Inspect the database
```bash
pnpm prisma studio
# Opens http://localhost:5555
```

### Tail application logs
```bash
docker compose logs -f app
```

## Troubleshooting

### Port already in use
- PostgreSQL: 5432
- Redis: 6379
- Next.js: 3000
- Prisma Studio: 5555

Stop the conflicting process or change the port in `.env.local`.

### `pnpm install` fails
- Check Node version: `node -v` (must be 20+)
- Clear pnpm store: `pnpm store prune`
- Remove `node_modules` and `pnpm-lock.yaml`, then re-run `pnpm install`

### Migrations fail
- Ensure PostgreSQL is healthy: `docker compose ps`
- Check `DATABASE_URL` in `.env.local`
- Reset with `pnpm prisma migrate reset`

### TypeScript errors
- Run `pnpm typecheck` to see all errors
- Ensure `@/*` path alias resolves (configured in `tsconfig.json`)

### Lint errors
- Run `pnpm lint` and address each finding
- Use `pnpm format` to auto-format

## IDE Setup

### VS Code (recommended)
Recommended extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- Playwright Test
- Error Lens

Settings already configured in `.vscode/settings.json`:
- Format on save (Prettier)
- ESLint fix on save
- TypeScript strict mode

## Workflow

1. Create a feature branch: `git checkout -b feat/<short-name>`
2. Make changes; commit with conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
3. Run quality gates locally:
   ```bash
   pnpm format
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
4. Open a pull request to `main`.
5. CI runs all checks. Production deploy requires approval.

## When Things Break

- Check `docs/runbooks/` for the specific runbook
- Tail logs: `docker compose logs -f`
- Reset: `docker compose down -v && pnpm install && pnpm prisma migrate dev`
- Ask for help in the project channel
