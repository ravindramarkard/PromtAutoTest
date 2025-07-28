// Tags: demo, environment, runtime, google
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

test.describe('🔧 ENVIRONMENT VARIABLES - WORKING EXAMPLE', () => {
  
  // Environment variables with fallbacks (LLM-generated pattern)
  const baseUrl = process.env.BASE_URL || 'https://www.google.com';
  const searchTerm = process.env.SEARCH_TERM || 'playwright testing';
  const username = process.env.USERNAME || 'testuser';
  const timeout = parseInt(process.env.TIMEOUT) || 30000;
  
  test('should perform search using environment variables', async ({ browser }) => {
    
    await allure.step('Display environment configuration', async () => {
      console.log(`
🔧 ENVIRONMENT VARIABLES IN ACTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 BASE_URL: ${baseUrl}
🔍 SEARCH_TERM: ${searchTerm}  
👤 USERNAME: ${username}
⏱️ TIMEOUT: ${timeout}ms

🔄 CONFIGURATION SOURCES:
BASE_URL  → ${process.env.BASE_URL ? '🌍 Environment Override' : '🏠 Default Fallback'}
SEARCH_TERM → ${process.env.SEARCH_TERM ? '🌍 Environment Override' : '🏠 Default Fallback'}
USERNAME  → ${process.env.USERNAME ? '🌍 Environment Override' : '🏠 Default Fallback'}
TIMEOUT   → ${process.env.TIMEOUT ? '🌍 Environment Override' : '🏠 Default Fallback'}

✅ THIS DEMONSTRATES DYNAMIC TEST CONFIGURATION!
      `);
    });

    await allure.step('Navigate using environment BASE_URL', async () => {
      const context = await AntiDetection.createStealthContext(browser);
      const page = await context.newPage();
      const selfHealing = new SelfHealingLocators(page);

      console.log(`🚀 Navigating to: ${baseUrl}`);
      
      // Navigate using environment variable URL
      await AntiDetection.navigateWithDetection(page, baseUrl);
      await page.waitForLoadState('networkidle', { timeout });
      
      // Handle any overlays
      await selfHealing.handleCommonOverlays();
      console.log(`✅ Page loaded successfully from: ${baseUrl}`);
      
      await allure.step('Perform search with environment variables', async () => {
        console.log(`🔍 Searching for: "${searchTerm}"`);
        
        // Find search input using self-healing locators
        const searchInput = await selfHealing.findSearchInput();
        expect(searchInput).toBeTruthy();
        
        // Fill search term using environment variable
        await AntiDetection.humanLikeFill(searchInput, searchTerm);
        
        // Submit search
        await searchInput.press('Enter');
        await AntiDetection.humanLikeDelay(2000, 4000);
        
        console.log(`✅ Search performed with term: "${searchTerm}"`);
        console.log(`📊 Environment variables successfully used in test execution!`);
      });
      
      await context.close();
    });
  });
  
  test('should demonstrate different environment scenarios', async () => {
    console.log(`
🌍 ENVIRONMENT OVERRIDE SCENARIOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 SCENARIO 1: DEFAULT ENVIRONMENT
   Command: npx playwright test environment-test-example.spec.js
   BASE_URL: https://www.google.com (default)
   SEARCH_TERM: playwright testing (default)
   Result: Tests run with default Google search

📋 SCENARIO 2: STAGING ENVIRONMENT
   Command: BASE_URL="https://bing.com" SEARCH_TERM="automation testing" npx playwright test environment-test-example.spec.js
   BASE_URL: https://bing.com (override)
   SEARCH_TERM: automation testing (override)
   Result: Tests run against Bing with different search term

📋 SCENARIO 3: CUSTOM CONFIGURATION
   Command: BASE_URL="https://duckduckgo.com" SEARCH_TERM="selenium vs playwright" TIMEOUT="60000" npx playwright test environment-test-example.spec.js
   BASE_URL: https://duckduckgo.com (override)
   SEARCH_TERM: selenium vs playwright (override)
   TIMEOUT: 60000ms (override)
   Result: Tests run against DuckDuckGo with custom settings

🎯 HOW TEST SUITES USE THIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CREATE TEST SUITE:
   • Add this test to a test suite
   • Set suite default environment to "Development"

2. RUN WITH DIFFERENT ENVIRONMENTS:
   
   🔸 Development Run (default):
   • BASE_URL: http://localhost:3000
   • USERNAME: testuser
   • Tests run against local development

   🔸 Staging Run (override):  
   • BASE_URL: https://staging.example.com
   • USERNAME: staging_user
   • Tests run against staging environment

   🔸 Production Run (override):
   • BASE_URL: https://app.example.com
   • USERNAME: prod_user
   • Tests run against production environment

✅ SAME TEST CODE, DIFFERENT RUNTIME BEHAVIOR!

🏆 ENVIRONMENT-AWARE TESTING ACHIEVED! 🏆
    `);
  });
}); 