import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.usatoday.com/money/blueprint/');
  await page.getByRole('link', { name: 'Best personal loans', exact: true }).click();
  await page.goto('https://www.usatoday.com/money/blueprint/personal-loans/best-personal-loans/');
  await page.goto('https://www.usatoday.com/money/blueprint/personal-loans/best-personal-loans/');
});