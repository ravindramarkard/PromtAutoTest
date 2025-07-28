import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  FileCopy,
  Download,
  PlayArrow,
  BugReport,
  Visibility,
  Code,
  Description,
  Settings,
  JavaScript,
  Close
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const FileViewer = ({ file, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Get file language for syntax highlighting
  const getLanguage = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'xml':
        return 'xml';
      case 'yml':
      case 'yaml':
        return 'yaml';
      case 'sql':
        return 'sql';
      case 'sh':
        return 'bash';
      default:
        return 'text';
    }
  };

  // Get file icon
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return <JavaScript color="warning" />;
      case 'json':
        return <Code color="info" />;
      case 'md':
        return <Description color="primary" />;
      case 'env':
        return <Settings color="success" />;
      default:
        return <Description />;
    }
  };

  // Fetch file content
  const fetchFileContent = async () => {
    if (!file) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/files/content?path=${encodeURIComponent(file.path)}`);
      if (response.ok) {
        const data = await response.text();
        setContent(data);
        setEditContent(data);
      } else {
        // Fallback to mock content
        setContent(getMockFileContent(file));
        setEditContent(getMockFileContent(file));
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setContent(getMockFileContent(file));
      setEditContent(getMockFileContent(file));
    } finally {
      setLoading(false);
    }
  };

  // Mock file content for demonstration
  const getMockFileContent = (file) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes('app.js')) {
      return `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Prompts from './pages/Prompts';
import Tests from './pages/Tests';
import Results from './pages/Results';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;`;
    }
    
    if (fileName.includes('server.js')) {
      return `const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const promptRoutes = require('./routes/prompts');
const testRoutes = require('./routes/tests');
const generationRoutes = require('./routes/generation');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/prompts', promptRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/generation', generationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});`;
    }
    
    if (fileName.includes('package.json')) {
      return `{
  "name": "auto-test-playwright-llm",
  "version": "1.0.0",
  "description": "AI-powered Playwright test automation",
  "main": "index.js",
  "scripts": {
    "start": "node backend/src/server.js",
    "dev": "concurrently \\"npm run backend:dev\\" \\"npm run frontend:dev\\"",
    "test": "playwright test",
    "test:headed": "playwright test --headed"
  },
  "dependencies": {
    "express": "^4.18.0",
    "playwright": "^1.40.0",
    "openai": "^4.0.0",
    "react": "^18.2.0"
  }
}`;
    }
    
    if (fileName.includes('.feature')) {
      return `Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  Background:
    Given I am on the login page

  Scenario: Successful login with valid credentials
    When I enter valid username "testuser@example.com"
    And I enter valid password "password123"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  Scenario: Failed login with invalid credentials
    When I enter invalid username "wrong@example.com"
    And I enter invalid password "wrongpass"
    And I click the login button
    Then I should see an error message
    And I should remain on the login page`;
    }
    
    if (fileName.includes('readme.md')) {
      return `# AutoTest LLM - AI-Powered Test Automation

## 🚀 Features

- **AI Test Generation**: Generate Playwright tests from natural language
- **Multiple LLM Support**: OpenAI, Claude, or local models
- **BDD Format**: Gherkin feature files with step definitions
- **Beautiful Reports**: Allure and Playwright HTML reports
- **React Dashboard**: Modern web interface

## 🛠️ Installation

