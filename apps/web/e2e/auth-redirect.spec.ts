import { expect, test } from '@playwright/test';

test.describe('auth redirect', () => {
  test('redirects unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/en/profile');

    await expect(page).toHaveURL(/\/en\/signin/);
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
