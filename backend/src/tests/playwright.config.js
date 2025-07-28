const { defineConfig, devices } = require('@playwright/test');

// Get reporter configuration based on environment variables
function getReporterConfig() {
  const executionType = process.env.ALLURE_EXECUTION_TYPE || 'individual';
  const collectionName = process.env.ALLURE_COLLECTION_NAME;
  const suiteName = process.env.ALLURE_SUITE_NAME;
  
  let reportName = 'Playwright Test Results';
  let environmentInfo = {};
  
  if (executionType === 'collection' && collectionName) {
    reportName = `Collection: ${collectionName}`;
    environmentInfo['Collection'] = collectionName;
    environmentInfo['Suite'] = suiteName || 'Multiple Suites';
  } else if (executionType === 'suite' && suiteName) {
    reportName = `Suite: ${suiteName}`;
    environmentInfo['Suite'] = suiteName;
  } else {
    reportName = 'Individual Test Execution';
  }
  
  environmentInfo['Execution Type'] = executionType;
  environmentInfo['Environment'] = process.env.BASE_URL || 'Unknown';
  environmentInfo['Browser'] = process.env.BROWSER || 'chromium';
  
  return { reportName, environmentInfo };
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Enhanced reporting configuration
  reporter: [
    ['html', { 
      outputFolder: '../../../playwright-report',
      open: 'never'
    }],
    ['allure-playwright', {
      ...getReporterConfig(),
      outputFolder: '../../../allure-results'
    }],
    ['list'],
    ['json', { outputFile: '../../../test-results/results.json' }]
  ],

  // Global test configuration
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Enhanced failure capture
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Timeouts
    actionTimeout: parseInt(process.env.TIMEOUT) || 30000,
    navigationTimeout: parseInt(process.env.TIMEOUT) || 30000,
    
    // Browser settings
    headless: process.env.HEADLESS !== 'false',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Test artifacts configuration
    testIdAttribute: 'data-testid'
  },

  // Output directories for artifacts
  outputDir: '../../../test-results/artifacts',
  
  // Project definitions for different browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enhanced video settings for failure reporting
        video: {
          mode: 'retain-on-failure',
          size: { width: 1280, height: 720 }
        }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        video: {
          mode: 'retain-on-failure',
          size: { width: 1280, height: 720 }
        }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        video: {
          mode: 'retain-on-failure',
          size: { width: 1280, height: 720 }
        }
      },
    },
  ],

  // Web server configuration (if needed)
  webServer: process.env.BASE_URL && process.env.BASE_URL.includes('localhost') ? {
    command: 'npm start',
    url: process.env.BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  } : undefined,
});