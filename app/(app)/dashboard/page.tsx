import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/auth/login');

  const orgs = await db.organizationMember.findMany({ where: { userId: user.id }, include: { organization: true } });
  const hasOrg = orgs.length > 0;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name ?? user.email}</h1>
          <p className="mt-1 text-muted-foreground">You are signed in as <span className="font-mono text-xs">{user.id}</span></p>
        </div>
        <Link href="/org/create" className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">+ Create Org</Link>
        <Link href="/auth/logout" className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">Logout</Link>
      </header>
      {!hasOrg && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <strong>Not in any organization.</strong> Create one to start managing projects.
        </div>
      )}
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
