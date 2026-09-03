# Phase 17 — Metrics + Tracing + Observability

## What is implemented

### OpenTelemetry SDK (`lib/telemetry/index.ts`)
- `initTelemetry()` starts the SDK once at boot
- OTLP HTTP exporter for traces and metrics
- Auto-instrumentations: `http`, `express`, `pg` (Postgres), `redis-4`
- Custom `withSpan()` wrapper that attaches `request.id` to every span
- 9 pre-defined counters (`http.requests`, `auth.failures`, `db.queries`, `jobs.*`, `webhooks.*`, `errors`)
- 3 pre-defined histograms (`http.request.duration`, `db.query.duration`, `job.duration`)
- 2 pre-defined up-down counters (`http.active_requests`, `queue.depth`)

### Request-scoped context (`lib/telemetry/request-context.ts`)
- `AsyncLocalStorage<RequestContext>` — no manual threading needed
- `withRequestId()`, `getRequestContext()`, `getRequestId()`
- `buildRequestContext()` called once per HTTP request

### Structured logger (`lib/telemetry/logger.ts`)
- Pino with pretty-print for dev, JSON for prod
- Auto-redacts: `password`, `token`, `secret`, `cookie`, `authorization`, `apiKey`
- `mixin()` injects `requestId`, `userId`, `organizationId` into every line
- `withTraceCorrelation()` attaches `traceId`/`spanId` for trace-to-log jump
- `createLogger(component)` for service-level child loggers

### Metrics (`forgeMetrics` in `lib/telemetry/index.ts`)
Every key metric is a typed reference so calling code never constructs raw metric names:

```ts
import { forgeMetrics } from '@/lib/telemetry';

// Counter with labels
forgeMetrics.httpRequests.add(1, { method: 'GET', path: '/projects' });

// Histogram
forgeMetrics.httpRequestDuration.record(0.042, { path: '/projects' });
```

### Metrics to collect in production

| Metric | Type | Labels | Purpose |
|---|---|---|---|
| `forge.http.requests` | Counter | method, status_code, path | Request rate |
| `forge.http.request.duration` | Histogram (s) | method, status_code, path | Latency (P50/P99) |
| `forge.http.active_requests` | UpDownCounter | — | Concurrent load |
| `forge.db.queries` | Counter | operation, model | Query rate |
| `forge.db.query.duration` | Histogram (s) | operation, model | Query latency |
| `forge.auth.failures` | Counter | — | Failed logins |
| `forge.jobs.enqueued` | Counter | job_type | Queue load |
| `forge.jobs.completed` | Counter | job_type | Success rate |
| `forge.jobs.failed` | Counter | job_type | Failure rate |
| `forge.webhooks.delivered` | Counter | event_type | Delivery rate |
| `forge.webhooks.failed` | Counter | event_type | Delivery failures |
| `forge.errors` | Counter | error_code | Error rate |

### Next steps (Phase 17+) not yet implemented
- [ ] Middleware that creates `RequestContext` for every incoming request
- [ ] DB query wrapper that records `recordDbQuery()` for every `db.*` call
- [ ] Job handler wrapper that records `recordJobDuration()` and `forgeMetrics.jobs.*`
- [ ] Health endpoint that exposes `metrics` endpoint (Prometheus format via OTLP or `prom-client`)
- [ ] Alerting rules (Prometheus Alertmanager or Datadog) for error-rate and latency thresholds
- [ ] Dashboard definition (Grafana JSON model) for `http.requests`, `db.query.duration`, `auth.failures`
