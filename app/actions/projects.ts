'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  description: z.string().max(1000).optional(),
});

export async function createProject(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = schema.safeParse({ name: formData.get('name'), description: formData.get('description') });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Invalid input');

  const membership = await db.organizationMember.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } });
  if (!membership) throw new Error('Not in any organization');

  const project = await db.project.create({
    data: { organizationId: membership.organizationId, name: parsed.data.name, description: parsed.data.description ?? null, createdById: user.id },
  });
  revalidatePath('/projects');
  redirect(`/projects/${project.id}`);
}

export async function updateProject(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = formData.get('projectId');
  if (typeof id !== 'string') throw new Error('Project ID required');
  const parsed = schema.partial().safeParse({ name: formData.get('name'), description: formData.get('description') });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Invalid input');

  const project = await db.project.findUnique({ where: { id } });
  if (!project) throw new Error('Not found');
  const membership = await db.organizationMember.findUnique({ where: { organizationId_userId: { organizationId: project.organizationId, userId: user.id } } });
  if (!membership) throw new Error('Not authorized');

  await db.project.update({
    where: { id },
    data: { ...(parsed.data.name !== undefined && { name: parsed.data.name }), ...(parsed.data.description !== undefined && { description: parsed.data.description ?? null }) },
  });
  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');
}

export async function archiveProject(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = formData.get('projectId');
  if (typeof id !== 'string') throw new Error('Project ID required');
  const project = await db.project.findUnique({ where: { id } });
  if (!project) throw new Error('Not found');
  const membership = await db.organizationMember.findUnique({ where: { organizationId_userId: { organizationId: project.organizationId, userId: user.id } } });
  if (!membership) throw new Error('Not authorized');
  await db.project.update({ where: { id }, data: { status: 'ARCHIVED' as const } });
  revalidatePath('/projects');
}
