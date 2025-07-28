import {
    Dashboard as DashboardIcon,
    PlayArrow as PlayIcon,
    Description as PromptsIcon,
    Assessment as ResultsIcon,
    Settings as SettingsIcon,
    BugReport as TestsIcon,
} from '@mui/icons-material';
import {
    AppBar,
    Box,
    Button,
    Toolbar,
    Tooltip,
    Typography
} from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/prompts', label: 'Prompts', icon: <PromptsIcon /> },
    { path: '/tests', label: 'Tests', icon: <TestsIcon /> },
    { path: '/results', label: 'Results', icon: <ResultsIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <PlayIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            AutoTest LLM
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {menuItems.map((item) => (
            <Tooltip key={item.path} title={item.label}>
              <Button
                color="inherit"
                startIcon={item.icon}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  minWidth: 'auto',
                  px: 2,
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {item.label}
                </Box>
              </Button>
            </Tooltip>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 