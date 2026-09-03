import Link from 'next/link';
import { Suspense } from 'react';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

export const metadata = { title: 'Projects — ForgeBoard' };

function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5 shadow-sm animate-pulse">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="mt-2 h-3 w-48 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

async function ProjectsList() {
  // In a real app, filter by the current user's organization memberships.
  // This skeleton uses db.project.findMany directly to demonstrate streaming.
  const projects = await db.project.findMany({
    take: 12,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, description: true, status: true, createdAt: true },
  });

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <h3 className="text-lg font-semibold">No projects yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}`}
          className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold group-hover:text-primary">{p.name}</h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{p.status}</span>
          </div>
          {p.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
        </Link>
      ))}
    </div>
  );
}

export default async function ProjectsPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-muted-foreground">All projects in your organization</p>
        </div>
        <Link
          href="/projects/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + New Project
        </Link>
      </header>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsList />
      </Suspense>
    </div>
  );
}
