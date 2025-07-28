const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

class TestSuiteService {
  constructor() {
    this.suitesDir = path.join(__dirname, '../data/test-suites');
    this.collectionsDir = path.join(__dirname, '../data/test-collections');
    this.environmentsDir = path.join(__dirname, '../data/environments');
    
    // Ensure directories exist
    fs.ensureDirSync(this.suitesDir);
    fs.ensureDirSync(this.collectionsDir);
    fs.ensureDirSync(this.environmentsDir);
    
    // Create default environments if they don't exist
    this.createDefaultEnvironments();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENVIRONMENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async createDefaultEnvironments() {
    const defaultEnvs = [
      {
        name: 'Development',
        key: 'dev',
        variables: {
          BASE_URL: 'http://localhost:3000',
          API_URL: 'http://localhost:8000/api',
          USERNAME: 'testuser',
          PASSWORD: 'testpass123',
          TIMEOUT: '30000',
          BROWSER: 'chromium'
        },
        jira: {
          enabled: false,
          serverUrl: '',
          username: '',
          apiToken: '',
          projectKey: '',
          issueType: 'Bug',
          assignee: '',
          priority: 'Medium',
          labels: ['automation', 'dev-environment']
        }
      },
      {
        name: 'Staging',
        key: 'staging',
        variables: {
          BASE_URL: 'https://staging.example.com',
          API_URL: 'https://staging-api.example.com',
          USERNAME: 'staging_user',
          PASSWORD: 'staging_pass123',
          TIMEOUT: '60000',
          BROWSER: 'chromium'
        },
        jira: {
          enabled: false,
          serverUrl: 'https://yourcompany.atlassian.net',
          username: 'test@yourcompany.com',
          apiToken: '',
          projectKey: 'STAGING',
          issueType: 'Bug',
          assignee: '',
          priority: 'High',
          labels: ['automation', 'staging-environment']
        }
      },
      {
        name: 'Production',
        key: 'prod',
        variables: {
          BASE_URL: 'https://app.example.com',
          API_URL: 'https://api.example.com',
          USERNAME: 'prod_user',
          PASSWORD: 'prod_pass123',
          TIMEOUT: '90000',
          BROWSER: 'chromium'
        },
        jira: {
          enabled: false,
          serverUrl: 'https://yourcompany.atlassian.net',
          username: 'prod@yourcompany.com',
          apiToken: '',
          projectKey: 'PROD',
          issueType: 'Bug',
          assignee: '',
          priority: 'Critical',
          labels: ['automation', 'production-environment']
        }
      }
    ];

    for (const env of defaultEnvs) {
      const envPath = path.join(this.environmentsDir, `${env.key}.json`);
      if (!await fs.pathExists(envPath)) {
        await fs.writeJson(envPath, env, { spaces: 2 });
      }
    }
  }

  async getEnvironments() {
    const envFiles = await fs.readdir(this.environmentsDir);
    const environments = [];

    for (const file of envFiles) {
      if (file.endsWith('.json')) {
        const envPath = path.join(this.environmentsDir, file);
        const env = await fs.readJson(envPath);
        
        // Ensure jira property exists with default values
        env.jira = env.jira || {
          enabled: false,
          serverUrl: '',
          username: '',
          apiToken: '',
          projectKey: '',
          issueType: 'Bug',
          assignee: '',
          priority: 'Medium',
          labels: ['automation']
        };
        
        environments.push(env);
      }
    }

    return environments;
  }

  async getEnvironment(key) {
    const envPath = path.join(this.environmentsDir, `${key}.json`);
    if (await fs.pathExists(envPath)) {
      const env = await fs.readJson(envPath);
      
      // Ensure jira property exists with default values
      env.jira = env.jira || {
        enabled: false,
        serverUrl: '',
        username: '',
        apiToken: '',
        projectKey: '',
        issueType: 'Bug',
        assignee: '',
        priority: 'Medium',
        labels: ['automation']
      };
      
      return env;
    }
    return null;
  }

  async createEnvironment(environment) {
    const envId = environment.key || uuidv4();
    const envPath = path.join(this.environmentsDir, `${envId}.json`);
    
    const envData = {
      id: envId,
      name: environment.name,
      key: envId,
      variables: environment.variables || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await fs.writeJson(envPath, envData, { spaces: 2 });
    return envData;
  }

  async updateEnvironment(key, updates) {
    const envPath = path.join(this.environmentsDir, `${key}.json`);
    if (await fs.pathExists(envPath)) {
      const env = await fs.readJson(envPath);
      const updatedEnv = {
        ...env,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await fs.writeJson(envPath, updatedEnv, { spaces: 2 });
      return updatedEnv;
    }
    throw new Error(`Environment ${key} not found`);
  }

  async deleteEnvironment(key) {
    const envPath = path.join(this.environmentsDir, `${key}.json`);
    if (await fs.pathExists(envPath)) {
      await fs.remove(envPath);
      return true;
    }
    throw new Error(`Environment ${key} not found`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST SUITE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async createTestSuite(suiteData) {
    const suiteId = uuidv4();
    const suite = {
      id: suiteId,
      name: suiteData.name,
      description: suiteData.description || '',
      environment: suiteData.environment || 'dev',
      testCases: suiteData.testCases || [], // Array of test IDs
      tags: suiteData.tags || [],
      settings: {
        headless: suiteData.headless !== false, // Default to headless
        browser: suiteData.browser || 'chromium',
        parallel: suiteData.parallel || false,
        retries: suiteData.retries || 0,
        timeout: suiteData.timeout || 30000
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const suitePath = path.join(this.suitesDir, `${suiteId}.json`);
    await fs.writeJson(suitePath, suite, { spaces: 2 });
    
    console.log(`✅ Test Suite created: ${suite.name} (${suiteId})`);
    return suite;
  }

  async getTestSuites() {
    const suiteFiles = await fs.readdir(this.suitesDir);
    const suites = [];

    for (const file of suiteFiles) {
      if (file.endsWith('.json')) {
        const suitePath = path.join(this.suitesDir, file);
        const suite = await fs.readJson(suitePath);
        suites.push(suite);
      }
    }

    return suites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getTestSuite(suiteId) {
    const suitePath = path.join(this.suitesDir, `${suiteId}.json`);
    if (await fs.pathExists(suitePath)) {
      return await fs.readJson(suitePath);
    }
    return null;
  }

  async updateTestSuite(suiteId, updates) {
    const suitePath = path.join(this.suitesDir, `${suiteId}.json`);
    if (await fs.pathExists(suitePath)) {
      const suite = await fs.readJson(suitePath);
      const updatedSuite = {
        ...suite,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await fs.writeJson(suitePath, updatedSuite, { spaces: 2 });
      return updatedSuite;
    }
    throw new Error(`Test Suite ${suiteId} not found`);
  }

  async deleteTestSuite(suiteId) {
    const suitePath = path.join(this.suitesDir, `${suiteId}.json`);
    if (await fs.pathExists(suitePath)) {
      await fs.remove(suitePath);
      return true;
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST SUITE COLLECTION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async createTestCollection(collectionData) {
    const collectionId = uuidv4();
    const collection = {
      id: collectionId,
      name: collectionData.name,
      description: collectionData.description || '',
      testSuites: collectionData.testSuites || [], // Array of suite IDs
      environment: collectionData.environment || 'dev',
      settings: {
        headless: collectionData.headless !== false,
        browser: collectionData.browser || 'chromium',
        parallel: collectionData.parallel || false,
        retries: collectionData.retries || 0,
        timeout: collectionData.timeout || 60000
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const collectionPath = path.join(this.collectionsDir, `${collectionId}.json`);
    await fs.writeJson(collectionPath, collection, { spaces: 2 });
    
    console.log(`✅ Test Collection created: ${collection.name} (${collectionId})`);
    return collection;
  }

  async getTestCollections() {
    const collectionFiles = await fs.readdir(this.collectionsDir);
    const collections = [];

    for (const file of collectionFiles) {
      if (file.endsWith('.json')) {
        const collectionPath = path.join(this.collectionsDir, file);
        const collection = await fs.readJson(collectionPath);
        collections.push(collection);
      }
    }

    return collections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getTestCollection(collectionId) {
    const collectionPath = path.join(this.collectionsDir, `${collectionId}.json`);
    if (await fs.pathExists(collectionPath)) {
      return await fs.readJson(collectionPath);
    }
    return null;
  }

  async deleteTestCollection(collectionId) {
    const collectionPath = path.join(this.collectionsDir, `${collectionId}.json`);
    if (await fs.pathExists(collectionPath)) {
      await fs.remove(collectionPath);
      return true;
    }
    return false;
  }

  async updateTestCollection(collectionId, updates) {
    const collectionPath = path.join(this.collectionsDir, `${collectionId}.json`);
    if (await fs.pathExists(collectionPath)) {
      const collection = await fs.readJson(collectionPath);
      const updatedCollection = {
        ...collection,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await fs.writeJson(collectionPath, updatedCollection, { spaces: 2 });
      console.log(`✅ Test Collection updated: ${updatedCollection.name} (${collectionId})`);
      return updatedCollection;
    }
    throw new Error(`Test Collection ${collectionId} not found`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  async runTestSuite(suiteId, options = {}) {
    const suite = await this.getTestSuite(suiteId);
    if (!suite) {
      throw new Error(`Test Suite ${suiteId} not found`);
    }

    // Use environment override if provided, otherwise use suite's default environment
    const environmentKey = options.environment || suite.environment;
    const environment = await this.getEnvironment(environmentKey);
    if (!environment) {
      throw new Error(`Environment ${environmentKey} not found`);
    }

    // Filter tests by tags if specified
    let testsToRun = suite.testCases || [];
    if (options.tags && options.tags.length > 0) {
      console.log(`🏷️ Filtering tests by tags: ${options.tags.join(', ')}`);
      testsToRun = await this.filterTestsByTags(suite.testCases, options.tags);
      console.log(`📝 Filtered to ${testsToRun.length} test(s) from ${suite.testCases.length} total`);
    }

    if (testsToRun.length === 0) {
      throw new Error(`No tests found matching the specified criteria`);
    }

    // Merge suite settings with runtime options
    const executionSettings = {
      ...suite.settings,
      ...options,
      environment: environment.variables,
      suiteName: suite.name // Add suite name for Allure reporting
    };

    console.log(`🚀 Running Test Suite: ${suite.name}`);
    console.log(`🌍 Environment: ${environment.name} (${environmentKey})`);
    console.log(`📊 Tests to execute: ${testsToRun.length}/${suite.testCases.length}`);
    if (options.tags && options.tags.length > 0) {
      console.log(`🏷️ Tag filter: ${options.tags.join(', ')}`);
    }
    console.log(`⚙️ Settings:`, executionSettings);

    return new Promise((resolve, reject) => {
      this.executeTestsWithSettings(testsToRun, executionSettings, (error, result) => {
        if (error) {
          console.error(`❌ Test Suite execution failed: ${error.message}`);
          reject(error);
        } else {
          console.log(`✅ Test Suite completed: ${suite.name}`);
          resolve({
            ...result,
            totalTestsInSuite: suite.testCases.length,
            filteredTestsExecuted: testsToRun.length,
            tagFilter: options.tags || null
          });
        }
      });
    });
  }

  // Helper method to filter tests by tags
  async filterTestsByTags(testIds, tags) {
    const testGenerator = require('./testGenerator');
    const allTests = await testGenerator.getGeneratedTests();
    
    const filteredTestIds = [];
    for (const testId of testIds) {
      const test = allTests.find(t => t.testId === testId);
      if (test && test.tags) {
        // Check if any of the test's tags match any of the filter tags
        const hasMatchingTag = test.tags.some(testTag => 
          tags.some(filterTag => 
            testTag.toLowerCase().includes(filterTag.toLowerCase()) ||
            filterTag.toLowerCase().includes(testTag.toLowerCase())
          )
        );
        
        if (hasMatchingTag) {
          filteredTestIds.push(testId);
        }
      }
    }
    
    return filteredTestIds;
  }

  async runTestCollection(collectionId, options = {}) {
    const collection = await this.getTestCollection(collectionId);
    if (!collection) {
      throw new Error(`Test Collection ${collectionId} not found`);
    }

    // Use environment override if provided, otherwise use collection's default environment
    const environmentKey = options.environment || collection.environment;
    const environment = await this.getEnvironment(environmentKey);
    const results = [];

    console.log(`🚀 Running Test Collection: ${collection.name}`);
    console.log(`🌍 Environment: ${environment ? environment.name : 'Unknown'} (${environmentKey})`);
    console.log(`📦 Test Suites: ${collection.testSuites.length}`);
    if (options.tags && options.tags.length > 0) {
      console.log(`🏷️ Tag filter: ${options.tags.join(', ')}`);
    }

    for (const suiteId of collection.testSuites) {
      try {
        const result = await this.runTestSuite(suiteId, {
          ...collection.settings,
          ...options,
          environment: environmentKey, // Pass the environment override to individual suites
          tags: options.tags || [], // Pass tag filter to individual suites
          collectionName: collection.name, // Add collection name for Allure reporting
          // Note: suiteName will be set by runTestSuite itself
        });
        results.push({ suiteId, success: true, result });
      } catch (error) {
        results.push({ suiteId, success: false, error: error.message });
      }
    }

    return {
      collectionId,
      collectionName: collection.name,
      totalSuites: collection.testSuites.length,
      results,
      success: results.every(r => r.success),
      tagFilter: options.tags || null
    };
  }

  async runTestsByTags(tags, environment = 'dev', options = {}) {
    const testGenerator = require('./testGenerator');
    const allTests = await testGenerator.getGeneratedTests();
    
    // Filter tests by tags
    const tagArray = Array.isArray(tags) ? tags : [tags];
    const filteredTests = allTests.filter(test => {
      return test.tags && test.tags.some(tag => 
        tagArray.some(filterTag => 
          tag.toLowerCase().includes(filterTag.toLowerCase())
        )
      );
    });

    if (filteredTests.length === 0) {
      throw new Error(`No tests found with tags: ${tagArray.join(', ')}`);
    }

    const env = await this.getEnvironment(environment);
    const executionSettings = {
      headless: true,
      browser: 'chromium',
      ...options,
      environment: env ? env.variables : {}
    };

    console.log(`🏷️ Running tests with tags: ${tagArray.join(', ')}`);
    console.log(`📝 Found ${filteredTests.length} matching tests`);

    const testIds = filteredTests.map(test => test.testId);
    
    return new Promise((resolve, reject) => {
      this.executeTestsWithSettings(testIds, executionSettings, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            tags: tagArray,
            testsFound: filteredTests.length,
            result
          });
        }
      });
    });
  }

  executeTestsWithSettings(testIds, settings, callback) {
    // Build Playwright command with environment variables and settings
    const envVars = Object.entries(settings.environment || {})
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    // Add execution context for Allure reporting
    const executionContext = [];
    if (settings.collectionName) {
      executionContext.push(`ALLURE_COLLECTION_NAME="${settings.collectionName}"`);
      executionContext.push(`ALLURE_EXECUTION_TYPE="collection"`);
    } else if (settings.suiteName) {
      executionContext.push(`ALLURE_SUITE_NAME="${settings.suiteName}"`);
      executionContext.push(`ALLURE_EXECUTION_TYPE="suite"`);
    } else {
      executionContext.push(`ALLURE_EXECUTION_TYPE="individual"`);
    }

    const allEnvVars = [envVars, ...executionContext].filter(env => env).join(' ');

    const playwrightArgs = [
      settings.headless ? '' : '--headed',
      `--project=${settings.browser}`,
      settings.parallel ? '--workers=4' : '--workers=1',
      settings.retries ? `--retries=${settings.retries}` : '',
      `--timeout=${settings.timeout}`
    ].filter(arg => arg).join(' ');

    // Get specific test files for the given test IDs
    this.getTestFileNames(testIds).then(testFiles => {
      if (testFiles.length === 0) {
        return callback(new Error('No valid test files found for the given test IDs'), null);
      }

      const testsRoot = path.join(__dirname, '../tests');
      
      // Create file pattern for specific tests
      const testFilePattern = testFiles.map(fileName => `playwright/${fileName}`).join(' ');
      const command = `cd ${testsRoot} && ${allEnvVars} npx playwright test ${testFilePattern} ${playwrightArgs}`;

      console.log(`🔧 Executing command: ${command}`);
      console.log(`📝 Running specific tests: ${testFiles.join(', ')}`);
      if (settings.collectionName) {
        console.log(`📦 Collection: ${settings.collectionName}`);
      }
      if (settings.suiteName) {
        console.log(`📋 Suite: ${settings.suiteName}`);
      }

      exec(command, { 
        cwd: testsRoot,
        env: { 
          ...process.env, 
          ...settings.environment,
          ...(settings.collectionName && { 
            ALLURE_COLLECTION_NAME: settings.collectionName,
            ALLURE_EXECUTION_TYPE: 'collection'
          }),
          ...(settings.suiteName && { 
            ALLURE_SUITE_NAME: settings.suiteName,
            ALLURE_EXECUTION_TYPE: 'suite'
          }),
          ...(!settings.collectionName && !settings.suiteName && {
            ALLURE_EXECUTION_TYPE: 'individual'
          })
        }
      }, (error, stdout, stderr) => {
        const result = {
          command,
          testFiles,
          stdout: stdout || '',
          stderr: stderr || '',
          success: !error,
          timestamp: new Date().toISOString(),
          executionContext: {
            type: settings.collectionName ? 'collection' : (settings.suiteName ? 'suite' : 'individual'),
            collectionName: settings.collectionName || null,
            suiteName: settings.suiteName || null
          }
        };

        if (error) {
          result.error = error.message;
          result.exitCode = error.code;
        }

        callback(error, result);
      });
    }).catch(error => {
      callback(error, null);
    });
  }

  // Helper method to get test file names from test IDs
  async getTestFileNames(testIds) {
    const testGenerator = require('./testGenerator');
    const allTests = await testGenerator.getGeneratedTests();
    
    const testFiles = [];
    for (const testId of testIds) {
      const test = allTests.find(t => t.testId === testId);
      if (test && test.fileName) {
        testFiles.push(test.fileName);
      }
    }
    
    return testFiles;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  async getSuiteStatistics() {
    const suites = await this.getTestSuites();
    const collections = await this.getTestCollections();
    const environments = await this.getEnvironments();

    const tagStats = {};
    suites.forEach(suite => {
      suite.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    });

    return {
      totalSuites: suites.length,
      totalCollections: collections.length,
      totalEnvironments: environments.length,
      tagDistribution: tagStats,
      recentSuites: suites.slice(0, 5),
      recentCollections: collections.slice(0, 5)
    };
  }

  async validateSuite(suiteId) {
    const suite = await this.getTestSuite(suiteId);
    if (!suite) {
      return { valid: false, error: 'Suite not found' };
    }

    const environment = await this.getEnvironment(suite.environment);
    if (!environment) {
      return { valid: false, error: `Environment ${suite.environment} not found` };
    }

    // Check if test cases exist
    const testGenerator = require('./testGenerator');
    const allTests = await testGenerator.getGeneratedTests();
    const validTestIds = allTests.map(test => test.testId);
    
    const invalidTests = suite.testCases.filter(testId => !validTestIds.includes(testId));
    
    if (invalidTests.length > 0) {
      return { 
        valid: false, 
        error: `Invalid test cases: ${invalidTests.join(', ')}`,
        invalidTests 
      };
    }

    return { 
      valid: true, 
      testCount: suite.testCases.length,
      environment: environment.name 
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST CLEANUP METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  async removeTestFromAllSuites(testId) {
    try {
      const suites = await this.getTestSuites();
      let updatedSuites = 0;

      for (const suite of suites) {
        if (suite.testCases && suite.testCases.includes(testId)) {
          // Remove the test ID from the test cases array
          const updatedTestCases = suite.testCases.filter(id => id !== testId);
          
          await this.updateTestSuite(suite.id, {
            testCases: updatedTestCases
          });
          
          updatedSuites++;
          console.log(`✅ Removed test ${testId} from test suite: ${suite.name}`);
        }
      }

      console.log(`🧹 Test cleanup complete: removed test ${testId} from ${updatedSuites} test suite(s)`);
      return updatedSuites;
    } catch (error) {
      console.error('❌ Error removing test from test suites:', error);
      throw error;
    }
  }

  async cleanupInvalidTests() {
    try {
      const testGenerator = require('./testGenerator');
      const allTests = await testGenerator.getGeneratedTests();
      const validTestIds = allTests.map(test => test.testId);
      
      const suites = await this.getTestSuites();
      let cleanedSuites = 0;
      let removedTests = 0;

      for (const suite of suites) {
        if (suite.testCases && suite.testCases.length > 0) {
          const validTestCases = suite.testCases.filter(testId => validTestIds.includes(testId));
          const invalidTestCases = suite.testCases.filter(testId => !validTestIds.includes(testId));
          
          if (invalidTestCases.length > 0) {
            await this.updateTestSuite(suite.id, {
              testCases: validTestCases
            });
            
            cleanedSuites++;
            removedTests += invalidTestCases.length;
            console.log(`🧹 Cleaned test suite "${suite.name}": removed ${invalidTestCases.length} invalid test(s)`);
          }
        }
      }

      console.log(`✅ Cleanup complete: cleaned ${cleanedSuites} test suite(s), removed ${removedTests} invalid test reference(s)`);
      return { cleanedSuites, removedTests };
    } catch (error) {
      console.error('❌ Error during test suite cleanup:', error);
      throw error;
    }
  }
}

module.exports = new TestSuiteService(); 