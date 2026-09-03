import { Suspense } from 'react';
import { unstable_cache, revalidateTag } from 'next/cache';
import { logger } from '@/lib/logging/logger';

// Cached function — revalidates every 60 seconds
const getStats = unstable_cache(
  async () => {
    const now = Date.now();
    return { fetchedAt: new Date(now).toISOString(), hits: Math.floor(Math.random() * 1000) };
  },
  ['stats'],
  { tags: ['stats'], revalidate: 60 }
);

async function StatsCard() {
  const stats = await getStats();
  return (
    <div className="rounded-lg border border-primary bg-primary/5 p-4">
      <p className="text-sm font-medium">Cached stats</p>
      <p className="text-xs text-muted-foreground">Fetched at: {stats.fetchedAt}</p>
      <p className="text-2xl font-bold">{stats.hits} hits</p>
    </div>
  );
}

function StatsSkeleton() {
  return <div className="h-24 rounded-lg border border-border bg-card animate-pulse" />;
}

export default function CachingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Caching Laboratory</h1>
        <p className="mt-1 text-muted-foreground">
          Demonstrations of Next.js cache strategies. Each component shows a different pattern.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">unstable_cache</h2>
        <p className="text-sm text-muted-foreground">
          Data is fetched once and cached. The cache is invalidated after 60s or via <code>revalidateTag</code>.
        </p>
        <Suspense fallback={<StatsSkeleton />}>
          <StatsCard />
        </Suspense>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Cache Layers</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Layer title="Request Memoization" desc="Same render, same call, same result" />
          <Layer title="Data Cache" desc="Survives across requests (with revalidate)" />
          <Layer title="Router Cache" desc="RSC payloads cached client-side" />
          <Layer title="Full Route Cache" desc="Static rendering at build" />
          <Layer title="CDN Cache" desc="Edge-cached static pages" />
          <Layer title="Application Cache" desc="Redis / external KV" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Revalidation</h2>
        <p className="text-sm text-muted-foreground">
          <code>revalidateTag('stats')</code> invalidates all cache entries tagged with <code>stats</code>.
          <br />
          <code>revalidatePath('/posts')</code> invalidates the cached RSC for that path.
        </p>
      </section>
    </div>
  );
}

function Layer({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
