import { notFound } from 'next/navigation';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { updateProject, archiveProject } from '@/app/actions/projects';
import { createTask } from '@/app/actions/tasks';

interface Props {
  params: Promise<{ projectId: string }>;
}

async function TaskList({ projectId }: { projectId: string }) {
  const tasks = await db.task.findMany({
    where: { projectId, deletedAt: null },
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      assignee: { select: { id: true, name: true } },
    },
  });

  if (tasks.length === 0) return <p className="text-muted-foreground text-sm py-4">No tasks yet.</p>;

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              task.status === 'DONE' ? 'bg-green-100 text-green-700'
              : task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700'
              : task.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-700'
              : 'bg-muted text-muted-foreground'
            }`}>{task.status.replace('_', ' ')}</span>
            <span className="text-sm font-medium truncate">{task.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {task.assignee && <span className="text-xs text-muted-foreground">{task.assignee.name}</span>}
            {task.dueDate && <span className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateTaskForm({ projectId }: { projectId: string }) {
  return (
    <form action={createTask} className="flex gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input name="title" type="text" required placeholder="New task title…" maxLength={200} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      <select name="status" className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="REVIEW">Review</option>
        <option value="DONE">Done</option>
      </select>
      <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Add Task</button>
    </form>
  );
}

function EditProjectForm({ projectId, name, description }: { projectId: string; name: string; description: string | null }) {
  return (
    <details className="group mt-4 rounded-lg border border-border">
      <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Edit Project</summary>
      <form action={updateProject} method="post" className="border-t border-border p-4 space-y-3">
        <input type="hidden" name="projectId" value={projectId} />
        <div>
          <label htmlFor="edit-name" className="block text-xs font-medium mb-1">Name</label>
          <input id="edit-name" name="name" type="text" defaultValue={name} required maxLength={100} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label htmlFor="edit-desc" className="block text-xs font-medium mb-1">Description</label>
          <textarea id="edit-desc" name="description" defaultValue={description ?? ''} rows={2} maxLength={1000} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2"><button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Save</button></div>
      </form>
    </details>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect('/auth/login');
  const { projectId } = await params;
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { _count: { select: { tasks: true } } },
  });

  if (!project) notFound();
  const membership = await db.organizationMember.findFirst({ where: { userId: user.id, organizationId: project.organizationId } });
  if (!membership) redirect('/projects');

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">← Projects</Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            {project.description && <p className="mt-1 text-muted-foreground">{project.description}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full bg-muted px-3 py-1 text-sm">{project.status}</span>
            <form action={archiveProject} method="post">
              <input type="hidden" name="projectId" value={projectId} />
              <button type="submit" className="rounded-lg border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">Archive</button>
            </form>
          </div>
        </div>
        <EditProjectForm projectId={projectId} name={project.name} description={project.description} />
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Tasks <span className="text-muted-foreground text-sm font-normal">({project._count.tasks})</span></h2>
        <div className="mb-4"><CreateTaskForm projectId={projectId} /></div>
        <TaskList projectId={projectId} />
      </section>
    </div>
  );
}
