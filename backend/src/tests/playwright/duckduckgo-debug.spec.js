// Tags: debug, duckduckgo
const { test, expect } = require('@playwright/test');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

test.describe('DuckDuckGo Debug', () => {
  
  test('should debug DuckDuckGo search selectors', async ({ browser }) => {
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();

    await test.step('Navigate to DuckDuckGo and perform search', async () => {
      await page.goto('https://duckduckgo.com');
      await page.waitForLoadState('networkidle');
      
      // Find the search input
      const searchInput = page.locator('#searchbox_input, input[name="q"]').first();
      await searchInput.waitFor({ state: 'visible' });
      
      await searchInput.fill('Playwright testing');
      await searchInput.press('Enter');
      
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ path: 'duckduckgo-search-results.png', fullPage: true });
    });

    await test.step('Analyze page structure and find correct selectors', async () => {
      const url = page.url();
      const title = await page.title();
      
      console.log(`📄 Page title: ${title}`);
      console.log(`🌐 Page URL: ${url}`);
      
      // Try different result selectors
      const possibleSelectors = [
        '#links',
        '.results',
        '[data-testid="result"]',
        '.result',
        '.web-result',
        '.results_links',
        '.result__body',
        '.js-result',
        '[data-testid="mainResults"]',
        '.results--main',
        'article[data-testid*="result"]',
        'h3 a',
        '.result__title',
        '.result__a'
      ];
      
      console.log('🔍 Testing result selectors:');
      
      for (const selector of possibleSelectors) {
        try {
          const elements = page.locator(selector);
          const count = await elements.count();
          const isVisible = count > 0 ? await elements.first().isVisible() : false;
          
          console.log(`   ${isVisible ? '✅' : '❌'} "${selector}": ${count} elements, visible: ${isVisible}`);
          
          if (isVisible && count > 0) {
            // Get text content of first result
            const text = await elements.first().textContent();
            console.log(`      First result text: ${text?.substring(0, 100)}...`);
          }
        } catch (error) {
          console.log(`   ❌ "${selector}": Error - ${error.message}`);
        }
      }
    });

    await test.step('Get page HTML structure for analysis', async () => {
      const bodyHTML = await page.locator('body').innerHTML();
      
      // Log first 1000 chars of body HTML
      console.log(`📝 Page HTML structure (first 1000 chars):`);
      console.log(bodyHTML.substring(0, 1000));
      
      // Search for specific patterns
      const patterns = ['result', 'search', 'web', 'link', 'title'];
      console.log('\n🔍 HTML pattern analysis:');
      
      for (const pattern of patterns) {
        const count = (bodyHTML.toLowerCase().match(new RegExp(pattern, 'g')) || []).length;
        console.log(`   "${pattern}": appears ${count} times`);
      }
    });

    await context.close();
  });
}); 