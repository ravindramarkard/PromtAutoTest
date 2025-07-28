import {
  Add,
  AddCircle,
  CleaningServices,
  Collections,
  Delete,
  Edit,
  ExpandMore,
  Label,
  PlayArrow,
  Refresh,
  RemoveCircle,
  Settings,
  Storage,
  ViewList,
  Visibility
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  DialogTitle, FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TestSuites = () => {
  const [tabValue, setTabValue] = useState(0);
  const [testSuites, setTestSuites] = useState([]);
  const [testCollections, setTestCollections] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [runningJobs, setRunningJobs] = useState(new Set());
  
  // Dialog states
  const [suiteDialogOpen, setSuiteDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [collectionEditDialogOpen, setCollectionEditDialogOpen] = useState(false);
  const [tagRunDialogOpen, setTagRunDialogOpen] = useState(false);
  const [suiteRunDialogOpen, setSuiteRunDialogOpen] = useState(false);
  const [manageTestsDialogOpen, setManageTestsDialogOpen] = useState(false);
  const [testFileDialogOpen, setTestFileDialogOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [testFileContent, setTestFileContent] = useState('');
  const [viewTestFileDialogOpen, setViewTestFileDialogOpen] = useState(false);

  // Form states
  const [suiteForm, setSuiteForm] = useState({
    name: '',
    description: '',
    environment: 'dev',
    testCases: [],
    tags: [],
    headless: true,
    browser: 'chromium',
    parallel: false,
    retries: 0,
    timeout: 30000
  });
  
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    testSuites: [],
    environment: 'dev',
    headless: true,
    browser: 'chromium',
    parallel: false
  });

  const [collectionEditForm, setCollectionEditForm] = useState({
    id: '',
    name: '',
    description: '',
    testSuites: [],
    environment: 'dev',
    headless: true,
    browser: 'chromium',
    parallel: false,
    isEditing: false
  });
  
  const [tagRunForm, setTagRunForm] = useState({
    tags: [],
    environment: 'dev',
    headless: true,
    browser: 'chromium'
  });

  const [suiteRunForm, setSuiteRunForm] = useState({
    suiteId: null,
    suiteName: '',
    environment: '', // Empty means use suite's default
    headless: true,
    browser: 'chromium',
    parallel: false,
    tags: [], // Tags to filter tests
    availableTags: [] // Tags available in this suite
  });

  const [manageTestsForm, setManageTestsForm] = useState({
    suiteId: null,
    suiteName: '',
    testsInSuite: [],
    availableTests: []
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [suitesRes, collectionsRes, envsRes, tagsRes, testsRes, statsRes] = await Promise.all([
        axios.get('/api/suites/suites'),
        axios.get('/api/suites/collections'),
        axios.get('/api/suites/environments'),
        axios.get('/api/suites/tags'),
        axios.get('/api/tests'),
        axios.get('/api/suites/statistics')
      ]);
      
      setTestSuites(suitesRes.data);
      setTestCollections(collectionsRes.data);
      setEnvironments(envsRes.data);
      setAvailableTags(tagsRes.data.tags);
      setAvailableTests(testsRes.data);
      setStatistics(statsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST SUITE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const handleCreateSuite = async () => {
    try {
      await axios.post('/api/suites/suites', suiteForm);
      toast.success('Test suite created successfully');
      setSuiteDialogOpen(false);
      setSuiteForm({
        name: '',
        description: '',
        environment: 'dev',
        testCases: [],
        tags: [],
        headless: true,
        browser: 'chromium',
        parallel: false,
        retries: 0,
        timeout: 30000
      });
      fetchAllData();
    } catch (error) {
      toast.error('Failed to create test suite');
    }
  };

  const handleManageTests = async (suiteId, suiteName) => {
    try {
      // Fetch current tests in suite and available tests
      const response = await axios.get(`/api/suites/suites/${suiteId}/tests`);
      
      setManageTestsForm({
        suiteId,
        suiteName,
        testsInSuite: response.data.testsInSuite,
        availableTests: response.data.availableTests
      });
      
      setManageTestsDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load test suite details');
    }
  };

  const handleAddTestToSuite = async (testId) => {
    try {
      const response = await axios.post(`/api/suites/suites/${manageTestsForm.suiteId}/tests/${testId}`);
      
      toast.success(response.data.message);
      
      // Refresh the manage tests data
      await handleManageTests(manageTestsForm.suiteId, manageTestsForm.suiteName);
      fetchAllData(); // Refresh main data
    } catch (error) {
      toast.error(`Failed to add test: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleRemoveTestFromSuite = async (testId) => {
    try {
      const response = await axios.delete(`/api/suites/suites/${manageTestsForm.suiteId}/tests/${testId}`);
      
      toast.success(response.data.message);
      
      // Refresh the manage tests data
      await handleManageTests(manageTestsForm.suiteId, manageTestsForm.suiteName);
      fetchAllData(); // Refresh main data
    } catch (error) {
      toast.error(`Failed to remove test: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleViewTestFile = async (testId) => {
    try {
      const response = await axios.get(`/api/tests/${testId}/file`);
      setTestFileContent(response.data.content);
      setViewTestFileDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load test file for viewing');
    }
  };

  const handleDeleteSuite = async (suiteId, suiteName) => {
    if (window.confirm(`Are you sure you want to delete test suite "${suiteName}"?`)) {
      try {
        await axios.delete(`/api/suites/suites/${suiteId}`);
        toast.success(`Test suite "${suiteName}" deleted successfully`);
        fetchAllData();
      } catch (error) {
        toast.error(`Failed to delete test suite: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const handleDeleteTest = async (testId, testName) => {
    if (window.confirm(`Are you sure you want to delete test "${testName}"?`)) {
      try {
        const response = await axios.delete(`/api/tests/${testId}`);
        toast.success(response.data.message || `Test "${testName}" deleted successfully`);
        fetchAllData();
      } catch (error) {
        toast.error(`Failed to delete test: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  // Function to edit test file
  const handleEditTestFile = async (testId) => {
    try {
      const response = await axios.get(`/api/tests/${testId}/file`);
      if (response.data.content) {
        setTestFileContent(response.data.content);
        setTestFileDialogOpen(true);
        setEditingTestId(testId); // Store the ID of the test being edited
      }
    } catch (error) {
      toast.error('Failed to load test file for editing');
    }
  };

  // Function to save edited test file
const handleSaveTestFile = async () => {
  try {
    await axios.put(`/api/tests/${editingTestId}/file`, { content: testFileContent });
    toast.success('Test file updated successfully');
    setTestFileDialogOpen(false);
    fetchAllData(); // Refresh the test list if necessary
  } catch (error) {
    toast.error('Failed to save test file');
  }
};

  const handleRunSuite = async (suiteId, suiteName) => {
    try {
      // Fetch suite details to get available tags
      const suiteResponse = await axios.get(`/api/suites/suites/${suiteId}/tests`);
      
      // Extract unique tags from tests in the suite
      const allTags = new Set();
      suiteResponse.data.testsInSuite.forEach(test => {
        if (test.tags) {
          test.tags.forEach(tag => allTags.add(tag));
        }
      });
      
      const availableTags = Array.from(allTags).sort();
      
      setSuiteRunForm({
        suiteId,
        suiteName,
        environment: '', // Empty means use suite's default
        headless: true,
        browser: 'chromium',
        parallel: false,
        tags: [], // No tags selected initially (run all)
        availableTags // Tags available in this suite
      });
      setSuiteRunDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load test suite details');
      console.error('Error loading suite details:', error);
    }
  };

  const handleExecuteSuite = async () => {
    try {
      setRunningJobs(prev => new Set([...prev, suiteRunForm.suiteId]));
      setSuiteRunDialogOpen(false);
      
      const environmentText = suiteRunForm.environment 
        ? environments.find(env => env.key === suiteRunForm.environment)?.name || suiteRunForm.environment
        : 'default';
      
      const tagText = suiteRunForm.tags.length > 0 
        ? ` [${suiteRunForm.tags.join(', ')}]`
        : ' [all tests]';
      
      toast.loading(`Running test suite: ${suiteRunForm.suiteName} (${environmentText})${tagText}`);
      
      const requestBody = {
        headless: suiteRunForm.headless,
        browser: suiteRunForm.browser,
        parallel: suiteRunForm.parallel
      };
      
      // Only include environment if it's explicitly selected (not default)
      if (suiteRunForm.environment) {
        requestBody.environment = suiteRunForm.environment;
      }
      
      // Include tags if any are selected
      if (suiteRunForm.tags.length > 0) {
        requestBody.tags = suiteRunForm.tags;
      }
      
      const response = await axios.post(`/api/suites/suites/${suiteRunForm.suiteId}/run`, requestBody);
      
      toast.dismiss();
      if (response.data.success) {
        const execution = response.data.execution;
        let successMessage = `Test suite completed: ${suiteRunForm.suiteName}`;
        
        if (execution.filteredTestsExecuted && execution.totalTestsInSuite) {
          successMessage += ` (${execution.filteredTestsExecuted}/${execution.totalTestsInSuite} tests)`;
        }
        
        toast.success(successMessage);
      } else {
        toast.error(`Test suite failed: ${suiteRunForm.suiteName}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to run test suite: ${error.response?.data?.error || error.message}`);
    } finally {
      setRunningJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(suiteRunForm.suiteId);
        return newSet;
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAG-BASED EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  const handleRunByTags = async () => {
    try {
      if (tagRunForm.tags.length === 0) {
        toast.error('Please select at least one tag');
        return;
      }
      
      toast.loading(`Running tests with tags: ${tagRunForm.tags.join(', ')}`);
      
      const response = await axios.post('/api/suites/run/tags', tagRunForm);
      
      toast.dismiss();
      if (response.data.success) {
        toast.success(`Found and ran ${response.data.testsFound} tests with tags: ${tagRunForm.tags.join(', ')}`);
      } else {
        toast.error('Tag-based execution failed');
      }
      
      setTagRunDialogOpen(false);
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to run tests by tags: ${error.response?.data?.error || error.message}`);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ENVIRONMENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const handleCleanupTestSuites = async () => {
    try {
      toast.loading('Cleaning up invalid test references...');
      
      const response = await axios.post('/api/suites/cleanup');
      
      toast.dismiss();
      if (response.data.success) {
        toast.success(`Cleanup completed: cleaned ${response.data.cleanedSuites} suites, removed ${response.data.removedTests} invalid test references`);
        fetchAllData(); // Refresh data to show updated suites
      } else {
        toast.error('Cleanup failed');
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Cleanup failed: ${error.response?.data?.error || error.message}`);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COLLECTION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const handleCreateCollection = async () => {
    try {
      await axios.post('/api/suites/collections', collectionForm);
      toast.success('Test collection created successfully');
      setCollectionDialogOpen(false);
      setCollectionForm({
        name: '',
        description: '',
        testSuites: [],
        environment: 'dev',
        headless: true,
        browser: 'chromium',
        parallel: false
      });
      fetchAllData();
    } catch (error) {
      toast.error('Failed to create test collection');
    }
  };

  const handleRunCollection = async (collectionId, collectionName) => {
    try {
      setRunningJobs(prev => new Set([...prev, collectionId]));
      toast.loading(`Running test collection: ${collectionName}`);
      
      const response = await axios.post(`/api/suites/collections/${collectionId}/run`, {
        headless: true,
        browser: 'chromium'
      });
      
      toast.dismiss();
      if (response.data.success) {
        toast.success(`Test collection completed: ${collectionName}`);
      } else {
        toast.error(`Test collection failed: ${collectionName}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to run test collection: ${error.response?.data?.error || error.message}`);
    } finally {
      setRunningJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(collectionId);
        return newSet;
      });
    }
  };

  const handleManageCollection = async (collectionId, collectionName) => {
    try {
      // Fetch the collection details
      const response = await axios.get(`/api/suites/collections/${collectionId}`);
      const collection = response.data;
      
      setCollectionEditForm({
        id: collection.id,
        name: collection.name,
        description: collection.description || '',
        testSuites: collection.testSuites || [],
        environment: collection.environment || 'dev',
        headless: collection.settings?.headless !== false,
        browser: collection.settings?.browser || 'chromium',
        parallel: collection.settings?.parallel || false,
        isEditing: true
      });
      
      setCollectionEditDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load collection details');
    }
  };

  const handleUpdateCollection = async () => {
    try {
      const updateData = {
        name: collectionEditForm.name,
        description: collectionEditForm.description,
        testSuites: collectionEditForm.testSuites,
        environment: collectionEditForm.environment,
        settings: {
          headless: collectionEditForm.headless,
          browser: collectionEditForm.browser,
          parallel: collectionEditForm.parallel
        }
      };

      await axios.put(`/api/suites/collections/${collectionEditForm.id}`, updateData);
      toast.success(`Collection "${collectionEditForm.name}" updated successfully`);
      handleCloseCollectionEditDialog();
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update collection');
    }
  };

  const handleCloseCollectionEditDialog = () => {
    setCollectionEditDialogOpen(false);
    setCollectionEditForm({
      id: '',
      name: '',
      description: '',
      testSuites: [],
      environment: 'dev',
      headless: true,
      browser: 'chromium',
      parallel: false,
      isEditing: false
    });
  };

  const handleDeleteCollection = async (collectionId, collectionName) => {
    if (window.confirm(`Are you sure you want to delete collection "${collectionName}"?`)) {
      try {
        await axios.delete(`/api/suites/collections/${collectionId}`);
        toast.success(`Test collection "${collectionName}" deleted successfully`);
        fetchAllData();
      } catch (error) {
        toast.error(`Failed to delete collection: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Statistics Cards */}
      <Grid item xs={12} md={3}>
        <Card sx={{ cursor: 'pointer' }} onClick={() => setTabValue(1)}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Collections color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Test Suites</Typography>
            </Box>
            <Typography variant="h3">{statistics.totalSuites || 0}</Typography>
            <Typography variant="body2" color="text.secondary">
              Available test suites
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card sx={{ cursor: 'pointer' }} onClick={() => setTabValue(2)}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Storage color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">Collections</Typography>
            </Box>
            <Typography variant="h3">{statistics.totalCollections || 0}</Typography>
            <Typography variant="body2" color="text.secondary">
              Test collections
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card sx={{ cursor: 'pointer' }} onClick={() => window.location.href = '/environments'}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Settings color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Environments</Typography>
            </Box>
            <Typography variant="h3">{statistics.totalEnvironments || 0}</Typography>
            <Typography variant="body2" color="text.secondary">
              Test environments
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card sx={{ cursor: 'pointer' }} onClick={() => setTabValue(3)}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <ViewList color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Tests</Typography>
            </Box>
            <Typography variant="h3">{availableTests.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Generated test files
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card sx={{ cursor: 'pointer' }} onClick={() => setTabValue(4)}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Label color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Available Tags</Typography>
            </Box>
            <Typography variant="h3">{availableTags.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Unique test tags
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🚀 Quick Actions</Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setSuiteDialogOpen(true)}
                color="primary"
              >
                Create Test Suite
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCollectionDialogOpen(true)}
                color="secondary"
              >
                Create Collection
              </Button>
              <Button
                variant="contained"
                startIcon={<Label />}
                onClick={() => setTagRunDialogOpen(true)}
                color="success"
              >
                Run by Tags
              </Button>
              <Button
                variant="outlined"
                startIcon={<CleaningServices />}
                onClick={handleCleanupTestSuites}
                color="warning"
              >
                Cleanup Invalid
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>📋 Recent Test Suites</Typography>
            {statistics.recentSuites?.slice(0, 5).map((suite) => (
              <Box key={suite.id} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Box>
                  <Typography variant="body1">{suite.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {suite.testCases?.length || 0} tests • {suite.environment}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRunSuite(suite.id, suite.name)}
                  disabled={runningJobs.has(suite.id)}
                >
                  {runningJobs.has(suite.id) ? (
                    <CircularProgress size={16} />
                  ) : (
                    <PlayArrow />
                  )}
                </IconButton>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🏷️ Tag Distribution</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {Object.entries(statistics.tagDistribution || {}).slice(0, 10).map(([tag, count]) => (
                <Chip 
                  key={tag} 
                  label={`${tag} (${count})`} 
                  size="small" 
                  onClick={() => {
                    setTagRunForm({...tagRunForm, tags: [tag]});
                    setTagRunDialogOpen(true);
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSuitesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">📋 Test Suites</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setSuiteDialogOpen(true)}
        >
          Create Test Suite
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Environment</strong></TableCell>
              <TableCell><strong>Test Cases</strong></TableCell>
              <TableCell><strong>Tags</strong></TableCell>
              <TableCell><strong>Settings</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testSuites.map((suite) => (
              <TableRow key={suite.id}>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {suite.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {suite.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={suite.environment} size="small" color="primary" />
                </TableCell>
                <TableCell>{suite.testCases?.length || 0}</TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {suite.tags?.slice(0, 3).map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                    {suite.tags?.length > 3 && (
                      <Chip label={`+${suite.tags.length - 3}`} size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {suite.settings?.browser} • {suite.settings?.headless ? 'Headless' : 'Headed'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={runningJobs.has(suite.id) ? <CircularProgress size={14} /> : <PlayArrow />}
                      onClick={() => handleRunSuite(suite.id, suite.name)}
                      disabled={runningJobs.has(suite.id)}
                      color="success"
                    >
                      Run
                    </Button>
                    <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleViewTestFile(suite.id)}
                    color="info"
                  >
                    View File
                  </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleManageTests(suite.id, suite.name)}
                      color="info"
                      title="Manage Tests"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteSuite(suite.id, suite.name)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderCollectionsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">📦 Test Collections</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCollectionDialogOpen(true)}
        >
          Create Collection
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Environment</strong></TableCell>
              <TableCell><strong>Test Suites</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testCollections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No test collections found. Create your first collection to group test suites together.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              testCollections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {collection.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {collection.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={collection.environment} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>{collection.testSuites?.length || 0}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => handleRunCollection(collection.id, collection.name)}
                        color="success"
                      >
                        Run
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleManageCollection(collection.id, collection.name)}
                        color="info"
                        title="Manage Collection"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCollection(collection.id, collection.name)}
                        color="error"
                        title="Delete Collection"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAllTestsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">📝 All Generated Tests</Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {availableTests.length} tests
        </Typography>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Test Name</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Tags</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableTests.map((test) => (
              <TableRow key={test.testId}>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {test.testName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {test.testId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={test.testType} size="small" color="secondary" />
                </TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {test.tags?.slice(0, 3).map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                    {test.tags?.length > 3 && (
                      <Chip label={`+${test.tags.length - 3}`} size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {test.timestamp ? new Date(test.timestamp).toLocaleDateString() : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => window.open(`/api/tests/${test.testId}/file`, '_blank')}
                      color="primary"
                      title="View Test File"
                    >
                      <Visibility />
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTest(test.testId, test.testName)}
                      color="error"
                      title="Delete Test"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderTagsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">🏷️ Tag-Based Execution</Typography>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={() => setTagRunDialogOpen(true)}
          color="success"
        >
          Run by Tags
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Available Tags</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {availableTags.map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    onClick={() => {
                      setTagRunForm({...tagRunForm, tags: [tag]});
                      setTagRunDialogOpen(true);
                    }}
                    clickable
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Tag Categories</Typography>
              {['smoke', 'sanity', 'regression', 'integration', 'api', 'ui'].map((category) => {
                const categoryTags = availableTags.filter(tag => 
                  tag.toLowerCase().includes(category.toLowerCase())
                );
                
                return categoryTags.length > 0 && (
                  <Accordion key={category}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>{category.toUpperCase()} Tests ({categoryTags.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {categoryTags.map((tag) => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small"
                            onClick={() => {
                              setTagRunForm({...tagRunForm, tags: [tag]});
                              setTagRunDialogOpen(true);
                            }}
                            clickable
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

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
          🧪 Test Suite Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchAllData}
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="📊 Overview" />
          <Tab label="📋 Test Suites" />
          <Tab label="📦 Collections" />
          <Tab label="📝 All Tests" />
          <Tab label="🏷️ Tags" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderOverviewTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderSuitesTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderCollectionsTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderAllTestsTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {renderTagsTab()}
        </TabPanel>
      </Paper>

      {/* Dialog for viewing test file content */}
      <Dialog open={testFileDialogOpen} onClose={() => setTestFileDialogOpen(false)}>
        <DialogTitle>Test File Content</DialogTitle>
        <DialogContent>
          <pre>{testFileContent}</pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestFileDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Test Suite Dialog */}
      <Dialog open={suiteDialogOpen} onClose={() => setSuiteDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Test Suite</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Suite Name"
                value={suiteForm.name}
                onChange={(e) => setSuiteForm({...suiteForm, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={suiteForm.description}
                onChange={(e) => setSuiteForm({...suiteForm, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={suiteForm.environment}
                  onChange={(e) => setSuiteForm({...suiteForm, environment: e.target.value})}
                  label="Environment"
                >
                  {environments.map((env) => (
                    <MenuItem key={env.key} value={env.key}>{env.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Browser</InputLabel>
                <Select
                  value={suiteForm.browser}
                  onChange={(e) => setSuiteForm({...suiteForm, browser: e.target.value})}
                  label="Browser"
                >
                  <MenuItem value="chromium">Chromium</MenuItem>
                  <MenuItem value="firefox">Firefox</MenuItem>
                  <MenuItem value="webkit">WebKit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={suiteForm.headless}
                    onChange={(e) => setSuiteForm({...suiteForm, headless: e.target.checked})}
                  />
                }
                label="Run in Headless Mode"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Test Cases</InputLabel>
                <Select
                  multiple
                  value={suiteForm.testCases}
                  onChange={(e) => setSuiteForm({...suiteForm, testCases: e.target.value})}
                  label="Test Cases"
                  renderValue={(selected) => `${selected.length} tests selected`}
                >
                  {availableTests.map((test) => (
                    <MenuItem key={test.testId} value={test.testId}>
                      {test.testName} ({test.testType})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Show selected tests */}
            {suiteForm.testCases.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Selected Tests:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {suiteForm.testCases.map((testId) => {
                    const test = availableTests.find(t => t.testId === testId);
                    return test ? (
                      <Chip
                        key={testId}
                        label={`${test.testName} (${test.testType})`}
                        onDelete={() => {
                          setSuiteForm({
                            ...suiteForm,
                            testCases: suiteForm.testCases.filter(id => id !== testId)
                          });
                        }}
                        size="small"
                        color="primary"
                      />
                    ) : null;
                  })}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuiteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSuite} variant="contained">Create Suite</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing test file content */}
      <Dialog open={testFileDialogOpen} onClose={() => setTestFileDialogOpen(false)}>
        <DialogTitle>Edit Test File</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            rows={10}
            value={testFileContent}
            onChange={(e) => setTestFileContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestFileDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTestFile} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Tag Run Dialog */}
      <Dialog open={tagRunDialogOpen} onClose={() => setTagRunDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Run Tests by Tags</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tags</InputLabel>
                <Select
                  multiple
                  value={tagRunForm.tags}
                  onChange={(e) => setTagRunForm({...tagRunForm, tags: e.target.value})}
                  label="Tags"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={tagRunForm.environment}
                  onChange={(e) => setTagRunForm({...tagRunForm, environment: e.target.value})}
                  label="Environment"
                >
                  {environments.map((env) => (
                    <MenuItem key={env.key} value={env.key}>{env.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Browser</InputLabel>
                <Select
                  value={tagRunForm.browser}
                  onChange={(e) => setTagRunForm({...tagRunForm, browser: e.target.value})}
                  label="Browser"
                >
                  <MenuItem value="chromium">Chromium</MenuItem>
                  <MenuItem value="firefox">Firefox</MenuItem>
                  <MenuItem value="webkit">WebKit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tagRunForm.headless}
                    onChange={(e) => setTagRunForm({...tagRunForm, headless: e.target.checked})}
                  />
                }
                label="Run in Headless Mode"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagRunDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRunByTags} variant="contained" color="success">
            Run Tests
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suite Run Dialog */}
      <Dialog open={suiteRunDialogOpen} onClose={() => setSuiteRunDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Run Test Suite</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>📋 {suiteRunForm.suiteName}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Override environment and execution settings for this run
              </Typography>
            </Grid>
            
            {/* Environment Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Environment Override</InputLabel>
                <Select
                  value={suiteRunForm.environment}
                  onChange={(e) => setSuiteRunForm({...suiteRunForm, environment: e.target.value})}
                  label="Environment Override"
                >
                  <MenuItem value="">
                    <em>Use Suite Default</em>
                  </MenuItem>
                  {environments.map((env) => (
                    <MenuItem key={env.key} value={env.key}>{env.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {suiteRunForm.environment && (
                <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                  Will override suite's default environment
                </Typography>
              )}
              {!suiteRunForm.environment && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Will use suite's configured environment
                </Typography>
              )}
            </Grid>
            
            {/* Browser Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Browser</InputLabel>
                <Select
                  value={suiteRunForm.browser}
                  onChange={(e) => setSuiteRunForm({...suiteRunForm, browser: e.target.value})}
                  label="Browser"
                >
                  <MenuItem value="chromium">Chromium</MenuItem>
                  <MenuItem value="firefox">Firefox</MenuItem>
                  <MenuItem value="webkit">WebKit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Tag Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Filter by Tags (optional)</InputLabel>
                <Select
                  multiple
                  value={suiteRunForm.tags}
                  onChange={(e) => setSuiteRunForm({...suiteRunForm, tags: e.target.value})}
                  label="Filter by Tags (optional)"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" color="primary" />
                      ))}
                    </Box>
                  )}
                >
                  {suiteRunForm.availableTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {suiteRunForm.tags.length > 0 ? (
                <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                  Will run only tests with tags: {suiteRunForm.tags.join(', ')}
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Will run all tests in the suite (no tag filter)
                </Typography>
              )}
              {suiteRunForm.availableTags.length === 0 && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
                  No tags available in this test suite
                </Typography>
              )}
            </Grid>
            
            {/* Execution Options */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={suiteRunForm.headless}
                    onChange={(e) => setSuiteRunForm({...suiteRunForm, headless: e.target.checked})}
                  />
                }
                label="Run in Headless Mode"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={suiteRunForm.parallel}
                    onChange={(e) => setSuiteRunForm({...suiteRunForm, parallel: e.target.checked})}
                  />
                }
                label="Run in Parallel"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuiteRunDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExecuteSuite} variant="contained" color="success">
            🚀 Execute Suite
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Tests Dialog */}
      <Dialog open={manageTestsDialogOpen} onClose={() => setManageTestsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>📝 Manage Tests in "{manageTestsForm.suiteName}"</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            
            {/* Tests Currently in Suite */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">
                📋 Tests in Suite ({manageTestsForm.testsInSuite.length})
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, minHeight: 400, maxHeight: 400, overflow: 'auto' }}>
                {manageTestsForm.testsInSuite.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No tests in this suite yet
                  </Typography>
                ) : (
                  manageTestsForm.testsInSuite.map((test) => (
                    <Box key={test.testId} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {test.testName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {test.testType} • {test.testId}
                          </Typography>
                          {test.tags && test.tags.length > 0 && (
                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                              {test.tags.slice(0, 3).map((tag) => (
                                <Chip key={tag} label={tag} size="small" />
                              ))}
                            </Box>
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveTestFromSuite(test.testId)}
                          color="error"
                          title="Remove from suite"
                        >
                          <RemoveCircle />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>

            {/* Available Tests to Add */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="secondary">
                ➕ Available Tests ({manageTestsForm.availableTests.length})
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, minHeight: 400, maxHeight: 400, overflow: 'auto' }}>
                {manageTestsForm.availableTests.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    All tests are already in this suite
                  </Typography>
                ) : (
                  manageTestsForm.availableTests.map((test) => (
                    <Box key={test.testId} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {test.testName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {test.testType} • {test.testId}
                          </Typography>
                          {test.tags && test.tags.length > 0 && (
                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                              {test.tags.slice(0, 3).map((tag) => (
                                <Chip key={tag} label={tag} size="small" />
                              ))}
                            </Box>
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleAddTestToSuite(test.testId)}
                          color="success"
                          title="Add to suite"
                        >
                          <AddCircle />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>

            {/* Suite Summary */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  📊 <strong>Suite Summary:</strong> {manageTestsForm.testsInSuite.length} test(s) configured • {manageTestsForm.availableTests.length} test(s) available to add
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageTestsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Collection Dialog */}
      <Dialog open={collectionDialogOpen} onClose={() => setCollectionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Test Collection</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Collection Name"
                value={collectionForm.name}
                onChange={(e) => setCollectionForm({...collectionForm, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={collectionForm.description}
                onChange={(e) => setCollectionForm({...collectionForm, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={collectionForm.environment}
                  onChange={(e) => setCollectionForm({...collectionForm, environment: e.target.value})}
                  label="Environment"
                >
                  {environments.map((env) => (
                    <MenuItem key={env.key} value={env.key}>{env.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Browser</InputLabel>
                <Select
                  value={collectionForm.browser}
                  onChange={(e) => setCollectionForm({...collectionForm, browser: e.target.value})}
                  label="Browser"
                >
                  <MenuItem value="chromium">Chromium</MenuItem>
                  <MenuItem value="firefox">Firefox</MenuItem>
                  <MenuItem value="webkit">WebKit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={collectionForm.headless}
                    onChange={(e) => setCollectionForm({...collectionForm, headless: e.target.checked})}
                  />
                }
                label="Run in Headless Mode"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Test Suites</InputLabel>
                <Select
                  multiple
                  value={collectionForm.testSuites}
                  onChange={(e) => setCollectionForm({...collectionForm, testSuites: e.target.value})}
                  label="Test Suites"
                  renderValue={(selected) => `${selected.length} suites selected`}
                >
                  {testSuites.map((suite) => (
                    <MenuItem key={suite.id} value={suite.id}>
                      {suite.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Show selected suites */}
            {collectionForm.testSuites.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Selected Suites:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {collectionForm.testSuites.map((suiteId) => {
                    const suite = testSuites.find(s => s.id === suiteId);
                    return suite ? (
                      <Chip
                        key={suiteId}
                        label={suite.name}
                        onDelete={() => {
                          setCollectionForm({
                            ...collectionForm,
                            testSuites: collectionForm.testSuites.filter(id => id !== suiteId)
                          });
                        }}
                        size="small"
                        color="primary"
                      />
                    ) : null;
                  })}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCollection} variant="contained">Create Collection</Button>
        </DialogActions>
      </Dialog>

      {/* Collection Edit Dialog */}
      <Dialog open={collectionEditDialogOpen} onClose={handleCloseCollectionEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>{collectionEditForm.isEditing ? 'Edit Collection' : 'Create Test Collection'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Collection Name"
                value={collectionEditForm.name}
                onChange={(e) => setCollectionEditForm({...collectionEditForm, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={collectionEditForm.description}
                onChange={(e) => setCollectionEditForm({...collectionEditForm, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={collectionEditForm.environment}
                  onChange={(e) => setCollectionEditForm({...collectionEditForm, environment: e.target.value})}
                  label="Environment"
                >
                  {environments.map((env) => (
                    <MenuItem key={env.key} value={env.key}>{env.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Browser</InputLabel>
                <Select
                  value={collectionEditForm.browser}
                  onChange={(e) => setCollectionEditForm({...collectionEditForm, browser: e.target.value})}
                  label="Browser"
                >
                  <MenuItem value="chromium">Chromium</MenuItem>
                  <MenuItem value="firefox">Firefox</MenuItem>
                  <MenuItem value="webkit">WebKit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={collectionEditForm.headless}
                    onChange={(e) => setCollectionEditForm({...collectionEditForm, headless: e.target.checked})}
                  />
                }
                label="Run in Headless Mode"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Test Suites</InputLabel>
                <Select
                  multiple
                  value={collectionEditForm.testSuites}
                  onChange={(e) => setCollectionEditForm({...collectionEditForm, testSuites: e.target.value})}
                  label="Test Suites"
                  renderValue={(selected) => `${selected.length} suites selected`}
                >
                  {testSuites.map((suite) => (
                    <MenuItem key={suite.id} value={suite.id}>
                      {suite.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Show selected suites */}
            {collectionEditForm.testSuites.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Selected Suites:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {collectionEditForm.testSuites.map((suiteId) => {
                    const suite = testSuites.find(s => s.id === suiteId);
                    return suite ? (
                      <Chip
                        key={suiteId}
                        label={suite.name}
                        onDelete={() => {
                          setCollectionEditForm({
                            ...collectionEditForm,
                            testSuites: collectionEditForm.testSuites.filter(id => id !== suiteId)
                          });
                        }}
                        size="small"
                        color="primary"
                      />
                    ) : null;
                  })}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCollectionEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateCollection} variant="contained">
            {collectionEditForm.isEditing ? 'Update Collection' : 'Create Collection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TestSuites; 