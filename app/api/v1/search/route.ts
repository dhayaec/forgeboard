import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, resolveOrganization } from '../_lib/api-auth';
import { getRequestId, apiError, paginatedMeta } from '../_lib/api-response';
import { z } from 'zod';

const schema = z.object({
  q: z.string().max(200).optional().default(''),
  type: z.enum(['all', 'projects', 'tasks']).default('all'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(50).default(10),
});

export const GET = async (req: NextRequest) => {
  const reqId = await getRequestId();
  const auth = await authenticateRequest();
  if (!auth) return apiError('UNAUTHORIZED', 'Sign in or provide a valid API key', reqId);

  const org = await resolveOrganization(auth);
  if (!org) return apiError('FORBIDDEN', 'Not a member of any organization', reqId);

  const url = new URL(req.url);
  const parsed = schema.safeParse({
    q: url.searchParams.get('q') ?? '',
    type: url.searchParams.get('type') ?? 'all',
    status: url.searchParams.get('status') ?? undefined,
    page: url.searchParams.get('page') ?? '1',
    perPage: url.searchParams.get('perPage') ?? '10',
  });
  if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid search params', reqId, parsed.error.flatten());

  const { q, type, status, page, perPage } = parsed.data;

  if (q.length < 2) {
    return Response.json({ data: [], meta: paginatedMeta(0, page, perPage, reqId), requestId: reqId });
  }

  const results: { projects: unknown[]; tasks: unknown[] } = { projects: [], tasks: [] };

  if (type === 'all' || type === 'projects') {
    const projects = await db.project.findMany({
      where: {
        organizationId: org.id,
        name: { contains: q, mode: 'insensitive' },
      },
      take: perPage,
      orderBy: { createdAt: 'desc' },
    });
    results.projects = projects;
  }

  if (type === 'all' || type === 'tasks') {
    const taskWhere: Parameters<typeof db.task.findMany>[0]['where'] = {
      deletedAt: null,
      project: { organizationId: org.id },
      title: { contains: q, mode: 'insensitive' },
    };
    if (status) taskWhere.status = status as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

    const tasks = await db.task.findMany({
      where: taskWhere,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true } } },
    });
    results.tasks = tasks;
  }

  return Response.json({
    data: results,
    query: q,
    requestId: reqId,
  });
};
