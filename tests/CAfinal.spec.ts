import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Ensure screenshots directory exists
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Set test timeout to 60 seconds
test.setTimeout(60000);

// Helper functions
async function setupPage(page: Page) {
  await page.setViewportSize({ width: 1280, height: 720 });
  page.on('pageerror', error => console.error('[RUNTIME ERROR]', error));
}

async function capturePerformanceMetrics(page: Page, pageUrl: string) {
  const performanceEntries = await page.evaluate(() => {
    return performance.getEntriesByType('resource')
      .map(entry => ({
        name: entry.name,
        duration: Number(entry.duration.toFixed(1)),
        initiatorType: (entry as PerformanceResourceTiming).initiatorType || 'unknown'
      }))
      .filter(entry => {
        try {
          const url = new URL(entry.name);
          return url.hostname.includes('forbes.com');
        } catch {
          return false;
        }
      })
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  });

  console.log(`\nTop 5 slowest internal resources for ${pageUrl}:`);
  console.table(performanceEntries);
}

async function runPageAudit(page: Page, pageUrl: string, expectedTitle: string) {
  const start = Date.now();
  const title = test.info().title.replace(/ /g, '-');

  try {
    console.log(`[STATUS] Starting audit for ${test.info().title}`);
    await setupPage(page);
    await page.goto(pageUrl);

    // Basic page checks
    await expect(page.locator('h1')).toContainText(expectedTitle);
    await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();

    // Performance metrics
    const loadTime = ((Date.now() - start) / 1000).toFixed(3);
    test.info().annotations.push({ type: 'metric', description: `LoadTime:${loadTime}` });
    await capturePerformanceMetrics(page, pageUrl);

    // Screenshot
    await page.screenshot({ path: path.join(screenshotsDir, `${title}.png`), fullPage: true });
    console.log(`[INFO] Screenshot saved for ${test.info().title} audit`);
    console.log(`[STATUS] ${test.info().title} audit complete ✅`);
  } catch (error) {
    console.error(`[ERROR] ${test.info().title} audit failed ❌`, error);
    await page.screenshot({ path: path.join(screenshotsDir, `${title}-failure.png`), fullPage: true });
    throw error;
  }
}

// Common assertions that are used across all pages
async function verifyCommonElements(page: Page) {
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
}

// Performance metrics tracking with total load time
async function trackPerformanceMetrics(page: Page, pageUrl: string) {
  const startTime = Date.now();
  
  const performanceEntries = await page.evaluate(() => {
    return performance.getEntriesByType('resource')
      .map(entry => ({
        name: entry.name,
        duration: Number(entry.duration.toFixed(1)),
        initiatorType: (entry as PerformanceResourceTiming).initiatorType || 'unknown'
      }))
      .filter(entry => {
        try {
          const url = new URL(entry.name);
          return url.hostname.includes('forbes.com');
        } catch {
          return false;
        }
      })
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  });

  const totalLoadTime = ((Date.now() - startTime) / 1000).toFixed(3);
  console.log(`\nTotal Load Time for ${pageUrl}: ${totalLoadTime} seconds`);
  console.log(`\nTop 5 slowest internal resources for ${pageUrl}:`);
  console.table(performanceEntries);
  
  // Add load time to test annotations
  test.info().annotations.push({ 
    type: 'metric', 
    description: `Total Load Time: ${totalLoadTime}s` 
  });
}

// Home page test
test('Home page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/');
  await expect(page.locator('h1')).toContainText('Smart Financial Decisions Made Simple');
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Smart Financial Decisions' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, 'Home page');
});

// Credit Cards page test
test('Credit Cards page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/credit-cards/best/best-credit-cards/');
  await expect(page.locator('h1')).toContainText("Compare Canada’s Best Credit Cards and Choose Your Perfect Match");
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Credit Cards page');
});

// Business page test
test('Business page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/business/');
  await expect(page.locator('h1')).toContainText('Transform Your Small Business');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Business page');
});

// Cash Back Credit Cards page test
test('Cash Back Credit Cards page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/credit-cards/best/cash-back/');
  await expect(page.locator('h1')).toContainText('Best Cash Back Credit Cards In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Cash Back Credit Cards page');
});

// Mortgage Lenders page test
test('Mortgage Lenders page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/mortgages/best-mortgage-lenders/');
  await expect(page.locator('h1')).toContainText('Best Mortgage Lenders In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Mortgage Lenders page');
});

// Mortgage Rates page test
test('Mortgage Rates page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/mortgages/best-mortgage-rates-in-canada/');
  await expect(page.locator('h1')).toContainText('Best Mortgage Rates In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Mortgage Rates page');
});

// Personal Loans page test
test('Personal Loans page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/personal-loans/best-personal-loans/');
  await expect(page.locator('h1')).toContainText('Best Personal Loans In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Personal Loans page');
});

// GIC Rates page test
test('GIC Rates page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/banking/gic/best-gic-rates/');
  await expect(page.locator('h1')).toContainText('Best GIC Rates In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'GIC Rates page');
});

// Savings Accounts page test
test('Savings Accounts page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/banking/savings/best-savings-accounts/');
  await expect(page.locator('h1')).toContainText('Best Savings Accounts In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Savings Accounts page');
});

// Chequing Accounts page test
test('Chequing Accounts page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/banking/chequing/best-chequing-accounts/');
  await expect(page.locator('h1')).toContainText('Best Chequing Accounts In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Chequing Accounts page');
});

// Travel Credit Cards page test
test('Travel Credit Cards page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/credit-cards/best/travel/');
  await expect(page.locator('h1')).toContainText('Best Travel Credit Cards In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Travel Credit Cards page');
});
