// Tags: demo, self-healing, robust
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');

test.describe('Self-Healing Selector Demonstration', () => {
  test.beforeEach(async ({ page }) => {
    console.log('🧪 Starting self-healing demonstration test');
  });

  test('should demonstrate self-healing selectors on HTTPBin', async ({ page }) => {
    const selfHealing = new SelfHealingLocators(page);
    
    await test.step('Navigate and wait for stable state', async () => {
      await page.goto('https://httpbin.org/forms/post');
      await selfHealing.waitForStableState();
      await selfHealing.handleCommonOverlays();
    });

    await test.step('Find form inputs using self-healing', async () => {
      // This will try multiple strategies to find the customer name input
      console.log('🔍 Testing self-healing for customer name input...');
      const customerNameInput = page.locator([
        'input[name="custname"]',  // Most specific
        'input[placeholder*="name" i]',  // Fallback 1
        'input[type="text"]'  // Generic fallback
      ].join(', ')).first();
      
      await customerNameInput.waitFor({ state: 'visible' });
      await customerNameInput.fill('Self-Healing Test Customer');
      
      console.log('✅ Successfully found and filled customer name input');
    });

    await test.step('Find telephone input with multiple strategies', async () => {
      console.log('🔍 Testing self-healing for telephone input...');
      const telephoneInput = page.locator([
        'input[name="custtel"]',  // Specific
        'input[type="tel"]',      // Type-based
        'input[placeholder*="phone" i]',  // Placeholder-based
        'input[placeholder*="telephone" i]'  // Alternative placeholder
      ].join(', ')).first();
      
      await telephoneInput.waitFor({ state: 'visible' });
      await telephoneInput.fill('555-123-4567');
      
      console.log('✅ Successfully found and filled telephone input');
    });

    await test.step('Find email input robustly', async () => {
      console.log('🔍 Testing self-healing for email input...');
      const emailInput = page.locator([
        'input[name="custemail"]',  // Specific name
        'input[type="email"]',      // Type-based
        'input[placeholder*="email" i]',  // Placeholder-based
        'input[autocomplete="email"]'  // Autocomplete-based
      ].join(', ')).first();
      
      await emailInput.waitFor({ state: 'visible' });
      await emailInput.fill('test@selfhealing.com');
      
      console.log('✅ Successfully found and filled email input');
    });

    await test.step('Find submit button with text-based self-healing', async () => {
      console.log('🔍 Testing self-healing for submit button...');
      const submitButton = page.locator([
        'input[type="submit"]',  // Type-based
        'button[type="submit"]',  // Button element  
        'input[value*="Submit" i]',  // Value-based (capital S)
        'button:has-text("Submit")',  // Button with text
        '*[role="button"]'  // Role-based fallback
      ].join(', ')).first();
      
      await submitButton.waitFor({ state: 'visible', timeout: 5000 });
      
      console.log('✅ Successfully found submit button');
      
      // Verify it's clickable but don't submit
      await expect(submitButton).toBeVisible();
      console.log('ℹ️  Submit button is ready - skipping actual submission');
    });

    await test.step('Verify all form elements are properly filled', async () => {
      // Verify our inputs were filled correctly
      const customerName = await page.locator('input[name="custname"]').inputValue();
      const telephone = await page.locator('input[name="custtel"]').inputValue();
      const email = await page.locator('input[name="custemail"]').inputValue();
      
      expect(customerName).toBe('Self-Healing Test Customer');
      expect(telephone).toBe('555-123-4567');  
      expect(email).toBe('test@selfhealing.com');
      
      console.log('✅ All form fields verified successfully');
    });
  });

  test('should demonstrate manual self-healing approach', async ({ page }) => {
    await test.step('Navigate to a simple page', async () => {
      await page.goto('https://example.com');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Find page elements with fallback selectors', async () => {
      // Demonstrate multiple selector strategy for page title
      console.log('🔍 Finding page title with self-healing selectors...');
      const pageTitle = page.locator([
        'h1:has-text("Example Domain")',  // Specific text
        'h1',  // Generic h1
        '[role="heading"]',  // Role-based
        'title'  // Fallback (though title is not visible)
      ].join(', ')).first();
      
      await expect(pageTitle).toBeVisible();
      console.log('✅ Successfully found page title');
      
      // Verify the text content
      const titleText = await pageTitle.textContent();
      expect(titleText).toContain('Example Domain');
    });

    await test.step('Find links with robust selectors', async () => {
      console.log('🔍 Finding links with self-healing approach...');
      const moreInfoLink = page.locator([
        'a:has-text("More information")',  // Text-based
        'a[href*="iana.org"]',  // URL-based
        'a[title*="information" i]',  // Title attribute
        'a'  // Generic fallback
      ].join(', ')).first();
      
      await expect(moreInfoLink).toBeVisible();
      console.log('✅ Successfully found more information link');
    });
  });
}); 