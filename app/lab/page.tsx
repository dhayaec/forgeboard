import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js Lab — Routing & Rendering',
  description: 'Hands-on demonstrations of Next.js App Router patterns',
};

const LABS: { title: string; href: string; description: string; patterns: string[] }[] = [
  {
    title: 'Nested Layouts',
    href: '/lab/nested-layout',
    description: 'Compose layouts at multiple levels. Each layout wraps its child segments.',
    patterns: ['layout.tsx nesting', 'segment boundaries', 'shared chrome'],
  },
  {
    title: 'Route Groups',
    href: '/lab/route-groups',
    description: 'Group routes for organization without affecting URL paths. (marketing) and (auth) share root.',
    patterns: ['(name) folder', 'URL-independence', 'shared layouts'],
  },
  {
    title: 'Dynamic Routes',
    href: '/lab/dynamic-routes/foo',
    description: 'Use [param] to capture dynamic segments. Type-safe params via PageProps.',
    patterns: ['[param]', 'generateStaticParams', 'server-side param access'],
  },
  {
    title: 'Catch-all Routes',
    href: '/lab/catch-all-routes/optional/a/b/c',
    description: 'Optional catch-all [[...slug]] for flexible path matching. Useful for docs/blog hierarchy.',
    patterns: ['[...slug]', '[[...slug]]', 'cms-style content'],
  },
  {
    title: 'Parallel Routes',
    href: '/lab/parallel-routes',
    description: 'Render multiple pages in the same layout using @slot folders. Independent loading and error.',
    patterns: ['@slot folders', 'modal patterns', 'multi-pane UI'],
  },
  {
    title: 'Intercepted Routes',
    href: '/lab/intercepted',
    description: 'Render a route within the current layout (e.g. modal task detail) instead of full navigation.',
    patterns: ['(.) same level', '(..) parent', '(..)(..) two up'],
  },
  {
    title: 'Search Params',
    href: '/lab/search-params?q=alice',
    description: 'URL-driven filters. Shareable, bookmarkable, SSR-friendly. No client state for filters.',
    patterns: ['searchParams prop', 'URL is source of truth', 'form action default'],
  },
  {
    title: 'Cookies (Request API)',
    href: '/lab/cookies',
    description: 'Read cookies in Server Components. No client JavaScript needed for cookie reads.',
    patterns: ['await cookies()', 'read-only in render', 'mutations in server actions'],
  },
  {
    title: 'Headers (Request API)',
    href: '/lab/headers',
    description: 'Read incoming request headers server-side. Useful for auth, analytics, geo.',
    patterns: ['await headers()', 'server-only', 'no client exposure'],
  },
  {
    title: 'Static Rendering',
    href: '/lab/static-rendering',
    description: 'Render at build time. CDN-served, no per-request compute. Use for content that rarely changes.',
    patterns: ['export const dynamic', 'force-static', 'CDN cacheable'],
  },
  {
    title: 'Dynamic Rendering',
    href: '/lab/dynamic-rendering',
    description: 'Render per request. Use for personalized, user-specific, or frequently-changing data.',
    patterns: ['force-dynamic', 'per-request compute', 'no cache'],
  },
  {
    title: 'Suspense & Streaming',
    href: '/lab/suspense',
    description: 'Fast shell renders immediately. Slow data streams in as it resolves. No blank loaders.',
    patterns: ['<Suspense>', 'loading.tsx', 'streaming RSC'],
  },
  {
    title: 'Error Handling',
    href: '/lab/error-handling',
    description: 'error.tsx boundaries catch errors. notFound() triggers 404. Use redirect() for 3xx.',
    patterns: ['error.tsx', 'notFound()', 'redirect()'],
  },
  {
    title: 'notFound() Behavior',
    href: '/lab/not-found-behavior',
    description: 'Trigger a 404. The closest not-found.tsx in the segment tree renders.',
    patterns: ['notFound()', 'segment-level boundaries', 'graceful 404'],
  },
  {
    title: 'Redirects',
    href: '/lab/redirects',
    description: 'Server-side redirects in Server Components or middleware. Faster than client navigation.',
    patterns: ['redirect()', 'proxy.ts', 'permanent vs temporary'],
  },
  {
    title: 'Caching',
    href: '/lab/caching',
    description: 'Multiple cache strategies: request memoization, server cache, Redis, CDN. See Phase 7.',
    patterns: ['unstable_cache', 'use cache', 'revalidateTag'],
  },
  {
    title: 'Experimental APIs',
    href: '/lab/experimental',
    description: 'APIs not yet in production paths. For evaluation only.',
    patterns: ['after()', 'use cache', 'experimental flags'],
  },
];

export default function LabIndexPage() {
  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back home
        </Link>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Next.js Lab</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Hands-on demonstrations of modern Next.js App Router patterns. Each example
          shows what it does, why it exists, when to use it, and when not to.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LABS.map((lab) => (
          <Link
            key={lab.href}
            // @ts-ignore Next.js 16 typed Link
            href={lab.href}
            className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold group-hover:text-primary">
                {lab.title}
              </h2>
              <span className="text-xs text-muted-foreground">→</span>
            </div>
            <p className="text-sm text-muted-foreground">{lab.description}</p>
            <div className="mt-auto flex flex-wrap gap-1 pt-2">
              {lab.patterns.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
