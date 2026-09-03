import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Validation', () => {
  it('accepts valid project input', () => {
    const schema = z.object({ name: z.string().min(2).max(100) });
    expect(schema.parse({ name: 'Alpha' })).toEqual({ name: 'Alpha' });
  });

  it('rejects empty name', () => {
    const schema = z.object({ name: z.string().min(1) });
    expect(() => schema.parse({ name: '' })).toThrow();
  });
});
