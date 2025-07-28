const { test } = require('@playwright/test');
const { allure } = require('allure-playwright');
const failureHandler = require('./failure-handler');

// Global setup for Allure reporting with dynamic hierarchy
test.beforeEach(async ({ page }, testInfo) => {
  const executionType = process.env.ALLURE_EXECUTION_TYPE || 'individual';
  const collectionName = process.env.ALLURE_COLLECTION_NAME;
  const suiteName = process.env.ALLURE_SUITE_NAME;
  
  // Set Allure labels based on execution context using different approach
  if (executionType === 'collection' && collectionName) {
    // Collection-based execution: Collection > Suite > Test
    await allure.epic(collectionName);
    await allure.feature(suiteName || 'Test Suite');
    await allure.story(testInfo.title);
    
    // Use suite() method instead of labels for better compatibility
    await allure.suite(collectionName);
    
    // Additional labels for filtering and metadata
    await allure.label('testType', 'collection');
    await allure.label('collection', collectionName);
    if (suiteName) {
      await allure.label('testSuite', suiteName);
    }
  } else if (executionType === 'suite' && suiteName) {
    // Suite-based execution: Suite > Test
    await allure.epic(suiteName);
    await allure.feature(testInfo.file.split('/').pop().replace('.spec.js', ''));
    await allure.story(testInfo.title);
    
    // Use suite() method for better organization
    await allure.suite(suiteName);
    
    await allure.label('testType', 'suite');
    await allure.label('testSuite', suiteName);
  } else {
    // Individual test execution: File > Test
    await allure.epic('Individual Tests');
    await allure.feature(testInfo.file.split('/').pop().replace('.spec.js', ''));
    await allure.story(testInfo.title);
    
    // Use suite() method for individual tests
    await allure.suite('Individual Tests');
    
    await allure.label('testType', 'individual');
  }
  
  // Add execution metadata
  await allure.parameter('Execution Type', executionType);
  await allure.parameter('Browser', process.env.BROWSER || 'chromium');
  await allure.parameter('Environment', process.env.NODE_ENV || 'test');
  await allure.parameter('Base URL', process.env.BASE_URL || 'N/A');
  
  // Add test metadata for better organization
  testInfo.annotations.push(
    {
      type: 'executionType',
      description: executionType
    },
    {
      type: 'hierarchy',
      description: executionType === 'collection' 
        ? `${collectionName} > ${suiteName || 'Suite'} > ${testInfo.title}`
        : executionType === 'suite'
        ? `${suiteName} > ${testInfo.title}`
        : `${testInfo.title}`
    }
  );
  
  // Add collection/suite specific annotations
  if (collectionName) {
    testInfo.annotations.push({
      type: 'collection',
      description: collectionName
    });
  }
  
  if (suiteName) {
    testInfo.annotations.push({
      type: 'suite', 
      description: suiteName
    });
  }
});

// Add step logging for better Allure reports
test.beforeEach(async ({ page }, testInfo) => {
  const executionContext = process.env.ALLURE_EXECUTION_TYPE || 'individual';
  const contextName = process.env.ALLURE_COLLECTION_NAME || process.env.ALLURE_SUITE_NAME || 'Individual';
  
  await allure.step(`Starting test: ${testInfo.title}`, async () => {
    await allure.step(`Execution context: ${executionContext} - ${contextName}`, async () => {
      // This step provides context in the Allure report
    });
  });
});

// Global test failure handler and result processing
test.afterEach(async ({ page }, testInfo) => {
  const testResult = testInfo.status;
  const testTitle = testInfo.title;
  
  if (testResult === 'failed') {
    console.log(`🔴 Test Failed: ${testTitle}`);
    
    try {
      // Add failure information to Allure report
      if (testInfo.error) {
        await allure.attachment('Error Message', testInfo.error.message, 'text/plain');
        await allure.attachment('Stack Trace', testInfo.error.stack, 'text/plain');
        await allure.parameter('Failure Reason', testInfo.error.message);
      }
      
      // Add execution metadata to failure
      await allure.parameter('Failed At', new Date().toISOString());
      await allure.parameter('Test Duration', `${testInfo.duration}ms`);
      await allure.parameter('Retry Count', testInfo.retry.toString());
      
      // Process failure with our comprehensive failure handler
      await allure.step('Processing test failure for Jira integration', async () => {
        const failureReport = await failureHandler.handleTestFailure(testInfo, testInfo.error);
        
        if (failureReport) {
          // Add failure report information to Allure
          await allure.attachment('Failure Report ID', failureReport.id, 'text/plain');
          await allure.parameter('Failure Report', failureReport.id);
          
          // Add steps to reproduce
          if (failureReport.stepsToReproduce && failureReport.stepsToReproduce.length > 0) {
            const stepsText = failureReport.stepsToReproduce
              .map((step, index) => `${index + 1}. ${step}`)
              .join('\n');
            await allure.attachment('Steps to Reproduce', stepsText, 'text/plain');
          }
          
          // Add Jira ticket information if created
          if (failureReport.jiraTicket) {
            await allure.link(failureReport.jiraTicket.url, 'Jira Ticket', 'issue');
            await allure.attachment('Jira Ticket Key', failureReport.jiraTicket.key, 'text/plain');
            await allure.parameter('Auto-Created Jira Ticket', failureReport.jiraTicket.key);
            
            console.log(`🎫 Auto-created Jira ticket: ${failureReport.jiraTicket.key}`);
            console.log(`🔗 Ticket URL: ${failureReport.jiraTicket.url}`);
          } else {
            console.log(`📋 Failure report created: ${failureReport.id} (Jira ticket creation skipped or failed)`);
          }
          
          // Add artifact information
          if (failureReport.screenshots && failureReport.screenshots.length > 0) {
            await allure.parameter('Screenshots Captured', failureReport.screenshots.length.toString());
          }
          
          if (failureReport.video) {
            await allure.parameter('Video Recording', 'Available');
          }
          
          if (failureReport.trace) {
            await allure.parameter('Trace File', 'Available');
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to process test failure:', error.message);
      await allure.attachment('Failure Processing Error', error.message, 'text/plain');
    }
    
  } else if (testResult === 'passed') {
    console.log(`✅ Test Passed: ${testTitle}`);
    await allure.parameter('Test Result', 'PASSED');
    
  } else if (testResult === 'skipped') {
    console.log(`⏭️ Test Skipped: ${testTitle}`);
    await allure.parameter('Test Result', 'SKIPPED');
    
  } else if (testResult === 'timedOut') {
    console.log(`⏰ Test Timed Out: ${testTitle}`);
    await allure.parameter('Test Result', 'TIMEOUT');
    
    // Treat timeout as a failure for Jira reporting
    try {
      const timeoutError = new Error(`Test timed out after ${testInfo.timeout}ms`);
      const failureReport = await failureHandler.handleTestFailure(testInfo, timeoutError);
      
      if (failureReport && failureReport.jiraTicket) {
        await allure.link(failureReport.jiraTicket.url, 'Timeout Jira Ticket', 'issue');
        console.log(`🎫 Auto-created Jira ticket for timeout: ${failureReport.jiraTicket.key}`);
      }
    } catch (error) {
      console.error('❌ Failed to process timeout as failure:', error.message);
    }
  }
  
  // Add test completion timestamp
  await allure.parameter('Completed At', new Date().toISOString());
});

module.exports = {
  failureHandler
};