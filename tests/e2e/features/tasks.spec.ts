/**
 * E2E tests for the task workflow.
 */
import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers';

test.describe('Tasks', () => {
  let orgId: string;
  let projectId: string;

  test.beforeEach(async ({ request }) => {
    const orgRes = await request.post('/api/_test/seed-org', { data: {} });
    const org = await orgRes.json();
    orgId = org.orgId;

    const projectRes = await request.post('/api/_test/seed-project', {
      data: { orgId, name: 'Tasks Workflow Project' },
    });
    const project = await projectRes.json();
    projectId = project.projectId;
  });

  test('user can create a task', async ({ page }) => {
    await loginAsTestUser(page, orgId);
    await page.goto(`/projects/${projectId}`);

    await page.fill('[name="title"]', 'E2E Task 1');
    await page.click('[data-testid="create-task-btn"]');

    await expect(page.locator('text=E2E Task 1')).toBeVisible();
  });

  test('user can transition task status', async ({ page, request }) => {
    const taskRes = await request.post('/api/_test/seed-task', {
      data: { projectId, orgId, title: 'Status Test Task' },
    });
    const { taskId } = await taskRes.json();

    await loginAsTestUser(page, orgId);
    await page.goto(`/projects/${projectId}`);

    const taskRow = page.locator(`[data-testid="task-${taskId}"]`);
    await expect(taskRow).toBeVisible();

    // Click status badge → change to IN_PROGRESS
    await taskRow.locator('[data-testid="status-badge"]').click();
    await page.click('[data-testid="status-option-IN_PROGRESS"]');

    await expect(taskRow.locator('[data-testid="status-badge"]')).toContainText(/in.progress/i);
  });

  test('user can search and filter tasks', async ({ page, request }) => {
    // Seed several tasks
    await request.post('/api/_test/seed-task', { data: { projectId, orgId, title: 'Buy groceries' } });
    await request.post('/api/_test/seed-task', { data: { projectId, orgId, title: 'Write report' } });
    await request.post('/api/_test/seed-task', { data: { projectId, orgId, title: 'Buy flowers' } });

    await loginAsTestUser(page, orgId);
    await page.goto(`/projects/${projectId}`);

    await page.fill('[data-testid="task-search"]', 'buy');
    await page.click('[data-testid="task-search-btn"]');

    // Expect 2 matches (groceries + flowers)
    const items = page.locator('[data-testid^="task-"]');
    await expect(items).toHaveCount(2);
  });

  test('completed tasks get strikethrough', async ({ page, request }) => {
    const taskRes = await request.post('/api/_test/seed-task', {
      data: { projectId, orgId, title: 'Done task', status: 'DONE' },
    });
    const { taskId } = await taskRes.json();

    await loginAsTestUser(page, orgId);
    await page.goto(`/projects/${projectId}`);

    const taskRow = page.locator(`[data-testid="task-${taskId}"]`);
    const css = await taskRow.evaluate((el) => window.getComputedStyle(el).textDecoration);
    expect(css).toContain('line-through');
  });
});
