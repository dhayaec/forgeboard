/**
 * E2E test helpers for ForgeBoard.
 */
import type { Page } from '@playwright/test';

export async function loginAsTestUser(
  page: Page,
  email = 'test@forgeboard.local',
  password = 'TestPass123!'
): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function logout(page: Page): Promise<void> {
  await page.click('[data-testid="user-menu"]');
  await page.click('button:has-text("Sign Out")');
  await page.waitForURL('/auth/login');
}

export async function createProject(page: Page, name: string): Promise<void> {
  await page.goto('/projects/new');
  await page.fill('input[name="name"]', name);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/projects\/[a-z0-9]+/);
}

export default { loginAsTestUser, logout, createProject };
