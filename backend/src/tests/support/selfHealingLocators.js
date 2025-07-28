const { expect } = require('@playwright/test');

/**
 * Self-healing locator utility for Playwright tests
 * Provides robust element finding with multiple fallback strategies
 */
class SelfHealingLocators {
  constructor(page) {
    this.page = page;
    this.timeout = 10000; // 10 seconds default timeout
  }

  /**
   * Smart search input finder - handles various input types and attributes
   * @param {Object} options - Configuration options
   * @returns {Promise<Locator>} - Playwright locator
   */
  async findSearchInput(options = {}) {
    const strategies = [
      // Most specific selectors first
      'textarea[name="q"]', // Google search (correct)
      'input[name="q"]', // Fallback for input-based search
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="Search" i]',
      'textarea[placeholder*="search" i]',
      'input[aria-label*="search" i]',
      'textarea[aria-label*="search" i]',
      '[data-testid*="search"]',
      '[role="searchbox"]',
      '#search-input',
      '#search',
      '.search-input',
      '.search-box',
      // Generic fallbacks
      'input[type="text"]',
      'textarea'
    ];

    return this.tryStrategies(strategies, 'search input', options);
  }

  /**
   * Smart button finder with text-based and attribute-based strategies
   * @param {string} buttonText - Text content or partial text
   * @param {Object} options - Configuration options
   * @returns {Promise<Locator>} - Playwright locator
   */
  async findButton(buttonText, options = {}) {
    const strategies = [
      // Exact text match
      `button:has-text("${buttonText}")`,
      `input[type="submit"][value="${buttonText}"]`,
      `input[type="button"][value="${buttonText}"]`,
      // Partial text match
      `button:has-text("${buttonText.toLowerCase()}")`,
      `*[role="button"]:has-text("${buttonText}")`,
      // Attribute-based
      `button[aria-label*="${buttonText}" i]`,
      `*[data-testid*="${buttonText.toLowerCase()}"]`,
      `*[class*="${buttonText.toLowerCase()}"]`,
      `*[id*="${buttonText.toLowerCase()}"]`,
      // Generic button selectors
      'button[type="submit"]',
      'input[type="submit"]',
      '*[role="button"]'
    ];

    return this.tryStrategies(strategies, `button with text "${buttonText}"`, options);
  }

  /**
   * Smart link finder
   * @param {string} linkText - Link text or partial text
   * @param {Object} options - Configuration options
   * @returns {Promise<Locator>} - Playwright locator
   */
  async findLink(linkText, options = {}) {
    const strategies = [
      `a:has-text("${linkText}")`,
      `*[role="link"]:has-text("${linkText}")`,
      `a[href*="${linkText.toLowerCase()}"]`,
      `*[data-testid*="${linkText.toLowerCase()}"]`
    ];

    return this.tryStrategies(strategies, `link with text "${linkText}"`, options);
  }

  /**
   * Generic element finder by text content
   * @param {string} text - Text to search for
   * @param {Object} options - Configuration options
   * @returns {Promise<Locator>} - Playwright locator
   */
  async findByText(text, options = {}) {
    const strategies = [
      `*:has-text("${text}")`,
      `*[aria-label*="${text}" i]`,
      `*[title*="${text}" i]`,
      `*[alt*="${text}" i]`,
      `*[placeholder*="${text}" i]`
    ];

    return this.tryStrategies(strategies, `element with text "${text}"`, options);
  }

  /**
   * Try multiple selector strategies until one works
   * @param {Array} strategies - Array of CSS selectors to try
   * @param {string} description - Human-readable description for debugging
   * @param {Object} options - Configuration options
   * @returns {Promise<Locator>} - Working locator
   */
  async tryStrategies(strategies, description, options = {}) {
    const timeout = options.timeout || this.timeout;
    const state = options.state || 'visible';
    
    console.log(`🔍 Self-healing: Finding ${description}...`);

    for (let i = 0; i < strategies.length; i++) {
      const selector = strategies[i];
      console.log(`🔧 Strategy ${i + 1}/${strategies.length}: Trying "${selector}"`);
      
      try {
        const locator = this.page.locator(selector);
        
        // Test if element exists and is in desired state
        await locator.waitFor({ state, timeout: 3000 });
        
        console.log(`✅ Success: Found ${description} using "${selector}"`);
        
        // Return a wrapped locator with enhanced methods
        return this.enhanceLocator(locator, selector, description);
        
      } catch (error) {
        console.log(`❌ Strategy ${i + 1} failed: ${error.message.split('\n')[0]}`);
        continue;
      }
    }

    // If all strategies failed, throw comprehensive error
    const errorMsg = `❌ Self-healing failed: Could not find ${description} using any of ${strategies.length} strategies:\n${strategies.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  /**
   * Enhance locator with additional self-healing methods
   * @param {Locator} locator - Original Playwright locator
   * @param {string} selector - Working selector
   * @param {string} description - Element description
   * @returns {Locator} - Enhanced locator
   */
  enhanceLocator(locator, selector, description) {
    // Add metadata to the locator
    locator._selfHealing = {
      selector,
      description,
      timestamp: new Date().toISOString()
    };

    // Override common methods with retry logic
    const originalFill = locator.fill.bind(locator);
    locator.fill = async (value, options) => {
      try {
        return await originalFill(value, options);
      } catch (error) {
        console.log(`🔧 Self-healing: Retrying fill operation for ${description}`);
        await locator.waitFor({ state: 'visible', timeout: 5000 });
        return await originalFill(value, options);
      }
    };

    const originalClick = locator.click.bind(locator);
    locator.click = async (options) => {
      try {
        return await originalClick(options);
      } catch (error) {
        console.log(`🔧 Self-healing: Retrying click operation for ${description}`);
        await locator.waitFor({ state: 'visible', timeout: 5000 });
        return await originalClick(options);
      }
    };

    return locator;
  }

  /**
   * Wait for page to be in a stable state
   */
  async waitForStableState() {
    console.log('⏳ Waiting for page to stabilize...');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
    console.log('✅ Page is stable');
  }

  /**
   * Handle common overlays and popups
   */
  async handleCommonOverlays() {
    console.log('🔧 Checking for common overlays...');
    
    const overlaySelectors = [
      'button:has-text("Accept all")', // Cookie consent
      'button:has-text("Accept")',
      'button:has-text("I agree")',
      'button:has-text("OK")',
      'button:has-text("Close")',
      '[aria-label*="close" i]',
      '.modal-close',
      '.popup-close',
      '*[data-testid*="close"]'
    ];

    for (const selector of overlaySelectors) {
      try {
        const overlay = this.page.locator(selector);
        if (await overlay.isVisible({ timeout: 1000 })) {
          console.log(`🔧 Found overlay with selector: ${selector}`);
          await overlay.click();
          console.log('✅ Overlay dismissed');
          await this.page.waitForTimeout(1000); // Wait for overlay to disappear
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
  }
}

module.exports = { SelfHealingLocators }; 