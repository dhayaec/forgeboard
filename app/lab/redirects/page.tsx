import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ to?: string }>;
}

export default async function RedirectsPage({ searchParams }: Props) {
  const { to } = await searchParams;

  if (to === '/lab/redirects/destination') {
    // Demonstrates redirect() in a Server Component
    redirect('/lab');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">redirect() — Server-Side Redirects</h1>
      <p className="text-muted-foreground mb-4">
        <code>redirect()</code> is a server-side redirect. It happens before any HTML
        is rendered, making it faster than client-side navigation.
      </p>
      <div className="space-y-2">
        <Link
          href="/lab/redirects?to=/lab/redirects/destination"
          className="inline-block rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Trigger redirect to /lab
        </Link>
      </div>
    </div>
  );
}
