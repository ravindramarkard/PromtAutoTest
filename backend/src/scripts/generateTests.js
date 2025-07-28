#!/usr/bin/env node

/**
 * CLI Script for batch test generation from prompts
 * Usage: node backend/src/scripts/generateTests.js [options]
 */

require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const promptManager = require('../services/promptManager');
const llmService = require('../services/llmService');
const testGenerator = require('../services/testGenerator');

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
  help: args.includes('--help') || args.includes('-h'),
  all: args.includes('--all'),
  testType: getArgValue('--type') || getArgValue('-t'),
  promptId: getArgValue('--prompt') || getArgValue('-p'),
  output: getArgValue('--output') || getArgValue('-o'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

function getArgValue(flag) {
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}

function showHelp() {
  console.log(`
AutoTest LLM - Test Generation CLI

Usage: node generateTests.js [options]

Options:
  -h, --help              Show this help message
  -a, --all               Generate tests for all prompts
  -t, --type <type>       Filter prompts by type (ui|api)
  -p, --prompt <id>       Generate test for specific prompt ID
  -o, --output <dir>      Output directory for generated tests
  -v, --verbose           Verbose output

Examples:
  node generateTests.js --all                     # Generate all tests
  node generateTests.js --type ui                 # Generate all UI tests
  node generateTests.js --prompt abc-123          # Generate specific test
  node generateTests.js --all --verbose           # Generate with detailed output
  
Environment Variables:
  LLM_PROVIDER            LLM provider (openai|claude|local)
  OPENAI_API_KEY         OpenAI API key
  ANTHROPIC_API_KEY      Anthropic API key
  LOCAL_LLM_URL          Local LLM URL
`);
}

async function main() {
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log('🤖 AutoTest LLM - Batch Test Generation');
  console.log('==========================================');
  
  try {
    // Validate LLM configuration
    const isValid = await llmService.validateApiKey();
    if (!isValid) {
      console.error('❌ LLM configuration is invalid. Please check your API keys.');
      process.exit(1);
    }
    
    if (options.verbose) {
      console.log(`✅ LLM Provider: ${llmService.provider}`);
    }

    let prompts = [];

    // Get prompts based on options
    if (options.promptId) {
      const prompt = await promptManager.getPrompt(options.promptId);
      if (!prompt) {
        console.error(`❌ Prompt with ID '${options.promptId}' not found.`);
        process.exit(1);
      }
      prompts = [prompt];
    } else if (options.all) {
      prompts = await promptManager.getAllPrompts();
      if (options.testType) {
        prompts = prompts.filter(p => p.testType === options.testType);
      }
    } else {
      console.error('❌ Please specify --all, --prompt <id>, or use --help for usage information.');
      process.exit(1);
    }

    if (prompts.length === 0) {
      console.log('📝 No prompts found matching the criteria.');
      process.exit(0);
    }

    console.log(`📋 Found ${prompts.length} prompt(s) to process`);
    
    // Process each prompt
    const results = [];
    const errors = [];

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      const progress = `[${i + 1}/${prompts.length}]`;
      
      try {
        console.log(`${progress} Processing: ${prompt.title}`);
        
        if (options.verbose) {
          console.log(`  Type: ${prompt.testType}`);
          console.log(`  Description: ${prompt.description}`);
        }

        // Generate test using LLM
        const llmResponse = await llmService.generateTestFromPrompt(
          prompt.content,
          prompt.testType,
          prompt.additionalContext
        );

        // Check for clarification needed
        if (llmResponse.clarificationNeeded) {
          console.log(`⚠️  ${progress} Clarification needed for: ${prompt.title}`);
          console.log(`   Questions: ${llmResponse.questions.join(', ')}`);
          errors.push({
            prompt: prompt.title,
            error: 'Clarification needed',
            questions: llmResponse.questions
          });
          continue;
        }

        // Generate test files
        const testResult = await testGenerator.generateTestFiles(
          llmResponse,
          prompt.id
        );

        console.log(`✅ ${progress} Generated: ${testResult.testName}`);
        
        if (options.verbose) {
          console.log(`   Test ID: ${testResult.testId}`);
          console.log(`   Files: ${testResult.files.map(f => f.name).join(', ')}`);
        }

        results.push({
          prompt: prompt.title,
          testId: testResult.testId,
          testName: testResult.testName,
          files: testResult.files.length
        });

      } catch (error) {
        console.error(`❌ ${progress} Failed: ${prompt.title} - ${error.message}`);
        errors.push({
          prompt: prompt.title,
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n📊 Generation Summary');
    console.log('====================');
    console.log(`✅ Successfully generated: ${results.length}`);
    console.log(`❌ Failed: ${errors.length}`);

    if (results.length > 0) {
      console.log('\n🎉 Successfully Generated Tests:');
      results.forEach(result => {
        console.log(`  • ${result.testName} (${result.files} files)`);
      });
    }

    if (errors.length > 0) {
      console.log('\n⚠️  Failed Tests:');
      errors.forEach(error => {
        console.log(`  • ${error.prompt}: ${error.error}`);
        if (error.questions) {
          console.log(`    Questions: ${error.questions.join(', ')}`);
        }
      });
    }

    console.log(`\n📁 Tests generated in: ${path.join(__dirname, '../../tests')}`);
    console.log('🚀 You can now run tests with: npm test');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { main }; 