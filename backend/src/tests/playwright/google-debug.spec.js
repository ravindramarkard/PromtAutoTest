// Tags: debug, google, anti-detection
const { test, expect } = require('@playwright/test');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

test.describe('Google Search Debug with Ultra-Enhanced Anti-Detection', () => {
  
  test('should debug what Google shows after enhanced stealth search', async ({ browser }) => {
    console.log('🔍 Starting Google search debug with maximum stealth...');
    
    // Use ultra-enhanced stealth
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    const selfHealing = new SelfHealingLocators(page);

    await test.step('Navigate to Google with maximum stealth', async () => {
      await AntiDetection.navigateWithDetection(page, 'https://google.com');
      await selfHealing.handleCommonOverlays();
      
      // Take screenshot after navigation
      await page.screenshot({ path: 'debug-after-navigation.png', fullPage: true });
      console.log('📸 Screenshot taken after navigation');
    });

    await test.step('Perform search with ultra-realistic behavior', async () => {
      const searchInput = await selfHealing.findSearchInput();
      
      await AntiDetection.humanLikeFill(searchInput, 'test search', {
        delay: 180,
        variation: 100,
        pauseProbability: 0.2,
        backspaceProbability: 0.1,
        preDelay: [1000, 2000],
        postDelay: [800, 1500]
      });
      
      // Extra delay before pressing Enter
      await AntiDetection.humanLikeDelay(1000, 2000);
      await searchInput.press('Enter');
      
      console.log('✅ Search submitted with ultra-realistic behavior');
    });

    await test.step('Debug what page we get after search', async () => {
      // Wait for page response
      await selfHealing.waitForStableState();
      
      // Take screenshot of result page
      await page.screenshot({ path: 'debug-after-search.png', fullPage: true });
      console.log('📸 Screenshot taken after search');
      
      // Get page title and URL
      const title = await page.title();
      const url = page.url();
      console.log(`📄 Page title: ${title}`);
      console.log(`🌐 Page URL: ${url}`);
      
      // Check for CAPTCHA indicators
      const hasCaptcha = await AntiDetection.hasBotDetection(page);
      console.log(`🤖 CAPTCHA detected: ${hasCaptcha}`);
      
      // Get page content analysis
      const pageContent = await page.content();
      const hasUnusualTraffic = pageContent.includes('unusual traffic');
      const hasRecaptcha = pageContent.includes('recaptcha');
      const hasNotRobot = pageContent.includes('not a robot');
      const hasResults = pageContent.includes('result');
      
      console.log(`🚦 Page analysis:`);
      console.log(`   - Contains "unusual traffic": ${hasUnusualTraffic}`);
      console.log(`   - Contains "recaptcha": ${hasRecaptcha}`);
      console.log(`   - Contains "not a robot": ${hasNotRobot}`);
      console.log(`   - Contains "result": ${hasResults}`);
      
      // Check for specific elements
      const searchResults = page.locator('#search, #rso, .search-results').first();
      const resultExists = await searchResults.isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`🔍 Search results visible: ${resultExists}`);
      
      // Check for CAPTCHA elements specifically
      const captchaElements = [
        'iframe[src*="recaptcha"]',
        '.g-recaptcha',
        'text=I\'m not a robot',
        'text=unusual traffic'
      ];
      
      for (const selector of captchaElements) {
        const exists = await page.locator(selector).isVisible({ timeout: 2000 }).catch(() => false);
        if (exists) {
          console.log(`🚨 CAPTCHA element found: ${selector}`);
        }
      }
      
      // Get visible text on page (first 500 chars)
      const bodyText = await page.locator('body').textContent();
      console.log(`📝 Page content preview: ${bodyText.substring(0, 500)}...`);
    });

    await test.step('Test alternative approaches if blocked', async () => {
      const hasDetection = await AntiDetection.hasBotDetection(page);
      
      if (hasDetection) {
        console.log('🔴 Bot detection confirmed - testing alternative approaches');
        
        // Try going to a different Google domain
        await AntiDetection.navigateWithDetection(page, 'https://www.google.com/search?q=test');
        await page.screenshot({ path: 'debug-alternative-approach.png', fullPage: true });
        
        const alternativeHasDetection = await AntiDetection.hasBotDetection(page);
        console.log(`🔄 Alternative approach detected: ${alternativeHasDetection}`);
      } else {
        console.log('✅ No detection found - search should be working');
      }
    });

    await context.close();
    
    console.log('🎯 Debug test completed - check screenshots for visual analysis');
  });

  test('should test enhanced stealth browser launch', async () => {
    console.log('🚀 Testing enhanced stealth browser launch...');
    
    const browser = await AntiDetection.launchBrowser({
      headless: false,
      slowMo: 200
    });
    
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    
    await test.step('Verify stealth properties are working', async () => {
      await page.goto('https://httpbin.org/headers');
      
      const headers = await page.textContent('pre');
      console.log('🌐 Request headers:', headers);
      
      await page.goto('about:blank');
      
      // Check enhanced stealth properties
      const stealthCheck = await page.evaluate(() => ({
        webdriver: navigator.webdriver,
        plugins: navigator.plugins.length,
        languages: navigator.languages,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        connection: navigator.connection?.effectiveType,
        chrome: !!window.chrome,
        automation: window.cdc_adoQpoasnfa76pfcZLmcfl_Array,
        playwright: window.__playwright
      }));
      
      console.log('🛡️ Stealth properties check:', JSON.stringify(stealthCheck, null, 2));
      
      expect(stealthCheck.webdriver).toBeUndefined();
      expect(stealthCheck.automation).toBeUndefined();
      expect(stealthCheck.playwright).toBeUndefined();
      expect(stealthCheck.plugins).toBeGreaterThan(0);
      
      console.log('✅ All enhanced stealth properties verified');
    });
    
    await context.close();
    await browser.close();
  });
}); 