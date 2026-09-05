'use server';

import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

const schema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  projectId: z.string().min(1),
});

export async function createTask(formData: FormData): Promise<void> {
  const user = await requireUser();
  const raw = { title: formData.get('title'), status: (formData.get('status') as string) || 'TODO', projectId: formData.get('projectId') };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Invalid input');
  await db.task.create({ data: { projectId: parsed.data.projectId, title: parsed.data.title, status: parsed.data.status, createdById: user.id } });
}
