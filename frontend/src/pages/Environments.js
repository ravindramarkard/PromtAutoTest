import {
    Add,
    CheckCircle,
    Delete,
    Edit,
    Error,
    Settings,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Environments = () => {
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [envDialogOpen, setEnvDialogOpen] = useState(false);
  const [testingJiraConnection, setTestingJiraConnection] = useState(false);
  const [showJiraPassword, setShowJiraPassword] = useState(false);
  
  const [envForm, setEnvForm] = useState({
    name: '',
    key: '',
    variables: {
      BASE_URL: '',
      API_URL: '',
      USERNAME: '',
      PASSWORD: '',
      TIMEOUT: '30000',
      BROWSER: 'chromium'
    },
    jira: {
      enabled: false,
      serverUrl: '',
      username: '',
      apiToken: '',
      projectKey: '',
      issueType: 'Bug',
      assignee: '',
      priority: 'Medium',
      labels: ['automation']
    },
    isEditing: false,
    originalKey: ''
  });

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const fetchEnvironments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/suites/environments');
      setEnvironments(response.data);
    } catch (error) {
      toast.error('Failed to load environments');
      console.error('Error fetching environments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnvironment = async () => {
    try {
      await axios.post('/api/suites/environments', envForm);
      toast.success(`Environment "${envForm.name}" created successfully`);
      handleCloseEnvDialog();
      fetchEnvironments();
    } catch (error) {
      toast.error('Failed to create environment');
    }
  };

  const handleEditEnvironment = async (key) => {
    try {
      const response = await axios.get(`/api/suites/environments/${key}`);
      setEnvForm({
        name: response.data.name,
        key: response.data.key,
        variables: response.data.variables,
        jira: response.data.jira || {
          enabled: false,
          serverUrl: '',
          username: '',
          apiToken: '',
          projectKey: '',
          issueType: 'Bug',
          assignee: '',
          priority: 'Medium',
          labels: ['automation']
        },
        isEditing: true,
        originalKey: response.data.key
      });
      setEnvDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load environment details');
    }
  };

  const handleUpdateEnvironment = async () => {
    try {
      await axios.put(`/api/suites/environments/${envForm.key}`, envForm);
      toast.success(`Environment "${envForm.name}" updated successfully`);
      handleCloseEnvDialog();
      fetchEnvironments();
    } catch (error) {
      toast.error('Failed to update environment');
    }
  };

  const handleDeleteEnvironment = async (key, name) => {
    if (window.confirm(`Are you sure you want to delete environment "${name}"?`)) {
      try {
        await axios.delete(`/api/suites/environments/${key}`);
        toast.success(`Environment "${name}" deleted successfully`);
        fetchEnvironments();
      } catch (error) {
        toast.error(`Failed to delete environment: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const handleCloseEnvDialog = () => {
    setEnvDialogOpen(false);
    setEnvForm({
      name: '',
      key: '',
      variables: {
        BASE_URL: '',
        API_URL: '',
        USERNAME: '',
        PASSWORD: '',
        TIMEOUT: '30000',
        BROWSER: 'chromium'
      },
      jira: {
        enabled: false,
        serverUrl: '',
        username: '',
        apiToken: '',
        projectKey: '',
        issueType: 'Bug',
        assignee: '',
        priority: 'Medium',
        labels: ['automation']
      },
      isEditing: false,
      originalKey: ''
    });
  };

  const handleTestJiraConnection = async () => {
    if (!envForm.jira.enabled) {
      toast.error('Jira integration is not enabled');
      return;
    }

    if (!envForm.jira.serverUrl || !envForm.jira.username || !envForm.jira.apiToken) {
      toast.error('Please fill in all required Jira fields');
      return;
    }

    try {
      setTestingJiraConnection(true);
      const response = await axios.post('/api/jira/test-connection', {
        jiraConfig: envForm.jira
      });

      if (response.data.success) {
        toast.success(`✅ ${response.data.message}`);
      } else {
        toast.error(`❌ ${response.data.message}`);
      }
    } catch (error) {
      toast.error(`Failed to test Jira connection: ${error.response?.data?.error || error.message}`);
    } finally {
      setTestingJiraConnection(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          🌍 Environment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setEnvDialogOpen(true)}
          color="primary"
        >
          New Environment
        </Button>
      </Box>

      <Grid container spacing={3}>
        {environments.map((env) => (
          <Grid item xs={12} md={6} lg={4} key={env.key}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>{env.name}</Typography>
                    <Box display="flex" gap={1} mb={1}>
                      <Chip label={env.key} size="small" color="primary" />
                      {env.jira?.enabled ? (
                        <Chip 
                          label="Jira Enabled" 
                          size="small" 
                          color="success" 
                          icon={<CheckCircle />}
                        />
                      ) : (
                        <Chip 
                          label="Jira Disabled" 
                          size="small" 
                          color="default" 
                          icon={<Error />}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditEnvironment(env.key)}
                      color="info"
                      title="Edit Environment"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteEnvironment(env.key, env.name)}
                      color="error"
                      title="Delete Environment"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Environment Variables:
                </Typography>
                <Box mb={2}>
                  {Object.entries(env.variables || {}).map(([key, value]) => (
                    <Box key={key} display="flex" justifyContent="space-between" py={0.5}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                        {key}:
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          maxWidth: '60%', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          textAlign: 'right'
                        }}
                      >
                        {key.toLowerCase().includes('password') ? '••••••' : value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {env.jira?.enabled && (
                  <>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Jira Integration:
                    </Typography>
                    <Box>
                      <Box display="flex" justifyContent="space-between" py={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                          Server:
                        </Typography>
                        <Typography variant="caption" sx={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {env.jira?.serverUrl || 'Not configured'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" py={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                          Project:
                        </Typography>
                        <Typography variant="caption">
                          {env.jira?.projectKey || 'Not set'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" py={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                          Priority:
                        </Typography>
                        <Typography variant="caption">
                          {env.jira?.priority || 'Medium'}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        {environments.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Settings sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No environments configured
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                Create your first environment to define URL endpoints, credentials, and configuration variables for your tests.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setEnvDialogOpen(true)}
                size="large"
              >
                Create First Environment
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Environment Dialog */}
      <Dialog open={envDialogOpen} onClose={handleCloseEnvDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {envForm.isEditing ? 'Edit Environment' : 'Create New Environment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Environment Name"
                value={envForm.name}
                onChange={(e) => setEnvForm({...envForm, name: e.target.value})}
                placeholder="e.g., Development, Staging, Production"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Environment Key"
                value={envForm.key}
                onChange={(e) => setEnvForm({...envForm, key: e.target.value})}
                disabled={envForm.isEditing}
                helperText={envForm.isEditing ? "Key cannot be changed when editing" : "Unique identifier (e.g., dev, staging, prod)"}
                placeholder="e.g., dev, staging, prod"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Environment Variables
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Configure the variables that will be used by tests in this environment
              </Typography>
            </Grid>
            {Object.entries(envForm.variables).map(([key, value]) => (
              <Grid item xs={12} md={6} key={key}>
                <TextField
                  fullWidth
                  label={key}
                  value={value}
                  type={key.toLowerCase().includes('password') ? 'password' : 'text'}
                  onChange={(e) => setEnvForm({
                    ...envForm,
                    variables: { ...envForm.variables, [key]: e.target.value }
                  })}
                  placeholder={
                    key === 'BASE_URL' ? 'https://app.example.com' :
                    key === 'API_URL' ? 'https://api.example.com' :
                    key === 'USERNAME' ? 'testuser' :
                    key === 'PASSWORD' ? 'password123' :
                    key === 'TIMEOUT' ? '30000' :
                    key === 'BROWSER' ? 'chromium' : ''
                  }
                />
              </Grid>
            ))}
            
            {/* Jira Integration Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Jira Integration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure Jira settings for automatic ticket creation on test failures
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={envForm.jira.enabled}
                      onChange={(e) => setEnvForm({
                        ...envForm,
                        jira: { ...envForm.jira, enabled: e.target.checked }
                      })}
                    />
                  }
                  label="Enable Jira"
                />
              </Box>
            </Grid>

            {envForm.jira.enabled && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Jira Server URL"
                    value={envForm.jira.serverUrl}
                    onChange={(e) => setEnvForm({
                      ...envForm,
                      jira: { ...envForm.jira, serverUrl: e.target.value }
                    })}
                    placeholder="https://yourcompany.atlassian.net"
                    helperText="Your Jira cloud or server URL"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username/Email"
                    value={envForm.jira.username}
                    onChange={(e) => setEnvForm({
                      ...envForm,
                      jira: { ...envForm.jira, username: e.target.value }
                    })}
                    placeholder="your-email@company.com"
                    helperText="Your Jira account email"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="API Token"
                    type={showJiraPassword ? 'text' : 'password'}
                    value={envForm.jira.apiToken}
                    onChange={(e) => setEnvForm({
                      ...envForm,
                      jira: { ...envForm.jira, apiToken: e.target.value }
                    })}
                    placeholder="Your Jira API token"
                    helperText="Generate from Jira Account Settings > Security > API tokens"
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowJiraPassword(!showJiraPassword)}
                          edge="end"
                        >
                          {showJiraPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project Key"
                    value={envForm.jira.projectKey}
                    onChange={(e) => setEnvForm({
                      ...envForm,
                      jira: { ...envForm.jira, projectKey: e.target.value }
                    })}
                    placeholder="PROJ"
                    helperText="Jira project key for creating tickets"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Issue Type</InputLabel>
                    <Select
                      value={envForm.jira.issueType}
                      onChange={(e) => setEnvForm({
                        ...envForm,
                        jira: { ...envForm.jira, issueType: e.target.value }
                      })}
                      label="Issue Type"
                    >
                      <MenuItem value="Bug">Bug</MenuItem>
                      <MenuItem value="Task">Task</MenuItem>
                      <MenuItem value="Story">Story</MenuItem>
                      <MenuItem value="Test">Test</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={envForm.jira.priority}
                      onChange={(e) => setEnvForm({
                        ...envForm,
                        jira: { ...envForm.jira, priority: e.target.value }
                      })}
                      label="Priority"
                    >
                      <MenuItem value="Critical">Critical</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Assignee (optional)"
                    value={envForm.jira.assignee}
                    onChange={(e) => setEnvForm({
                      ...envForm,
                      jira: { ...envForm.jira, assignee: e.target.value }
                    })}
                    placeholder="username or email"
                    helperText="Default assignee for created tickets"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Labels (comma separated)"
                    value={Array.isArray(envForm.jira.labels) ? envForm.jira.labels.join(', ') : envForm.jira.labels}
                    onChange={(e) => setEnvForm({
                      ...envForm,
                      jira: { 
                        ...envForm.jira, 
                        labels: e.target.value.split(',').map(label => label.trim()).filter(Boolean)
                      }
                    })}
                    placeholder="automation, test-failure, urgent"
                    helperText="Labels to add to created tickets"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={handleTestJiraConnection}
                      disabled={testingJiraConnection}
                      startIcon={testingJiraConnection ? <CircularProgress size={16} /> : <CheckCircle />}
                    >
                      {testingJiraConnection ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnvDialog}>Cancel</Button>
          <Button 
            onClick={envForm.isEditing ? handleUpdateEnvironment : handleCreateEnvironment} 
            variant="contained"
            startIcon={envForm.isEditing ? <Edit /> : <Add />}
          >
            {envForm.isEditing ? 'Update Environment' : 'Create Environment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Environments; 