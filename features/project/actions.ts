/**
 * Example server action for creating a project.
 * Demonstrates: validate → authorize → transaction → audit → revalidate.
 */

'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser, getMembership } from '@/lib/auth/session';
import { audit } from '@/lib/db/tenant';
import { requirePermission } from '@/lib/permissions/rbac';
import { revalidatePath } from 'next/cache';

const schema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input', details: parsed.error.flatten() };
  }

  const { organizationId, name, description, status } = parsed.data;
  await requirePermission(organizationId, 'projects:create');

  const project = await db.project.create({
    data: {
      organizationId,
      name,
      description,
      status,
      createdById: user.id,
    },
  });

  await audit(organizationId, {
    actorId: user.id,
    action: 'project.created',
    entityType: 'Project',
    entityId: project.id,
    metadata: { name, status },
  });

  revalidatePath('/projects');
  return { ok: true, data: { id: project.id } };
}
