import {
    AppBar,
    Box,
    Button,
    Container,
    CssBaseline,
    ThemeProvider,
    Toolbar,
    Typography,
    createTheme
} from '@mui/material';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Import pages
import Environments from './pages/Environments';
import Prompts from './pages/Prompts';
import Results from './pages/Results';
import TestSuites from './pages/TestSuites';
import Explorer from './pages/Explorer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🤖 Auto-Test LLM Platform
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                color="inherit" 
                component={Link} 
                to="/"
              >
                📝 Prompts
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/suites"
              >
                🧪 Test Suites
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/results"
              >
                📊 Results
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/explorer"
              >
                📁 Explorer
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/environments"
              >
                🌍 Environments
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 2 }}>
          <Routes>
            <Route path="/" element={<Prompts />} />
            <Route path="/suites" element={<TestSuites />} />
            <Route path="/results" element={<Results />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/environments" element={<Environments />} />
          </Routes>
        </Container>

        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;