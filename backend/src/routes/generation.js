const express = require('express');
const router = express.Router();
const llmService = require('../services/llmService');
const testGenerator = require('../services/testGenerator');
const promptManager = require('../services/promptManager');

// Generate test from prompt
router.post('/from-prompt', async (req, res) => {
  try {
    const { 
      promptId, 
      promptContent, 
      testType = 'ui', 
      additionalContext = {} 
    } = req.body;

    if (!promptId && !promptContent) {
      return res.status(400).json({ 
        error: 'Either promptId or promptContent is required' 
      });
    }

    let prompt;
    let content;

    if (promptId) {
      prompt = await promptManager.getPrompt(promptId);
      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }
      content = prompt.content;
    } else {
      content = promptContent;
    }

    // Generate test using LLM
    const llmResponse = await llmService.generateTestFromPrompt(
      content, 
      testType, 
      additionalContext
    );

    // Check if LLM needs clarification
    if (llmResponse.clarificationNeeded) {
      return res.json({
        clarificationNeeded: true,
        questions: llmResponse.questions,
        timestamp: llmResponse.timestamp
      });
    }

    // Generate test files
    const testResult = await testGenerator.generateTestFiles(
      llmResponse, 
      promptId || 'ad-hoc'
    );

    res.json({
      success: true,
      test: testResult,
      llmResponse,
      clarificationNeeded: false
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Test generation failed', 
      details: error.message 
    });
  }
});

// Generate test with clarifications
router.post('/from-prompt/clarified', async (req, res) => {
  try {
    const { 
      promptId, 
      promptContent, 
      testType = 'ui', 
      additionalContext = {},
      clarifications = {}
    } = req.body;

    if (!promptId && !promptContent) {
      return res.status(400).json({ 
        error: 'Either promptId or promptContent is required' 
      });
    }

    let prompt;
    let content;

    if (promptId) {
      prompt = await promptManager.getPrompt(promptId);
      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }
      content = prompt.content;
    } else {
      content = promptContent;
    }

    // Build enhanced context with clarifications
    const enhancedContext = {
      ...additionalContext,
      clarifications
    };

    // Generate test using LLM with clarifications
    const llmResponse = await llmService.generateTestFromPrompt(
      content, 
      testType, 
      enhancedContext
    );

    // Generate test files
    const testResult = await testGenerator.generateTestFiles(
      llmResponse, 
      promptId || 'ad-hoc'
    );

    res.json({
      success: true,
      test: testResult,
      llmResponse
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Test generation failed', 
      details: error.message 
    });
  }
});

// Bulk generate tests from multiple prompts
router.post('/bulk', async (req, res) => {
  try {
    const { promptIds, testType = 'ui', additionalContext = {} } = req.body;

    if (!promptIds || !Array.isArray(promptIds) || promptIds.length === 0) {
      return res.status(400).json({ error: 'promptIds array is required' });
    }

    const results = [];
    const errors = [];

    for (const promptId of promptIds) {
      try {
        const prompt = await promptManager.getPrompt(promptId);
        if (!prompt) {
          errors.push({ promptId, error: 'Prompt not found' });
          continue;
        }

        const llmResponse = await llmService.generateTestFromPrompt(
          prompt.content,
          testType,
          additionalContext
        );

        if (llmResponse.clarificationNeeded) {
          errors.push({ 
            promptId, 
            error: 'Clarification needed', 
            questions: llmResponse.questions 
          });
          continue;
        }

        const testResult = await testGenerator.generateTestFiles(
          llmResponse,
          promptId
        );

        results.push({
          promptId,
          test: testResult,
          llmResponse
        });

      } catch (error) {
        errors.push({ promptId, error: error.message });
      }
    }

    res.json({
      success: true,
      generated: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Bulk generation failed', 
      details: error.message 
    });
  }
});

// Validate LLM configuration
router.get('/validate-llm', async (req, res) => {
  try {
    const validationResult = await llmService.validateApiKey();
    res.json({
      valid: validationResult.valid,
      provider: llmService.provider,
      hasClient: {
        openai: !!llmService.openai,
        anthropic: !!llmService.anthropic,
        localUrl: llmService.localLLMUrl
      },
      apiKeys: {
        openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
        anthropic: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_claude_api_key_here'
      },
      error: validationResult.error || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Validation failed', 
      details: error.message,
      provider: llmService.provider,
      hasClient: {
        openai: !!llmService.openai,
        anthropic: !!llmService.anthropic
      }
    });
  }
});

// Get available LLM providers
router.get('/providers', async (req, res) => {
  try {
    const providers = [
      {
        name: 'openai',
        displayName: 'OpenAI (GPT-4)',
        configured: !!process.env.OPENAI_API_KEY,
        models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo']
      },
      {
        name: 'claude',
        displayName: 'Anthropic Claude',
        configured: !!process.env.ANTHROPIC_API_KEY,
        models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-5-haiku-20241022']
      },
      {
        name: 'local',
        displayName: 'Local LLM (Ollama)',
        configured: !!process.env.LOCAL_LLM_URL,
        models: ['llama2', 'codellama', 'mistral']
      }
    ];

    res.json({
      providers,
      current: process.env.LLM_PROVIDER || 'openai'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get providers', 
      details: error.message 
    });
  }
});

// Regenerate test from existing test
router.post('/regenerate/:testId', async (req, res) => {
  try {
    const { additionalContext = {}, modifications = {} } = req.body;
    const tests = await testGenerator.getGeneratedTests();
    const existingTest = tests.find(t => t.testId === req.params.testId);
    
    if (!existingTest) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Get original prompt
    let prompt;
    if (existingTest.promptId !== 'ad-hoc') {
      prompt = await promptManager.getPrompt(existingTest.promptId);
    }

    let content = prompt ? prompt.content : 'Regenerate test based on existing test structure';
    
    // Add modifications to context
    const enhancedContext = {
      ...additionalContext,
      modifications,
      regenerateFrom: existingTest.testId
    };

    // Generate new test
    const llmResponse = await llmService.generateTestFromPrompt(
      content,
      existingTest.testType,
      enhancedContext
    );

    // Generate test files
    const testResult = await testGenerator.generateTestFiles(
      llmResponse,
      existingTest.promptId
    );

    res.json({
      success: true,
      test: testResult,
      llmResponse,
      originalTest: existingTest.testId
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Regeneration failed', 
      details: error.message 
    });
  }
});

module.exports = router; 