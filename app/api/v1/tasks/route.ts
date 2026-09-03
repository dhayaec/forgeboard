import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, resolveOrganization } from '../_lib/api-auth';
import { getRequestId, apiError, paginatedMeta } from '../_lib/api-response';
import { z } from 'zod';

const createSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
});

const updateSchema = createSchema.partial();

export const GET = async (req: NextRequest) => {
  const reqId = await getRequestId();
  const auth = await authenticateRequest();
  if (!auth) return apiError('UNAUTHORIZED', 'Sign in or provide a valid API key', reqId);

  const org = await resolveOrganization(auth);
  if (!org) return apiError('FORBIDDEN', 'Not a member of any organization', reqId);

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get('perPage') || '20')));
  const status = url.searchParams.get('status') ?? undefined;
  const priority = url.searchParams.get('priority') ?? undefined;
  const q = url.searchParams.get('q') ?? undefined;
  const projectId = url.searchParams.get('projectId') ?? undefined;

  // Idempotency key — if provided, return the existing task
  const idempotencyKey = req.headers.get('idempotency-key');
  if (idempotencyKey) {
    const existing = await db.task.findFirst({
      where: {
        idempotencyKey,
        project: { organizationId: org.id },
        deletedAt: null,
      },
    });
    if (existing) {
      return Response.json({ data: existing, requestId: reqId, idempotent: true });
    }
  }

  const where = {
    deletedAt: null,
    project: { organizationId: org.id },
    ...(status ? { status: status as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' } : {}),
    ...(priority ? { priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' } : {}),
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
    ...(projectId ? { projectId } : {}),
  };

  const [tasks, total] = await Promise.all([
    db.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    }),
    db.task.count({ where }),
  ]);

  return Response.json({
    data: tasks,
    meta: paginatedMeta(total, page, perPage, reqId),
    requestId: reqId,
  });
};

export const POST = async (req: NextRequest) => {
  const reqId = await getRequestId();
  const auth = await authenticateRequest();
  if (!auth) return apiError('UNAUTHORIZED', 'Sign in or provide a valid API key', reqId);

  const org = await resolveOrganization(auth);
  if (!org) return apiError('FORBIDDEN', 'Not a member of any organization', reqId);

  const idempotencyKey = req.headers.get('idempotency-key') ?? undefined;
  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', reqId, parsed.error.flatten());

  // Verify project belongs to this org
  const project = await db.project.findUnique({ where: { id: parsed.data.projectId } });
  if (!project || project.organizationId !== org.id) {
    return apiError('NOT_FOUND', 'Project not found', reqId);
  }

  const userId = auth.type === 'session' ? auth.userId : undefined;
  if (!userId) return apiError('FORBIDDEN', 'Session user required for creation', reqId);

  const task = await db.task.create({
    data: {
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId ?? null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      createdById: userId,
      position: 0,
      idempotencyKey: idempotencyKey ?? null,
    },
  });

  return Response.json({ data: task, requestId: reqId }, { status: 201 });
};
