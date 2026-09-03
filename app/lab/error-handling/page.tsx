import { notFound } from 'next/navigation';

// Demo: throw notFound() to trigger the nearest not-found.tsx boundary
export default function ErrorHandlingPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Error Handling</h1>
      <p className="text-muted-foreground mb-4">
        Next.js has error boundaries at the segment level.
        Use <code>notFound()</code> for 404s, <code>redirect()</code> for 3xx.
      </p>
      <div className="space-y-2 text-sm">
        <div className="rounded-lg border bg-card p-3">
          <code>notFound()</code>
          <p className="text-muted-foreground">Renders the nearest not-found.tsx boundary</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <code>redirect(path, type)</code>
          <p className="text-muted-foreground">Redirects to a path (temporary=307, permanent=308)</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <code>throw new Error()</code>
          <p className="text-muted-foreground">Triggers the nearest error.tsx boundary</p>
        </div>
      </div>
    </div>
  );
}
