'use server';

import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  projectId: z.string().cuid('Project required').optional(),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime().optional(),
});

export async function createTask(formData: FormData): Promise<{ error?: string; taskId?: string }> {
  const user = await requireUser().catch(() => null);
  if (!user) return { error: 'Must sign in' };

  const raw = {
    title: formData.get('title'),
    status: formData.get('status') ?? 'TODO',
    priority: formData.get('priority') ?? 'MEDIUM',
    projectId: formData.get('projectId'),
    description: formData.get('description'),
    dueDate: formData.get('dueDate'),
  };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const data = parsed.data as { projectId?: string };
  if (!data.projectId) return { error: 'Project is required' };

  const project = await db.project.findUnique({ where: { id: data.projectId } });
  if (!project) return { error: 'Project not found' };

  const task = await db.task.create({
    data: {
      projectId: data.projectId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      createdById: user.id,
    },
  });

  return { taskId: task.id };
}
