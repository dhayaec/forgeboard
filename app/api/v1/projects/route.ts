import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, resolveOrganization } from '../_lib/api-auth';
import { getRequestId, apiError, paginatedMeta } from '../_lib/api-response';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export const GET = async (req: NextRequest) => {
  const reqId = await getRequestId();
  const auth = await authenticateRequest();
  if (!auth) return apiError('UNAUTHORIZED', 'Sign in or provide a valid API key', reqId);

  const org = await resolveOrganization(auth);
  if (!org) return apiError('FORBIDDEN', 'Not a member of any organization', reqId);

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get('perPage') || '20')));

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where: { organizationId: org.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.project.count({ where: { organizationId: org.id, deletedAt: null } }),
  ]);

  return Response.json({
    data: projects,
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

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', reqId, parsed.error.flatten());

  const userId = auth.type === 'session' ? auth.userId : undefined;
  if (!userId) return apiError('FORBIDDEN', 'Session user required for creation', reqId);

  const project = await db.project.create({
    data: {
      organizationId: org.id,
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      createdById: userId,
    },
  });

  return Response.json({ data: project, requestId: reqId }, { status: 201 });
};
