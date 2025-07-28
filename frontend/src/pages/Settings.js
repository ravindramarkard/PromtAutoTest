import {
    CheckCircle,
    Error,
    Refresh,
    Save,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [providers, setProviders] = useState([]);
  const [currentProvider, setCurrentProvider] = useState('openai');
  const [validationStatus, setValidationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    llmProvider: 'openai',
    openaiApiKey: '',
    anthropicApiKey: '',
    localLlmUrl: '',
    testTimeout: '30000',
    maxRetries: '3',
    parallelWorkers: '4',
    headlessMode: true,
    allureReporting: true,
  });

  useEffect(() => {
    fetchProviders();
    fetchCurrentSettings();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('/api/generate/providers');
      setProviders(response.data.providers);
      setCurrentProvider(response.data.current);
      setSettings(prev => ({ ...prev, llmProvider: response.data.current }));
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchCurrentSettings = async () => {
    try {
      // Load from environment or localStorage
      const savedSettings = localStorage.getItem('autotest-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleValidateLLM = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/generate/validate-llm');
      setValidationStatus(response.data);
      
      if (response.data.valid) {
        toast.success('LLM configuration is valid');
      } else {
        toast.error('LLM configuration is invalid');
      }
    } catch (error) {
      toast.error('Failed to validate LLM configuration');
      setValidationStatus({ valid: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Save to localStorage (in a real app, you'd save to backend)
      localStorage.setItem('autotest-settings', JSON.stringify(settings));
      
      // Update environment variables would require backend restart
      toast.success('Settings saved successfully');
      toast('Note: API key changes require server restart', { icon: 'ℹ️' });
      
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      {/* LLM Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            LLM Configuration
          </Typography>
          
          {validationStatus && (
            <Alert 
              severity={validationStatus.valid ? 'success' : 'error'}
              sx={{ mb: 2 }}
              icon={validationStatus.valid ? <CheckCircle /> : <Error />}
            >
              {validationStatus.valid 
                ? `LLM Provider (${validationStatus.provider}) is configured correctly`
                : 'LLM configuration needs attention'
              }
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>LLM Provider</InputLabel>
                <Select
                  value={settings.llmProvider}
                  label="LLM Provider"
                  onChange={(e) => handleSettingChange('llmProvider', e.target.value)}
                >
                  {providers.map((provider) => (
                    <MenuItem key={provider.name} value={provider.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {provider.displayName}
                        <Chip
                          label={provider.configured ? 'Configured' : 'Not Configured'}
                          size="small"
                          color={provider.configured ? 'success' : 'error'}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {settings.llmProvider === 'openai' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="OpenAI API Key"
                  type="password"
                  value={settings.openaiApiKey}
                  onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                  placeholder="sk-..."
                  helperText="Get your API key from https://platform.openai.com/api-keys"
                />
              </Grid>
            )}

            {settings.llmProvider === 'claude' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Anthropic API Key"
                  type="password"
                  value={settings.anthropicApiKey}
                  onChange={(e) => handleSettingChange('anthropicApiKey', e.target.value)}
                  placeholder="sk-ant-..."
                  helperText="Get your API key from https://console.anthropic.com/"
                />
              </Grid>
            )}

            {settings.llmProvider === 'local' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Local LLM URL"
                  value={settings.localLlmUrl}
                  onChange={(e) => handleSettingChange('localLlmUrl', e.target.value)}
                  placeholder="http://localhost:11434"
                  helperText="URL for your local LLM instance (e.g., Ollama)"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleValidateLLM}
                  disabled={loading}
                >
                  Validate Configuration
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                >
                  Save LLM Settings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Test Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Configuration
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Test Timeout (ms)"
                type="number"
                value={settings.testTimeout}
                onChange={(e) => handleSettingChange('testTimeout', e.target.value)}
                helperText="Default timeout for test execution"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Retries"
                type="number"
                value={settings.maxRetries}
                onChange={(e) => handleSettingChange('maxRetries', e.target.value)}
                helperText="Number of retries for failed tests"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parallel Workers"
                type="number"
                value={settings.parallelWorkers}
                onChange={(e) => handleSettingChange('parallelWorkers', e.target.value)}
                helperText="Number of parallel test workers"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.headlessMode}
                    onChange={(e) => handleSettingChange('headlessMode', e.target.checked)}
                  />
                }
                label="Run tests in headless mode"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allureReporting}
                    onChange={(e) => handleSettingChange('allureReporting', e.target.checked)}
                  />
                }
                label="Enable Allure reporting"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Current LLM Provider:</strong> {currentProvider}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Version:</strong> 1.0.0
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Available Providers:</strong>
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {providers.map((provider) => (
                  <Chip
                    key={provider.name}
                    label={provider.displayName}
                    size="small"
                    color={provider.configured ? 'success' : 'default'}
                    variant={provider.configured ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save All Settings */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={handleSaveSettings}
        >
          Save All Settings
        </Button>
      </Box>
    </Container>
  );
};

export default Settings; 