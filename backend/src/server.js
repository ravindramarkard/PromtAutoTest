require('dotenv').config({ path: '/Users/ravindramarkard/Downloads/promptAutoTest/environment.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure required directories exist
const requiredDirs = [
  '../prompts',
  '../tests/features',
  '../tests/step-definitions',
  '../tests/support',
  '../tests/api',
  '../test-results',
  '../allure-results'
];

requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  fs.ensureDirSync(fullPath);
});

// Routes
app.use('/api/prompts', require('./routes/prompts'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/generate', require('./routes/generation'));
app.use('/api/suites', require('./routes/testSuites'));
app.use('/api/jira', require('./routes/jira'));
app.use('/api/files', require('./routes/files'));

// Serve static files from test-results and allure directories for viewing reports

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    llmProvider: process.env.LLM_PROVIDER || 'openai'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🤖 LLM Provider: ${process.env.LLM_PROVIDER || 'openai'}`);
  console.log(`📝 Prompts directory: ${path.join(__dirname, '../prompts')}`);
  console.log(`🧪 Tests directory: ${path.join(__dirname, '../tests')}`);
});