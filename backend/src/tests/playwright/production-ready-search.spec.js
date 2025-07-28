// Tags: production, search, fallback, anti-captcha
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

test.describe('Production-Ready Search with CAPTCHA Fallbacks', () => {
  
  test('should perform search with intelligent fallback strategies', async ({ browser }) => {
    console.log('🚀 Starting production-ready search with CAPTCHA handling...');
    
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();

    await test.step('Check IP status and reputation', async () => {
      const ipStatus = await AntiDetection.checkIPStatus(page);
      console.log('🔍 IP Analysis:', JSON.stringify(ipStatus, null, 2));
      
      if (ipStatus.flagged) {
        console.log('⚠️  IP appears to be flagged - will use extra caution');
      }
    });

    let searchResult;
    
    await test.step('Attempt search with advanced fallback strategies', async () => {
      try {
        searchResult = await AntiDetection.performGoogleSearch(page, 'Playwright automation testing', {
          maxRetries: 2,
          waitBetweenRetries: [10000, 20000], // Shorter waits for demo
          useAlternativeDomains: true
        });
        
        console.log('✅ Search completed successfully:', searchResult);
        
      } catch (error) {
        console.log('❌ All Google search strategies failed:', error.message);
        
        if (error.message.includes('CAPTCHA')) {
          const response = await AntiDetection.handleCaptchaChallenge(page, {
            skipTest: false,
            useAlternativeSearch: true,
            notifyUser: true
          });
          
          if (response.action === 'duckduckgo') {
            console.log('🦆 Falling back to DuckDuckGo search...');
            searchResult = await AntiDetection.performDuckDuckGoSearch(page, 'Playwright automation testing');
          }
        } else {
          throw error;
        }
      }
    });

    await test.step('Verify search results are present', async () => {
      expect(searchResult).toBeDefined();
      expect(searchResult.success).toBe(true);
      expect(searchResult.hasResults).toBe(true);
      
      console.log(`✅ Search successful on domain: ${searchResult.domain}`);
      
      // Take screenshot of successful results
      await page.screenshot({ 
        path: `search-success-${searchResult.domain.replace(/[^a-zA-Z0-9]/g, '-')}.png`,
        fullPage: true 
      });
    });

    await test.step('Analyze and log search success metrics', async () => {
      const metrics = {
        domain: searchResult.domain,
        searchEngine: searchResult.domain.includes('google') ? 'Google' : 'DuckDuckGo',
        success: searchResult.success,
        captchaEncountered: searchResult.domain !== 'google.com',
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 Search Metrics:', JSON.stringify(metrics, null, 2));
      
      // Log success for monitoring
      console.log(`
🎉 Search Test Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Status: SUCCESS
🌐 Engine: ${metrics.searchEngine}
🏷️  Domain: ${metrics.domain}
🛡️  CAPTCHA: ${metrics.captchaEncountered ? 'Avoided with fallback' : 'Not encountered'}
⏱️  Time: ${metrics.timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });

    await context.close();
  });

  test('should demonstrate IP checking and Google detection analysis', async ({ browser }) => {
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();

    await test.step('Perform comprehensive Google detection analysis', async () => {
      console.log('🔍 Performing comprehensive Google detection analysis...');
      
      // Check IP status
      const ipStatus = await AntiDetection.checkIPStatus(page);
      console.log('🌐 IP Status:', ipStatus);
      
      // Test multiple Google domains
      const domains = ['google.com', 'www.google.com', 'google.co.uk'];
      const domainResults = [];
      
      for (const domain of domains) {
        try {
          console.log(`🌍 Testing domain: ${domain}`);
          
          await AntiDetection.navigateWithDetection(page, `https://${domain}`);
          await AntiDetection.humanLikeDelay(2000, 4000);
          
          const hasCaptcha = await AntiDetection.hasBotDetection(page);
          const title = await page.title();
          
          domainResults.push({
            domain,
            captcha: hasCaptcha,
            title: title.substring(0, 50),
            accessible: !hasCaptcha
          });
          
          console.log(`   ${hasCaptcha ? '🔴' : '✅'} ${domain}: ${hasCaptcha ? 'CAPTCHA' : 'Accessible'}`);
          
        } catch (error) {
          domainResults.push({
            domain,
            error: error.message,
            accessible: false
          });
          console.log(`   ❌ ${domain}: Error - ${error.message}`);
        }
      }
      
      console.log('\n📊 Domain Analysis Summary:');
      console.log(JSON.stringify(domainResults, null, 2));
      
      const accessibleDomains = domainResults.filter(r => r.accessible);
      console.log(`\n✅ Accessible domains: ${accessibleDomains.length}/${domains.length}`);
      
      if (accessibleDomains.length === 0) {
        console.log('🔴 All Google domains blocked - IP likely flagged');
        console.log('💡 Recommendations:');
        console.log('   - Wait 30-60 minutes before retrying');
        console.log('   - Use VPN/proxy for testing');
        console.log('   - Switch to alternative search engines');
        console.log('   - Consider Google Custom Search API');
      }
    });

    await context.close();
  });

  test('should demonstrate DuckDuckGo as reliable alternative', async ({ browser }) => {
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();

    await test.step('Test DuckDuckGo search reliability', async () => {
      console.log('🦆 Testing DuckDuckGo as Google alternative...');
      
      const result = await AntiDetection.performDuckDuckGoSearch(page, 'Playwright testing framework');
      
      expect(result.success).toBe(true);
      expect(result.hasResults).toBe(true);
      expect(result.domain).toBe('duckduckgo.com');
      
      console.log('✅ DuckDuckGo search successful - reliable alternative confirmed');
      
      // Verify we can interact with results
      const resultLinks = page.locator('[data-testid="result-title-a"], .result__a').first();
      const hasLinks = await resultLinks.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasLinks) {
        console.log('✅ Search result links are interactable');
      }
      
      await page.screenshot({ path: 'duckduckgo-search-success.png', fullPage: true });
    });

    await context.close();
  });
}); 