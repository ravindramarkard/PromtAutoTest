const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai';
    this.initializeClients();
  }

  initializeClients() {
    try {
      // Initialize OpenAI client if API key is available
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log('✅ OpenAI client initialized');
      }

      // Initialize Anthropic client if API key is available
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_claude_api_key_here') {
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
        console.log('✅ Anthropic (Claude) client initialized');
      }

      // Initialize local LLM URL
      if (this.provider === 'local') {
        this.localLLMUrl = process.env.LOCAL_LLM_URL || 'http://localhost:11434';
        console.log('✅ Local LLM URL set:', this.localLLMUrl);
      }

      // Log current provider
      console.log('🤖 Current LLM Provider:', this.provider);
      
    } catch (error) {
      console.error('❌ Error initializing LLM clients:', error);
    }
  }

  async generateTestFromPrompt(prompt, testType = 'ui', additionalContext = {}) {
    const systemPrompt = this.getSystemPrompt(testType);
    const userPrompt = this.buildUserPrompt(prompt, testType, additionalContext);

    try {
      let response;
      
      switch (this.provider) {
        case 'openai':
          response = await this.callOpenAI(systemPrompt, userPrompt);
          break;
        case 'claude':
          response = await this.callClaude(systemPrompt, userPrompt);
          break;
        case 'local':
          response = await this.callLocalLLM(systemPrompt, userPrompt);
          break;
        default:
          throw new Error(`Unsupported LLM provider: ${this.provider}`);
      }

      return this.parseResponse(response, testType);
    } catch (error) {
      console.error('Error generating test:', error);
      throw error;
    }
  }

  async callOpenAI(systemPrompt, userPrompt) {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Check your API key.');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  }

  async callClaude(systemPrompt, userPrompt) {
    if (!this.anthropic) {
      throw new Error('Claude client not initialized. Check your API key.');
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

    return response.content[0].text;
  }

  async callLocalLLM(systemPrompt, userPrompt) {
    try {
      const response = await axios.post(`${this.localLLMUrl}/api/generate`, {
        model: 'llama2', // Default model, can be configured
        prompt: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9
        }
      });

      return response.data.response;
    } catch (error) {
      throw new Error(`Local LLM error: ${error.message}`);
    }
  }

  getSystemPrompt(testType) {
    return `You are an expert test automation engineer. Generate comprehensive Playwright tests based on the user's requirements.

CORE REQUIREMENTS:
- Generate ${testType === 'api' ? 'API' : 'UI'} tests using Playwright
- Use CommonJS require() syntax (NOT ES6 imports)
- Include comprehensive error handling and assertions
- Add detailed Allure reporting steps
- Use self-healing locators and anti-detection features

ENVIRONMENT VARIABLES INTEGRATION:
=====================================

CRITICAL: Generate tests that use runtime environment variables for dynamic configuration.

REQUIRED ENVIRONMENT VARIABLES TO USE:
• process.env.BASE_URL - Base URL for the application
• process.env.API_URL - API endpoint URL  
• process.env.USERNAME - Test user credentials
• process.env.PASSWORD - Test user credentials
• process.env.TIMEOUT - Custom timeout values
• process.env.BROWSER - Browser configuration

EXAMPLE ENVIRONMENT VARIABLE USAGE:
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const apiUrl = process.env.API_URL || 'http://localhost:8000/api';  
const username = process.env.USERNAME || 'testuser';
const password = process.env.PASSWORD || 'testpass';
const timeout = parseInt(process.env.TIMEOUT) || 30000;

NAVIGATION EXAMPLE:
await page.goto(baseUrl);
await page.goto(\`\${baseUrl}/login\`);

API TESTING EXAMPLE:
const response = await request.get(\`\${apiUrl}/users\`);

LOGIN EXAMPLE:
await page.fill('[data-testid="username"]', username);
await page.fill('[data-testid="password"]', password);

TIMEOUT EXAMPLE:
await page.waitForSelector('.result', { timeout });

${testType === 'api' ? `
API TESTING REQUIREMENTS:
- Use process.env.API_URL as base URL for all API calls
- Include authentication using process.env.USERNAME and process.env.PASSWORD
- Test different HTTP methods (GET, POST, PUT, DELETE)
- Validate response status codes and data structure
- Include error handling for different response codes

EXAMPLE API TEST STRUCTURE:
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
require('../support/allure-setup'); // Import dynamic Allure setup

test.describe('API Tests', () => {
  const apiUrl = process.env.API_URL || 'http://localhost:8000/api';
  const username = process.env.USERNAME || 'testuser';
  const password = process.env.PASSWORD || 'testpass';

  test('should perform API operations', async ({ request }) => {
    await allure.step('API Authentication', async () => {
      const response = await request.post(\`\${apiUrl}/auth/login\`, {
        data: { username, password }
      });
      expect(response.status()).toBe(200);
    });
  });
});
` : `
UI TESTING REQUIREMENTS:
- Use process.env.BASE_URL for page navigation
- Use process.env.USERNAME and process.env.PASSWORD for login flows
- Include wait strategies with process.env.TIMEOUT
- Test user interactions and form submissions
- Validate page elements and content

EXAMPLE UI TEST STRUCTURE:
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
require('../support/allure-setup'); // Import dynamic Allure setup
const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

test.describe('UI Tests', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const username = process.env.USERNAME || 'testuser';  
  const password = process.env.PASSWORD || 'testpass';
  const timeout = parseInt(process.env.TIMEOUT) || 30000;

  test('should perform UI operations', async ({ browser }) => {
    const context = await AntiDetection.createStealthContext(browser);
    const page = await context.newPage();
    const selfHealing = new SelfHealingLocators(page);

    await allure.step('Navigate to application', async () => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Perform login', async () => {
      await page.fill('[data-testid="username"]', username);
      await page.fill('[data-testid="password"]', password);
      await page.click('[data-testid="login-button"]');
    });
  });
});
`}

SELF-HEALING LOCATORS INTEGRATION:
==================================

Always use SelfHealingLocators for robust element finding:

const { SelfHealingLocators } = require('../support/selfHealingLocators');
const { AntiDetection } = require('../support/antiDetection');

Usage in tests:
const selfHealing = new SelfHealingLocators(page);
const searchInput = await selfHealing.findSearchInput();
const loginButton = await selfHealing.findByText('Login');

ANTI-DETECTION INTEGRATION:
===========================

For sites with bot detection, always use:

const context = await AntiDetection.createStealthContext(browser);
const page = await context.newPage();

await AntiDetection.navigateWithDetection(page, baseUrl);
await AntiDetection.humanLikeDelay(1000, 3000);

RECOMMENDED USAGE FOR "I AM NOT A ROBOT" ISSUES:
Always use the stealth context for sites with bot detection:
const context = await AntiDetection.createStealthContext(browser);
const page = await context.newPage();
const selfHealing = new SelfHealingLocators(page);

await AntiDetection.navigateWithDetection(page, baseUrl);
await selfHealing.handleCommonOverlays(); // Handle cookies
await AntiDetection.humanLikeDelay(2000, 4000); // Wait before interaction

// Use self-healing selectors with human-like behavior
const searchInput = await selfHealing.findSearchInput();
await AntiDetection.humanLikeFill(searchInput, 'search query');

OUTPUT FORMAT - CRITICAL INSTRUCTIONS:
===================================

1. Generate ONLY pure JavaScript test code
2. ALWAYS use environment variables for dynamic configuration
3. Include const declarations for environment variables at test level
4. DO NOT use markdown formatting (NO code blocks)
5. DO NOT wrap in JSON structure
6. DO NOT include "clarificationNeeded", "testContent", or metadata fields
7. Return raw JavaScript code ready to save as .spec.js file
8. NO explanatory text or documentation
9. NO markdown code blocks
10. NO template literals with explanations

EXAMPLE STRUCTURE (NO markdown blocks):
- Start with: // Tags: smoke, regression
- Include: const { test, expect } = require('@playwright/test');
- Include: const { allure } = require('allure-playwright');
- Include: require('../support/allure-setup'); // Import dynamic Allure setup
- Include: const { SelfHealingLocators } = require('../support/selfHealingLocators');
- Include: const { AntiDetection } = require('../support/antiDetection');
- Include: Environment variable declarations with fallbacks
- Use: test.describe() and test() functions
- End with proper JavaScript structure

ABSOLUTELY FORBIDDEN:
- markdown code blocks
- Explanatory text after code
- JSON wrapping
- Template literals with documentation
- Any non-JavaScript content
- Hardcoded URLs, usernames, or passwords (use env vars!)

REMEMBER: Generate tests that are environment-aware and use runtime variables!`;
  }

  buildUserPrompt(prompt, testType, additionalContext) {
    let userPrompt = `Please generate a ${testType.toUpperCase()} test based on this prompt: "${prompt}"`;

    if (additionalContext.baseUrl) {
      userPrompt += `\nBase URL: ${additionalContext.baseUrl}`;
    }

    if (additionalContext.authRequired) {
      userPrompt += `\nAuthentication required: ${additionalContext.authRequired}`;
    }

    if (additionalContext.existingSelectors) {
      userPrompt += `\nExisting selectors to use: ${JSON.stringify(additionalContext.existingSelectors)}`;
    }

    if (additionalContext.additionalInfo) {
      userPrompt += `\nAdditional context: ${additionalContext.additionalInfo}`;
    }

    return userPrompt;
  }

  parseResponse(response, testType) {
    try {
      // The LLM now returns raw JavaScript code, not JSON
      // Extract test name from the first comment or describe block
      let testName = 'Generated Test';
      let tags = ['generated'];
      
      // Try to extract test name from test.describe
      const describeMatch = response.match(/test\.describe\(['"`]([^'"`]+)['"`]/);
      if (describeMatch) {
        testName = describeMatch[1];
      }
      
      // Try to extract tags from comment
      const tagsMatch = response.match(/\/\/\s*Tags:\s*([^\n]+)/);
      if (tagsMatch) {
        tags = tagsMatch[1].split(',').map(tag => tag.trim());
      }
      
      // Clean up the response - remove any potential JSON wrapping if it exists
      let cleanCode = response;
      
      // AGGRESSIVE MARKDOWN REMOVAL
      // Remove markdown code blocks (``` blocks)
      cleanCode = cleanCode.replace(/```[\w]*\s*\n?/g, '');
      cleanCode = cleanCode.replace(/```\s*$/g, '');
      cleanCode = cleanCode.replace(/```/g, '');
      
      // Remove any text that appears after the last closing brace of a test block
      const lastCloseBraceIndex = cleanCode.lastIndexOf('});');
      if (lastCloseBraceIndex !== -1) {
        // Keep everything up to and including the last });
        cleanCode = cleanCode.substring(0, lastCloseBraceIndex + 3);
      }
      
      // Remove any explanatory text blocks that don't start with valid JS
      const lines = cleanCode.split('\n');
      const validLines = [];
      let inTestBlock = false;
      
      for (let line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines or lines that start with explanatory text patterns
        if (trimmedLine === '' || 
            trimmedLine.startsWith('This test implementation') ||
            trimmedLine.startsWith('The test uses') ||
            trimmedLine.startsWith('The selectors') ||
            /^\d+\./.test(trimmedLine) || // Numbered lists
            trimmedLine.startsWith('-') && !trimmedLine.includes('//')) { // Bullet points (but keep comments)
          continue;
        }
        
        // Keep lines that look like valid JavaScript
        if (trimmedLine.startsWith('//') || // Comments
            trimmedLine.startsWith('const') || // Variable declarations
            trimmedLine.startsWith('test.') || // Test functions
            trimmedLine.startsWith('await') || // Await statements
            trimmedLine.startsWith('expect') || // Assertions
            trimmedLine.includes('{') || trimmedLine.includes('}') || // Braces
            trimmedLine.includes(';') || // Semicolons
            inTestBlock) { // Inside a test block
          
          validLines.push(line);
          
          // Track if we're inside a test block
          if (trimmedLine.includes('test.describe') || trimmedLine.includes('test(')) {
            inTestBlock = true;
          }
        }
      }
      
      cleanCode = validLines.join('\n');
      
      // If there's still JSON structure, try to extract testContent
      if (cleanCode.includes('"testContent"')) {
        try {
          const jsonMatch = cleanCode.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.testContent) {
              cleanCode = parsed.testContent;
              testName = parsed.testName || testName;
              tags = parsed.tags || tags;
            }
          }
        } catch (e) {
          // If JSON parsing fails, use the cleaned code
        }
      }
      
      // Final cleanup - ensure proper formatting
      cleanCode = cleanCode.trim();
      
      return {
        clarificationNeeded: false,
        questions: [],
        testContent: cleanCode,
        testType,
        testName,
        tags,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // If anything fails, treat the entire response as test content
      return {
        clarificationNeeded: false,
        questions: [],
        testContent: response,
        testType,
        testName: 'Generated Test',
        tags: ['generated'],
        timestamp: new Date().toISOString(),
        rawResponse: response
      };
    }
  }

  async validateApiKey() {
    try {
      switch (this.provider) {
        case 'openai':
          if (!this.openai) return { valid: false, error: 'OpenAI client not initialized' };
          await this.openai.models.list();
          return { valid: true };
        case 'claude':
          if (!this.anthropic) {
            console.error('❌ Anthropic client not initialized');
            return { valid: false, error: 'Anthropic client not initialized' };
          }
          console.log('🔄 Testing Claude API key...');
          // Claude doesn't have a simple validation endpoint, so we'll try a minimal request
          await this.anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          });
          console.log('✅ Claude API key validation successful');
          return { valid: true };
        case 'local':
          const response = await axios.get(`${this.localLLMUrl}/api/tags`);
          return { valid: response.status === 200 };
        default:
          return { valid: false, error: 'Unknown provider' };
      }
    } catch (error) {
      const errorDetails = {
        provider: this.provider,
        message: error.message,
        status: error.status,
        type: error.type,
        code: error.code
      };
      console.error('❌ API key validation failed:', errorDetails);
      return { valid: false, error: errorDetails };
    }
  }
}

module.exports = new LLMService(); 