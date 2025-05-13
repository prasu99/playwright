import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Ensure screenshots directory exists
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Set test timeout to 120 seconds to account for CAPTCHA handling
test.setTimeout(120000);

// Helper functions
async function setupPage(page: Page) {
  await page.setViewportSize({ width: 1280, height: 720 });
  page.on('pageerror', error => console.error('[RUNTIME ERROR]', error));
  
  // Add stealth mode to avoid detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  });
}

// Function to handle CAPTCHA with random mouse movements
async function handleCaptcha(page: Page) {
  try {
    // Check for common CAPTCHA elements
    const captchaPresent = await page.evaluate(() => {
      return document.body.innerText.includes('captcha') || 
             document.body.innerText.includes('CAPTCHA') ||
             document.body.innerText.includes('robot') ||
             document.body.innerText.includes('verification');
    });

    if (captchaPresent) {
      console.log('CAPTCHA detected, attempting to bypass...');
      
      // Perform random mouse movements and clicks
      for (let i = 0; i < 3; i++) {
        await page.mouse.move(Math.random() * 800, Math.random() * 800);
        await page.waitForTimeout(500); // Wait between movements
        await page.mouse.click(Math.random() * 1000, Math.random() * 1000);
        await page.waitForTimeout(1000); // Wait between clicks
      }

      // Wait a bit to see if CAPTCHA was bypassed
      await page.waitForTimeout(2000);
      
      // Check if CAPTCHA is still present
      const stillPresent = await page.evaluate(() => {
        return document.body.innerText.includes('captcha') || 
               document.body.innerText.includes('CAPTCHA') ||
               document.body.innerText.includes('robot') ||
               document.body.innerText.includes('verification');
      });

      if (stillPresent) {
        console.log('CAPTCHA still present after attempts, waiting for manual intervention...');
        await page.waitForFunction(() => {
          return !document.body.innerText.includes('captcha') && 
                 !document.body.innerText.includes('CAPTCHA') &&
                 !document.body.innerText.includes('robot') &&
                 !document.body.innerText.includes('verification');
        }, { timeout: 30000 });
      }
      
      console.log('Continuing test...');
    }
  } catch (error) {
    console.error('Error handling CAPTCHA:', error);
    throw error;
  }
}

// Function to navigate with retry logic
async function navigateWithRetry(page: Page, url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await handleCaptcha(page);
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Navigation attempt ${i + 1} failed, retrying...`);
      await page.waitForTimeout(2000); // Wait 2 seconds before retry
    }
  }
}

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
  
  test.info().annotations.push({ 
    type: 'metric', 
    description: `Total Load Time: ${totalLoadTime}s` 
  });
}

// Common assertions that are used across all pages
async function verifyCommonElements(page: Page) {
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
}

// Home page test
test('Home page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/');
  await expect(page.locator('h1')).toContainText('Scelte finanziarie intelligenti in tutta semplicità');
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Scelte finanziarie' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, 'Home page');
});

// Investing page test
test('Investing page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/investire/');
  await expect(page.locator('h1')).toContainText('Investire soldi');
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Investire soldi' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, 'Investing page');
});

// Cryptocurrency page test
test('Cryptocurrency page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/investire/criptovalute/');
  await expect(page.locator('h1')).toContainText('Investire in criptovalute');
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Investire in criptovalute', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, 'Cryptocurrency page');
});

// ETF page test
test('ETF page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/investire/etf/');
  await expect(page.locator('h1')).toContainText('Investire in ETF');
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Investire in ETF' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, 'ETF page');
});

// Credit Cards page test
test('Credit Cards page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/carta-di-credito/migliori-carte-di-credito/');
  await expect(page.locator('h1')).toContainText('Le migliori carte di credito nel 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Credit Cards page');
});

// Personal Loans page test
test('Personal Loans page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/prestiti/miglior-prestito-online/');
  await expect(page.locator('h1')).toContainText('I migliori prestiti online, la classifica');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Personal Loans page');
});

// Car Insurance page test
test('Car Insurance page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/assicurazione-auto/assicurazione-auto-online-economica/');
  await expect(page.locator('h1')).toContainText('Assicurazione auto online più economica nel 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Car Insurance page');
});

// Travel Insurance page test
test('Travel Insurance page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/assicurazione-viaggio/');
  await expect(page.locator('#best-of-article-lander')).toContainText('Assicurazione viaggio: quando farla e quale scegliere');
  await expect(page.getByRole('link', { name: 'Assicurazione viaggio: quando' })).toBeVisible();
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Travel Insurance page');
});

// Life Insurance page test
test('Life Insurance page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/assicurazione-vita/miglior-assicurazione-vita/');
  await expect(page.locator('h1')).toContainText('La migliore assicurazione vita');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Life Insurance page');
});

// Current Account page test
test('Current Account page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/conto-corrente/miglior-conto-corrente-online/');
  await expect(page.locator('h1')).toContainText('Il miglior conto corrente online: classifica 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Current Account page');
});

// Business page test
test('Business page verification', async ({ page }) => {
  await setupPage(page);
  await navigateWithRetry(page, 'https://www.forbes.com/advisor/it/business/');
  await expect(page.locator('h1')).toContainText('Crea il tuo business');
  await expect(page.getByRole('img', { name: 'Crea il tuo business' })).toBeVisible();
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Business page');
}); 