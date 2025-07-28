const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PromptManager {
  constructor() {
    this.promptsDir = path.join(__dirname, '../../prompts');
    fs.ensureDirSync(this.promptsDir);
  }

  async savePrompt(promptData) {
    const promptId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const prompt = {
      id: promptId,
      title: promptData.title || 'Untitled Prompt',
      description: promptData.description || '',
      content: promptData.content,
      testType: promptData.testType || 'ui',
      tags: promptData.tags || [],
      additionalContext: promptData.additionalContext || {},
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'active'
    };

    const fileName = `${promptId}.json`;
    const filePath = path.join(this.promptsDir, fileName);
    
    await fs.writeJson(filePath, prompt, { spaces: 2 });
    
    return prompt;
  }

  async getPrompt(promptId) {
    const filePath = path.join(this.promptsDir, `${promptId}.json`);
    
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath);
    }
    
    return null;
  }

  async getAllPrompts() {
    const files = await fs.readdir(this.promptsDir);
    const prompts = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const promptPath = path.join(this.promptsDir, file);
          const prompt = await fs.readJson(promptPath);
          prompts.push(prompt);
        } catch (error) {
          console.error(`Error reading prompt file ${file}:`, error);
        }
      }
    }

    return prompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updatePrompt(promptId, updates) {
    const prompt = await this.getPrompt(promptId);
    
    if (!prompt) {
      throw new Error('Prompt not found');
    }

    const updatedPrompt = {
      ...prompt,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const filePath = path.join(this.promptsDir, `${promptId}.json`);
    await fs.writeJson(filePath, updatedPrompt, { spaces: 2 });
    
    return updatedPrompt;
  }

  async deletePrompt(promptId) {
    const filePath = path.join(this.promptsDir, `${promptId}.json`);
    
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      return true;
    }
    
    return false;
  }

  async searchPrompts(query, filters = {}) {
    const allPrompts = await this.getAllPrompts();
    
    let filteredPrompts = allPrompts;

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchTerm) ||
        prompt.description.toLowerCase().includes(searchTerm) ||
        prompt.content.toLowerCase().includes(searchTerm) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by test type
    if (filters.testType) {
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.testType === filters.testType
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filteredPrompts = filteredPrompts.filter(prompt =>
        filters.tags.some(tag => prompt.tags.includes(tag))
      );
    }

    // Filter by status
    if (filters.status) {
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.status === filters.status
      );
    }

    return filteredPrompts;
  }

  async getPromptsByTestType(testType) {
    const allPrompts = await this.getAllPrompts();
    return allPrompts.filter(prompt => prompt.testType === testType);
  }

  async duplicatePrompt(promptId) {
    const originalPrompt = await this.getPrompt(promptId);
    
    if (!originalPrompt) {
      throw new Error('Prompt not found');
    }

    const duplicatedPrompt = {
      ...originalPrompt,
      title: `${originalPrompt.title} (Copy)`,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const fileName = `${duplicatedPrompt.id}.json`;
    const filePath = path.join(this.promptsDir, fileName);
    
    await fs.writeJson(filePath, duplicatedPrompt, { spaces: 2 });
    
    return duplicatedPrompt;
  }

  async getPromptStats() {
    const allPrompts = await this.getAllPrompts();
    
    const stats = {
      total: allPrompts.length,
      byTestType: {},
      byStatus: {},
      recentCount: 0
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    allPrompts.forEach(prompt => {
      // Count by test type
      stats.byTestType[prompt.testType] = (stats.byTestType[prompt.testType] || 0) + 1;
      
      // Count by status
      stats.byStatus[prompt.status] = (stats.byStatus[prompt.status] || 0) + 1;
      
      // Count recent prompts
      if (new Date(prompt.createdAt) > oneWeekAgo) {
        stats.recentCount++;
      }
    });

    return stats;
  }

  async exportPrompts() {
    const allPrompts = await this.getAllPrompts();
    return {
      exportDate: new Date().toISOString(),
      totalPrompts: allPrompts.length,
      prompts: allPrompts
    };
  }

  async importPrompts(importData) {
    const imported = [];
    const errors = [];

    for (const promptData of importData.prompts) {
      try {
        // Generate new ID to avoid conflicts
        const newPrompt = {
          ...promptData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const fileName = `${newPrompt.id}.json`;
        const filePath = path.join(this.promptsDir, fileName);
        
        await fs.writeJson(filePath, newPrompt, { spaces: 2 });
        imported.push(newPrompt);
      } catch (error) {
        errors.push({
          prompt: promptData.title || 'Unknown',
          error: error.message
        });
      }
    }

    return {
      imported: imported.length,
      errors,
      importedPrompts: imported
    };
  }
}

module.exports = new PromptManager(); 