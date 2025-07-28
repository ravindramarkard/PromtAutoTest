@generated @allure.feature:Generated_Tests
{
  "clarificationNeeded": false,
  "testType": "ui",
  "testName": "Google Search Functionality",
  "tags": ["@smoke", "@search", "@regression"],
  "featureFile": `
Feature: Google Search Functionality
  As a user
  I want to search on Google
  So that I can find information about Raj

  @smoke @search
  Scenario: Search for Raj on Google
    Given I am on the Google homepage
    When I enter "Raj" in the search box
    And I click the search button
    Then I should see "Raj" in the first search result
    And I close the browser
  `,
  "stepDefinitions": `
  import { test, expect } from '@playwright/test';
  import { Given, When, Then } from '@cucumber/cucumber';
  
  let page;
  
  Given('I am on the Google homepage', async function () {
    page = await browser.newPage();
    await page.goto('https://google.com');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    // Handle cookie consent if present
    try {
      const consentButton = await page.locator('button:has-text("Accept all")');
      if (await consentButton.isVisible()) {
        await consentButton.click();
      }
    } catch (error) {
      console.log('Cookie consent not present');
    }
  });
  
  When('I enter {string} in the search box', async function (searchTerm) {
    await page.locator('input[name="q"]').fill(searchTerm);
  });
  
  When('I click the search button', async function () {
    // Press Enter instead of clicking search button as it's more reliable
    await page.keyboard.press('Enter');
    // Wait for search results to load
    await page.waitForSelector('#search');
  });
  
  Then('I should see {string} in the first search result', async function (expectedText) {
    // Wait for the first result and verify it contains the text
    const firstResult = await page.locator('#search .g').first();
    await expect(firstResult).toContainText(expectedText, {
      timeout: 5000
    });
  });
  
  Then('I close the browser', async function () {
    await page.close();
  });
  
  // Add Allure reporting annotations
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: 'test',
      description: 'Google Search Test'
    });
  });
  `
}

Note: This test implementation includes:
1. Proper error handling for cookie consent popup
2. Reliable selectors for Google search elements
3. Appropriate waits for page loads and elements
4. Allure reporting annotations
5. Clear step definitions with async/await
6. Page object pattern principles
7. Timeout handling for assertions
8. Browser cleanup

You might want to consider adding these additional scenarios:
1. Search with special characters
2. Search with empty string
3. Search with very long text
4. Verify search suggestions
5. Test keyboard navigation

Would you like me to generate any of these additional scenarios?