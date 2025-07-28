const express = require('express');
const router = express.Router();
const testGenerator = require('../services/testGenerator');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

// Get all generated tests
router.get('/', async (req, res) => {
  try {
    const tests = await testGenerator.getGeneratedTests();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific test
router.get('/:id', async (req, res) => {
  try {
    const test = await testGenerator.getGeneratedTest(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test file content
router.get('/:id/file', async (req, res) => {
  try {
    const testId = req.params.id;
    const testFilePath = path.join(__dirname, '../tests', `${testId}.spec.js`);
    
    if (await fs.pathExists(testFilePath)) {
      const fileContent = await fs.readFile(testFilePath, 'utf-8');
      res.json({ content: fileContent });
    } else {
      res.status(404).json({ error: 'Test file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete test
router.delete('/:id', async (req, res) => {
  try {
    const test = await testGenerator.getGeneratedTest(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // Delete the test file
    const testFilePath = path.join(__dirname, '../tests/playwright', test.fileName);
    if (await fs.pathExists(testFilePath)) {
      await fs.remove(testFilePath);
    }
    
    // Remove from generated tests list
    await testGenerator.deleteGeneratedTest(req.params.id);
    
    // Remove test from any test suites that contain it
    const testSuiteService = require('../services/testSuiteService');
    await testSuiteService.removeTestFromAllSuites(req.params.id);
    
    res.json({ 
      message: 'Test deleted successfully and removed from all test suites',
      testId: req.params.id,
      testName: test.testName
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run individual test
router.post('/:id/run', async (req, res) => {
  try {
    const testId = req.params.id;
    const { browser = 'chromium', headed = false } = req.body;
    
    // Get test details
    const test = await testGenerator.getGeneratedTest(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    const playwrightConfigPath = path.join(__dirname, '../tests/playwright.config.js');
    const testsRoot = path.join(__dirname, '../tests');
    
    // Set environment variables for individual test execution
    const envVars = {
      ...process.env,
      ALLURE_EXECUTION_TYPE: 'individual',
      BASE_URL: process.env.BASE_URL || 'http://localhost:4001',
      BROWSER: browser
    };
    
    const command = `npx playwright test "playwright/${test.fileName}" --config="${playwrightConfigPath}" --project=${browser}${headed ? ' --headed' : ''}`;
    
    console.log('🔧 Executing individual test command:', command);
    console.log(`📝 Running test: ${test.testName} (${test.fileName})`);
    console.log('🎯 Execution type: Individual test');
    
    exec(command, { 
      cwd: testsRoot,
      env: envVars
    }, (error, stdout, stderr) => {
      // For Playwright, exit code 1 usually means test failures, not execution errors
      const hasExecutionError = error && !stdout.includes('Running') && !stdout.includes('test');
      
      if (hasExecutionError) {
        console.error('❌ Individual test execution failed:', error);
        return res.status(500).json({ 
          error: 'Test execution failed', 
          details: error.message,
          stdout: stdout || '',
          stderr: stderr || ''
        });
      }

      const result = {
        success: !error,
        testId,
        testName: test.testName,
        fileName: test.fileName,
        browser,
        headed,
        stdout: stdout || '',
        stderr: stderr || '',
        testsFailed: error && stdout.includes('failed'),
        exitCode: error ? error.code : 0,
        executionType: 'individual',
        timestamp: new Date().toISOString()
      };

      console.log(result.success ? '✅ Individual test completed successfully' : '❌ Individual test execution failed');
      res.json(result);
    });

  } catch (error) {
    console.error('❌ Error running individual test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Run all tests
router.post('/run-all', async (req, res) => {
  try {
    const { browser = 'chromium', headed = false } = req.body;
    
    // Run all Playwright tests
    const playwrightConfigPath = path.join(__dirname, '../tests/playwright.config.js');
    const testsRoot = path.join(__dirname, '../tests');
    const command = `npx playwright test "playwright" --config="${playwrightConfigPath}" --project=${browser}${headed ? ' --headed' : ''}`;
    
    console.log('Executing command:', command);
    console.log('Running all tests from directory: playwright/ (relative to tests root)');
    
    exec(command, { cwd: testsRoot }, (error, stdout, stderr) => {
      // For Playwright, exit code 1 usually means test failures, not execution errors
      const hasExecutionError = error && !stdout.includes('Running') && !stdout.includes('test');
      
      if (hasExecutionError) {
        console.error('Test execution failed:', error);
        return res.status(500).json({ 
          error: 'Test execution failed', 
          details: error.message,
          stdout: stdout || '',
          stderr: stderr || ''
        });
      }

      // Generate Allure report (whether tests passed or failed)
      const allureCommand = 'export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH" && npm run allure:generate';
      exec(allureCommand, { cwd: path.join(__dirname, '../../'), shell: '/bin/zsh' }, (allureError, allureStdout, allureStderr) => {
        if (allureError) {
          console.warn('Allure report generation failed:', allureError);
        } else {
          console.log('✅ Allure report generated successfully');
        }

        res.json({
          success: !error,
          browser,
          headed,
          stdout: stdout || '',
          stderr: stderr || '',
          allureReport: !allureError,
          testsFailed: error && stdout.includes('failed'),
          exitCode: error ? error.code : 0
        });
      });
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Test execution failed', 
      details: error.message 
    });
  }
});

// Get test results
router.get('/results/latest', async (req, res) => {
  try {
    const resultsPath = path.join(__dirname, '../../../test-results/results.json');
    
    if (await fs.pathExists(resultsPath)) {
      const results = await fs.readJson(resultsPath);
      res.json(results);
    } else {
      res.json({ message: 'No test results found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Playwright HTML report
router.get('/reports/playwright', async (req, res) => {
  try {
    const reportPath = path.join(__dirname, '../../../playwright-report/index.html');
    
    if (await fs.pathExists(reportPath)) {
      res.sendFile(path.resolve(reportPath));
    } else {
      res.status(404).json({ 
        error: 'Playwright report not found',
        message: 'Run some tests first to generate reports'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Allure HTML report
router.get('/reports/allure', async (req, res) => {
  try {
    const reportPath = path.join(__dirname, '../../../allure-report/index.html');
    
    if (await fs.pathExists(reportPath)) {
      res.sendFile(path.resolve(reportPath));
    } else {
      res.status(404).json({ 
        error: 'Allure report not found',
        message: 'Run "npm run allure:generate" to generate reports'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve Allure report assets
router.get('/reports/allure/*', async (req, res) => {
  try {
    const assetPath = path.join(__dirname, '../../../allure-report', req.params[0]);
    
    if (await fs.pathExists(assetPath)) {
      res.sendFile(path.resolve(assetPath));
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test results summary
router.get('/results/summary', async (req, res) => {
  try {
    const tests = await testGenerator.getGeneratedTests();
    const playwrightReportExists = await fs.pathExists(path.join(__dirname, '../../../playwright-report/index.html'));
    const allureReportExists = await fs.pathExists(path.join(__dirname, '../../../allure-report/index.html'));
    
    res.json({
      totalTests: tests.length,
      reports: {
        playwright: {
          available: playwrightReportExists,
          url: playwrightReportExists ? '/api/tests/reports/playwright' : null
        },
        allure: {
          available: allureReportExists,
          url: allureReportExists ? '/api/tests/reports/allure' : null,
          message: allureReportExists ? 'Allure reports available' : 'Generate Allure reports first'
        }
      },
      recentTests: tests.slice(0, 5).map(test => ({
        testId: test.testId,
        testName: test.testName,
        testType: test.testType,
        timestamp: test.timestamp
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Allure report
router.get('/allure/generate', async (req, res) => {
  try {
    exec('npm run allure:generate', { cwd: path.join(__dirname, '../../../') }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          error: 'Allure report generation failed',
          details: error.message,
          stderr
        });
      }

      res.json({
        message: 'Allure report generated successfully',
        output: stdout
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update test file content
router.put('/:testId/files/:fileType', async (req, res) => {
  try {
    const { content } = req.body;
    const tests = await testGenerator.getGeneratedTests();
    const test = tests.find(t => t.testId === req.params.testId);
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const file = test.files.find(f => f.type === req.params.fileType);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    await fs.writeFile(file.path, content);
    res.json({ message: 'File updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this route to update test file content
router.put('/:id/file', async (req, res) => {
  try {
    const testId = req.params.id;
    const testFilePath = path.join(__dirname, '../tests', `${testId}.spec.js`);
    
    if (await fs.pathExists(testFilePath)) {
      await fs.writeFile(testFilePath, req.body.content, 'utf-8');
      res.json({ message: 'Test file updated successfully' });
    } else {
      res.status(404).json({ error: 'Test file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 