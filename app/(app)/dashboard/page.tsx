import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Server component — enforces auth at request time.
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name ?? user.email}</h1>
        <p className="mt-1 text-muted-foreground">You are signed in as <span className="font-mono text-xs">{user.id}</span></p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/projects" className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage your projects</p>
        </Link>
        <Link href="/tasks" className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="text-lg font-semibold">My Tasks</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tasks assigned to you</p>
        </Link>
        <Link href="/lab" className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="text-lg font-semibold">Lab</h2>
          <p className="mt-1 text-sm text-muted-foreground">Next.js demos</p>
        </Link>
      </div>
    </div>
  );
}
