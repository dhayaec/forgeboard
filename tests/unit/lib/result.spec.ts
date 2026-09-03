import { describe, it, expect } from 'vitest';
import { Result } from '@/lib/result';

describe('Result', () => {
  it('ok() creates a success result', () => {
    const r = Result.ok({ id: '1' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ id: '1' });
  });

  it('fail() creates a failure result', () => {
    const err = new Error('boom');
    const r = Result.fail(err);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(err);
  });
});
