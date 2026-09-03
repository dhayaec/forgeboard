'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-destructive">Application Error</h1>
            <p className="mt-3 text-muted-foreground">
              A critical error occurred. Please refresh the page.
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: <code>{error.digest}</code>
              </p>
            )}
          </div>
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
