# Phase 19 — Docker

## Files

- **Dockerfile** — multi-stage build (deps → builder → runner), non-root user, dumb-init, health check
- **docker-compose.yml** — web, postgres, redis, otel-collector, prometheus, adminer
- **.dockerignore** — slimmer context, faster builds
- **otel-collector-config.yaml** — receives OTLP, exports to Prometheus
- **prometheus.yml** — scrapes otel-collector + web app

## Build

```bash
docker build -t forgeboard:latest .
```

## Run locally (with full stack)

```bash
docker compose up --build
```

This brings up:
- Web: http://localhost:3000
- Adminer (DB UI): http://localhost:8080
- Prometheus: http://localhost:9090
- OpenTelemetry Collector: gRPC :4317, HTTP :4318

## Production deployment pattern

```bash
docker build -t <ecr-repo>/forgeboard:<sha> .
docker push <ecr-repo>/forgeboard:<sha>

# ECS Fargate / App Runner / Cloud Run — pass env from secrets manager
```

## Security hardening

- Non-root user (uid 1001)
- `dumb-init` to handle PID 1 signal forwarding
- `HEALTHCHECK` so the orchestrator knows when the app is ready
- Production-only env vars (no secrets baked into image)
- `NEXT_TELEMETRY_DISABLED=1` to opt out of Vercel's telemetry
- `.env.example` (not `.env`) is copied — real values injected at runtime

## Image size optimization

Multi-stage build with standalone Next.js output:
- Stage 1 (deps): ~600MB with full pnpm tree
- Stage 2 (builder): ~1.2GB during build, intermediate
- Stage 3 (runner): ~150MB final — includes only the standalone output + static assets

## Migration at deploy time

The `prisma/` folder is copied so we can run `npx prisma migrate deploy` as a one-off task or in the entrypoint. Current entrypoint is just `node server.js`; for production add a sidecar migration step (or use the Terraform-launched ECS task that runs `prisma migrate deploy` before the service).
