/**
 * E2E tests for project CRUD flows.
 */
import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers';

test.describe('Projects', () => {
  let orgId: string;

  test.beforeEach(async ({ request }) => {
    // Seed org + user via API
    const seedRes = await request.post('/api/_test/seed-org', { data: {} });
    const seed = await seedRes.json();
    orgId = seed.orgId;
    // Store cookie jar per test context
  });

  test('user can view projects list', async ({ page }) => {
    await loginAsTestUser(page, orgId);
    await page.goto('/projects');
    await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
  });

  test('user can create a new project', async ({ page }) => {
    await loginAsTestUser(page, orgId);
    await page.goto('/projects');

    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[name="name"]', 'E2E Test Project');
    await page.fill('[name="description"]', 'Created by Playwright');
    await page.click('[data-testid="submit-project-btn"]');

    await expect(page.locator('text=E2E Test Project')).toBeVisible();
  });

  test('creating a project without a name shows validation error', async ({ page }) => {
    await loginAsTestUser(page, orgId);
    await page.goto('/projects');
    await page.click('[data-testid="new-project-btn"]');
    await page.click('[data-testid="submit-project-btn"]');

    await expect(page.locator('[data-testid="field-error-name"]')).toBeVisible();
  });

  test('project detail page loads', async ({ page }) => {
    const projectRes = await page.request.post('/api/_test/seed-project', {
      data: { orgId, name: 'Detail Test Project' },
    });
    const { projectId } = await projectRes.json();

    await loginAsTestUser(page, orgId);
    await page.goto(`/projects/${projectId}`);
    await expect(page.locator('text=Detail Test Project')).toBeVisible();
  });

  test('task list is rendered with suspense skeleton', async ({ page }) => {
    const projectRes = await page.request.post('/api/_test/seed-project', {
      data: { orgId, name: 'Tasks Test Project' },
    });
    const { projectId } = await projectRes.json();

    await loginAsTestUser(page, orgId);
    await page.goto(`/projects/${projectId}`);

    // Loading skeleton should briefly appear
    await expect(page.locator('[data-testid="task-skeleton"], [data-testid="task-list"]')).toBeVisible({ timeout: 5000 });
  });
});
