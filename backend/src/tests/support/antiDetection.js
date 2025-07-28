const { chromium } = require('playwright');

/**
 * Anti-Detection utility for Playwright tests
 * Helps bypass common bot detection systems
 */
class AntiDetection {
  
  /**
   * Pool of realistic user agents that are currently active and accepted by Chromium
   * Updated regularly to match real browser usage patterns
   */
  static getUserAgentPool() {
    return [
      // Chrome 120 (Windows 10/11)
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      
      // Chrome 119 (Windows 10/11) 
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      
      // Chrome 118 (Windows 10/11)
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
      
      // Chrome 120 (macOS)
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      
      // Chrome 120 (macOS M1/M2)
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      
      // Chrome 120 (Linux)
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      
      // Edge (Windows 10/11) - Based on Chromium
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
      
      // Additional Windows versions for variety
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      
      // Chrome with different screen resolutions markers
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
  }

  /**
   * Get a random user agent from the pool
   * @returns {string} - Random user agent string
   */
  static getRandomUserAgent() {
    const userAgents = this.getUserAgentPool();
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    const selectedAgent = userAgents[randomIndex];
    
    console.log(`🎭 Selected random user agent: ${selectedAgent.substring(0, 80)}...`);
    return selectedAgent;
  }

  /**
   * Get viewport size that matches the user agent
   * @param {string} userAgent - User agent string
   * @returns {Object} - Viewport configuration
   */
  static getMatchingViewport(userAgent) {
    // Common desktop resolutions
    const desktopViewports = [
      { width: 1920, height: 1080 }, // Full HD
      { width: 1366, height: 768 },  // HD
      { width: 1536, height: 864 },  // HD+
      { width: 1440, height: 900 },  // WXGA+
      { width: 1600, height: 900 },  // HD+
      { width: 2560, height: 1440 }, // QHD
      { width: 1280, height: 720 }   // HD
    ];

    // Select random viewport for variety
    const viewport = desktopViewports[Math.floor(Math.random() * desktopViewports.length)];
    console.log(`📱 Selected viewport: ${viewport.width}x${viewport.height}`);
    
    return viewport;
  }

  /**
   * Get timezone that matches the user agent
   * @param {string} userAgent - User agent string  
   * @returns {string} - Timezone ID
   */
  static getMatchingTimezone(userAgent) {
    const timezones = [
      'America/New_York',      // Eastern US
      'America/Chicago',       // Central US  
      'America/Denver',        // Mountain US
      'America/Los_Angeles',   // Pacific US
      'Europe/London',         // UK
      'Europe/Berlin',         // Central Europe
      'Europe/Paris',          // France
      'America/Toronto',       // Canada
      'Australia/Sydney',      // Australia
      'Asia/Tokyo'            // Japan
    ];

    // Prefer US timezones for better compatibility
    const preferredTimezones = timezones.slice(0, 4);
    const selectedTimezone = preferredTimezones[Math.floor(Math.random() * preferredTimezones.length)];
    
    console.log(`🌍 Selected timezone: ${selectedTimezone}`);
    return selectedTimezone;
  }

  /**
   * Launch browser with anti-detection configurations
   * @param {Object} options - Browser launch options
   * @returns {Promise<Browser>} - Configured browser instance
   */
  static async launchBrowser(options = {}) {
    const defaultArgs = [
      // Disable automation flags (most critical)
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--disable-ipc-flooding-protection',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      
      // Additional automation detection disabling
      '--disable-extensions',
      '--disable-plugins',
      '--disable-plugins-discovery',
      '--disable-preconnect',
      '--disable-translate',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-features=Translate',
      
      // Privacy and tracking protection
      '--disable-component-extensions-with-background-pages',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-features=MediaRouter',
      '--disable-features=DialMediaRouteProvider',
      '--disable-client-side-phishing-detection',
      '--disable-features=VizDisplayCompositor',
      '--disable-domain-reliability',
      
      // Memory and performance (appear more like regular browser)
      '--memory-pressure-off',
      '--max_old_space_size=4096',
      '--aggressive-cache-discard',
      '--enable-surface-synchronization',
      
      // Network and security
      '--disable-web-security',
      '--disable-site-isolation-trials',
      '--disable-features=VizServiceDisplayCompositor',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
      
      // Additional stealth flags
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu-sandbox',
      '--disable-software-rasterizer',
      '--disable-accelerated-2d-canvas',
      '--disable-accelerated-jpeg-decoding',
      '--disable-accelerated-mjpeg-decode',
      '--disable-accelerated-video-decode',
      '--disable-app-list-dismiss-on-blur',
      '--disable-background-mode',
      
      // Make browser appear more normal
      '--start-maximized',
      '--enable-features=NetworkService,NetworkServiceLogging',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--use-mock-keychain',
      
      // Reduce automation signals
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-renderer-accessibility',
      '--disable-component-update',
      '--disable-permissions-api',
      '--disable-notifications',
      '--mute-audio'
    ];

    const browserOptions = {
      headless: false, // Always non-headless for better stealth
      args: [...defaultArgs, ...(options.args || [])],
      ignoreDefaultArgs: [
        '--enable-automation',
        '--enable-blink-features=IdleDetection',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-component-extensions-with-background-pages'
      ],
      ignoreHTTPSErrors: true,
      slowMo: Math.floor(Math.random() * 100) + 50, // Random slow motion 50-150ms
      ...options
    };

    console.log('🚀 Launching enhanced anti-detection browser...');
    console.log(`⏱️  Slow motion: ${browserOptions.slowMo}ms for human-like timing`);
    
    const browser = await chromium.launch(browserOptions);
    
    return browser;
  }

  /**
   * Create context with stealth configurations
   * @param {Browser} browser - Browser instance
   * @param {Object} options - Context options
   * @returns {Promise<BrowserContext>} - Configured context
   */
  static async createStealthContext(browser, options = {}) {
    // Get random user agent and matching properties
    const userAgent = this.getRandomUserAgent();
    const viewport = this.getMatchingViewport(userAgent);
    const timezone = this.getMatchingTimezone(userAgent);
    
    const contextOptions = {
      viewport,
      userAgent,
      locale: 'en-US',
      timezoneId: timezone,
      permissions: ['geolocation', 'notifications'],
      // Add some randomness to other properties
      geolocation: {
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1, // San Francisco area with variance
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1
      },
      // Add extra headers to appear more natural
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      ...options
    };

    console.log('🕵️ Creating enhanced stealth context...');
    const context = await browser.newContext(contextOptions);

    // Add comprehensive stealth scripts
    await context.addInitScript(() => {
      // Remove webdriver property completely
      delete Object.getPrototypeOf(navigator).webdriver;
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
        configurable: false,
        enumerable: false
      });

      // Mock languages with realistic variety
      const languageOptions = [
        ['en-US', 'en'],
        ['en-US', 'en', 'es'],
        ['en-US', 'en', 'fr'],
        ['en-US', 'en', 'de'],
        ['en-US']
      ];
      const selectedLanguages = languageOptions[Math.floor(Math.random() * languageOptions.length)];
      
      Object.defineProperty(navigator, 'languages', {
        get: () => selectedLanguages,
        configurable: false,
        enumerable: false
      });

      // More sophisticated plugin mocking
      const pluginCount = Math.floor(Math.random() * 5) + 3;
      const mockPlugins = Array.from({ length: pluginCount }, (_, i) => ({
        name: `Plugin ${i}`,
        description: `Mock Plugin ${i}`,
        filename: `plugin${i}.dll`,
        length: 0
      }));
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => mockPlugins,
        configurable: false,
        enumerable: false
      });

