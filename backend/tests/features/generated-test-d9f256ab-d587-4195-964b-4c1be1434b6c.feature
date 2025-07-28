@generated @allure.feature:Generated_Tests
{
  "clarificationNeeded": true,
  "questions": [
    "What search terms should be tested?",
    "Should we validate search suggestions/autocomplete?",
    "Do we need to verify search results count?",
    "Should we test different types of searches (images, news, etc.)?",
    "Are there any specific error scenarios to test?"
  ],
  "featureFile": `
    @search
    Feature: Google Search Functionality
    As a user
    I want to perform searches on Google
    So that I can find relevant information

    Background:
      Given I am on the Google homepage

    @smoke
    Scenario: Perform basic search
      When I enter "playwright testing" in the search box
      And I click the search button
      Then I should see search results
      And the page title should contain "playwright testing"

    @regression
    Scenario: Verify search suggestions
      When I start typing "play" in the search box
      Then I should see search suggestions
      And the suggestions should contain "playwright"

    @negative
    Scenario: Search with empty query
      When I click the search button without entering any text
      Then I should remain on the Google homepage
  `,
  "stepDefinitions": `
    import { test, expect } from '@playwright/test';
    import { Given, When, Then } from '@cucumber/cucumber';

    let page;

    Given('I am on the Google homepage', async function () {
      page = await browser.newPage();
      await page.goto('https://google.com');
      // Handle cookie consent if present
      try {
        const consentButton = await page.locator('button:has-text("Accept all")');
        if (await consentButton.isVisible())
          await consentButton.click();
      } catch (e) {
        console.log('Cookie consent not present');
      }
    });

    When('I enter {string} in the search box', async function (searchTerm) {
      await page.locator('input[name="q"]').fill(searchTerm);
    });

    When('I click the search button', async function () {
      await page.locator('input[name="btnK"]').click();
    });

    When('I start typing {string} in the search box', async function (partialText) {
      await page.locator('input[name="q"]').fill(partialText);
      // Wait for suggestions to appear
      await page.waitForSelector('ul[role="listbox"]');
    });

    Then('I should see search results', async function () {
      await expect(page.locator('#search')).toBeVisible();
      const results = await page.locator('#search div[class*="g"]').count();
      expect(results).toBeGreaterThan(0);
    });

    Then('the page title should contain {string}', async function (expectedText) {
      await expect(page).toHaveTitle(new RegExp(expectedText, 'i'));
    });

    Then('I should see search suggestions', async function () {
      const suggestions = await page.locator('ul[role="listbox"] li');
      await expect(suggestions).toHaveCount({ minimum: 1 });
    });

    Then('the suggestions should contain {string}', async function (expectedText) {
      const suggestions = await page.locator('ul[role="listbox"] li').allTextContents();
      expect(suggestions.some(text => text.toLowerCase().includes(expectedText.toLowerCase()))).toBeTruthy();
    });

    Then('I should remain on the Google homepage', async function () {
      await expect(page).toHaveURL('https://google.com/');
    });

    After(async function () {
      await page.close();
    });
  `,
  "testType": "ui",
  "testName": "Google Search Functionality Test",
  "tags": ["@search", "@smoke", "@regression"]
}