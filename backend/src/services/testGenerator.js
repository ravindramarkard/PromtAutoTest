const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TestGenerator {
  constructor() {
    this.testsDir = path.join(__dirname, '../tests');
    this.playwrightTestsDir = path.join(this.testsDir, 'playwright');
    this.supportDir = path.join(this.testsDir, 'support');
    
    // Ensure directories exist
    fs.ensureDirSync(this.testsDir);
    fs.ensureDirSync(this.playwrightTestsDir);
    fs.ensureDirSync(this.supportDir);

    // Create base configuration files
    this.createPlaywrightConfig();
    this.createAllureReporter();
  }

  async createPlaywrightConfig() {
    const configPath = path.join(this.testsDir, 'playwright.config.js');
    
    if (!await fs.pathExists(configPath)) {
      const config = `const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['allure-playwright'],
    ['list']
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...require('@playwright/test').devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...require('@playwright/test').devices['Desktop Safari'] },
    },
  ],
});`;

      await fs.writeFile(configPath, config);
    }
  }

  async createAllureReporter() {
    const reporterPath = path.join(this.supportDir, 'allure-setup.js');
    
    if (!await fs.pathExists(reporterPath)) {
      const setup = `const { test } = require('@playwright/test');

// Global setup for Allure reporting
test.beforeEach(async ({ page }, testInfo) => {
  // Add test metadata for Allure
  testInfo.annotations.push(
    {
      type: 'feature',
      description: testInfo.title
    },
    {
      type: 'story',
      description: testInfo.titlePath.join(' > ')
    }
  );
});

module.exports = {};`;

      await fs.writeFile(reporterPath, setup);
    }
  }

  async generateTestFiles(llmResponse, promptId) {
    const testId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testName = this.sanitizeFileName(llmResponse.testName || 'generated-test');
    
    const result = {
      testId,
      promptId,
      testName,
      files: [],
      timestamp,
      testType: llmResponse.testType,
      tags: llmResponse.tags || [],
      fileName: null
    };

    try {
      if (llmResponse.testType === 'api') {
        // Generate API test file
        const apiTestFile = await this.generatePlaywrightApiTest(llmResponse, testName, testId);
        result.files.push(apiTestFile);
        result.fileName = apiTestFile.name;
      } else {
        // Generate UI test file
        const uiTestFile = await this.generatePlaywrightUITest(llmResponse, testName, testId);
        result.files.push(uiTestFile);
        result.fileName = uiTestFile.name;
      }

      // Save test metadata
      await this.saveTestMetadata(result);
      return result;
    } catch (error) {
      console.error('Error generating test files:', error);
      throw error;
    }
  }

  async generatePlaywrightUITest(llmResponse, testName, testId) {
    const fileName = `${testName}-${testId}.spec.js`;
    const filePath = path.join(this.playwrightTestsDir, fileName);

    let testContent = llmResponse.testContent;
    
    // Convert ES6 imports to CommonJS requires
    testContent = testContent
      .replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@playwright\/test['"];?\s*\n?/g, 
        'const { $1 } = require(\'@playwright/test\');\n')
      .replace(/import\s+allure\s+from\s+['"]@playwright\/test-allure['"];?\s*\n?/g, 
        'const { allure } = require(\'allure-playwright\');\n')
      .replace(/import\s+allure\s+from\s+['"]@playwright\/test-allure-reporter['"];?\s*\n?/g, 
        'const { allure } = require(\'allure-playwright\');\n')
      .replace(/import\s+\{\s*allure\s*\}\s+from\s+['"]allure-playwright['"];?\s*\n?/g, 
        'const { allure } = require(\'allure-playwright\');\n')
      .replace(/import\s+\{\s*([^}]*allure[^}]*)\s*\}\s+from\s+['"][^'"]+['"];?\s*\n?/g, 
        'const { allure } = require(\'allure-playwright\');\n');
    
    // Add proper imports if not present
    if (!testContent.includes('require(\'@playwright/test\')')) {
      const imports = `const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');

`;
      testContent = imports + testContent;
    }

    // Add tags as test metadata if available
    if (llmResponse.tags && llmResponse.tags.length > 0) {
      const tagsComment = `// Tags: ${llmResponse.tags.join(', ')}\n`;
      testContent = tagsComment + testContent;
    }

    await fs.writeFile(filePath, testContent);

    return {
      type: 'playwright-ui',
      name: fileName,
      path: filePath,
      content: testContent
    };
  }

  async generatePlaywrightApiTest(llmResponse, testName, testId) {
    const fileName = `${testName}-${testId}-api.spec.js`;
    const filePath = path.join(this.playwrightTestsDir, fileName);

    let testContent = llmResponse.testContent;
    
    // Convert ES6 imports to CommonJS requires
    testContent = testContent
      .replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@playwright\/test['"];?\s*\n?/g, 
        'const { $1 } = require(\'@playwright/test\');\n')
      .replace(/import\s+allure\s+from\s+['"]@playwright\/test-allure['"];?\s*\n?/g, 
        'const { allure } = require(\'allure-playwright\');\n')
      .replace(/import\s+allure\s+from\s+['"]@playwright\/test-allure-reporter['"];?\s*\n?/g, 
        'const { allure } = require(\'allure-playwright\');\n')
      .replace(/import\s+\{\s*allure\s*\}\s+from\s+['"]allure-playwright['"];?\s*\n?/g, 
        'const { allure } = require(\'allure-playwright\');\n')
      .replace(/import\s+\{\s*([^}]*allure[^}]*)\s*\}\s+from\s+['"][^'"]+['"];?\s*\n?/g, 
        'const { allure } = require(\'allure-playwright\');\n');
    
    // Add proper imports if not present
    if (!testContent.includes('require(\'@playwright/test\')')) {
      const imports = `const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');

`;
      testContent = imports + testContent;
    }

    // Add tags as test metadata if available
    if (llmResponse.tags && llmResponse.tags.length > 0) {
      const tagsComment = `// Tags: ${llmResponse.tags.join(', ')}\n`;
      testContent = tagsComment + testContent;
    }

    await fs.writeFile(filePath, testContent);

    return {
      type: 'playwright-api',
      name: fileName,
      path: filePath,
      content: testContent
    };
  }

  async generateFeatureFile(llmResponse, testName, testId) {
    const fileName = `${testName}-${testId}.feature`;
    const filePath = path.join(this.featuresDir, fileName);

    let featureContent = llmResponse.featureFile;
    
    // Add allure tags if not present
    if (!featureContent.includes('@allure')) {
      const tags = llmResponse.tags || ['@generated'];
      tags.push('@allure.feature:Generated_Tests');
      featureContent = `${tags.join(' ')}\n${featureContent}`;
    }

    await fs.writeFile(filePath, featureContent);

    return {
      type: 'feature',
      name: fileName,
      path: filePath,
      content: featureContent
    };
  }

  async generateStepDefinitions(llmResponse, testName, testId) {
    const fileName = `${testName}-${testId}.steps.js`;
    const filePath = path.join(this.stepDefinitionsDir, fileName);

    let stepDefContent = llmResponse.stepDefinitions;

    // Add default imports if not present
    if (!stepDefContent.includes('require')) {
      const imports = `
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { allure } = require('allure-playwright');

`;
      stepDefContent = imports + stepDefContent;
    }

    await fs.writeFile(filePath, stepDefContent);

    return {
      type: 'step-definitions',
      name: fileName,
      path: filePath,
      content: stepDefContent
    };
  }

  async generateApiTest(llmResponse, testName, testId) {
    const fileName = `${testName}-${testId}.spec.js`;
    const filePath = path.join(this.apiTestsDir, fileName);

    // Convert feature file to Playwright test format if needed
    let testContent;
    
    if (llmResponse.stepDefinitions) {
      testContent = llmResponse.stepDefinitions;
    } else {
      testContent = this.convertFeatureToPlaywrightAPI(llmResponse.featureFile, testName);
    }

    // Ensure proper test structure
    if (!testContent.includes('import') && !testContent.includes('require')) {
      const imports = `
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');

`;
      testContent = imports + testContent;
    }

    await fs.writeFile(filePath, testContent);

    return {
      type: 'api-test',
      name: fileName,
      path: filePath,
      content: testContent
    };
  }

  convertFeatureToPlaywrightAPI(featureContent, testName) {
    // Basic conversion from Gherkin to Playwright test
    // This is a simplified version - in production, you'd want more sophisticated parsing
    
    return `
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');

test.describe('${testName}', () => {
  test('API Test Generated from Feature', async ({ request }) => {
    await allure.epic('Generated API Tests');
    await allure.feature('${testName}');
    
    // TODO: Implement API test logic based on feature:
    /*
${featureContent}
    */
    
    // Example API test structure:
    const response = await request.get('/api/endpoint');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
`;
  }

  async saveTestMetadata(testResult) {
    const indexPath = path.join(this.testsDir, 'index.json');
    let index = { tests: [], lastUpdated: new Date().toISOString() };
    
    // Load existing index if it exists
    if (await fs.pathExists(indexPath)) {
      index = await fs.readJson(indexPath);
    }
    
    // Ensure tests array exists
    if (!index.tests) {
      index.tests = [];
    }
    
    // Remove existing test with same ID (if updating)
    index.tests = index.tests.filter(test => test.testId !== testResult.testId);
    
    // Add the new test
    index.tests.push(testResult);
    
    // Update timestamp
    index.lastUpdated = new Date().toISOString();
    
    // Save the updated index
    await fs.writeJson(indexPath, index, { spaces: 2 });
  }

  async getGeneratedTests() {
    const indexPath = path.join(this.testsDir, 'index.json');
    
    if (await fs.pathExists(indexPath)) {
      const index = await fs.readJson(indexPath);
      return index.tests || [];
    }
    
    return [];
  }

  async getGeneratedTest(testId) {
    const tests = await this.getGeneratedTests();
    return tests.find(test => test.testId === testId);
  }

  async deleteGeneratedTest(testId) {
    const indexPath = path.join(this.testsDir, 'index.json');
    
    if (await fs.pathExists(indexPath)) {
      const index = await fs.readJson(indexPath);
      const tests = index.tests || [];
      
      const updatedTests = tests.filter(test => test.testId !== testId);
      
      await fs.writeJson(indexPath, {
        ...index,
        tests: updatedTests,
        lastUpdated: new Date().toISOString()
      }, { spaces: 2 });
      
      return true;
    }
    
    return false;
  }

  async deleteTest(testId) {
    const metadataDir = path.join(this.testsDir, 'metadata');
    const metadataFile = path.join(metadataDir, `${testId}.json`);
    
    if (fs.existsSync(metadataFile)) {
      const metadata = await fs.readJson(metadataFile);
      
      // Delete test files
      for (const file of metadata.files) {
        if (fs.existsSync(file.path)) {
          await fs.remove(file.path);
        }
      }
      
      // Delete metadata
      await fs.remove(metadataFile);
      
      return true;
    }
    
    return false;
  }

  sanitizeFileName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

module.exports = new TestGenerator(); 