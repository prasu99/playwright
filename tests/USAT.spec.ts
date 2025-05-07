import { test, expect } from '@playwright/test';

// --- 1. Blueprint Page Test ---
test('USAT Blueprint Page - Verify headline and gold price link', async ({ page }) => {
  await page.goto('https://www.usatoday.com/money/blueprint/');
  await expect(page.getByRole('main')).toContainText('USA TODAY Blueprint');
  await expect(page.getByRole('link', { name: 'Gold price today: Gold is' })).toBeVisible();
  console.log('[CHECK] Blueprint page verified');
});

// --- 2. Money Page Test ---
test('USAT Money Page - Verify headline, Powerball link, and iframe ad', async ({ page }) => {
  await page.goto('https://www.usatoday.com/money/');
  await expect(page.locator('h1')).toContainText('Money');
  await expect(page.getByRole('link', { name: 'Powerball winning numbers for' })).toBeVisible();

  const iframe = page.frameLocator('iframe[name="google_ads_iframe_7103\\/usatoday\\/poster_scroll_front\\/money\\/main_1"]');
  await expect(iframe.getByRole('link')).toBeVisible();
  console.log('[CHECK] Money page and iframe ad verified');
});

// --- 3. Investing Section Test ---
test('USAT Investing Section - Verify navigation and Warren article link', async ({ page }) => {
  await page.goto('https://www.usatoday.com/money/');
  await page.getByRole('link', { name: 'Investing', exact: true }).click();
  await page.getByRole('navigation', { name: 'Investing section navigation' }).click();
  await expect(page.getByLabel('Money navigation')).toContainText('Investing');
  await expect(page.getByRole('link', { name: 'How investment guru Warren' })).toBeVisible();
  console.log('[CHECK] Investing section verified');
});

// --- 4. Shopping Section Test ---
test('USAT Shopping Section - Verify navigation and shopping article link', async ({ page }) => {
  await page.goto('https://www.usatoday.com/money/');
  await page.getByRole('link', { name: 'Shopping' }).click();
  await expect(page.getByLabel('Shopping section navigation')).toContainText('Shopping');
  await expect(page.getByRole('link', { name: 'Save on outdoor gear for life' })).toBeVisible();
  console.log('[CHECK] Shopping section verified');
});
