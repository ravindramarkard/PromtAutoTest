const express = require('express');
const router = express.Router();
const promptManager = require('../services/promptManager');

// Get all prompts
router.get('/', async (req, res) => {
  try {
    const { search, testType, tags, status } = req.query;
    
    if (search || testType || tags || status) {
      const filters = {
        testType,
        tags: tags ? tags.split(',') : undefined,
        status
      };
      const prompts = await promptManager.searchPrompts(search, filters);
      res.json(prompts);
    } else {
      const prompts = await promptManager.getAllPrompts();
      res.json(prompts);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get prompt by ID
router.get('/:id', async (req, res) => {
  try {
    const prompt = await promptManager.getPrompt(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new prompt
router.post('/', async (req, res) => {
  try {
    const { title, description, content, testType, tags, additionalContext } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const promptData = {
      title,
      description,
      content,
      testType: testType || 'ui',
      tags: tags || [],
      additionalContext: additionalContext || {}
    };

    const prompt = await promptManager.savePrompt(promptData);
    res.status(201).json(prompt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update prompt
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const prompt = await promptManager.updatePrompt(req.params.id, updates);
    res.json(prompt);
  } catch (error) {
    if (error.message === 'Prompt not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete prompt
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await promptManager.deletePrompt(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate prompt
router.post('/:id/duplicate', async (req, res) => {
  try {
    const duplicatedPrompt = await promptManager.duplicatePrompt(req.params.id);
    res.status(201).json(duplicatedPrompt);
  } catch (error) {
    if (error.message === 'Prompt not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get prompts by test type
router.get('/type/:testType', async (req, res) => {
  try {
    const prompts = await promptManager.getPromptsByTestType(req.params.testType);
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get prompt statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await promptManager.getPromptStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export prompts
router.get('/export/all', async (req, res) => {
  try {
    const exportData = await promptManager.exportPrompts();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=prompts-export.json');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import prompts
router.post('/import', async (req, res) => {
  try {
    const importData = req.body;
    const result = await promptManager.importPrompts(importData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 