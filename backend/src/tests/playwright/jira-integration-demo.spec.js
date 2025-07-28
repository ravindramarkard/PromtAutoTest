require('../support/allure-setup');
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

test.describe('🎫 JIRA INTEGRATION DEMO', () => {

  test('should demonstrate successful test with all features @smoke @demo', async ({ page }) => {
    await allure.step('Navigate to test application', async () => {
      const baseUrl = process.env.BASE_URL || 'https://example.com';
      await page.goto(baseUrl);
      
      // Add anti-detection setup
      await AntiDetection.setup(page);
      
      console.log(`✅ Successfully navigated to: ${baseUrl}`);
    });

    await allure.step('Verify page title', async () => {
      const title = await page.title();
      expect(title).toBeTruthy();
      
      console.log(`✅ Page title verified: ${title}`);
    });

    await allure.step('Take screenshot for documentation', async () => {
      await page.screenshot({ path: 'success-demo.png', fullPage: true });
      console.log('📸 Screenshot captured for successful test');
    });
  });

  test('should demonstrate failure reporting and Jira integration @regression @demo', async ({ page }) => {
    await allure.step('Navigate to test application', async () => {
      const baseUrl = process.env.BASE_URL || 'https://example.com';
      await page.goto(baseUrl);
      
      console.log(`📍 Navigated to: ${baseUrl}`);
      console.log('🎯 This test is designed to fail to demonstrate Jira integration');
    });

    await allure.step('Attempt to find non-existent element (will fail)', async () => {
      // This step will intentionally fail to trigger failure reporting
      console.log('🔍 Looking for element that does not exist...');
      
      await page.waitForSelector('#non-existent-element', { timeout: 5000 });
      
      // This line should never be reached
      console.log('❌ This should not appear - element was found unexpectedly');
    });

    await allure.step('This step should not execute', async () => {
      console.log('❌ This step should not execute due to previous failure');
    });
  });

  test('should demonstrate API failure with detailed error @api @demo', async ({ page, request }) => {
    await allure.step('Make API request to non-existent endpoint', async () => {
      const apiUrl = process.env.API_URL || 'https://jsonplaceholder.typicode.com';
      console.log(`📡 Making API request to: ${apiUrl}/non-existent-endpoint`);
      
      const response = await request.get(`${apiUrl}/non-existent-endpoint`);
      
      // This assertion will fail for 404 status
      expect(response.status()).toBe(200);
      
      console.log('❌ This should not appear - API call succeeded unexpectedly');
    });

    await allure.step('Verify response data', async () => {
      console.log('❌ This step should not execute due to previous failure');
    });
  });

  test('should demonstrate timeout failure @ui @demo @timeout', async ({ page }) => {
    await allure.step('Navigate to test application', async () => {
      const baseUrl = process.env.BASE_URL || 'https://httpstat.us/200?sleep=10000';
      console.log(`⏰ Navigating to slow-loading page: ${baseUrl}`);
      console.log('🎯 This test will timeout to demonstrate timeout failure handling');
      
      // Set a short timeout to force a timeout failure
      await page.goto(baseUrl, { timeout: 3000 });
      
      console.log('❌ This should not appear - navigation completed unexpectedly');
    });

    await allure.step('This step should not execute due to timeout', async () => {
      console.log('❌ This step should not execute due to timeout failure');
    });
  });

  test('should demonstrate assertion failure with detailed context @ui @demo @assertion', async ({ page }) => {
    await allure.step('Navigate to test application', async () => {
      const baseUrl = process.env.BASE_URL || 'https://example.com';
      await page.goto(baseUrl);
      
      console.log(`📍 Navigated to: ${baseUrl}`);
    });

    await allure.step('Verify incorrect page title (will fail)', async () => {
      const actualTitle = await page.title();
      console.log(`📋 Actual page title: "${actualTitle}"`);
      console.log(`🎯 Expected page title: "Expected Test Title"`);
      console.log('💥 This assertion will fail to demonstrate detailed error reporting');
      
      // This assertion will fail and provide detailed context
      expect(actualTitle).toBe('Expected Test Title');
      
      console.log('❌ This should not appear - assertion passed unexpectedly');
    });

    await allure.step('Additional context that will not execute', async () => {
      console.log('❌ This step should not execute due to assertion failure');
    });
  });

  test('should demonstrate form interaction failure @ui @demo @forms', async ({ page }) => {
    await allure.step('Navigate to test application', async () => {
      const baseUrl = process.env.BASE_URL || 'https://example.com';
      await page.goto(baseUrl);
      
      console.log(`📍 Navigated to: ${baseUrl}`);
    });

    await allure.step('Attempt to fill non-existent form (will fail)', async () => {
      console.log('📝 Attempting to interact with non-existent form elements');
      
      // These interactions will fail and provide context about the attempted actions
      await page.fill('#non-existent-username', 'testuser');
      await page.fill('#non-existent-password', 'testpass');
      await page.click('#non-existent-submit');
      
      console.log('❌ This should not appear - form interaction succeeded unexpectedly');
    });

    await allure.step('Verify form submission result', async () => {
      console.log('❌ This step should not execute due to form interaction failure');
    });
  });

});

console.log(`
🎫 JIRA INTEGRATION DEMO TEST SUITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PURPOSE:
This test suite demonstrates the comprehensive Jira integration and failure 
reporting capabilities of the Auto-Test LLM Platform.

✅ SUCCESSFUL TEST:
• Demonstrates normal test execution with screenshots
• Shows proper test organization and reporting
• Validates basic functionality works correctly

❌ FAILURE SCENARIOS:
• Element Not Found: Timeout waiting for non-existent elements
• API Failures: HTTP status code mismatches
• Timeout Failures: Page load timeouts with slow responses  
• Assertion Failures: Data validation mismatches with context
• Form Interaction Failures: UI element interaction failures

🔧 AUTOMATIC FAILURE PROCESSING:
When tests fail, the system automatically:

📸 CAPTURES ARTIFACTS:
• Screenshots of the failure moment
• Video recordings of the entire test execution
• Trace files for detailed debugging
• Error stack traces and context

📋 GENERATES FAILURE REPORTS:
• Detailed error analysis and categorization
• Steps to reproduce the failure
• Environment and browser information
• Test execution context and metadata

🎫 CREATES JIRA TICKETS:
• Automatic ticket creation (if Jira is enabled)
• Comprehensive failure description
• Attached screenshots and videos
• Steps to reproduce section
• Environment and system information
• Proper labeling and categorization

📊 ALLURE INTEGRATION:
• Rich test reports with failure context
• Linked Jira tickets for easy tracking
• Organized by Collections, Suites, or Individual tests
• Screenshots and videos embedded in reports

🌍 ENVIRONMENT SUPPORT:
• Different environments (Dev, Staging, Prod)
• Environment-specific Jira configurations
• Automatic environment detection
• Context-aware failure reporting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 TO TEST JIRA INTEGRATION:
1. Configure Jira settings in Environment Management
2. Enable Jira integration for your environment
3. Run this test suite with: npm run test:jira-demo
4. Check created Jira tickets and Allure reports

💡 NOTE: Some tests are designed to fail for demonstration purposes.
This is expected behavior to showcase the failure reporting capabilities.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`); 