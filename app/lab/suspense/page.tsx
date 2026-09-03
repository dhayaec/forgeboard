import { Suspense } from 'react';

// Simulated slow data fetch
async function SlowComponent() {
  await new Promise((r) => setTimeout(r, 2000));
  return (
    <div className="rounded-lg border border-primary bg-primary/5 p-4">
      <p className="font-medium text-primary">Slow data loaded after 2s</p>
    </div>
  );
}

function FastComponent() {
  return (
    <div className="rounded-lg border bg-green-500/10 p-4">
      <p className="font-medium text-green-600">Fast component — immediate</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border p-4">
      <div className="h-4 w-48 rounded bg-muted" />
      <div className="mt-2 h-3 w-32 rounded bg-muted" />
    </div>
  );
}

export default function SuspensePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Suspense — Streaming</h1>
      <p className="text-muted-foreground mb-4">
        Fast parts render immediately. Slow parts stream in as they resolve.
        The user sees a meaningful page fast — no blank loading spinner.
      </p>
      <div className="space-y-4">
        <FastComponent />
        <Suspense fallback={<LoadingSkeleton />}>
          <SlowComponent />
        </Suspense>
      </div>
    </div>
  );
}
