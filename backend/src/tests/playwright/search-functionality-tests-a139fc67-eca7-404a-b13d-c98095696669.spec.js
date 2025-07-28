// Tags: smoke, search
// Tags: smoke, search
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');
test.describe('Search Functionality Tests', () => {
  const baseUrl = process.env.BASE_URL || 'https://www.bing.com';
  const timeout = parseInt(process.env.TIMEOUT) || 30000;
  test('should search for Google and verify results', async ({ browser }) => {
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    const selfHealing = new SelfHealingLocators(page);
    try {
      await allure.step('Navigate to search page', async () => {
        await AntiDetection.navigateWithDetection(page, baseUrl);
        await page.waitForLoadState('networkidle');
      });
      await allure.step('Handle any cookie consent or overlays', async () => {
        await selfHealing.handleCommonOverlays();
        await AntiDetection.humanLikeDelay(1000, 2000);
      });
      await allure.step('Perform search for Google', async () => {
        const searchInput = await selfHealing.findSearchInput();
        await AntiDetection.humanLikeFill(searchInput, 'google');
        await AntiDetection.humanLikeDelay(500, 1000);
        await page.keyboard.press('Enter');
      });
      await allure.step('Verify search results', async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('title', { timeout });
        const pageTitle = await page.title();
        expect(pageTitle.toLowerCase()).toContain('google');
        expect(pageTitle.toLowerCase()).toContain('search results');
      });
    } catch (error) {
      await allure.attachment('Error Screenshot', await page.screenshot(), {
        contentType: 'image/png'
      });
      throw error;
    } finally {
      await allure.step('Cleanup: Close browser', async () => {
        await context.close();
      });
    }
  });
});