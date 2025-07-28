// Tags: smoke, search, bing
// Tags: smoke, search, bing
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');
test.describe('Bing Search Functionality', () => {
    test.beforeEach(async ({ page }) => {
        allure.severity('critical');
        allure.epic('Search');
        allure.story('Basic Search');
    });
    test('should perform basic search for Microsoft', async ({ browser }) => {
        // Use stealth context to avoid detection
        const context = await AntiDetection.createStealthContext(browser);
        const page = await context.newPage();
        const selfHealing = new SelfHealingLocators(page);
        try {
            // Navigate with anti-detection
            await AntiDetection.navigateWithDetection(page, 'https://www.bing.com');
            // Handle any overlays and wait for stability
            await selfHealing.handleCommonOverlays();
            await selfHealing.waitForStableState();
            // Find search input using self-healing locator
            const searchInput = await selfHealing.findSearchInput();
            await expect(searchInput).toBeVisible();
            // Type search query with human-like behavior
            await AntiDetection.humanLikeFill(searchInput, 'Microsoft');
            // Press Enter with delay
            await AntiDetection.humanLikeDelay(500, 1000);
            await searchInput.press('Enter');
            // Wait for search results and verify
            await page.waitForLoadState('networkidle');
            await selfHealing.waitForStableState();
            // Verify title contains Microsoft
            const pageTitle = await page.title();
            expect(pageTitle).toContain('Microsoft');
            // Verify search results are present
            const searchResults = await selfHealing.findByText('Microsoft');
            await expect(searchResults).toBeVisible();
        } catch (error) {
            await allure.attachment('error', {
                body: error.message,
                type: 'text/plain'
            });
            throw error;
        } finally {
            await context.close();
        }
    });
    test('should handle empty search gracefully', async ({ browser }) => {
        const context = await AntiDetection.createStealthContext(browser);
        const page = await context.newPage();
        const selfHealing = new SelfHealingLocators(page);
        try {
            await AntiDetection.navigateWithDetection(page, 'https://www.bing.com');
            await selfHealing.handleCommonOverlays();
            const searchInput = await selfHealing.findSearchInput();
            await searchInput.press('Enter');
            // Verify we're still on Bing homepage
            const currentUrl = page.url();
            expect(currentUrl).toBe('https://www.bing.com/');
        } finally {
            await context.close();
        }
    });
});