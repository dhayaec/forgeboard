import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr } from '@/lib/result';

describe('Result', () => {
  it('ok() creates a success result', () => {
    const r = ok({ id: '1' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ id: '1' });
  });

  it('fail() creates a failure result', () => {
    const e = { code: 'TEST', message: 'boom' };
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });

  it('isOk() type guard narrows to success', () => {
    const r = ok({ id: '1' });
    if (isOk(r)) {
      expect(r.data).toEqual({ id: '1' });
    }
  });

  it('isErr() type guard narrows to failure', () => {
    const r = err({ code: 'TEST', message: 'boom' });
    if (isErr(r)) {
      expect(r.error.code).toBe('TEST');
    }
  });
});
