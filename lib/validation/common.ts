import 'server-only';
import { z } from 'zod';
import { ValidationError } from '@/lib/errors';

/**
 * Validate a value against a Zod schema and throw a ValidationError on failure.
 * Use at every system boundary (form input, API request, job payload).
 */
export function validate<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const message = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${(msgs ?? []).join(', ')}`)
      .join('; ');
    throw new ValidationError(message || 'Invalid input', { fieldErrors: errors });
  }
  return result.data;
}

/** Validate and return a result instead of throwing. */
export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown
): { ok: true; data: z.infer<T> } | { ok: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(value);
  if (!result.success) {
    return { ok: false, errors: result.error.flatten().fieldErrors };
  }
  return { ok: true, data: result.data };
}

// Reusable Zod primitives

export const idSchema = z.string().min(1).max(64);
export const slugSchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Invalid slug');
export const emailSchema = z.string().email().max(254);
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']).default('asc'),
});
