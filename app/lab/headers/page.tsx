import { headers } from 'next/headers';

export default async function HeadersPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') ?? 'unknown';
  const acceptLanguage = headersList.get('accept-language') ?? 'unknown';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Headers (Request API)</h1>
      <p className="text-muted-foreground mb-4">
        Server Components can read incoming request headers via <code>headers()</code>.
        Useful for authentication, analytics, A/B testing.
      </p>
      <dl className="space-y-2 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">User-Agent:</dt>
          <dd className="break-all font-mono text-xs">{userAgent}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Accept-Language:</dt>
          <dd className="font-mono text-sm">{acceptLanguage}</dd>
        </div>
      </dl>
    </div>
  );
}
