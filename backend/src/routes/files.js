const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Get file tree structure
router.get('/tree', async (req, res) => {
  try {
    const projectRoot = path.join(__dirname, '../../../');
    const fileTree = await buildFileTree(projectRoot, 'promptAutoTest');
    res.json(fileTree);
  } catch (error) {
    console.error('Error building file tree:', error);
    res.status(500).json({ error: 'Failed to build file tree' });
  }
});

// Get file content
router.get('/content', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const projectRoot = path.join(__dirname, '../../../');
    const fullPath = path.join(projectRoot, filePath);
    
    // Security check - ensure file is within project directory
    if (!fullPath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const content = await fs.readFile(fullPath, 'utf8');
    res.send(content);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

// Save file content
router.post('/save', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'File path and content are required' });
    }

    const projectRoot = path.join(__dirname, '../../../');
    const fullPath = path.join(projectRoot, filePath);
    
    // Security check - ensure file is within project directory
    if (!fullPath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await fs.writeFile(fullPath, content, 'utf8');
    res.json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// Create new file or directory
router.post('/create', async (req, res) => {
  try {
    const { name, type, parent } = req.body;
    if (!name || !type || !parent) {
      return res.status(400).json({ error: 'Name, type, and parent are required' });
    }

    const projectRoot = path.join(__dirname, '../../../');
    const parentPath = path.join(projectRoot, parent);
    const newPath = path.join(parentPath, name);
    
    // Security check
    if (!newPath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (type === 'directory') {
      await fs.mkdir(newPath, { recursive: true });
    } else {
      await fs.writeFile(newPath, '', 'utf8');
    }

    res.json({ success: true, message: `${type} created successfully` });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Delete file or directory
router.delete('/delete', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const projectRoot = path.join(__dirname, '../../../');
    const fullPath = path.join(projectRoot, filePath);
    
    // Security check
    if (!fullPath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      await fs.rmdir(fullPath, { recursive: true });
    } else {
      await fs.unlink(fullPath);
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Helper function to build file tree
async function buildFileTree(dirPath, name = path.basename(dirPath)) {
  const stats = await fs.stat(dirPath);
  
  if (stats.isFile()) {
    return {
      name,
      type: 'file',
      path: path.relative(path.join(__dirname, '../../../'), dirPath).replace(/\\/g, '/'),
      size: formatFileSize(stats.size)
    };
  }

  if (stats.isDirectory()) {
    const children = [];
    try {
      const items = await fs.readdir(dirPath);
      
      // Filter out common directories/files we don't want to show
      const filteredItems = items.filter(item => 
        !item.startsWith('.') || 
        ['.env', '.gitignore'].includes(item)
      ).filter(item => 
        !['node_modules', '.git', 'dist', 'build'].includes(item)
      );

      for (const item of filteredItems) {
        const itemPath = path.join(dirPath, item);
        try {
          const child = await buildFileTree(itemPath, item);
          children.push(child);
        } catch (error) {
          // Skip items we can't read
          console.warn(`Skipping ${itemPath}:`, error.message);
        }
      }
    } catch (error) {
      console.warn(`Cannot read directory ${dirPath}:`, error.message);
    }

    // Sort children: directories first, then files, both alphabetically
    children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      name,
      type: 'directory',
      path: path.relative(path.join(__dirname, '../../../'), dirPath).replace(/\\/g, '/'),
      children
    };
  }
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

module.exports = router;