\`\`\`bash
npm install
npm run install:all
npx playwright install
\`\`\`

## 🎯 Usage

1. Start the application:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Open http://localhost:4001
3. Create prompts and generate tests
4. Run tests and view results

## 📊 Architecture

- **Backend**: Node.js + Express
- **Frontend**: React + Material-UI  
- **Testing**: Playwright + Cucumber
- **AI**: OpenAI/Claude integration`;
    }
    
    return `// File: ${file.name}
// Path: ${file.path}
// This is a sample file content for demonstration.

console.log('Hello from ${file.name}!');

// TODO: Implement actual file content loading
// This would typically fetch the real file content from the backend`;
  };

  // Save file content
  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: file.path,
          content: editContent
        })
      });
      
      if (response.ok) {
        setContent(editContent);
        setEditMode(false);
        onSave?.(file, editContent);
      } else {
        setError('Failed to save file');
      }
    } catch (error) {
      setError('Error saving file: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Copy content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  // Download file
  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Run file (if it's a test)
  const runFile = async () => {
    if (file.name.includes('.test.') || file.name.includes('.spec.')) {
      try {
        const response = await fetch('/api/tests/run-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: file.path })
        });
        
        if (response.ok) {
          // Handle test execution result
          console.log('Test executed successfully');
        }
      } catch (error) {
        console.error('Error running test:', error);
      }
    }
  };

  useEffect(() => {
    if (file) {
      fetchFileContent();
      setEditMode(false);
      setActiveTab(0);
    }
  }, [file]);

  if (!file) {
    return (
      <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Select a file to view its content
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getFileIcon(file.name)}
            <Typography variant="h6">{file.name}</Typography>
            <Chip label={file.size} size="small" variant="outlined" />
            {file.path.includes('/tests/') && (
              <Chip label="Test File" size="small" color="primary" />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!editMode && (
              <>
                <Tooltip title="Copy Content">
                  <IconButton size="small" onClick={copyToClipboard}>
                    <FileCopy />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Download">
                  <IconButton size="small" onClick={downloadFile}>
                    <Download />
                  </IconButton>
                </Tooltip>
                
                {(file.name.includes('.test.') || file.name.includes('.spec.')) && (
                  <Tooltip title="Run Test">
                    <IconButton size="small" onClick={runFile} color="primary">
                      <PlayArrow />
                    </IconButton>
                  </Tooltip>
                )}
                
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setEditMode(true)} color="primary">
                    <Edit />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            {editMode && (
              <>
                <Button
                  size="small"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                  variant="contained"
                >
                  Save
                </Button>
                
                <Button
                  size="small"
                  onClick={() => {
                    setEditMode(false);
                    setEditContent(content);
                  }}
                  startIcon={<Cancel />}
                >
                  Cancel
                </Button>
              </>
            )}
            
            <Tooltip title="Close">
              <IconButton size="small" onClick={onClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* File path */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {file.path}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Content" icon={<Code />} />
          <Tab label="Preview" icon={<Visibility />} />
          {file.name.includes('.test.') && <Tab label="Test Info" icon={<BugReport />} />}
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Content Tab */}
            {activeTab === 0 && (
              <Box sx={{ height: '100%' }}>
                {editMode ? (
                  <TextField
                    multiline
                    fullWidth
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        height: '100%',
                        alignItems: 'flex-start'
                      }
                    }}
                  />
                ) : (
                  <SyntaxHighlighter
                    language={getLanguage(file.name)}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      height: '100%',
                      fontSize: '14px'
                    }}
                    showLineNumbers
                    wrapLines
                  >
                    {content}
                  </SyntaxHighlighter>
                )}
              </Box>
            )}
            
            {/* Preview Tab */}
            {activeTab === 1 && (
              <Box sx={{ p: 2 }}>
                {file.name.endsWith('.md') ? (
                  <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
                ) : file.name.endsWith('.json') ? (
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {JSON.stringify(JSON.parse(content || '{}'), null, 2)}
                  </pre>
                ) : (
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {content}
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Test Info Tab */}
            {activeTab === 2 && file.name.includes('.test.') && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Test File Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">File Details:</Typography>
                  <Typography variant="body2">Name: {file.name}</Typography>
                  <Typography variant="body2">Size: {file.size}</Typography>
                  <Typography variant="body2">Type: Test File</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">Quick Actions:</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<PlayArrow />} onClick={runFile}>
                      Run Test
                    </Button>
                    <Button size="small" startIcon={<BugReport />}>
                      Debug
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default FileViewer;