import {
    Delete,
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [runningTest, setRunningTest] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tests');
      setTests(response.data);
    } catch (error) {
      toast.error('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTest = async (test) => {
    try {
      setSelectedTest(test);
      setViewDialog(true);
    } catch (error) {
      toast.error('Failed to load test details');
    }
  };

  const handleViewFile = async (test, fileType) => {
    try {
      const response = await axios.get(`/api/tests/${test.testId}/files/${fileType}`);
      setSelectedFile(response.data);
    } catch (error) {
      toast.error('Failed to load file content');
    }
  };

  const handleRunTest = async (test) => {
    try {
      setRunningTest(test.testId);
      toast.loading('Running test...');
      
      const response = await axios.post(`/api/tests/${test.testId}/run`, {
        browser: 'chromium',
        headed: false,
      });
      
      toast.dismiss();
      toast.success('Test completed successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Test execution failed');
    } finally {
      setRunningTest(null);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await axios.delete(`/api/tests/${testId}`);
        toast.success('Test deleted successfully');
        fetchTests();
      } catch (error) {
        toast.error('Failed to delete test');
      }
    }
  };

  const handleRunAllTests = async () => {
    try {
      toast.loading('Running all tests...');
      await axios.post('/api/tests/run/all');
      toast.dismiss();
      toast.success('All tests started successfully');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Generated Tests
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTests}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={handleRunAllTests}
            disabled={tests.length === 0}
          >
            Run All Tests
          </Button>
        </Box>
      </Box>

      {tests.length === 0 ? (
        <Alert severity="info">
          No tests generated yet. Go to the Prompts page to create and generate tests.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {tests.map((test) => (
            <Grid item xs={12} md={6} lg={4} key={test.testId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {test.testName}
                    </Typography>
                    <Chip
                      label={test.testType.toUpperCase()}
                      size="small"
                      color={test.testType === 'ui' ? 'primary' : 'secondary'}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Created: {new Date(test.timestamp).toLocaleString()}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Files: {test.files.length}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {test.files.map((file) => (
                      <Chip
                        key={file.type}
                        label={file.type}
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewFile(test, file.type)}
                        clickable
                      />
                    ))}
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleViewTest(test)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteTest(test.testId)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={runningTest === test.testId ? <CircularProgress size={16} /> : <PlayArrow />}
                      onClick={() => handleRunTest(test)}
                      disabled={runningTest === test.testId}
                    >
                      Run Test
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Test Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Test Details: {selectedTest?.testName}
        </DialogTitle>
        <DialogContent>
          {selectedTest && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Test ID:</Typography>
                  <Typography variant="body2">{selectedTest.testId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Type:</Typography>
                  <Chip label={selectedTest.testType.toUpperCase()} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Created:</Typography>
                  <Typography variant="body2">{new Date(selectedTest.timestamp).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Files:</Typography>
                  <Typography variant="body2">{selectedTest.files.length}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Generated Files:
              </Typography>
              {selectedTest.files.map((file) => (
                <Card key={file.type} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">{file.name}</Typography>
                      <Button
                        size="small"
                        onClick={() => handleViewFile(selectedTest, file.type)}
                      >
                        View Content
                      </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Type: {file.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Path: {file.path}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* File Content Dialog */}
      <Dialog open={!!selectedFile} onClose={() => setSelectedFile(null)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedFile?.fileName}
        </DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Type: {selectedFile.type} | Path: {selectedFile.path}
              </Typography>
              <SyntaxHighlighter
                language={selectedFile.type === 'feature' ? 'gherkin' : 'javascript'}
                style={tomorrow}
                customStyle={{
                  maxHeight: '500px',
                  overflow: 'auto',
                }}
              >
                {selectedFile.content}
              </SyntaxHighlighter>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFile(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Tests; 