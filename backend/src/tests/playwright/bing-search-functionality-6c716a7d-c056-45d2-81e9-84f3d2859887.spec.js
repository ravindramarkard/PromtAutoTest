// Tags: smoke, search, bing
// Tags: smoke, search, bing
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');
test.describe('Bing Search Functionality', () => {
    test('should search for Microsoft and verify results', async ({ browser }) => {
        // Create stealth context to avoid detection
        const context = await AntiDetection.createStealthContext(browser);
        const page = await context.newPage();
        const selfHealing = new SelfHealingLocators(page);
        await allure.step('Navigate to Bing homepage', async () => {
            await AntiDetection.navigateWithDetection(page, 'https://www.bing.com');
            await selfHealing.handleCommonOverlays();
            await selfHealing.waitForStableState();
        });
        await allure.step('Perform search for Microsoft', async () => {
            const searchInput = await selfHealing.findSearchInput();
            await AntiDetection.humanLikeDelay(800, 1500);
            await AntiDetection.humanLikeFill(searchInput, 'microsoft');
            const searchButton = await selfHealing.findButton('Search');
            await AntiDetection.humanLikeMouseMovement(page, { selector: searchButton });
            await searchButton.click();
            await selfHealing.waitForStableState();
        });
        await allure.step('Verify search results', async () => {
            // Wait for search results to load
            await page.waitForLoadState('networkidle');
            // Get first result text
            const firstResult = await selfHealing.findByText('microsoft', { exact: false });
            await expect(firstResult).toBeVisible();
            const firstResultText = await firstResult.textContent();
            expect(firstResultText.toLowerCase()).toContain('microsoft');
        });
        await allure.step('Cleanup', async () => {
            await context.close();
        });
    });
    test('should handle empty search gracefully', async ({ browser }) => {
        const context = await AntiDetection.createStealthContext(browser);
        const page = await context.newPage();
        const selfHealing = new SelfHealingLocators(page);
        await AntiDetection.navigateWithDetection(page, 'https://www.bing.com');
        await selfHealing.handleCommonOverlays();
        const searchInput = await selfHealing.findSearchInput();
        await searchInput.click();
        const searchButton = await selfHealing.findButton('Search');
        await searchButton.click();
        // Verify we're still on Bing homepage
        await expect(page).toHaveURL('https://www.bing.com/');
        await context.close();
    });
});