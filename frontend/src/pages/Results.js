import {
    Assessment,
    CheckCircle,
    OpenInNew,
    PlayArrow,
    Refresh,
    Visibility
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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Results = () => {
  const [summary, setSummary] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningTest, setRunningTest] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Fetch results summary
      const summaryResponse = await axios.get('/api/tests/results/summary');
      setSummary(summaryResponse.data);

      // Fetch all tests
      const testsResponse = await axios.get('/api/tests');
      setTests(testsResponse.data);
      
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (testId) => {
    try {
      setRunningTest(testId);
      toast.loading(`Running test...`);
      
      const response = await axios.post(`/api/tests/${testId}/run`, {
        browser: 'chromium',
        headed: false
      });
      
      toast.dismiss();
      if (response.data.success) {
        toast.success('Test completed successfully!');
      } else {
        toast.error('Test execution completed with failures');
      }
      
      // Refresh results after running test
      await fetchResults();
      
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to run test: ' + (error.response?.data?.error || error.message));
    } finally {
      setRunningTest(null);
    }
  };

  const runAllTests = async () => {
    try {
      setRunningTest('all');
      toast.loading('Running all tests...');
      
      const response = await axios.post('/api/tests/run-all', {
        browser: 'chromium',
        headed: false
      });
      
      toast.dismiss();
      if (response.data.success) {
        toast.success('All tests completed successfully!');
      } else {
        toast.error('Test execution completed with some failures');
      }
      
      // Refresh results after running tests
      await fetchResults();
      
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to run tests: ' + (error.response?.data?.error || error.message));
    } finally {
      setRunningTest(null);
    }
  };

  const openPlaywrightReport = () => {
    if (summary?.reports?.playwright?.available) {
      window.open('http://localhost:8000/api/tests/reports/playwright', '_blank');
    } else {
      toast.error('Playwright report not available. Run some tests first.');
    }
  };

  const openAllureReport = () => {
    if (summary?.reports?.allure?.available) {
      window.open('http://localhost:8000/api/tests/reports/allure', '_blank');
    } else {
      toast.error('Allure report not available. Generate reports first by running tests.');
    }
  };

  const generateAllureReport = async () => {
    try {
      toast.loading('Generating Allure report...');
      
      await axios.get('/api/tests/allure/generate');
      
      toast.dismiss();
      toast.success('Allure report generated successfully');
      
      // Refresh summary to update report status
      await fetchResults();
      
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate Allure report');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp.replace(/[-]/g, '/').replace('Z', '')).toLocaleString();
  };

  const getTestTypeColor = (type) => {
    return type === 'ui' ? 'primary' : 'secondary';
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
          📊 Test Results & Execution
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchResults}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={runningTest === 'all' ? <CircularProgress size={16} /> : <PlayArrow />}
            onClick={runAllTests}
            disabled={runningTest !== null || tests.length === 0}
            color="success"
          >
            Run All Tests
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Tests</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {summary?.totalTests || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generated tests available
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Visibility color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Playwright Report</Typography>
              </Box>
              <Typography variant="h6" component="div" color={summary?.reports?.playwright?.available ? 'success.main' : 'text.secondary'}>
                {summary?.reports?.playwright?.available ? 'Available' : 'Not Available'}
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={openPlaywrightReport}
                disabled={!summary?.reports?.playwright?.available}
                startIcon={<OpenInNew />}
                sx={{ mt: 1 }}
              >
                View Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Allure Report</Typography>
              </Box>
              <Typography variant="h6" component="div" color={summary?.reports?.allure?.available ? 'success.main' : 'text.secondary'}>
                {summary?.reports?.allure?.available ? 'Available' : 'Not Available'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {summary?.reports?.allure?.available ? (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={openAllureReport}
                    startIcon={<OpenInNew />}
                  >
                    View Report
                  </Button>
                ) : (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={generateAllureReport}
                    startIcon={<Assessment />}
                  >
                    Generate
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Tests</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {summary?.recentTests?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available for execution
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test List */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🧪 Available Tests
          </Typography>
          
          {tests.length === 0 ? (
            <Alert severity="info">
              No tests available. Create some prompts and generate tests first.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Test Name</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell><strong>Files</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.testId} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {test.testName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={test.testType?.toUpperCase() || 'UI'} 
                          size="small" 
                          color={getTestTypeColor(test.testType)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatTimestamp(test.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {test.files?.length || 0} file(s)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={runningTest === test.testId ? <CircularProgress size={16} /> : <PlayArrow />}
                          onClick={() => runTest(test.testId)}
                          disabled={runningTest !== null}
                          color="success"
                        >
                          {runningTest === test.testId ? 'Running...' : 'Run Test'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Test Runs */}
      {summary?.recentTests && summary.recentTests.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📈 Recent Test Activity
            </Typography>
            <Grid container spacing={2}>
              {summary.recentTests.map((test, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {test.testName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {test.testType?.toUpperCase()} • {formatTimestamp(test.timestamp)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>💡 Tips:</strong>
          <br />
          • Run individual tests to see detailed results in reports
          • Playwright reports show test execution details and screenshots
          • Allure reports provide comprehensive test analytics and trends
          • Use "Run All Tests" to execute your entire test suite
        </Typography>
      </Alert>
    </Container>
  );
};

export default Results; 