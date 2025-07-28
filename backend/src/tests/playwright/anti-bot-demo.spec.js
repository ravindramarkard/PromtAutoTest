// Tags: anti-bot, stealth, demo
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { AntiDetection } = require('../support/antiDetection');
const { SelfHealingLocators } = require('../support/selfHealingLocators');

test.describe('Anti-Bot Detection Demonstration', () => {
  let stealthBrowser;
  let stealthContext;

  test.beforeAll(async () => {
    // Launch browser with anti-detection configurations
    stealthBrowser = await AntiDetection.launchBrowser({
      headless: false, // Better for avoiding detection
      slowMo: 100,     // Slight delay between actions
    });

    // Create stealth context
    stealthContext = await AntiDetection.createStealthContext(stealthBrowser);
    
    console.log('🕵️ Stealth browser and context ready');
  });

  test.afterAll(async () => {
    if (stealthContext) await stealthContext.close();
    if (stealthBrowser) await stealthBrowser.close();
    console.log('🧹 Stealth browser cleaned up');
  });

  test('should handle potential bot detection on a protected site', async () => {
    const page = await stealthContext.newPage();
    const selfHealing = new SelfHealingLocators(page);

    await test.step('Navigate with anti-detection', async () => {
      // Example with a site that might have bot detection
      await AntiDetection.navigateWithDetection(page, 'https://httpbin.org/user-agent');
      
      // Check if we successfully bypassed any detection
      const hasDetection = await AntiDetection.hasBotDetection(page);
      console.log(`🔍 Bot detection present: ${hasDetection}`);
    });

    await test.step('Verify we appear as a normal browser', async () => {
      // Check that our user agent doesn't reveal automation
      const userAgentInfo = await page.textContent('pre');
      console.log('🌐 User Agent Info:', userAgentInfo);
      
      // Should not contain automation indicators
      expect(userAgentInfo.toLowerCase()).not.toContain('headlesschrome');
      expect(userAgentInfo.toLowerCase()).not.toContain('automation');
    });

    await test.step('Demonstrate human-like behavior', async () => {
      // Navigate to a form page
      await AntiDetection.navigateWithDetection(page, 'https://httpbin.org/forms/post');
      
      // Use human-like delays and movements
      await AntiDetection.humanLikeDelay(500, 1000);
      
      // Find inputs with self-healing
      const nameInput = await selfHealing.findSearchInput();
      
      // Fill with human-like typing
      await AntiDetection.humanLikeFill(nameInput, 'Test User', {
        delay: 120,      // Average human typing speed
        variation: 40    // Natural variation
      });
      
      console.log('✅ Human-like form interaction completed');
    });

    await page.close();
  });

  test('should handle Cloudflare-protected sites', async () => {
    const page = await stealthContext.newPage();

    await test.step('Navigate to potentially protected site', async () => {
      try {
        // This is just a demo - real Cloudflare sites may still detect automation
        await AntiDetection.navigateWithDetection(page, 'https://example.com');
        
        // If we get here, navigation was successful
        console.log('✅ Successfully navigated past any protection');
        
        // Verify page loaded correctly
        await expect(page.locator('h1')).toBeVisible();
        
      } catch (error) {
        if (error.message.includes('CAPTCHA') || error.message.includes('Rate limiting')) {
          console.log('⚠️ Protection detected - this is expected in some cases');
          test.skip('Skipping due to protection challenge');
        } else {
          throw error;
        }
      }
    });

    await page.close();
  });

  test('should demonstrate stealth browser features', async () => {
    const page = await stealthContext.newPage();

    await test.step('Verify stealth properties', async () => {
      await page.goto('https://httpbin.org/headers');
      
      // Get the headers information
      const headersText = await page.textContent('pre');
      const headers = JSON.parse(headersText);
      
      console.log('🔍 Browser Headers:', headers.headers);
      
      // Verify stealth user agent
      expect(headers.headers['User-Agent']).toContain('Chrome');
      expect(headers.headers['User-Agent']).not.toContain('Playwright');
      
      console.log('✅ Stealth user agent verified');
    });

    await test.step('Check JavaScript stealth properties', async () => {
      await page.goto('about:blank');
      
      // Check webdriver property
      const webdriverProperty = await page.evaluate(() => navigator.webdriver);
      expect(webdriverProperty).toBeUndefined();
      console.log('✅ navigator.webdriver is undefined');
      
      // Check languages (now randomized for better stealth)
      const languages = await page.evaluate(() => navigator.languages);
      expect(languages).toContain('en-US'); // Should always contain English
      expect(languages.length).toBeGreaterThanOrEqual(2); // Should have at least 2 languages
      console.log(`✅ Languages randomized correctly: ${JSON.stringify(languages)}`);
      
      // Check plugins length (now randomized)
      const pluginsLength = await page.evaluate(() => navigator.plugins.length);
      expect(pluginsLength).toBeGreaterThan(0);
      expect(pluginsLength).toBeLessThanOrEqual(10); // Reasonable range
      console.log(`✅ Plugins count randomized: ${pluginsLength}`);
      
      // Check hardware concurrency (now randomized)
      const hardwareConcurrency = await page.evaluate(() => navigator.hardwareConcurrency);
      expect(hardwareConcurrency).toBeGreaterThanOrEqual(4);
      expect(hardwareConcurrency).toBeLessThanOrEqual(12);
      console.log(`✅ Hardware concurrency randomized: ${hardwareConcurrency} cores`);
      
      // Check device memory if available (now randomized)
      const deviceMemory = await page.evaluate(() => navigator.deviceMemory);
      if (deviceMemory) {
        expect([4, 8, 16]).toContain(deviceMemory);
        console.log(`✅ Device memory randomized: ${deviceMemory}GB`);
      }
      
      // Verify Chrome runtime is mocked (may not be available on all platforms)
      const hasChromeRuntime = await page.evaluate(() => !!window.chrome?.runtime);
      console.log(`✅ Chrome runtime check: ${hasChromeRuntime ? 'Available' : 'Not available on this platform'}`);
      
      // Verify no automation indicators remain
      const automationIndicators = await page.evaluate(() => ({
        webdriver: navigator.webdriver,
        cdc_array: window.cdc_adoQpoasnfa76pfcZLmcfl_Array,
        cdc_promise: window.cdc_adoQpoasnfa76pfcZLmcfl_Promise,
        playwright: window.__playwright,
        pw_manual: window.__pw_manual
      }));
      
      expect(automationIndicators.webdriver).toBeUndefined();
      expect(automationIndicators.cdc_array).toBeUndefined();
      expect(automationIndicators.cdc_promise).toBeUndefined();
      expect(automationIndicators.playwright).toBeUndefined();
      expect(automationIndicators.pw_manual).toBeUndefined();
      
      console.log('✅ All automation indicators successfully removed');
    });

    await page.close();
  });
});

// Alternative configuration for regular Playwright config
test.describe('Regular Test with Anti-Detection', () => {
  test('should use anti-detection with standard browser', async ({ browser }) => {
    // Create stealth context even with regular browser
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();

    await test.step('Navigate with stealth context', async () => {
      await AntiDetection.navigateWithDetection(page, 'https://httpbin.org/ip');
      
      // Verify we can access the content
      const ipInfo = await page.textContent('pre');
      console.log('🌐 IP Information:', ipInfo);
      
      expect(ipInfo).toContain('origin');
    });

    await test.step('Check for bot detection indicators', async () => {
      const hasDetection = await AntiDetection.hasBotDetection(page);
      console.log(`🔍 Bot detection indicators found: ${hasDetection}`);
      
      // In most cases, this should be false for httpbin.org
      expect(hasDetection).toBe(false);
    });

    await context.close();
  });
}); 