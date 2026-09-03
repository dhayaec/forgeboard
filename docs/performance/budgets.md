# Performance Budgets

## Targets

| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| Initial JS bundle (per route) | < 100 KB gzipped | > 250 KB fails build |
| Total route JS (per page) | < 200 KB gzipped | > 400 KB fails build |
| Largest Contentful Paint (LCP) | < 2.5s p75 | > 4.0s alerts |
| Interaction to Next Paint (INP) | < 200ms p75 | > 500ms alerts |
| Cumulative Layout Shift (CLS) | < 0.1 | > 0.25 alerts |
| Time to First Byte (TTFB) | < 200ms p75 | > 800ms alerts |
| API p95 latency | < 300ms | > 1000ms alerts |
| Database query p95 | < 50ms | > 200ms alerts |
| Error rate (5xx) | < 0.1% | > 1% pages on-call |

## Bundle Analysis

Run:
```bash
ANALYZE=true pnpm build
```

Open `.next/analyze/client.html` to inspect bundle composition. Look for:
- Repeated large libraries
- Accidental `any` from a 3rd-party package
- Polyfills being shipped to modern browsers

## N+1 Prevention

Prisma relations are lazy. The team must:
- Use `include` or `select` to fetch related data in one query.
- Avoid loops that re-query.
- Use DataLoader for batched relation loading in route handlers.

## Streaming Strategy

- Page shells render immediately.
- Slow data is wrapped in `<Suspense>` with skeleton fallback.
- Use `loading.tsx` for the page-level shell.

## Caching Strategy

- Static (full route cache): `/`, `/login`, marketing pages
- Cached with revalidation: project lists, dashboards (revalidate 60s)
- Dynamic (per request): `/app/dashboard`, `/app/tasks`, `/api/v1/*`

## CDN Strategy

- CloudFront caches static assets and static pages.
- Dynamic routes use `Cache-Control: private, no-store`.
- API responses are never cached by CloudFront.
