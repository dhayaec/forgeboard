# Next.js Feature Matrix

Tracks every Next.js feature we use, where, and its production status.

## Status Legend
- ✅ Implemented for production
- 🧪 Implemented as learning lab (`/lab`)
- 🚧 In progress
- ⏳ Not yet implemented
- ❌ Not applicable to this project
- ⚠️ Experimental

| Feature                       | Status     | Location                                       | Production Use | Notes                                      |
| ----------------------------- | ---------- | ---------------------------------------------- | -------------- | ------------------------------------------ |
| App Router                    | ✅         | `app/`                                         | Yes            | Default for all routes                     |
| Layouts (nested)              | ✅         | `app/(app)/layout.tsx`                         | Yes            | Per-section chrome                         |
| Route Groups                  | ✅         | `app/(marketing)`, `app/(auth)`, `app/(app)`   | Yes            | URL-independent grouping                   |
| Dynamic Routes                | ✅         | `app/(app)/projects/[projectId]/page.tsx`      | Yes            | Tasks, projects, etc.                      |
| Catch-all Routes              | ✅         | `app/api/[...path]/route.ts`                   | Yes            | Webhook fan-in                             |
| Optional Catch-all            | 🧪        | `app/lab/catch-all/[[...slug]]/page.tsx`       | No             | Learning example                           |
| Parallel Routes               | 🧪        | `app/lab/parallel/@a/@b/page.tsx`              | No             | Will use in dashboard in Phase 6           |
| Intercepted Routes            | 🧪        | `app/lab/intercepted/...`                      | No             | Modal task detail in Phase 6               |
| Server Components (RSC)       | ✅         | Default across app/                            | Yes            | Reduces client JS                          |
| Client Components             | ✅         | Used sparingly with `"use client"`             | Yes            | Forms, interactive UI                      |
| Suspense                      | ✅         | `loading.tsx`, `<Suspense>` boundaries          | Yes            | Streaming                                 |
| Streaming                     | ✅         | Server Components returning promises           | Yes            | Fast shell + slow data                    |
| Server Actions / Functions    | ✅         | Mutations in `features/*/actions.ts`           | Yes            | Form submissions, mutations                |
| Route Handlers                | ✅         | `app/api/v1/*`, `app/api/health`, `app/api/ready` | Yes         | Public API                                 |
| Proxy (middleware)            | ✅         | `proxy.ts`                                     | Yes            | Auth, rate limiting, headers               |
| Caching                       | ✅         | `unstable_cache` / `use cache`                 | Yes            | Multiple strategies in `/lab/caching`      |
| `use cache` / Cache Components| 🧪        | `app/lab/caching/use-cache/page.tsx`           | No             | Cache Components when available            |
| Revalidation                  | ✅         | `revalidateTag` / `revalidatePath`             | Yes            | After mutations                            |
| `updateTag`                   | 🧪        | Lab only                                       | No             | When supported in stable release           |
| Metadata API                  | ✅         | `app/layout.tsx`, per-page `metadata`          | Yes            | Title, description, OG                     |
| Dynamic Metadata              | ✅         | `generateMetadata`                             | Yes            | Project / task pages                       |
| Sitemap                       | ✅         | `app/sitemap.ts`                               | Yes            | Dynamic entries                            |
| Robots                        | ✅         | `app/robots.ts`                                | Yes            | Environment-aware                          |
| Manifest (PWA)                | ⏳        | `app/manifest.ts`                              | Maybe          | Optional                                   |
| OG Images                     | ✅         | `app/opengraph-image.tsx`                      | Yes            | Dynamic per page                           |
| `next/image`                  | ✅         | Throughout                                     | Yes            | Avif/Webp                                  |
| `next/font`                   | ✅         | `app/layout.tsx`                               | Yes            | Self-hosted, no FOIT                       |
| Typed Routes                  | ✅         | `next.config.ts` `experimental.typedRoutes`    | Yes            | Type-safe `<Link href>`                    |
| Instrumentation               | ✅         | `instrumentation.ts`                           | Yes            | OpenTelemetry setup                        |
| Client Instrumentation        | ⏳        | `instrumentation-client.ts`                    | Later          | When needed                                |
| OpenTelemetry                 | ✅         | `lib/telemetry/`                               | Yes            | Distributed traces                         |
| Error Boundaries              | ✅         | `app/error.tsx`, `app/global-error.tsx`        | Yes            | User-friendly errors                       |
| `notFound`                    | ✅         | `app/not-found.tsx`, `notFound()`              | Yes            | Custom 404                                 |
| Loading UI                    | ✅         | `loading.tsx` files                            | Yes            | Skeletons                                  |
| Redirects                     | ✅         | `redirect()` in Server Components              | Yes            | Server-side                                |
| Cookies (Request API)         | ✅         | `cookies()` in Server Components               | Yes            | Read/write session                         |
| Headers (Request API)         | ✅         | `headers()` in Server Components               | Yes            | Read metadata                              |
| Environment Variables         | ✅         | `process.env` + validation                     | Yes            | Zod-validated on startup                   |
| `after` / post-response work  | 🧪        | `app/lab/experimental/after/page.tsx`          | No             | Available in lab                           |
| Health / Readiness            | ✅         | `app/api/health/route.ts`, `app/api/ready/route.ts` | Yes        | ECS / ALB health checks                    |
| Graceful Shutdown             | ✅         | Docker `STOPSIGNAL SIGTERM`                    | Yes            | ECS handles                                |
| Docker / Self Hosting         | ✅         | `Dockerfile`                                   | Yes            | Multi-stage, non-root                      |
| Health checks                 | ✅         | Dockerfile `HEALTHCHECK` + `/api/health`       | Yes            | ECS / docker-compose                       |

Last updated: Phase 0
