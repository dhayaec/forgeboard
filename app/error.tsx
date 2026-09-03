'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground">
          {error.digest && (
            <code className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs">
              {error.digest}
            </code>
          )}
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
