import { z } from 'zod';

export const searchSchema = z.object({
  q: z.string().max(200).optional().default(''),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(50).default(10),
});
