import {
    Add,
    Assessment,
    BugReport,
    Description,
    PlayArrow
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [llmStatus, setLlmStatus] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple data sources in parallel
      const [promptStatsRes, testsRes, llmStatusRes] = await Promise.all([
        axios.get('/api/prompts/stats/overview'),
        axios.get('/api/tests'),
        axios.get('/api/generate/validate-llm'),
      ]);

      setStats(promptStatsRes.data);
      setTests(testsRes.data.slice(0, 5)); // Show latest 5 tests
      setLlmStatus(llmStatusRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAllTests = async () => {
    try {
      toast.loading('Running all tests...');
      await axios.post('/api/tests/run/all');
      toast.dismiss();
      toast.success('Tests started successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to run tests');
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
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* LLM Status Alert */}
      {llmStatus && (
        <Alert 
          severity={llmStatus.valid ? 'success' : 'warning'} 
          sx={{ mb: 3 }}
          action={
            !llmStatus.valid && (
              <Button color="inherit" size="small" onClick={() => navigate('/settings')}>
                Configure
              </Button>
            )
          }
        >
          {llmStatus.valid 
            ? `LLM Provider (${llmStatus.provider}) is configured and ready`
            : `LLM Provider (${llmStatus.provider}) needs configuration`
          }
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Description color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Prompts</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total prompts created
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BugReport color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Tests</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {tests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generated test files
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">UI Tests</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats?.byTestType?.ui || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                UI test prompts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">API Tests</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats?.byTestType?.api || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                API test prompts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/prompts')}
                >
                  Create Prompt
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  onClick={handleRunAllTests}
                  disabled={tests.length === 0}
                >
                  Run All Tests
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  onClick={() => navigate('/results')}
                >
                  View Results
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent prompts: {stats?.recentCount || 0}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
                  <Chip
                    key={status}
                    label={`${status}: ${count}`}
                    size="small"
                    color={status === 'active' ? 'success' : 'default'}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Tests */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Tests
          </Typography>
          {tests.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No tests generated yet. Create a prompt to get started.
            </Typography>
          ) : (
            <Box>
              {tests.map((test) => (
                <Box
                  key={test.testId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {test.testName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(test.timestamp).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={test.testType.toUpperCase()}
                      size="small"
                      color={test.testType === 'ui' ? 'primary' : 'secondary'}
                    />
                    <Button
                      size="small"
                      onClick={() => navigate('/tests')}
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard; 