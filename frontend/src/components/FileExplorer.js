import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip,
  Divider,
  Paper,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Folder,
  FolderOpen,
  InsertDriveFile,
  JavaScript,
  Code,
  Description,
  Settings,
  BugReport,
  PlayArrow,
  Refresh,
  Add,
  Delete,
  Edit,
  FileCopy,
  Visibility
} from '@mui/icons-material';

const FileExplorer = ({ onFileSelect, currentFile, onRefresh }) => {
  const [fileTree, setFileTree] = useState({});
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [createDialog, setCreateDialog] = useState({ open: false, type: '', parent: '' });
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');

  // File type icons mapping
  const getFileIcon = (fileName, isDirectory) => {
    if (isDirectory) {
      return expandedFolders.has(fileName) ? <FolderOpen /> : <Folder />;
    }
    
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
      case 'config':
        return <Settings color="secondary" />;
      case 'test':
        return <BugReport color="error" />;
      default:
        return <InsertDriveFile />;
    }
  };

  // Mock file tree for demonstration
  const getMockFileTree = () => ({
    name: 'promptAutoTest',
    type: 'directory',
    path: '/',
    children: [
      {
        name: 'backend',
        type: 'directory',
        path: '/backend',
        children: [
          {
            name: 'src',
            type: 'directory',
            path: '/backend/src',
            children: [
              { name: 'server.js', type: 'file', path: '/backend/src/server.js', size: '2.1 KB' },
              {
                name: 'routes',
                type: 'directory',
                path: '/backend/src/routes',
                children: [
                  { name: 'prompts.js', type: 'file', path: '/backend/src/routes/prompts.js', size: '1.8 KB' },
                  { name: 'tests.js', type: 'file', path: '/backend/src/routes/tests.js', size: '2.3 KB' },
                  { name: 'generation.js', type: 'file', path: '/backend/src/routes/generation.js', size: '1.5 KB' },
                  { name: 'files.js', type: 'file', path: '/backend/src/routes/files.js', size: '2.8 KB' }
                ]
              },
              {
                name: 'services',
                type: 'directory',
                path: '/backend/src/services',
                children: [
                  { name: 'llmService.js', type: 'file', path: '/backend/src/services/llmService.js', size: '3.2 KB' },
                  { name: 'testGenerator.js', type: 'file', path: '/backend/src/services/testGenerator.js', size: '4.1 KB' },
                  { name: 'promptManager.js', type: 'file', path: '/backend/src/services/promptManager.js', size: '2.7 KB' }
                ]
              }
            ]
          },
          { name: 'package.json', type: 'file', path: '/backend/package.json', size: '1.2 KB' }
        ]
      },
      {
        name: 'frontend',
        type: 'directory',
        path: '/frontend',
        children: [
          {
            name: 'src',
            type: 'directory',
            path: '/frontend/src',
            children: [
              { name: 'App.js', type: 'file', path: '/frontend/src/App.js', size: '2.8 KB' },
              {
                name: 'components',
                type: 'directory',
                path: '/frontend/src/components',
                children: [
                  { name: 'Navbar.js', type: 'file', path: '/frontend/src/components/Navbar.js', size: '1.4 KB' },
                  { name: 'FileExplorer.js', type: 'file', path: '/frontend/src/components/FileExplorer.js', size: '8.2 KB', current: true },
                  { name: 'FileViewer.js', type: 'file', path: '/frontend/src/components/FileViewer.js', size: '6.5 KB' },
                  { name: 'ViewSwitcher.js', type: 'file', path: '/frontend/src/components/ViewSwitcher.js', size: '4.1 KB' },
                  { name: 'ExplorerLayout.js', type: 'file', path: '/frontend/src/components/ExplorerLayout.js', size: '7.8 KB' }
                ]
              },
              {
                name: 'pages',
                type: 'directory',
                path: '/frontend/src/pages',
                children: [
                  { name: 'Dashboard.js', type: 'file', path: '/frontend/src/pages/Dashboard.js', size: '3.1 KB' },
                  { name: 'Prompts.js', type: 'file', path: '/frontend/src/pages/Prompts.js', size: '4.5 KB' },
                  { name: 'Results.js', type: 'file', path: '/frontend/src/pages/Results.js', size: '2.9 KB' },
                  { name: 'Tests.js', type: 'file', path: '/frontend/src/pages/Tests.js', size: '3.7 KB' },
                  { name: 'Explorer.js', type: 'file', path: '/frontend/src/pages/Explorer.js', size: '0.2 KB' }
                ]
              }
            ]
          },
          { name: 'package.json', type: 'file', path: '/frontend/package.json', size: '1.8 KB' }
        ]
      },
      {
        name: 'tests',
        type: 'directory',
        path: '/tests',
        children: [
          {
            name: 'features',
            type: 'directory',
            path: '/tests/features',
            children: [
              { name: 'login.feature', type: 'file', path: '/tests/features/login.feature', size: '0.8 KB' },
              { name: 'checkout.feature', type: 'file', path: '/tests/features/checkout.feature', size: '1.2 KB' }
            ]
          },
          {
            name: 'step-definitions',
            type: 'directory',
            path: '/tests/step-definitions',
            children: [
              { name: 'login.steps.js', type: 'file', path: '/tests/step-definitions/login.steps.js', size: '2.1 KB' },
              { name: 'checkout.steps.js', type: 'file', path: '/tests/step-definitions/checkout.steps.js', size: '3.4 KB' }
            ]
          }
        ]
      },
      { name: 'package.json', type: 'file', path: '/package.json', size: '2.3 KB' },
      { name: 'playwright.config.js', type: 'file', path: '/playwright.config.js', size: '1.1 KB' },
      { name: 'README.md', type: 'file', path: '/README.md', size: '12.5 KB' },
      { name: 'README-FileExplorer.md', type: 'file', path: '/README-FileExplorer.md', size: '3.2 KB' },
      { name: 'README-ViewSwitcher.md', type: 'file', path: '/README-ViewSwitcher.md', size: '4.8 KB' },
      { name: 'environment.env', type: 'file', path: '/environment.env', size: '0.5 KB' }
    ]
  });

  // Fetch file tree from backend
  const fetchFileTree = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/files/tree');
      if (response.ok) {
        const data = await response.json();
        setFileTree(data);
      } else {
        // Fallback to mock data if API not available
        setFileTree(getMockFileTree());
      }
    } catch (error) {
      console.error('Error fetching file tree:', error);
      setFileTree(getMockFileTree());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileTree();
  }, []);

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (file) => {
    if (file.type === 'file' && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleContextMenu = (event, item) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
    setSelectedItem(item);
  };

  const closeContextMenu = () => {
    setContextMenu(null);
    setSelectedItem(null);
  };

  const handleCreateItem = (type, parent) => {
    setCreateDialog({ open: true, type, parent });
    closeContextMenu();
  };

  const createNewItem = async () => {
    if (!newItemName.trim()) {
      setError('Name is required');
      return;
    }

    try {
      const response = await fetch('/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          type: createDialog.type,
          parent: createDialog.parent
        })
      });

      if (response.ok) {
        setCreateDialog({ open: false, type: '', parent: '' });
        setNewItemName('');
        setError('');
        fetchFileTree();
      } else {
        setError('Failed to create item');
      }
    } catch (error) {
      setError('Error creating item: ' + error.message);
    }
  };

  const renderTreeItem = (item, level = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const isCurrentFile = currentFile && currentFile.path === item.path;

    return (
      <Box key={item.path}>
        <ListItem
          disablePadding
          sx={{
            pl: level * 2,
            backgroundColor: isCurrentFile ? 'action.selected' : 'transparent',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          <ListItemButton
            onClick={() => {
              if (item.type === 'directory') {
                toggleFolder(item.path);
              } else {
                handleFileClick(item);
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, item)}
            sx={{ py: 0.5 }}
          >
            {item.type === 'directory' && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(item.path);
                }}
                sx={{ mr: 0.5, p: 0.25 }}
              >
                {isExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
              </IconButton>
            )}
            
            <ListItemIcon sx={{ minWidth: 32 }}>
              {getFileIcon(item.name, item.type === 'directory')}
            </ListItemIcon>
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isCurrentFile ? 'bold' : 'normal',
                      color: isCurrentFile ? 'primary.main' : 'inherit'
                    }}
                  >
                    {item.name}
                  </Typography>
                  {item.current && (
                    <Chip label="Current" size="small" color="primary" variant="outlined" />
                  )}
                  {item.size && item.type === 'file' && (
                    <Typography variant="caption" color="text.secondary">
                      {item.size}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>

        {item.type === 'directory' && item.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Paper elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Folder color="primary" />
            Explorer
          </Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => { fetchFileTree(); onRefresh?.(); }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="New File">
              <IconButton size="small" onClick={() => handleCreateItem('file', '/')}>
                <Add />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* File Tree */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Loading file tree...
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {fileTree.children ? 
              fileTree.children.map(item => renderTreeItem(item)) :
              renderTreeItem(fileTree)
            }
          </List>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={closeContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {selectedItem?.type === 'directory' && [
          <MenuItem key="new-file" onClick={() => handleCreateItem('file', selectedItem.path)}>
            <ListItemIcon><InsertDriveFile fontSize="small" /></ListItemIcon>
            New File
          </MenuItem>,
          <MenuItem key="new-folder" onClick={() => handleCreateItem('directory', selectedItem.path)}>
            <ListItemIcon><Folder fontSize="small" /></ListItemIcon>
            New Folder
          </MenuItem>,
          <Divider key="divider1" />
        ]}
        
        <MenuItem onClick={() => { /* Copy path */ closeContextMenu(); }}>
          <ListItemIcon><FileCopy fontSize="small" /></ListItemIcon>
          Copy Path
        </MenuItem>
        
        {selectedItem?.type === 'file' && (
          <MenuItem onClick={() => { /* Open file */ handleFileClick(selectedItem); closeContextMenu(); }}>
            <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
            Open File
          </MenuItem>
        )}
        
        <MenuItem onClick={() => { /* Rename */ closeContextMenu(); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          Rename
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => { /* Delete */ closeContextMenu(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog open={createDialog.open} onClose={() => setCreateDialog({ open: false, type: '', parent: '' })}>
        <DialogTitle>
          Create New {createDialog.type === 'file' ? 'File' : 'Folder'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createNewItem()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog({ open: false, type: '', parent: '' })}>
            Cancel
          </Button>
          <Button onClick={createNewItem} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FileExplorer;