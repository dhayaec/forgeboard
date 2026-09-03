import { cookies } from 'next/headers';

export default async function CookiesPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'light';
  const visitCount = Number(cookieStore.get('visit-count')?.value ?? '0') + 1;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cookies (Request API)</h1>
      <p className="text-muted-foreground mb-4">
        Server Components can read cookies via the <code>cookies()</code> function.
        No client JavaScript needed for simple cookie reads.
      </p>
      <dl className="space-y-2 rounded-lg border bg-card p-4">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Current theme:</dt>
          <dd className="font-mono text-sm">{theme}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Visit count:</dt>
          <dd className="font-mono text-sm">{visitCount}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted-foreground">
        Note: This page does not set cookies — it only reads them.
      </p>
    </div>
  );
}
