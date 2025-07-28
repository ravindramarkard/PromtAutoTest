const express = require('express');
const router = express.Router();
const jiraService = require('../services/jiraService');
const testSuiteService = require('../services/testSuiteService');

// ═══════════════════════════════════════════════════════════════════════════
// JIRA CONNECTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// Test Jira connection
router.post('/test-connection', async (req, res) => {
  try {
    const { jiraConfig } = req.body;
    const result = await jiraService.testJiraConnection(jiraConfig);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test Jira connection for environment
router.post('/test-connection/:environmentKey', async (req, res) => {
  try {
    const environment = await testSuiteService.getEnvironment(req.params.environmentKey);
    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    const result = await jiraService.testJiraConnection(environment.jira);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get Jira projects for environment
router.get('/projects/:environmentKey', async (req, res) => {
  try {
    const environment = await testSuiteService.getEnvironment(req.params.environmentKey);
    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    const result = await jiraService.getJiraProjects(environment.jira);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get issue types for project
router.get('/issue-types/:environmentKey/:projectKey', async (req, res) => {
  try {
    const environment = await testSuiteService.getEnvironment(req.params.environmentKey);
    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    const result = await jiraService.getIssueTypes(environment.jira, req.params.projectKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FAILURE REPORT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// Get all failure reports
router.get('/failure-reports', async (req, res) => {
  try {
    const reports = await jiraService.getFailureReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific failure report
router.get('/failure-reports/:reportId', async (req, res) => {
  try {
    const report = await jiraService.getFailureReport(req.params.reportId);
    if (!report) {
      return res.status(404).json({ error: 'Failure report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create failure report (used internally by test failures)
router.post('/failure-reports', async (req, res) => {
  try {
    const report = await jiraService.createFailureReport(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete failure report
router.delete('/failure-reports/:reportId', async (req, res) => {
  try {
    const success = await jiraService.deleteFailureReport(req.params.reportId);
    if (success) {
      res.json({ message: 'Failure report deleted successfully' });
    } else {
      res.status(404).json({ error: 'Failure report not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// JIRA TICKET MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// Create Jira ticket from failure report
router.post('/create-ticket/:reportId', async (req, res) => {
  try {
    const { environmentKey } = req.body;
    
    const report = await jiraService.getFailureReport(req.params.reportId);
    if (!report) {
      return res.status(404).json({ error: 'Failure report not found' });
    }

    const environment = await testSuiteService.getEnvironment(environmentKey);
    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    if (!environment.jira.enabled) {
      return res.status(400).json({ error: 'Jira integration is not enabled for this environment' });
    }

    const result = await jiraService.createJiraTicketForFailure(report, environment.jira);
    
    if (result.success) {
      // Update the failure report with Jira ticket information
      report.jiraTicket = {
        key: result.ticketKey,
        url: result.ticketUrl,
        createdAt: new Date().toISOString(),
        environment: environmentKey
      };
      
      await jiraService.createFailureReport({
        ...report,
        id: report.id // Keep the same ID to overwrite
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create Jira ticket manually (for any test failure)
router.post('/create-ticket-manual', async (req, res) => {
  try {
    const { 
      environmentKey, 
      testName, 
      testId, 
      errorMessage, 
      stepsToReproduce,
      additionalInfo 
    } = req.body;

    const environment = await testSuiteService.getEnvironment(environmentKey);
    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    if (!environment.jira.enabled) {
      return res.status(400).json({ error: 'Jira integration is not enabled for this environment' });
    }

    // Create a manual failure report
    const failureData = {
      testName,
      testId,
      testType: 'Manual Report',
      environment: environmentKey,
      errorMessage,
      stepsToReproduce: Array.isArray(stepsToReproduce) ? stepsToReproduce : [stepsToReproduce],
      failedAt: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      isManualReport: true,
      additionalInfo
    };

    const report = await jiraService.createFailureReport(failureData);
    const result = await jiraService.createJiraTicketForFailure(report, environment.jira);

    if (result.success) {
      report.jiraTicket = {
        key: result.ticketKey,
        url: result.ticketUrl,
        createdAt: new Date().toISOString(),
        environment: environmentKey
      };
    }

    res.json({
      ...result,
      reportId: report.id
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router; 