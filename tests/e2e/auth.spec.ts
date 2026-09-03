/**
 * E2E tests for authentication flows.
 *
 * These run via `pnpm test:e2e` against a running dev server.
 * Each test is isolated and uses a unique seeded user.
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('home page redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login form validates empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // Form should still be visible (HTML5 required + Zod validation)
    await expect(page.locator('form')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'nobody@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error toast or message
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 5000 });
  });

  test('login with valid credentials redirects to dashboard', async ({ page, request }) => {
    // Seed a user via the API test fixture
    const seedRes = await request.post('/api/_test/seed-user', {
      data: { email: `e2e-${Date.now()}@test.local`, password: 'Passw0rd!23' },
    });
    expect(seedRes.ok()).toBeTruthy();
    const { email, password } = await seedRes.json();

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
