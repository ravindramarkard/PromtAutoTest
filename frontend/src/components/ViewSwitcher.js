import React from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Paper,
  Typography,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ViewList,
  ViewModule,
  ViewQuilt,
  Fullscreen,
  FullscreenExit,
  MoreVert,
  SplitScreen,
  ViewSidebar,
  ViewColumn,
  Dashboard,
  Code,
  Visibility,
  Settings
} from '@mui/icons-material';

const ViewSwitcher = ({ 
  viewMode, 
  onViewModeChange, 
  isFullscreen = false, 
  onToggleFullscreen,
  showAdvanced = true 
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [advancedMenuOpen, setAdvancedMenuOpen] = React.useState(false);

  const handleAdvancedMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    setAdvancedMenuOpen(true);
  };

  const handleAdvancedMenuClose = () => {
    setAnchorEl(null);
    setAdvancedMenuOpen(false);
  };

  const viewModes = [
    {
      value: 'explorer',
      icon: <ViewList />,
      label: 'Explorer Only',
      description: 'Show only the file tree',
      shortcut: 'Ctrl+Shift+E'
    },
    {
      value: 'split',
      icon: <ViewModule />,
      label: 'Split View',
      description: 'Explorer and viewer side by side',
      shortcut: 'Ctrl+\\'
    },
    {
      value: 'viewer',
      icon: <Code />,
      label: 'Editor Only',
      description: 'Show only the file editor',
      shortcut: 'Ctrl+Shift+F'
    },
    {
      value: 'grid',
      icon: <ViewQuilt />,
      label: 'Grid View',
      description: 'Multiple files in grid layout',
      shortcut: 'Ctrl+Shift+G'
    }
  ];

  const advancedViews = [
    {
      value: 'zen',
      icon: <Fullscreen />,
      label: 'Zen Mode',
      description: 'Distraction-free editing'
    },
    {
      value: 'preview',
      icon: <Visibility />,
      label: 'Preview Mode',
      description: 'Read-only file preview'
    },
    {
      value: 'compare',
      icon: <SplitScreen />,
      label: 'Compare Files',
      description: 'Side-by-side file comparison'
    }
  ];

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      onViewModeChange(newView);
    }
  };

  const handleAdvancedViewSelect = (viewType) => {
    onViewModeChange(viewType);
    handleAdvancedMenuClose();
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1, 
        gap: 1,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Main View Toggle */}
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewChange}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            },
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }
        }}
      >
        {viewModes.slice(0, 3).map((mode) => (
          <ToggleButton key={mode.value} value={mode.value}>
            <Tooltip 
              title={
                <Box>
                  <Typography variant="subtitle2">{mode.label}</Typography>
                  <Typography variant="caption" color="inherit">
                    {mode.description}
                  </Typography>
                  <Typography variant="caption" color="inherit" sx={{ display: 'block', mt: 0.5 }}>
                    {mode.shortcut}
                  </Typography>
                </Box>
              }
              placement="bottom"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {mode.icon}
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {mode.label.split(' ')[0]}
                </Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      {/* Fullscreen Toggle */}
      <Tooltip title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}>
        <IconButton 
          size="small" 
          onClick={onToggleFullscreen}
          color={isFullscreen ? 'primary' : 'default'}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Tooltip>

      {/* Advanced Views Menu */}
      {showAdvanced && (
        <>
          <Tooltip title="More View Options">
            <IconButton 
              size="small" 
              onClick={handleAdvancedMenuClick}
              color={advancedMenuOpen ? 'primary' : 'default'}
            >
              <MoreVert />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={advancedMenuOpen}
            onClose={handleAdvancedMenuClose}
            PaperProps={{
              sx: { minWidth: 220 }
            }}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2" color="text.secondary">
                Advanced Views
              </Typography>
            </MenuItem>
            <Divider />
            
            {advancedViews.map((view) => (
              <MenuItem 
                key={view.value}
                onClick={() => handleAdvancedViewSelect(view.value)}
                selected={viewMode === view.value}
              >
                <ListItemIcon>
                  {view.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={view.label}
                  secondary={view.description}
                />
              </MenuItem>
            ))}
            
            <Divider />
            
            <MenuItem onClick={() => handleAdvancedViewSelect('grid')}>
              <ListItemIcon>
                <ViewQuilt />
              </ListItemIcon>
              <ListItemText 
                primary="Grid View"
                secondary="Multiple files in grid"
              />
            </MenuItem>
            
            <MenuItem onClick={handleAdvancedMenuClose}>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText 
                primary="View Settings"
                secondary="Customize layout options"
              />
            </MenuItem>
          </Menu>
        </>
      )}

      {/* Current View Indicator */}
      <Box sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
        <Typography variant="caption" color="text.secondary">
          {viewModes.find(mode => mode.value === viewMode)?.label || 'Custom View'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ViewSwitcher;