const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class FailureHandler {
  constructor() {
    this.failureArtifactsDir = path.join(__dirname, '../../../../test-results/failure-artifacts');
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000/api';
    fs.ensureDirSync(this.failureArtifactsDir);
  }

  async handleTestFailure(testInfo, error) {
    try {
      console.log(`🔴 Test Failure Detected: ${testInfo.title}`);
      console.log(`📁 Test File: ${testInfo.file}`);
      console.log(`❌ Error: ${error.message}`);

      // Collect failure artifacts
      const failureData = await this.collectFailureData(testInfo, error);
      
      // Create failure report
      const report = await this.createFailureReport(failureData);
      
      // Auto-create Jira ticket if enabled
      await this.autoCreateJiraTicket(report);
      
      console.log(`📋 Failure report created: ${report.id}`);
      
      return report;
    } catch (reportError) {
      console.error('❌ Failed to create failure report:', reportError.message);
      return null;
    }
  }

  async collectFailureData(testInfo, error) {
    const timestamp = new Date().toISOString();
    const testId = this.extractTestIdFromFile(testInfo.file);
    
    // Collect basic test information
    const failureData = {
      testName: testInfo.title,
      testId: testId,
      testType: this.extractTestType(testInfo.file),
      testFile: path.relative(process.cwd(), testInfo.file),
      environment: this.getCurrentEnvironment(),
      browser: process.env.BROWSER || 'chromium',
      headless: process.env.HEADLESS !== 'false',
      failedAt: timestamp,
      duration: testInfo.duration,
      retryCount: testInfo.retry,
      
      // Error information
      errorMessage: error.message,
      errorStack: error.stack,
      errorLine: this.extractErrorLine(error.stack),
      
      // Environment context
      baseUrl: process.env.BASE_URL,
      environmentVariables: this.sanitizeEnvironmentVariables(),
      
      // Execution context
      collectionName: process.env.ALLURE_COLLECTION_NAME,
      suiteName: process.env.ALLURE_SUITE_NAME,
      executionType: process.env.ALLURE_EXECUTION_TYPE || 'individual',
      
      // System information
      platform: process.platform,
      nodeVersion: process.version,
      playwrightVersion: this.getPlaywrightVersion(),
      
      // Test metadata
      tags: this.extractTestTags(testInfo),
      lastAction: this.extractLastAction(error.stack)
    };

    // Collect failure artifacts
    const artifacts = await this.collectArtifacts(testInfo);
    
    if (artifacts.screenshots.length > 0) {
      failureData.screenshots = artifacts.screenshots;
    }
    
    if (artifacts.video) {
      failureData.video = artifacts.video;
    }
    
    if (artifacts.trace) {
      failureData.trace = artifacts.trace;
    }

    // Generate steps to reproduce
    failureData.stepsToReproduce = await this.generateStepsToReproduce(testInfo, failureData);

    return failureData;
  }

  async collectArtifacts(testInfo) {
    const artifacts = {
      screenshots: [],
      video: null,
      trace: null
    };

    try {
      // Collect screenshots
      const screenshotPath = testInfo.outputPath('screenshot.png');
      if (await fs.pathExists(screenshotPath)) {
        const targetPath = path.join(this.failureArtifactsDir, `${Date.now()}-screenshot.png`);
        await fs.copy(screenshotPath, targetPath);
        artifacts.screenshots.push(targetPath);
      }

      // Collect video
      const videoPath = testInfo.outputPath('video.webm');
      if (await fs.pathExists(videoPath)) {
        const targetPath = path.join(this.failureArtifactsDir, `${Date.now()}-video.webm`);
        await fs.copy(videoPath, targetPath);
        artifacts.video = targetPath;
      }

      // Collect trace
      const tracePath = testInfo.outputPath('trace.zip');
      if (await fs.pathExists(tracePath)) {
        const targetPath = path.join(this.failureArtifactsDir, `${Date.now()}-trace.zip`);
        await fs.copy(tracePath, targetPath);
        artifacts.trace = targetPath;
      }

      console.log(`📸 Collected ${artifacts.screenshots.length} screenshots`);
      if (artifacts.video) console.log(`🎥 Collected video recording`);
      if (artifacts.trace) console.log(`🔍 Collected trace file`);

    } catch (error) {
      console.error('❌ Error collecting artifacts:', error.message);
    }

    return artifacts;
  }

  async createFailureReport(failureData) {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/jira/failure-reports`, failureData, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create failure report via API:', error.message);
      
      // Fallback: create local failure report
      const reportId = `failure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const reportPath = path.join(this.failureArtifactsDir, `${reportId}.json`);
      
      const report = {
        id: reportId,
        ...failureData,
        createdAt: new Date().toISOString()
      };
      
      await fs.writeJson(reportPath, report, { spaces: 2 });
      return report;
    }
  }

  async autoCreateJiraTicket(report) {
    try {
      // Only auto-create if environment has Jira enabled
      const environment = this.getCurrentEnvironment();
      if (!environment) return;

      const response = await axios.post(`${this.apiBaseUrl}/jira/create-ticket/${report.id}`, {
        environmentKey: environment
      }, {
        timeout: 15000
      });

      if (response.data.success) {
        console.log(`🎫 Auto-created Jira ticket: ${response.data.ticketKey}`);
        console.log(`🔗 Ticket URL: ${response.data.ticketUrl}`);
      }
    } catch (error) {
      console.error('❌ Failed to auto-create Jira ticket:', error.message);
      // Don't throw - this is optional functionality
    }
  }

  // Helper methods
  extractTestIdFromFile(filePath) {
    const fileName = path.basename(filePath);
    const match = fileName.match(/-([a-f0-9-]{36})\.spec\.js$/);
    return match ? match[1] : fileName.replace('.spec.js', '');
  }

  extractTestType(filePath) {
    const fileName = path.basename(filePath);
    if (fileName.includes('api-')) return 'API Test';
    if (fileName.includes('ui-')) return 'UI Test';
    if (fileName.includes('e2e-')) return 'E2E Test';
    return 'Functional Test';
  }

  getCurrentEnvironment() {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) return 'dev';
    
    if (baseUrl.includes('localhost')) return 'dev';
    if (baseUrl.includes('staging')) return 'staging';
    if (baseUrl.includes('prod')) return 'prod';
    
    return 'dev';
  }

  sanitizeEnvironmentVariables() {
    const envVars = { ...process.env };
    
    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
    Object.keys(envVars).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        envVars[key] = '***REDACTED***';
      }
    });

    return envVars;
  }

  extractErrorLine(stack) {
    if (!stack) return 'Unknown';
    
    const lines = stack.split('\n');
    for (const line of lines) {
      const match = line.match(/:(\d+):\d+/);
      if (match) {
        return match[1];
      }
    }
    
    return 'Unknown';
  }

  getPlaywrightVersion() {
    try {
      const pkg = require('@playwright/test/package.json');
      return pkg.version;
    } catch {
      return 'Unknown';
    }
  }

  extractTestTags(testInfo) {
    // Extract tags from test title or annotations
    const title = testInfo.title;
    const tags = [];
    
    // Look for @tag patterns in title
    const tagMatches = title.match(/@(\w+)/g);
    if (tagMatches) {
      tags.push(...tagMatches.map(tag => tag.substring(1)));
    }
    
    // Look for common test categories
    if (title.toLowerCase().includes('smoke')) tags.push('smoke');
    if (title.toLowerCase().includes('regression')) tags.push('regression');
    if (title.toLowerCase().includes('sanity')) tags.push('sanity');
    if (title.toLowerCase().includes('api')) tags.push('api');
    if (title.toLowerCase().includes('ui')) tags.push('ui');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  extractLastAction(stack) {
    if (!stack) return null;
    
    // Try to extract the last meaningful action from the stack trace
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('click') || line.includes('fill') || line.includes('goto') || 
          line.includes('type') || line.includes('select')) {
        return line.trim();
      }
    }
    
    return null;
  }

  async generateStepsToReproduce(testInfo, failureData) {
    const steps = [];
    
    // Basic navigation step
    if (failureData.baseUrl) {
      steps.push(`Navigate to ${failureData.baseUrl}`);
    }
    
    // Add browser/environment context
    steps.push(`Set browser to ${failureData.browser} (${failureData.headless ? 'headless' : 'headed'} mode)`);
    
    // Add test-specific steps
    steps.push(`Execute test: "${failureData.testName}"`);
    steps.push(`Follow test scenario defined in: ${failureData.testFile}`);
    
    // Add last action if available
    if (failureData.lastAction) {
      steps.push(`Last successful action: ${failureData.lastAction}`);
    }
    
    // Add error context
    steps.push(`Observe failure: ${failureData.errorMessage}`);
    
    // Add environment variables that might be relevant
    if (failureData.environmentVariables.USERNAME && failureData.environmentVariables.USERNAME !== '***REDACTED***') {
      steps.push(`Use test credentials: ${failureData.environmentVariables.USERNAME}`);
    }
    
    return steps;
  }
}

module.exports = new FailureHandler(); 