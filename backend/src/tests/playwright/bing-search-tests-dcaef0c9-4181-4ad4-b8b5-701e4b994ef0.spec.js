// Tags: generated
// @ts-check
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

test.describe('Bing Search Tests', () => {
  test('should search for AI and verify results', async ({ browser }) => {
    // Setup anti-detection context
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    const selfHealing = new SelfHealingLocators(page);

    try {
      // Add allure steps for better reporting
      await allure.step('Navigate to Bing', async () => {
        await AntiDetection.navigateWithDetection(page, 'https://www.bing.com');
        await selfHealing.waitForStableState();
        await selfHealing.handleCommonOverlays(); // Handle cookie banners etc
      });

      await allure.step('Perform search for AI', async () => {
        // Find and fill search input using self-healing locators
        const searchInput = await selfHealing.findSearchInput();
        await AntiDetection.humanLikeFill(searchInput, 'AI');
        
        // Find and click search button
        const searchButton = await selfHealing.findButton('Search');
        await searchButton.click();
        
        // Wait for results to load
        await selfHealing.waitForStableState();
      });

      await allure.step('Verify search results', async () => {
        // Get first result using self-healing locators
        const firstResult = await selfHealing.findByText('AI', { exact: false });
        await expect(firstResult).toBeVisible();
        
        // Verify AI appears in first result
        const firstResultText = await firstResult.textContent();
        expect(firstResultText.toLowerCase()).toContain('ai');
      });

    } catch (error) {
      // Log error and take screenshot
      console.error('Test failed:', error);
      await page.screenshot({ path: 'error-bing-search.png' });
      throw error;
    } finally {
      // Cleanup
      await context.close();
    }
  });

  // Negative test case
  test('should handle empty search gracefully', async ({ browser }) => {
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    const selfHealing = new SelfHealingLocators(page);

    try {
      await AntiDetection.navigateWithDetection(page, 'https://www.bing.com');
      await selfHealing.waitForStableState();
      await selfHealing.handleCommonOverlays();

      // Try to search without entering text
      const searchButton = await selfHealing.findButton('Search');
      await searchButton.click();

      // Verify we're still on Bing homepage
      await expect(page).toHaveURL('https://www.bing.com/');

    } finally {
      await context.close();
    }
  });
});