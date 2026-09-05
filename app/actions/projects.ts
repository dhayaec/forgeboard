'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(1000).optional(),
});

const updateProjectSchema = createProjectSchema.partial();

/**
 * Create a new project for the user's first organization.
 * Redirects to the new project page on success.
 */
export async function createProject(formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser().catch(() => null);
  if (!user) return { error: 'You must be signed in to create a project' };

  const name = formData.get('name');
  const description = formData.get('description');

  const parsed = createProjectSchema.safeParse({ name, description });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  // Get the user's first organization
  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });
  if (!membership) return { error: 'You are not a member of any organization' };

  const project = await db.project.create({
    data: {
      organizationId: membership.organizationId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      createdById: user.id,
    },
  });

  revalidatePath('/projects');
  redirect(`/projects/${project.id}`);
}

/**
 * Update an existing project.
 */
export async function updateProject(formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser().catch(() => null);
  if (!user) return { error: 'Not authenticated' };

  const projectId = formData.get('projectId');
  const name = formData.get('name');
  const description = formData.get('description');

  if (typeof projectId !== 'string') return { error: 'Project ID required' };

  const parsed = updateProjectSchema.safeParse({ name, description });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: 'Project not found' };

  const membership = await db.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: project.organizationId, userId: user.id } },
  });
  if (!membership) return { error: 'Not authorized' };

  await db.project.update({
    where: { id: projectId },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description ?? null }),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/projects');
  return {};
}

/**
 * Archive (soft-delete) a project.
 */
export async function archiveProject(formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser().catch(() => null);
  if (!user) return { error: 'Not authenticated' };

  const projectId = formData.get('projectId');
  if (typeof projectId !== 'string') return { error: 'Project ID required' };

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: 'Project not found' };

  const membership = await db.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: project.organizationId, userId: user.id } },
  });
  if (!membership) return { error: 'Not authorized' };

  await db.project.update({
    where: { id: projectId },
    data: { status: 'ARCHIVED' as const },
  });

  revalidatePath('/projects');
  return {};
}
