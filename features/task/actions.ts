/**
 * Example server action for creating a task.
 * Demonstrates the mutation flow with validation + authorization.
 */

'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/session';
import { audit } from '@/lib/db/tenant';
import { requirePermission } from '@/lib/permissions/rbac';
import { revalidatePath } from 'next/cache';

const schema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function createTask(formData: FormData) {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', details: parsed.error.flatten() };
  }
  const { projectId, title, description, status, priority, assigneeId, dueDate } = parsed.data;

  // Verify project belongs to user's org (simplified — real check uses membership)
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return { ok: false, error: 'Project not found' };
  await requirePermission(project.organizationId, 'tasks:create');

  const task = await db.task.create({
    data: {
      projectId,
      title,
      description,
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: user.id,
      position: 0,
    },
  });

  await audit(project.organizationId, {
    actorId: user.id,
    action: 'task.created',
    entityType: 'Task',
    entityId: task.id,
    metadata: { title, status, priority },
  });

  revalidatePath(`/projects/${projectId}`);
  return { ok: true, data: { id: task.id } };
}
