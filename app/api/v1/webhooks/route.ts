import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, resolveOrganization } from '../_lib/api-auth';
import { getRequestId, apiError } from '../_lib/api-response';
import { z } from 'zod';
import { requirePermission } from '@/lib/permissions/rbac';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

export const GET = async (req: NextRequest) => {
  const reqId = await getRequestId();
  const auth = await authenticateRequest();
  if (!auth) return apiError('UNAUTHORIZED', 'Sign in or provide a valid API key', reqId);

  const org = await resolveOrganization(auth);
  if (!org) return apiError('FORBIDDEN', 'No organization found', reqId);

  const webhooks = await db.webhook.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ data: webhooks, requestId: reqId });
};

export const POST = async (req: NextRequest) => {
  const reqId = await getRequestId();
  const auth = await authenticateRequest();
  if (!auth) return apiError('UNAUTHORIZED', 'Sign in or provide a valid API key', reqId);

  const org = await resolveOrganization(auth);
  if (!org) return apiError('FORBIDDEN', 'No organization found', reqId);

  try {
    await requirePermission(org.id, 'webhooks:manage');
  } catch {
    return apiError('FORBIDDEN', 'Insufficient permissions', reqId);
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', reqId, parsed.error.flatten());

  const validEvents = ['task.created', 'task.updated', 'task.deleted', 'project.created', 'project.updated', 'member.added', 'member.removed'];
  const invalid = parsed.data.events.filter((e) => !validEvents.includes(e));
  if (invalid.length) return apiError('VALIDATION_ERROR', `Unknown events: ${invalid.join(', ')}`, reqId);

  const secret = crypto.randomUUID() + crypto.randomUUID();
  const webhook = await db.webhook.create({
    data: {
      organizationId: org.id,
      name: parsed.data.name,
      url: parsed.data.url,
      events: parsed.data.events,
      secret,
      active: true,
    },
  });

  return Response.json({ data: { ...webhook, secret } }, { status: 201 });
};
