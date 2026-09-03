import { describe, it, expect } from 'vitest';

describe('Health check', () => {
  it('returns 200 OK with status', async () => {
    const res = await fetch('http://localhost:3000/api/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});
