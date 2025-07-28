// Tags: generated
// @ts-check
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

test.describe('Bing Search Functionality', () => {
  test('should search for AI and verify results', async ({ browser }) => {
    // Setup anti-detection context
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    const selfHealing = new SelfHealingLocators(page);

    await allure.step('Navigate to Bing', async () => {
      await AntiDetection.navigateWithDetection(page, 'https://www.bing.com');
      await selfHealing.waitForStableState();
      await selfHealing.handleCommonOverlays(); // Handle any cookie banners or popups
    });

    await allure.step('Perform search for AI', async () => {
      // Find and interact with search input using self-healing locators
      const searchInput = await selfHealing.findSearchInput();
      await AntiDetection.humanLikeFill(searchInput, 'AI');
      
      // Find and click search button
      const searchButton = await selfHealing.findButton('Search');
      await searchButton.click();
      
      // Wait for search results to load
      await selfHealing.waitForStableState();
    });

    await allure.step('Verify search results', async () => {
      // Get first search result using self-healing locators
      const firstResult = await selfHealing.findByText('AI', { exact: false });
      
      // Verify AI appears in first result
      await expect(firstResult).toBeVisible();
      const firstResultText = await firstResult.textContent();
      expect(firstResultText.toLowerCase()).toContain('ai');
    });

    // Cleanup
    await context.close();
  });

  // Negative test case
  test('should handle empty search gracefully', async ({ browser }) => {
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    const selfHealing = new SelfHealingLocators(page);

    await AntiDetection.navigateWithDetection(page, 'https://www.bing.com');
    await selfHealing.waitForStableState();
    await selfHealing.handleCommonOverlays();

    // Try to search without entering text
    const searchButton = await selfHealing.findButton('Search');
    await searchButton.click();

    // Verify we're still on Bing homepage
    await expect(page).toHaveURL('https://www.bing.com/');

    await context.close();
  });
});
