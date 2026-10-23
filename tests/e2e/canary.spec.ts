import { test, expect } from '@playwright/test';

const CANARY_URL = process.env.CANARY_URL;

test.describe('L4 Canary Live Testing (TC-R01..TC-R03)', () => {
  test.skip(!CANARY_URL, 'Skipping canary test: CANARY_URL environment variable is not defined.');

  test('TC-R01 & TC-R02: canary loads with zero SiteKit errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('[SiteKit]')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(CANARY_URL!);
    await page.waitForLoadState('networkidle');

    // Asserts SiteKit core runtime initialized
    const version = await page.evaluate(() => window.__SITEKIT__?.version);
    expect(version).toBeDefined();

    // Zero SiteKit errors logged to console
    expect(consoleErrors).toHaveLength(0);
  });

  test('TC-R03: asserts Squarespace contract attributes exist on canary page', async ({ page }) => {
    await page.goto(CANARY_URL!);
    await page.waitForLoadState('domcontentloaded');

    // Official Custom Code Specification section wrapper exists
    const sections = page.locator('[data-sqsp-section]');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(0);

    // Official Custom Code Specification block wrapper exists
    const blocks = page.locator('[data-sqsp-block]');
    const blockCount = await blocks.count();
    expect(blockCount).toBeGreaterThan(0);

    // Logged-out visitor must never have editor class on body
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).not.toContain('squarespace-config');
    expect(bodyClass).not.toContain('sqs-edit-mode');
  });
});
