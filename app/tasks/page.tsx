import Link from 'next/link';
import { Suspense } from 'react';
import { db } from '@/lib/db';

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export const metadata = { title: 'Tasks — ForgeBoard' };

export default async function TasksPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || '';
  const status = params.status || '';
  const page = Math.max(1, parseInt(params.page || '1'));
  const perPage = 10;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">Search and filter tasks</p>
      </header>

      <form method="get" action="/tasks" className="mb-6 flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search tasks..."
          className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select name="status" defaultValue={status} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="DONE">Done</option>
        </select>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Filter</button>
      </form>

      <Suspense fallback={<SkeletonTable />}>
        <TaskTable q={q} status={status} page={page} perPage={perPage} />
      </Suspense>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 rounded-lg border border-border animate-pulse" />
      ))}
    </div>
  );
}

async function TaskTable({ q, status, page, perPage }: { q: string; status: string; page: number; perPage: number }) {
  type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  const where: { title?: { contains: string; mode: 'insensitive' }; status?: TaskStatus; projectId?: string } = {};
  if (q) where.title = { contains: q, mode: 'insensitive' as const };
  if (status) where.status = status as TaskStatus;

  const [tasks, total] = await Promise.all([
    db.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: { id: true, title: true, status: true, priority: true, projectId: true, project: { select: { id: true, name: true } } },
    }),
    db.task.count({ where }),
  ]);

  const pages = Math.ceil(total / perPage);

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
            <th className="py-2 px-3">Title</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Project</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="border-b border-border hover:bg-muted/10">
              <td className="py-3 px-3 text-sm">{t.title}</td>
              <td className="py-3 px-3 text-xs">{t.status}</td>
              <td className="py-3 px-3 text-xs text-muted-foreground">{t.project?.name ?? '-'}</td>
            </tr>
          ))}
          {tasks.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-sm text-muted-foreground">No tasks found.</td></tr>}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Page {page} of {pages || 1}</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`?q=${q}&status=${status}&page=${page - 1}`} className="rounded-md border border-border px-3 py-1 hover:bg-muted">Previous</Link>
          )}
          {page < pages && (
            <Link href={`?q=${q}&status=${status}&page=${page + 1}`} className="rounded-md border border-border px-3 py-1 hover:bg-muted">Next</Link>
          )}
        </div>
      </div>
    </div>
  );
}
