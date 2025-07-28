const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class JiraService {
  constructor() {
    this.failureReportsDir = path.join(__dirname, '../data/failure-reports');
    fs.ensureDirSync(this.failureReportsDir);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // JIRA API INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════

  async createJiraClient(jiraConfig) {
    if (!jiraConfig.enabled || !jiraConfig.serverUrl || !jiraConfig.username || !jiraConfig.apiToken) {
      throw new Error('Jira configuration is incomplete or disabled');
    }

    const auth = Buffer.from(`${jiraConfig.username}:${jiraConfig.apiToken}`).toString('base64');
    
    return axios.create({
      baseURL: `${jiraConfig.serverUrl}/rest/api/3`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  async testJiraConnection(jiraConfig) {
    try {
      const client = await this.createJiraClient(jiraConfig);
      const response = await client.get('/myself');
      
      return {
        success: true,
        user: response.data,
        message: `Connected to Jira as ${response.data.displayName}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        message: 'Failed to connect to Jira'
      };
    }
  }

  async getJiraProjects(jiraConfig) {
    try {
      const client = await this.createJiraClient(jiraConfig);
      const response = await client.get('/project/search');
      
      return {
        success: true,
        projects: response.data.values.map(project => ({
          key: project.key,
          name: project.name,
          id: project.id
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getIssueTypes(jiraConfig, projectKey) {
    try {
      const client = await this.createJiraClient(jiraConfig);
      const response = await client.get(`/project/${projectKey}`);
      
      return {
        success: true,
        issueTypes: response.data.issueTypes.map(type => ({
          id: type.id,
          name: type.name,
          description: type.description
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FAILURE REPORTING
  // ═══════════════════════════════════════════════════════════════════════════

  async createFailureReport(failureData) {
    const reportId = `failure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const reportPath = path.join(this.failureReportsDir, `${reportId}.json`);
    
    const report = {
      id: reportId,
      ...failureData,
      createdAt: new Date().toISOString()
    };

    await fs.writeJson(reportPath, report, { spaces: 2 });
    console.log(`📋 Failure report created: ${reportId}`);
    
    return report;
  }

  async createJiraTicketForFailure(failureReport, jiraConfig) {
    try {
      const client = await this.createJiraClient(jiraConfig);
      
      // Generate detailed description with steps to reproduce
      const description = this.generateJiraDescription(failureReport);
      
      const issueData = {
        fields: {
          project: {
            key: jiraConfig.projectKey
          },
          summary: `🔴 Test Failure: ${failureReport.testName}`,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: description
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: jiraConfig.issueType || 'Bug'
          },
          priority: {
            name: jiraConfig.priority || 'Medium'
          },
          labels: [
            ...(jiraConfig.labels || []),
            'automated-test-failure',
            `test-id-${failureReport.testId}`,
            `environment-${failureReport.environment}`
          ]
        }
      };

      // Add assignee if specified
      if (jiraConfig.assignee) {
        issueData.fields.assignee = {
          name: jiraConfig.assignee
        };
      }

      const response = await client.post('/issue', issueData);
      
      console.log(`🎫 Jira ticket created: ${response.data.key}`);
      
      // Attach screenshots if available
      if (failureReport.screenshots && failureReport.screenshots.length > 0) {
        await this.attachFilesToJiraTicket(client, response.data.key, failureReport.screenshots);
      }

      // Attach video if available
      if (failureReport.video) {
        await this.attachFilesToJiraTicket(client, response.data.key, [failureReport.video]);
      }

      return {
        success: true,
        ticketKey: response.data.key,
        ticketUrl: `${jiraConfig.serverUrl}/browse/${response.data.key}`
      };
    } catch (error) {
      console.error('❌ Failed to create Jira ticket:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  async attachFilesToJiraTicket(client, ticketKey, filePaths) {
    const FormData = require('form-data');
    
    for (const filePath of filePaths) {
      try {
        if (await fs.pathExists(filePath)) {
          const form = new FormData();
          form.append('file', fs.createReadStream(filePath));

          await client.post(`/issue/${ticketKey}/attachments`, form, {
            headers: {
              ...form.getHeaders(),
              'X-Atlassian-Token': 'no-check'
            }
          });

          console.log(`📎 Attached file to ${ticketKey}: ${path.basename(filePath)}`);
        }
      } catch (error) {
        console.error(`❌ Failed to attach file ${filePath}:`, error.message);
      }
    }
  }

  generateJiraDescription(failureReport) {
    return `
🔴 AUTOMATED TEST FAILURE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TEST DETAILS:
• Test Name: ${failureReport.testName}
• Test ID: ${failureReport.testId}
• Test Type: ${failureReport.testType || 'Unknown'}
• Environment: ${failureReport.environment}
• Browser: ${failureReport.browser || 'Unknown'}
• Execution Mode: ${failureReport.headless ? 'Headless' : 'Headed'}

⏰ FAILURE INFORMATION:
• Failed At: ${failureReport.failedAt || failureReport.createdAt}
• Duration: ${failureReport.duration || 'Unknown'}
• Retry Attempt: ${failureReport.retryCount || 0}

❌ ERROR DETAILS:
${failureReport.errorMessage || 'No error message available'}

🔍 FAILURE LOCATION:
• File: ${failureReport.testFile || 'Unknown'}
• Line: ${failureReport.errorLine || 'Unknown'}

📝 STEPS TO REPRODUCE:
${this.generateStepsToReproduce(failureReport)}

🌐 ENVIRONMENT VARIABLES:
${this.formatEnvironmentVariables(failureReport.environmentVariables)}

📊 SYSTEM INFORMATION:
• Platform: ${failureReport.platform || process.platform}
• Node Version: ${failureReport.nodeVersion || process.version}
• Playwright Version: ${failureReport.playwrightVersion || 'Unknown'}

📸 ATTACHMENTS:
${failureReport.screenshots ? `• Screenshots: ${failureReport.screenshots.length} file(s)` : '• No screenshots captured'}
${failureReport.video ? '• Video recording available' : '• No video recording'}

🔗 RELATED INFORMATION:
• Collection: ${failureReport.collectionName || 'N/A'}
• Suite: ${failureReport.suiteName || 'N/A'}
• Tags: ${failureReport.tags ? failureReport.tags.join(', ') : 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This ticket was automatically created by the Auto-Test LLM Platform.
Report ID: ${failureReport.id}
    `.trim();
  }

  generateStepsToReproduce(failureReport) {
    if (failureReport.stepsToReproduce && failureReport.stepsToReproduce.length > 0) {
      return failureReport.stepsToReproduce.map((step, index) => 
        `${index + 1}. ${step}`
      ).join('\n');
    }

    // Generate basic steps if not provided
    const steps = [
      `Navigate to ${failureReport.baseUrl || 'the application URL'}`,
      `Execute test: ${failureReport.testName}`,
      `Follow the test scenario defined in ${failureReport.testFile || 'the test file'}`,
      `Observe the failure at the point where the error occurred`
    ];

    if (failureReport.lastAction) {
      steps.splice(-1, 0, `Last successful action: ${failureReport.lastAction}`);
    }

    return steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
  }

  formatEnvironmentVariables(envVars) {
    if (!envVars) return 'Not available';
    
    return Object.entries(envVars)
      .filter(([key]) => !key.toLowerCase().includes('password') && !key.toLowerCase().includes('token'))
      .map(([key, value]) => `• ${key}: ${value}`)
      .join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FAILURE REPORT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async getFailureReports() {
    const reportFiles = await fs.readdir(this.failureReportsDir);
    const reports = [];

    for (const file of reportFiles) {
      if (file.endsWith('.json')) {
        const reportPath = path.join(this.failureReportsDir, file);
        const report = await fs.readJson(reportPath);
        reports.push(report);
      }
    }

    return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getFailureReport(reportId) {
    const reportPath = path.join(this.failureReportsDir, `${reportId}.json`);
    if (await fs.pathExists(reportPath)) {
      return await fs.readJson(reportPath);
    }
    return null;
  }

  async deleteFailureReport(reportId) {
    const reportPath = path.join(this.failureReportsDir, `${reportId}.json`);
    if (await fs.pathExists(reportPath)) {
      await fs.remove(reportPath);
      return true;
    }
    return false;
  }
}

module.exports = new JiraService(); 