      // Enhanced screen properties
      Object.defineProperty(screen, 'colorDepth', {
        get: () => 24,
        configurable: false
      });
      
      Object.defineProperty(screen, 'pixelDepth', {
        get: () => 24,
        configurable: false
      });

      // Realistic hardware specs
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => Math.floor(Math.random() * 8) + 4,
        configurable: false
      });

      // Device memory with realistic values
      if ('deviceMemory' in navigator) {
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => [4, 8, 16][Math.floor(Math.random() * 3)],
          configurable: false
        });
      }

      // Connection information
      if ('connection' in navigator) {
        Object.defineProperty(navigator, 'connection', {
          get: () => ({
            effectiveType: '4g',
            type: 'wifi',
            downlink: 10,
            rtt: 50,
            saveData: false
          }),
          configurable: false
        });
      }

      // Enhanced permissions API
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => {
        const permissions = {
          'notifications': 'default',
          'geolocation': 'granted',
          'camera': 'denied',
          'microphone': 'denied'
        };
        return Promise.resolve({ 
          state: permissions[parameters.name] || 'denied' 
        });
      };

      // Comprehensive automation indicator removal
      const automationProps = [
        'cdc_adoQpoasnfa76pfcZLmcfl_Array',
        'cdc_adoQpoasnfa76pfcZLmcfl_Promise', 
        'cdc_adoQpoasnfa76pfcZLmcfl_Symbol',
        'cdc_adoQpoasnfa76pfcZLmcfl_Object',
        'cdc_adoQpoasnfa76pfcZLmcfl_Proxy',
        '$cdc_asdjflasutopfhvcZLmcfl_',
        '$chrome_asyncScriptInfo',
        '__$webdriverAsyncExecutor',
        '__webdriverAsyncExecutor',
        '__webdriver_evaluate',
        '__selenium_evaluate',
        '__webdriver_script_function',
        '__webdriver_script_func',
        '__webdriver_script_fn',
        '__fxdriver_evaluate',
        '__driver_unwrapped',
        '__webdriver_unwrapped',
        '__driver_evaluate',
        '__selenium_unwrapped',
        '__fxdriver_unwrapped',
        '_phantom',
        '__nightmare',
        '_selenium',
        'callPhantom',
        'callSelenium',
        '_Selenium_IDE_Recorder'
      ];

      automationProps.forEach(prop => {
        delete window[prop];
        Object.defineProperty(window, prop, {
          get: () => undefined,
          configurable: false,
          enumerable: false
        });
      });

      // Remove Playwright specific indicators
      delete window.__playwright;
      delete window.__pw_manual;
      delete window.__PW_inspect;
      delete window._playwrightTest;

      // Enhanced Chrome runtime mocking
      if (!window.chrome || !window.chrome.runtime) {
        window.chrome = {
          app: { isInstalled: false },
          webstore: {
            onInstallStageChanged: {},
            onDownloadProgress: {}
          },
          runtime: {
            connect: function() { return { onMessage: {}, postMessage: function() {} }; },
            sendMessage: function() {},
            onConnect: { addListener: function() {} },
            onMessage: { addListener: function() {} },
            id: undefined,
            onInstalled: { addListener: function() {} }
          }
        };
      }

      // Mock realistic battery API
      if ('getBattery' in navigator) {
        navigator.getBattery = () => Promise.resolve({
          charging: true,
          chargingTime: 0,
          dischargingTime: Infinity,
          level: 0.8 + Math.random() * 0.2,
          addEventListener: () => {},
          removeEventListener: () => {}
        });
      }

      // Performance timing with realistic variance
      if (window.performance && window.performance.timing) {
        const originalNow = window.performance.now;
        window.performance.now = function() {
          return originalNow.call(this) + Math.random() * 0.1;
        };

        const originalGetEntriesByType = window.performance.getEntriesByType;
        window.performance.getEntriesByType = function(type) {
          const entries = originalGetEntriesByType.call(this, type);
          return entries.map(entry => {
            if (entry.name && entry.name.includes('navigation')) {
              entry.loadEventEnd += Math.random() * 100;
              entry.domContentLoadedEventEnd += Math.random() * 50;
            }
            return entry;
          });
        };
      }

      // Canvas fingerprint randomization
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function() {
        const ctx = this.getContext('2d');
        if (ctx) {
          // Add minimal noise to canvas
          const imageData = ctx.getImageData(0, 0, this.width, this.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            if (Math.random() < 0.01) { // 1% of pixels
              imageData.data[i] = Math.min(255, imageData.data[i] + Math.floor(Math.random() * 3) - 1);
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }
        return originalToDataURL.apply(this, arguments);
      };

      // WebGL fingerprint protection
      const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
          return 'Intel Inc.';
        }
        if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
          return 'Intel Iris OpenGL Engine';
        }
        return originalGetParameter.apply(this, arguments);
      };

      // Audio context fingerprint protection
      if (window.AudioContext || window.webkitAudioContext) {
        const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
        window.AudioContext = window.webkitAudioContext = function() {
          const context = new OriginalAudioContext();
          const originalCreateAnalyser = context.createAnalyser;
          context.createAnalyser = function() {
            const analyser = originalCreateAnalyser.call(this);
            const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
            analyser.getFloatFrequencyData = function(array) {
              originalGetFloatFrequencyData.call(this, array);
              // Add minimal noise
              for (let i = 0; i < array.length; i++) {
                array[i] += Math.random() * 0.0001;
              }
            };
            return analyser;
          };
          return context;
        };
      }

      console.log('🛡️ Enhanced stealth mode activated with comprehensive fingerprint protection');
    });

    return context;
  }

  /**
   * Handle common anti-bot challenges
   * @param {Page} page - Playwright page
   * @param {Object} options - Configuration options
   */
  static async handleBotDetection(page, options = {}) {
    const { timeout = 30000, retries = 3 } = options;
    
    console.log('🔍 Checking for bot detection challenges...');

    for (let attempt = 1; attempt <= retries; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${retries}`);

      try {
        // Check for various bot detection patterns
        await this.checkForCloudflare(page, timeout);
        await this.checkForCaptcha(page, timeout);
        await this.checkForRateLimiting(page, timeout);
        
        console.log('✅ No bot detection challenges found');
        return true;
        
      } catch (error) {
        console.log(`❌ Bot detection challenge detected: ${error.message}`);
        
        if (attempt < retries) {
          console.log('⏳ Waiting before retry...');
          await this.humanLikeDelay(3000, 5000);
        } else {
          throw new Error(`Failed to bypass bot detection after ${retries} attempts: ${error.message}`);
        }
      }
    }
  }

  /**
   * Check for Cloudflare challenges
   * @param {Page} page - Playwright page
   * @param {number} timeout - Timeout in milliseconds
   */
  static async checkForCloudflare(page, timeout = 30000) {
    const cloudflareSelectors = [
      '[data-testid="cf-please-wait"]',
      '.cf-browser-verification',
      '#cf-please-wait',
      '.cf-checking-browser',
      'text=Checking your browser',
      'text=Please wait while we check your browser',
      'text=This process is automatic'
    ];

    for (const selector of cloudflareSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          console.log('🛡️ Cloudflare challenge detected, waiting...');
          
          // Wait for Cloudflare to complete (usually 5-15 seconds)
          await element.waitFor({ state: 'hidden', timeout });
          console.log('✅ Cloudflare challenge completed');
          
          // Additional wait for page to stabilize
          await this.humanLikeDelay(2000, 4000);
          return;
        }
      } catch (error) {
        // Continue checking other selectors
      }
    }
  }

  /**
   * Check for CAPTCHA challenges with enhanced Google detection
   * @param {Page} page - Playwright page
   * @param {number} timeout - Timeout in milliseconds
   */
  static async checkForCaptcha(page, timeout = 30000) {
    const captchaSelectors = [
      // Google specific CAPTCHA selectors
      'iframe[src*="recaptcha"]',
      '.g-recaptcha',
      '#recaptcha',
      '.recaptcha-checkbox',
      'iframe[title*="reCAPTCHA"]',
      'iframe[name*="c-"]', // Google reCAPTCHA iframe names
      
      // Text-based detection for Google
      'text=I\'m not a robot',
      'text=Verify it\'s you',
      'text=Unusual traffic from your computer network',
      'text=Our systems have detected unusual traffic',
      'text=To continue, please click the box below',
      
      // Other CAPTCHA systems
      '.captcha',
      '.hcaptcha',
      'iframe[src*="hcaptcha"]',
      '[data-testid="captcha"]',
      '.cf-challenge-running', // Cloudflare CAPTCHA
      
      // Additional Google protection pages
      'text=Before we continue',
      'text=Checking your browser',
      'text=Please complete the security check',
      
      // Generic challenge indicators
      '[role="dialog"]:has-text("verify")',
      '[role="dialog"]:has-text("robot")',
      '[role="dialog"]:has-text("human")'
    ];

    for (const selector of captchaSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`🤖 CAPTCHA/Challenge detected with selector: ${selector}`);
          
          // Check if it's a Google unusual traffic page specifically
          const pageContent = await page.content();
          if (pageContent.includes('unusual traffic') || pageContent.includes('not a robot')) {
            console.log('🔴 Google unusual traffic challenge detected');
            console.log('💡 This indicates the IP/browser fingerprint has been flagged');
          }
          
          // For automated tests, you might want to:
          // 1. Skip the test
          // 2. Use a CAPTCHA solving service
          // 3. Use test accounts that bypass CAPTCHA
          // 4. Mock the CAPTCHA response in test environment
          // 5. Wait longer and retry with different approach
          
          throw new Error(`CAPTCHA challenge detected (${selector}) - manual intervention or alternative approach required`);
        }
      } catch (error) {
        if (error.message.includes('CAPTCHA')) {
          throw error;
        }
        // Continue checking other selectors
      }
    }
  }

  /**
   * Check for rate limiting
   * @param {Page} page - Playwright page
   * @param {number} timeout - Timeout in milliseconds
   */
  static async checkForRateLimiting(page, timeout = 30000) {
    const rateLimitSelectors = [
      'text=Too many requests',
      'text=Rate limit exceeded',
      'text=Please try again later',
      'text=Access denied',
      '[data-testid="rate-limit"]'
    ];

    for (const selector of rateLimitSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          console.log('⏱️ Rate limiting detected');
          throw new Error('Rate limiting detected - too many requests');
        }
      } catch (error) {
        if (error.message.includes('Rate limiting')) {
          throw error;
        }
        // Continue checking other selectors
      }
    }
  }

  /**
   * Enhanced form filling with ultra-realistic human behavior
   * @param {Locator} input - Input element locator
   * @param {string} value - Value to fill
   * @param {Object} options - Fill options
   */
  static async humanLikeFill(input, value, options = {}) {
    const { 
      delay = 150, 
      variation = 80,
      pauseProbability = 0.15, // 15% chance to pause while typing
      backspaceProbability = 0.05, // 5% chance to backspace and retype
      preDelay = [800, 1500], // Delay before starting to type
      postDelay = [500, 1200] // Delay after typing
    } = options;
    
    console.log('⌨️  Starting ultra-realistic human-like typing...');
    
    // Random delay before starting
    await this.humanLikeDelay(preDelay[0], preDelay[1]);
    
    // Click on the input with human-like precision (not exactly center)
    const box = await input.boundingBox();
    if (box) {
      const x = box.x + box.width * (0.3 + Math.random() * 0.4); // 30-70% across
      const y = box.y + box.height * (0.4 + Math.random() * 0.2); // 40-60% down
      await input.page().mouse.click(x, y);
    } else {
      await input.click();
    }
    
    await this.humanLikeDelay(200, 500);
    
    // Clear existing content with selection + delete (more human-like)
    await input.page().keyboard.press('Control+A');
    await this.humanLikeDelay(50, 150);
    await input.page().keyboard.press('Delete');
    await this.humanLikeDelay(100, 300);
    
    // Type character by character with realistic behavior
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      
      // Occasional backspace and retype (human mistake simulation)
      if (Math.random() < backspaceProbability && i > 0) {
        console.log('⌫ Simulating typing mistake - backspace and retype');
        await this.humanLikeDelay(100, 300);
        await input.page().keyboard.press('Backspace');
        await this.humanLikeDelay(150, 400);
        await input.page().keyboard.type(value[i-1]); // Retype previous char
        await this.humanLikeDelay(100, 200);
      }
      
      // Type the actual character
      const charDelay = delay + (Math.random() * variation * 2) - variation;
      await input.page().keyboard.type(char, { delay: Math.max(50, charDelay) });
      
      // Occasional pause while typing (thinking pause)
      if (Math.random() < pauseProbability) {
        console.log('🤔 Simulating thinking pause...');
        await this.humanLikeDelay(300, 800);
      }
      
      // Slightly longer delays for certain characters (shift keys, numbers, etc.)
      if (/[A-Z!@#$%^&*()_+{}|:"<>?~]/.test(char)) {
        await this.humanLikeDelay(50, 150); // Extra delay for special chars
      }
    }
    
    // Random delay after typing
    await this.humanLikeDelay(postDelay[0], postDelay[1]);
    
    console.log(`✅ Completed human-like typing of "${value}"`);
  }

  /**
   * Check if current page has bot detection
   * @param {Page} page - Playwright page
   * @returns {boolean} - True if bot detection is present
   */
  static async hasBotDetection(page) {
    const detectionIndicators = [
      'text=Checking your browser',
      'text=Please wait',
      'text=I\'m not a robot',
      '.cf-browser-verification',
      '.g-recaptcha',
      '.hcaptcha'
    ];

    for (const indicator of detectionIndicators) {
      try {
        if (await page.locator(indicator).isVisible({ timeout: 1000 })) {
          return true;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    return false;
  }

  /**
   * Simulate human-like mouse movements
   * @param {Page} page - Playwright page
   * @param {Object} target - Target element or coordinates
   */
  static async humanLikeMouseMovement(page, target) {
    const viewport = page.viewportSize();
    const startX = Math.random() * viewport.width;
    const startY = Math.random() * viewport.height;
    
    // Move mouse to random starting position
    await page.mouse.move(startX, startY);
    await this.humanLikeDelay(100, 300);
    
    if (target.x && target.y) {
      // Move to specific coordinates
      await page.mouse.move(target.x, target.y, { steps: 10 });
    } else if (target.selector) {
      // Move to element
      const element = page.locator(target.selector);
      const box = await element.boundingBox();
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y, { steps: 10 });
      }
    }
  }

  /**
   * Enhanced navigation with longer delays and more careful behavior
   * @param {Page} page - Playwright page
   * @param {string} url - URL to navigate to
   * @param {Object} options - Navigation options
   */
  static async navigateWithDetection(page, url, options = {}) {
    console.log(`🌐 Navigating to: ${url} with enhanced stealth...`);
    
    // Longer random delay before navigation (appear less bot-like)
    await this.humanLikeDelay(1000, 3000);
    
    // Navigate to the page with extended timeout
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000, // Increased timeout
      ...options
    });
    
    // Wait for any immediate redirects or security checks
    await this.humanLikeDelay(2000, 4000);
    
    // Handle any bot detection challenges
    await this.handleBotDetection(page, { timeout: 45000, retries: 5 });
    
    // Additional wait for page stability
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Final delay to appear more human
    await this.humanLikeDelay(1000, 2500);
    
    console.log('✅ Enhanced navigation completed successfully');
  }

  /**
   * Simulate more realistic human-like delays with varied patterns
   * @param {number} min - Minimum delay in milliseconds
   * @param {number} max - Maximum delay in milliseconds
   */
  static async humanLikeDelay(min = 1000, max = 3000) {
    // Use a more realistic delay distribution (not uniform)
    const random1 = Math.random();
    const random2 = Math.random();
    const randomGaussian = (random1 + random2) / 2; // Approximate normal distribution
    
    const delay = min + (randomGaussian * (max - min));
    const finalDelay = Math.max(min, Math.min(max, delay));
    
    console.log(`⏳ Human-like delay: ${Math.round(finalDelay)}ms`);
    await new Promise(resolve => setTimeout(resolve, finalDelay));
  }

  /**
   * Advanced Google search with fallback strategies
   * @param {Page} page - Playwright page
   * @param {string} query - Search query
   * @param {Object} options - Search options
   */
  static async performGoogleSearch(page, query, options = {}) {
    const { 
      maxRetries = 3, 
      useAlternativeDomains = true,
      waitBetweenRetries = [30000, 60000] // 30-60 seconds between retries
    } = options;

    console.log(`🔍 Performing Google search with advanced fallback strategies: "${query}"`);

    const strategies = [
      'https://google.com',
      'https://www.google.com', 
      'https://google.co.uk',
      'https://google.ca',
      'https://duckduckgo.com' // Non-Google fallback
    ];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Search attempt ${attempt}/${maxRetries}`);

      for (const domain of strategies) {
        try {
          console.log(`🌐 Trying domain: ${domain}`);
          
          if (domain.includes('duckduckgo')) {
            return await this.performDuckDuckGoSearch(page, query);
          } else {
            return await this.performSingleGoogleSearch(page, domain, query);
          }
        } catch (error) {
          console.log(`❌ ${domain} failed: ${error.message}`);
          
          if (error.message.includes('CAPTCHA')) {
            console.log(`🚨 CAPTCHA detected on ${domain} - trying next domain`);
            continue;
          }
          
          if (attempt < maxRetries) {
            const waitTime = Math.floor(Math.random() * (waitBetweenRetries[1] - waitBetweenRetries[0])) + waitBetweenRetries[0];
            console.log(`⏳ Waiting ${Math.round(waitTime/1000)}s before retry (IP cooldown)...`);
            await this.humanLikeDelay(waitTime, waitTime + 5000);
          }
        }
      }
    }

    throw new Error('All Google search strategies failed - consider using alternative testing approaches');
  }

  /**
   * Perform search on a single Google domain
   * @param {Page} page - Playwright page
   * @param {string} domain - Google domain to use
   * @param {string} query - Search query
   */
  static async performSingleGoogleSearch(page, domain, query) {
    const selfHealing = new (require('./selfHealingLocators').SelfHealingLocators)(page);
    
    // Navigate with enhanced stealth
    await this.navigateWithDetection(page, domain);
    await selfHealing.handleCommonOverlays();
    
    // Check for immediate CAPTCHA
    if (await this.hasBotDetection(page)) {
      throw new Error('CAPTCHA detected immediately on navigation');
    }
    
    // Perform search
    const searchInput = await selfHealing.findSearchInput();
    await this.humanLikeFill(searchInput, query, {
      delay: 200,
      variation: 100,
      pauseProbability: 0.25,
      backspaceProbability: 0.08,
      preDelay: [1500, 2500],
      postDelay: [1000, 2000]
    });
    
    await this.humanLikeDelay(1500, 3000);
    await searchInput.press('Enter');
    
    // Wait and check for results vs CAPTCHA
    await selfHealing.waitForStableState();
    
    if (await this.hasBotDetection(page)) {
      throw new Error('CAPTCHA detected after search');
    }
    
    // Verify results are present
    const results = page.locator('#search, #rso, .search-results').first();
    const hasResults = await results.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!hasResults) {
      throw new Error('No search results found');
    }
    
    console.log(`✅ Successful Google search on ${domain}`);
    return { domain, success: true, hasResults: true };
  }

  /**
   * Alternative search using DuckDuckGo (as fallback when Google blocks)
   * @param {Page} page - Playwright page  
   * @param {string} query - Search query
   */
  static async performDuckDuckGoSearch(page, query) {
    console.log('🦆 Using DuckDuckGo as Google alternative...');
    
    const selfHealing = new (require('./selfHealingLocators').SelfHealingLocators)(page);
    
    await this.navigateWithDetection(page, 'https://duckduckgo.com');
    
    const searchInput = page.locator('#searchbox_input, input[name="q"]').first();
    await searchInput.waitFor({ state: 'visible' });
    
    await this.humanLikeFill(searchInput, query);
    await searchInput.press('Enter');
    
    await selfHealing.waitForStableState();
    
    const results = page.locator('#links, .results').first();
    const hasResults = await results.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!hasResults) {
      throw new Error('No DuckDuckGo results found');
    }
    
    console.log('✅ Successful DuckDuckGo search');
    return { domain: 'duckduckgo.com', success: true, hasResults: true };
  }

  /**
   * Check if IP might be flagged by Google
   * @param {Page} page - Playwright page
   * @returns {Object} - IP analysis results
   */
  static async checkIPStatus(page) {
    console.log('🔍 Checking IP status and reputation...');
    
    try {
      // Check IP info
      await page.goto('https://httpbin.org/ip');
      const ipInfo = await page.textContent('pre');
      const ip = JSON.parse(ipInfo).origin;
      
      console.log(`🌐 Current IP: ${ip}`);
      
      // Quick Google test
      await page.goto('https://google.com');
      await this.humanLikeDelay(2000, 4000);
      
      const hasImmediateCaptcha = await this.hasBotDetection(page);
      
      return {
        ip,
        flagged: hasImmediateCaptcha,
        recommendation: hasImmediateCaptcha ? 
          'IP appears flagged - consider VPN/proxy or rate limiting' :
          'IP appears clean for automation'
      };
    } catch (error) {
      console.log('❌ IP check failed:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Enhanced CAPTCHA handling with potential solutions
   * @param {Page} page - Playwright page
   * @param {Object} options - Handling options
   */
  static async handleCaptchaChallenge(page, options = {}) {
    const { 
      skipTest = true,
      useAlternativeSearch = true,
      notifyUser = true 
    } = options;

    console.log('🤖 CAPTCHA challenge detected - implementing response strategy...');
    
    if (notifyUser) {
      console.log(`
🔴 CAPTCHA Challenge Detected!

📊 Analysis:
- Google has flagged this browser/IP for automation
- Ultra-enhanced stealth measures were not sufficient
- This indicates sophisticated detection algorithms

💡 Recommended Solutions:
1. Use alternative search engines (DuckDuckGo, Bing)
2. Implement rate limiting (wait 30-60 minutes between tests)  
3. Use rotating VPN/proxy services
4. Consider Google Custom Search API for testing
5. Use test-specific domains/environments
6. Implement CAPTCHA solving services for production

⚡ Immediate Actions:
- Test will use DuckDuckGo as fallback
- Consider longer delays between automation runs
- Monitor IP reputation status
      `);
    }

    if (useAlternativeSearch) {
      console.log('🔄 Switching to DuckDuckGo for this test...');
      return { strategy: 'alternative_search', action: 'duckduckgo' };
    }

    if (skipTest) {
      console.log('⏭️  Skipping test due to CAPTCHA challenge');
      return { strategy: 'skip', action: 'test_skipped' };
    }

    return { strategy: 'manual', action: 'manual_intervention_required' };
  }
}

module.exports = { AntiDetection }; 