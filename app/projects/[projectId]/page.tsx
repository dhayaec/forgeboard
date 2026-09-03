import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import { requireMembership } from '@/lib/permissions/rbac';

interface Props {
  params: Promise<{ projectId: string }>;
}

async function TaskList({ projectId }: { projectId: string }) {
  const tasks = await db.task.findMany({
    where: { projectId, deletedAt: null },
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
    select: { id: true, title: true, status: true, priority: true, dueDate: true },
  });

  if (tasks.length === 0) {
    return <p className="text-muted-foreground text-sm">No tasks in this project yet.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{task.title}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{task.status}</span>
          </div>
          {task.dueDate && (
            <span className="text-xs text-muted-foreground">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg border border-border bg-card animate-pulse" />
      ))}
    </div>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;
  const user = await requireMembership(projectId); // simplified — uses first org membership

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { _count: { select: { tasks: true } } },
  });

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-6">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">← Projects</Link>
        <div className="mt-3 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-muted-foreground">{project.description}</p>
            )}
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-sm">{project.status}</span>
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Tasks ({project._count.tasks})</h2>
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskList projectId={projectId} />
        </Suspense>
      </section>
    </div>
  );
}
