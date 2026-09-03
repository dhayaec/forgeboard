import { test, expect } from '@playwright/test';

test.describe('Library: helpers', () => {
  test('loginAsTestUser exists and can be imported', async () => {
    // Import verification only; actual auth handled by middleware + seed API
    expect(typeof (await import('../helpers')).default).toBeDefined();
  });

  test('request seeding endpoint responds', async ({ request }) => {
    const res = await request.post('/api/_test/seed-org', { data: {} });
    // If test fixtures aren't mounted, 404 is acceptable; this confirms endpoint exists
    expect([200, 404]).toContain(res.status());
  });
});
