import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <p className="text-8xl font-bold text-primary/20">404</p>
        <h1 className="-mt-4 text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded-lg border border-border bg-background px-6 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-muted"
        >
          Go home
        </Link>
        <Link
          href="/lab"
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          View routing lab
        </Link>
      </div>
    </div>
  );
}
