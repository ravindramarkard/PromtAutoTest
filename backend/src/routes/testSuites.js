const express = require('express');
const router = express.Router();
const testSuiteService = require('../services/testSuiteService');
const schedulerService = require('../services/schedulerService');

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Get all environments
router.get('/environments', async (req, res) => {
  try {
    const environments = await testSuiteService.getEnvironments();
    res.json(environments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific environment
router.get('/environments/:key', async (req, res) => {
  try {
    const environment = await testSuiteService.getEnvironment(req.params.key);
    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    res.json(environment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new environment
router.post('/environments', async (req, res) => {
  try {
    const environment = await testSuiteService.createEnvironment(req.body);
    res.status(201).json(environment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update environment
router.put('/environments/:key', async (req, res) => {
  try {
    const environment = await testSuiteService.updateEnvironment(req.params.key, req.body);
    res.json(environment);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Delete environment
router.delete('/environments/:key', async (req, res) => {
  try {
    await testSuiteService.deleteEnvironment(req.params.key);
    res.json({ message: `Environment ${req.params.key} deleted successfully` });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITE ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Get all test suites
router.get('/suites', async (req, res) => {
  try {
    const suites = await testSuiteService.getTestSuites();
    res.json(suites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific test suite
router.get('/suites/:id', async (req, res) => {
  try {
    const suite = await testSuiteService.getTestSuite(req.params.id);
    if (!suite) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    res.json(suite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new test suite
router.post('/suites', async (req, res) => {
  try {
    const suite = await testSuiteService.createTestSuite(req.body);
    res.status(201).json(suite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update test suite
router.put('/suites/:id', async (req, res) => {
  try {
    const suite = await testSuiteService.updateTestSuite(req.params.id, req.body);
    res.json(suite);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Add test to test suite
router.post('/suites/:id/tests/:testId', async (req, res) => {
  try {
    const suiteId = req.params.id;
    const testId = req.params.testId;
    
    // Get current test suite
    const suite = await testSuiteService.getTestSuite(suiteId);
    if (!suite) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    
    // Check if test exists
    const testGenerator = require('../services/testGenerator');
    const test = await testGenerator.getGeneratedTest(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // Check if test is already in the suite
    if (suite.testCases && suite.testCases.includes(testId)) {
      return res.status(400).json({ error: 'Test is already in this test suite' });
    }
    
    // Add test to suite
    const updatedTestCases = suite.testCases ? [...suite.testCases, testId] : [testId];
    const updatedSuite = await testSuiteService.updateTestSuite(suiteId, {
      testCases: updatedTestCases
    });
    
    console.log(`✅ Added test ${testId} to test suite: ${suite.name}`);
    
    res.json({
      success: true,
      message: `Test "${test.testName}" added to test suite "${suite.name}"`,
      suite: updatedSuite,
      addedTest: {
        testId: test.testId,
        testName: test.testName,
        testType: test.testType
      }
    });
  } catch (error) {
    console.error('❌ Error adding test to suite:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove test from test suite
router.delete('/suites/:id/tests/:testId', async (req, res) => {
  try {
    const suiteId = req.params.id;
    const testId = req.params.testId;
    
    // Get current test suite
    const suite = await testSuiteService.getTestSuite(suiteId);
    if (!suite) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    
    // Check if test is in the suite
    if (!suite.testCases || !suite.testCases.includes(testId)) {
      return res.status(400).json({ error: 'Test is not in this test suite' });
    }
    
    // Get test details for response
    const testGenerator = require('../services/testGenerator');
    const test = await testGenerator.getGeneratedTest(testId);
    const testName = test ? test.testName : `Test ${testId}`;
    
    // Remove test from suite
    const updatedTestCases = suite.testCases.filter(id => id !== testId);
    const updatedSuite = await testSuiteService.updateTestSuite(suiteId, {
      testCases: updatedTestCases
    });
    
    console.log(`✅ Removed test ${testId} from test suite: ${suite.name}`);
    
    res.json({
      success: true,
      message: `Test "${testName}" removed from test suite "${suite.name}"`,
      suite: updatedSuite,
      removedTest: {
        testId,
        testName
      }
    });
  } catch (error) {
    console.error('❌ Error removing test from suite:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tests in a test suite with detailed information
router.get('/suites/:id/tests', async (req, res) => {
  try {
    const suite = await testSuiteService.getTestSuite(req.params.id);
    if (!suite) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    
    const testGenerator = require('../services/testGenerator');
    const allTests = await testGenerator.getGeneratedTests();
    
    // Get detailed information for tests in this suite
    const suiteTests = [];
    if (suite.testCases) {
      for (const testId of suite.testCases) {
        const test = allTests.find(t => t.testId === testId);
        if (test) {
          suiteTests.push(test);
        }
      }
    }
    
    // Get available tests that are not in this suite
    const availableTests = allTests.filter(test => 
      !suite.testCases || !suite.testCases.includes(test.testId)
    );
    
    res.json({
      suite: {
        id: suite.id,
        name: suite.name,
        description: suite.description,
        environment: suite.environment
      },
      testsInSuite: suiteTests,
      availableTests: availableTests,
      totalTestsInSuite: suiteTests.length,
      totalAvailableTests: availableTests.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete test suite
router.delete('/suites/:id', async (req, res) => {
  try {
    const success = await testSuiteService.deleteTestSuite(req.params.id);
    if (success) {
      res.json({ message: 'Test suite deleted successfully' });
    } else {
      res.status(404).json({ error: 'Test suite not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate test suite
router.get('/suites/:id/validate', async (req, res) => {
  try {
    const validation = await testSuiteService.validateSuite(req.params.id);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST COLLECTION ROUTES
// ═════���═════════════════════════════════════════════════════════════════════

// Get all test collections
router.get('/collections', async (req, res) => {
  try {
    const collections = await testSuiteService.getTestCollections();
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific test collection
router.get('/collections/:id', async (req, res) => {
  try {
    const collection = await testSuiteService.getTestCollection(req.params.id);
    if (!collection) {
      return res.status(404).json({ error: 'Test collection not found' });
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new test collection
router.post('/collections', async (req, res) => {
  try {
    const collection = await testSuiteService.createTestCollection(req.body);
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update test collection
router.put('/collections/:id', async (req, res) => {
  try {
    const collection = await testSuiteService.updateTestCollection(req.params.id, req.body);
    res.json(collection);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Delete test collection
router.delete('/collections/:id', async (req, res) => {
  try {
    const success = await testSuiteService.deleteTestCollection(req.params.id);
    if (success) {
      res.json({ message: 'Test collection deleted successfully' });
    } else {
      res.status(404).json({ error: 'Test collection not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Run test suite
router.post('/suites/:id/run', async (req, res) => {
  try {
    const { 
      headless = true, 
      browser = 'chromium', 
      parallel = false,
      environment,
      tags
    } = req.body;
    
    console.log(`🚀 Starting test suite execution: ${req.params.id}`);
    console.log(`⚙️ Options:`, { headless, browser, parallel, environment, tags });
    
    const result = await testSuiteService.runTestSuite(req.params.id, {
      headless,
      browser,
      parallel,
      environment, // Pass environment override if provided
      tags: tags || [] // Pass tags filter if provided
    });
    
    res.json({
      success: true,
      suiteId: req.params.id,
      execution: result
    });
  } catch (error) {
    console.error('❌ Test suite execution error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      suiteId: req.params.id
    });
  }
});

// Run test collection
router.post('/collections/:id/run', async (req, res) => {
  try {
    const { 
      headless = true, 
      browser = 'chromium', 
      parallel = false,
      environment,
      tags
    } = req.body;
    
    console.log(`🚀 Starting test collection execution: ${req.params.id}`);
    console.log(`⚙️ Options:`, { headless, browser, parallel, environment, tags });
    
    const result = await testSuiteService.runTestCollection(req.params.id, {
      headless,
      browser,
      parallel,
      environment, // Pass environment override if provided
      tags: tags || [] // Pass tags filter if provided
    });
    
    res.json({
      success: result.success,
      collectionId: req.params.id,
      execution: result
    });
  } catch (error) {
    console.error('❌ Test collection execution error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      collectionId: req.params.id
    });
  }
});

// Run tests by tags
router.post('/run/tags', async (req, res) => {
  try {
    const { 
      tags, 
      environment = 'dev', 
      headless = true, 
      browser = 'chromium' 
    } = req.body;
    
    if (!tags || (Array.isArray(tags) && tags.length === 0)) {
      return res.status(400).json({ error: 'Tags are required' });
    }
    
    console.log(`🏷️ Running tests by tags: ${Array.isArray(tags) ? tags.join(', ') : tags}`);
    console.log(`🌍 Environment: ${environment}`);
    
    const result = await testSuiteService.runTestsByTags(tags, environment, {
      headless,
      browser
    });
    
    res.json({
      success: true,
      tags: result.tags,
      testsFound: result.testsFound,
      environment,
      execution: result.result
    });
  } catch (error) {
    console.error('❌ Tag-based execution error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULER ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await schedulerService.getSchedules();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific schedule
router.get('/schedules/:id', async (req, res) => {
  try {
    const schedule = await schedulerService.getSchedule(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new schedule
router.post('/schedules', async (req, res) => {
  try {
    const schedule = await schedulerService.createSchedule(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update schedule
router.put('/schedules/:id', async (req, res) => {
  try {
    const schedule = await schedulerService.updateSchedule(req.params.id, req.body);
    res.json(schedule);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Delete schedule
router.delete('/schedules/:id', async (req, res) => {
  try {
    const success = await schedulerService.deleteSchedule(req.params.id);
    if (success) {
      res.json({ message: 'Schedule deleted successfully' });
    } else {
      res.status(404).json({ error: 'Schedule not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle schedule active state
router.patch('/schedules/:id/toggle', async (req, res) => {
  try {
    const { active } = req.body;
    const schedule = await schedulerService.toggleSchedule(req.params.id, active);
    res.json(schedule);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get execution history
router.get('/schedules/executions', async (req, res) => {
  try {
    const { scheduleId, limit } = req.query;
    const executions = await schedulerService.getExecutionHistory(
      scheduleId || null, 
      parseInt(limit) || 50
    );
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get execution history for specific schedule
router.get('/schedules/:id/executions', async (req, res) => {
  try {
    const { limit } = req.query;
    const executions = await schedulerService.getExecutionHistory(
      req.params.id, 
      parseInt(limit) || 50
    );
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get schedule statistics
router.get('/schedules/statistics', async (req, res) => {
  try {
    const stats = await schedulerService.getScheduleStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate cron expression
router.post('/schedules/validate-cron', async (req, res) => {
  try {
    const { cronExpression } = req.body;
    const validation = schedulerService.validateCronExpression(cronExpression);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule a test suite
router.post('/suites/:id/schedule', async (req, res) => {
  try {
    const suite = await testSuiteService.getTestSuite(req.params.id);
    if (!suite) {
      return res.status(404).json({ error: 'Test suite not found' });
    }

    const scheduleData = {
      ...req.body,
      type: 'suite',
      targetId: req.params.id,
      targetName: suite.name
    };

    const schedule = await schedulerService.createSchedule(scheduleData);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule a test collection
router.post('/collections/:id/schedule', async (req, res) => {
  try {
    const collection = await testSuiteService.getTestCollection(req.params.id);
    if (!collection) {
      return res.status(404).json({ error: 'Test collection not found' });
    }

    const scheduleData = {
      ...req.body,
      type: 'collection',
      targetId: req.params.id,
      targetName: collection.name
    };

    const schedule = await schedulerService.createSchedule(scheduleData);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// STATISTICS AND UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

// Get suite statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await testSuiteService.getSuiteStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available tags from all tests
router.get('/tags', async (req, res) => {
  try {
    const testGenerator = require('../services/testGenerator');
    const allTests = await testGenerator.getGeneratedTests();
    
    const tagSet = new Set();
    allTests.forEach(test => {
      if (test.tags) {
        test.tags.forEach(tag => tagSet.add(tag));
      }
    });
    
    const tags = Array.from(tagSet).sort();
    
    res.json({
      tags,
      totalTests: allTests.length,
      taggedTests: allTests.filter(test => test.tags && test.tags.length > 0).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tests by tag (for preview)
router.get('/tags/:tag/tests', async (req, res) => {
  try {
    const testGenerator = require('../services/testGenerator');
    const allTests = await testGenerator.getGeneratedTests();
    
    const filteredTests = allTests.filter(test => {
      return test.tags && test.tags.some(tag => 
        tag.toLowerCase().includes(req.params.tag.toLowerCase())
      );
    });
    
    res.json({
      tag: req.params.tag,
      tests: filteredTests.map(test => ({
        testId: test.testId,
        testName: test.testName,
        testType: test.testType,
        tags: test.tags,
        timestamp: test.timestamp
      })),
      totalFound: filteredTests.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CLEANUP AND MAINTENANCE ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Clean up invalid test references from all test suites
router.post('/cleanup', async (req, res) => {
  try {
    const result = await testSuiteService.cleanupInvalidTests();
    
    res.json({
      success: true,
      message: 'Test suite cleanup completed successfully',
      cleanedSuites: result.cleanedSuites,
      removedTests: result.removedTests,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;