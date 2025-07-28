import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Fade,
  Slide,
  Collapse
} from '@mui/material';
import {
  Home,
  NavigateNext,
  Refresh,
  Search,
  FilterList,
  Settings,
  FolderOpen,
  Close
} from '@mui/icons-material';
import FileExplorer from './FileExplorer';
import FileViewer from './FileViewer';
import ViewSwitcher from './ViewSwitcher';

const ExplorerLayout = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '\\':
            event.preventDefault();
            setViewMode('split');
            break;
          case 'e':
            if (event.shiftKey) {
              event.preventDefault();
              setViewMode('explorer');
            }
            break;
          case 'f':
            if (event.shiftKey) {
              event.preventDefault();
              setViewMode('viewer');
            }
            break;
          case 'g':
            if (event.shiftKey) {
              event.preventDefault();
              setViewMode('grid');
            }
            break;
        }
      }
      
      if (event.key === 'F11') {
        event.preventDefault();
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    
    // Add to open files if not already open
    if (!openFiles.find(f => f.path === file.path)) {
      const newOpenFiles = [...openFiles, file];
      setOpenFiles(newOpenFiles);
      setActiveFileIndex(newOpenFiles.length - 1);
    } else {
      // Switch to existing file
      const index = openFiles.findIndex(f => f.path === file.path);
      setActiveFileIndex(index);
    }
  };

  const handleFileClose = (fileToClose) => {
    if (fileToClose) {
      const newOpenFiles = openFiles.filter(f => f.path !== fileToClose.path);
      setOpenFiles(newOpenFiles);
      
      if (newOpenFiles.length === 0) {
        setSelectedFile(null);
        setActiveFileIndex(0);
      } else {
        const newIndex = Math.min(activeFileIndex, newOpenFiles.length - 1);
        setActiveFileIndex(newIndex);
        setSelectedFile(newOpenFiles[newIndex]);
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileSave = (file, content) => {
    console.log('File saved:', file.path, content.length, 'characters');
    // Add toast notification or update file status
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    
    // Handle special view modes
    switch (newMode) {
      case 'zen':
        setIsFullscreen(true);
        setViewMode('viewer');
        break;
      case 'preview':
        setViewMode('viewer');
        break;
      case 'compare':
        // TODO: Implement compare mode
        setViewMode('split');
        break;
      default:
        break;
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const getBreadcrumbs = () => {
    if (!selectedFile) return [];
    
    const pathParts = selectedFile.path.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Root', path: '/' }];
    
    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += '/' + part;
      if (index < pathParts.length - 1) {
        breadcrumbs.push({ name: part, path: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  const renderFileExplorer = () => (
    <FileExplorer
      key={refreshKey}
      onFileSelect={handleFileSelect}
      currentFile={selectedFile}
      onRefresh={handleRefresh}
    />
  );

  const renderFileViewer = () => (
    <FileViewer
      file={selectedFile}
      onClose={handleFileClose}
      onSave={handleFileSave}
    />
  );

  const renderOpenFileTabs = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, overflow: 'auto' }}>
      {openFiles.map((file, index) => (
        <Chip
          key={file.path}
          label={file.name}
          size="small"
          variant={index === activeFileIndex ? 'filled' : 'outlined'}
          color={index === activeFileIndex ? 'primary' : 'default'}
          onClick={() => {
            setActiveFileIndex(index);
            setSelectedFile(file);
          }}
          onDelete={() => handleFileClose(file)}
          deleteIcon={<Close fontSize="small" />}
          sx={{ 
            maxWidth: 150,
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}
        />
      ))}
    </Box>
  );

  const renderGridView = () => (
    <Grid container spacing={2} sx={{ height: '100%' }}>
      <Grid item xs={3}>
        <Paper sx={{ height: '100%', p: 1 }}>
          {renderFileExplorer()}
        </Paper>
      </Grid>
      <Grid item xs={9}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {openFiles.length > 0 && renderOpenFileTabs()}
          <Paper sx={{ flex: 1, p: 1 }}>
            {selectedFile ? renderFileViewer() : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a file to view
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );

  return (
    <Box 
      sx={{ 
        height: isFullscreen ? '100vh' : 'calc(100vh - 120px)', 
        display: 'flex', 
        flexDirection: 'column',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        backgroundColor: 'background.default'
      }}
    >
      {/* Header */}
      <Collapse in={!isFullscreen || viewMode !== 'viewer'}>
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FolderOpen color="primary" />
              File Explorer
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <ViewSwitcher
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
              />
              
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Search Files">
                <IconButton>
                  <Search />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Filter">
                <IconButton>
                  <FilterList />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Settings">
                <IconButton>
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Breadcrumbs */}
          {selectedFile && (
            <Fade in={Boolean(selectedFile)}>
              <Box sx={{ mb: 1 }}>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                  <Link
                    underline="hover"
                    color="inherit"
                    href="#"
                    onClick={() => setSelectedFile(null)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <Home fontSize="small" />
                    Root
                  </Link>
                  {getBreadcrumbs().slice(1).map((crumb, index) => (
                    <Link
                      key={index}
                      underline="hover"
                      color="inherit"
                      href="#"
                    >
                      {crumb.name}
                    </Link>
                  ))}
                  <Typography color="text.primary" sx={{ fontWeight: 'bold' }}>
                    {selectedFile.name}
                  </Typography>
                </Breadcrumbs>
              </Box>
            </Fade>
          )}

          {/* Status Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`View: ${viewMode}`} 
              size="small" 
              variant="outlined" 
            />
            {selectedFile && (
              <>
                <Chip 
                  label={`File: ${selectedFile.name}`} 
                  size="small" 
                  color="primary" 
                />
                <Chip 
                  label={`Size: ${selectedFile.size || 'Unknown'}`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Type: ${selectedFile.type}`} 
                  size="small" 
                  variant="outlined" 
                />
              </>
            )}
            {openFiles.length > 0 && (
              <Chip 
                label={`Open Files: ${openFiles.length}`} 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            )}
          </Box>
        </Paper>
      </Collapse>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Box sx={{ height: '100%' }}>
            {viewMode === 'explorer' && renderFileExplorer()}

            {viewMode === 'split' && (
              <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item xs={4}>
                  {renderFileExplorer()}
                </Grid>
                <Grid item xs={8}>
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {openFiles.length > 0 && renderOpenFileTabs()}
                    <Box sx={{ flex: 1 }}>
                      {renderFileViewer()}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}

            {viewMode === 'viewer' && selectedFile && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {openFiles.length > 0 && !isFullscreen && renderOpenFileTabs()}
                <Box sx={{ flex: 1 }}>
                  {renderFileViewer()}
                </Box>
              </Box>
            )}

            {viewMode === 'grid' && renderGridView()}
          </Box>
        </Slide>
      </Box>

      {/* Welcome Message */}
      {!selectedFile && viewMode === 'split' && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}>
          <Fade in={!selectedFile}>
            <Alert severity="info" sx={{ maxWidth: 400 }}>
              <Typography variant="h6" gutterBottom>
                Welcome to File Explorer
              </Typography>
              <Typography variant="body2" paragraph>
                Select a file from the explorer to view its content here.
              </Typography>
              <Typography variant="body2">
                <strong>Keyboard Shortcuts:</strong>
                <br />• Ctrl+\ - Split View
                <br />• Ctrl+Shift+E - Explorer Only
                <br />• Ctrl+Shift+F - Editor Only
                <br />• F11 - Toggle Fullscreen
              </Typography>
            </Alert>
          </Fade>
        </Box>
      )}
    </Box>
  );
};

export default ExplorerLayout;