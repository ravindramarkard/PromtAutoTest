// Tags: comprehensive, self-healing, anti-bot, example
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

test.describe('Comprehensive Self-Healing + Anti-Detection Example', () => {
  
  test('should demonstrate complete robust testing approach', async ({ browser }) => {
    // Create stealth context for anti-detection
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    const selfHealing = new SelfHealingLocators(page);

    await test.step('Navigate with full protection', async () => {
      console.log('🚀 Starting comprehensive robust test...');
      
      // Use anti-detection navigation
      await AntiDetection.navigateWithDetection(page, 'https://httpbin.org/forms/post');
      
      // Use self-healing stability check
      await selfHealing.waitForStableState();
      await selfHealing.handleCommonOverlays();
      
      console.log('✅ Successfully navigated with full protection');
    });

    await test.step('Fill form with robust selectors and human behavior', async () => {
      console.log('📝 Filling form with self-healing + human behavior...');
      
      // Use self-healing to find customer name input with multiple fallbacks
      const customerNameInput = page.locator([
        'input[name="custname"]',           // Primary selector
        'input[placeholder*="customer" i]', // Placeholder fallback
        'input[type="text"]'               // Type fallback
      ].join(', ')).first();
      
      // Fill with human-like behavior
      await AntiDetection.humanLikeFill(customerNameInput, 'John Doe Robot-Proof', {
        delay: 120,
        variation: 40
      });
      
      console.log('✅ Customer name filled with human-like behavior');
    });

    await test.step('Handle telephone input with multiple strategies', async () => {
      // Use self-healing utility method
      try {
        const telephoneInput = await selfHealing.findByText('telephone');
        await AntiDetection.humanLikeFill(telephoneInput, '+1-555-123-4567');
        console.log('✅ Used self-healing utility for telephone');
      } catch (error) {
        // Fallback to manual multi-selector approach
        console.log('🔄 Fallback to manual selector approach');
        const telephoneInput = page.locator([
          'input[name="custtel"]',
          'input[type="tel"]',
          'input[placeholder*="phone" i]',
          'input[placeholder*="telephone" i]'
        ].join(', ')).first();
        
        await AntiDetection.humanLikeFill(telephoneInput, '+1-555-123-4567');
        console.log('✅ Used manual fallback for telephone');
      }
    });

    await test.step('Handle email with comprehensive approach', async () => {
      // Combine self-healing with human behavior
      const emailInput = page.locator([
        'input[name="custemail"]',
        'input[type="email"]',
        'input[autocomplete="email"]',
        'input[placeholder*="email" i]'
      ].join(', ')).first();
      
      // Add human-like mouse movement before typing
      await AntiDetection.humanLikeMouseMovement(page, { 
        selector: 'input[name="custemail"]' 
      });
      
      await AntiDetection.humanLikeDelay(200, 500);
      
      await AntiDetection.humanLikeFill(emailInput, 'john.doe@robusttest.com', {
        delay: 100,
        variation: 30
      });
      
      console.log('✅ Email filled with mouse movement + human typing');
    });

    await test.step('Handle dropdown/select with fallbacks', async () => {
      // Handle medium selection with multiple strategies
      const mediumSelect = page.locator([
        'select[name="custmedium"]',
        'select',
        '[data-testid*="medium"]',
        '[name*="medium"]'
      ].join(', ')).first();
      
      await mediumSelect.waitFor({ state: 'visible' });
      await AntiDetection.humanLikeDelay(300, 600);
      await mediumSelect.selectOption('Email');
      
      console.log('✅ Dropdown selection completed');
    });

    await test.step('Find and verify submit button without submitting', async () => {
      // Use self-healing button finder
      try {
        const submitButton = await selfHealing.findButton('Submit');
        await expect(submitButton).toBeVisible();
        console.log('✅ Submit button found with self-healing utility');
      } catch (error) {
        // Manual fallback approach
        const submitButton = page.locator([
          'input[type="submit"]',
          'button[type="submit"]',
          'button:has-text("Submit")',
          'input[value*="Submit" i]'
        ].join(', ')).first();
        
        await expect(submitButton).toBeVisible();
        console.log('✅ Submit button found with manual fallback');
      }
      
      // Don't actually submit to avoid external dependencies
      console.log('ℹ️  Form ready for submission - skipping actual submit');
    });

    await test.step('Verify all form data with robust checks', async () => {
      // Verify our inputs were filled correctly using robust selectors
      const customerName = await page.locator('input[name="custname"], input[type="text"]').first().inputValue();
      const telephone = await page.locator('input[name="custtel"], input[type="tel"]').first().inputValue();
      const email = await page.locator('input[name="custemail"], input[type="email"]').first().inputValue();
      const medium = await page.locator('select[name="custmedium"], select').first().inputValue();
      
      expect(customerName).toBe('John Doe Robot-Proof');
      expect(telephone).toBe('+1-555-123-4567');
      expect(email).toBe('john.doe@robusttest.com');
      expect(medium).toBe('Email');
      
      console.log('✅ All form data verified successfully');
    });

    await test.step('Final anti-detection verification', async () => {
      // Verify we haven't triggered any bot detection
      const hasDetection = await AntiDetection.hasBotDetection(page);
      expect(hasDetection).toBe(false);
      
      // Verify stealth properties are still active
      const webdriverProperty = await page.evaluate(() => navigator.webdriver);
      expect(webdriverProperty).toBeUndefined();
      
      console.log('✅ No bot detection triggered - stealth maintained');
    });

    await context.close();
    console.log('🎉 Comprehensive robust test completed successfully!');
  });

  test('should handle Google search with full protection', async ({ browser }) => {
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    const selfHealing = new SelfHealingLocators(page);

    await test.step('Navigate to Google with anti-detection', async () => {
      await AntiDetection.navigateWithDetection(page, 'https://google.com');
      await selfHealing.handleCommonOverlays(); // Handle cookie consent
    });

    await test.step('Perform search with self-healing selectors', async () => {
      // Use self-healing search input finder
      const searchInput = await selfHealing.findSearchInput();
      
      // Fill with human-like behavior
      await AntiDetection.humanLikeFill(searchInput, 'Playwright testing automation', {
        delay: 150,
        variation: 50
      });
      
      // Human-like delay before pressing Enter
      await AntiDetection.humanLikeDelay(500, 1000);
      await searchInput.press('Enter');
      
      console.log('✅ Google search performed with full protection');
    });

    await test.step('Verify search results appear', async () => {
      // Wait for results with self-healing
      await selfHealing.waitForStableState();
      
      // Check for search results with multiple fallback selectors
      const searchResults = page.locator([
        '#search',
        '#rso', 
        '[data-testid="search-results"]',
        '.search-results'
      ].join(', ')).first();
      
      await expect(searchResults).toBeVisible({ timeout: 10000 });
      
      // Verify no bot detection was triggered
      const hasDetection = await AntiDetection.hasBotDetection(page);
      expect(hasDetection).toBe(false);
      
      console.log('✅ Search results loaded without detection');
    });

    await context.close();
  });
}); 