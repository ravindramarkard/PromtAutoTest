import {
    Add,
    ContentCopy,
    Delete,
    Edit,
    FilterList,
    PlayArrow,
    Search,
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
    Fab,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Prompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [generating, setGenerating] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      content: '',
      testType: 'ui',
      tags: '',
      additionalContext: {
        baseUrl: '',
        authRequired: false,
        additionalInfo: ''
      }
    }
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await axios.get('/api/prompts');
      setPrompts(response.data);
    } catch (error) {
      toast.error('Failed to fetch prompts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = async (data) => {
    try {
      const promptData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        additionalContext: {
          baseUrl: data.additionalContext.baseUrl,
          authRequired: data.additionalContext.authRequired,
          additionalInfo: data.additionalContext.additionalInfo
        }
      };

      if (editingPrompt) {
        await axios.put(`/api/prompts/${editingPrompt.id}`, promptData);
        toast.success('Prompt updated successfully');
      } else {
        await axios.post('/api/prompts', promptData);
        toast.success('Prompt created successfully');
      }

      setOpenDialog(false);
      setEditingPrompt(null);
      reset();
      fetchPrompts();
    } catch (error) {
      toast.error('Failed to save prompt');
      console.error(error);
    }
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    reset({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      testType: prompt.testType,
      tags: prompt.tags?.join(', ') || '',
      additionalContext: {
        baseUrl: prompt.additionalContext?.baseUrl || '',
        authRequired: prompt.additionalContext?.authRequired || false,
        additionalInfo: prompt.additionalContext?.additionalInfo || ''
      }
    });
    setOpenDialog(true);
  };

  const handleDeletePrompt = async (promptId) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await axios.delete(`/api/prompts/${promptId}`);
        toast.success('Prompt deleted successfully');
        fetchPrompts();
      } catch (error) {
        toast.error('Failed to delete prompt');
        console.error(error);
      }
    }
  };

  const handleDuplicatePrompt = async (prompt) => {
    try {
      await axios.post(`/api/prompts/${prompt.id}/duplicate`);
      toast.success('Prompt duplicated successfully');
      fetchPrompts();
    } catch (error) {
      toast.error('Failed to duplicate prompt');
      console.error(error);
    }
  };

  const handleGenerateTest = async (prompt) => {
    setGenerating(prompt.id);
    try {
      const response = await axios.post('/api/generate/from-prompt', {
        promptId: prompt.id,
        testType: prompt.testType,
        additionalContext: prompt.additionalContext
      });

      if (response.data.clarificationNeeded) {
        toast.error('Clarification needed for test generation');
        // Handle clarification dialog here
      } else {
        toast.success('Test generated successfully');
        // Optionally redirect to tests page
      }
    } catch (error) {
      toast.error('Failed to generate test');
      console.error(error);
    } finally {
      setGenerating(null);
    }
  };

  const handleViewPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setViewDialog(true);
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || prompt.testType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Test Prompts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingPrompt(null);
            reset();
            setOpenDialog(true);
          }}
        >
          Add New Prompt
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Filter by Type"
            startAdornment={<FilterList sx={{ mr: 1 }} />}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="ui">UI Tests</MenuItem>
            <MenuItem value="api">API Tests</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {prompts.length === 0 ? 'No prompts found. Create your first prompt to get started!' : 'No prompts match your search criteria.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredPrompts.map((prompt) => (
            <Grid item xs={12} md={6} lg={4} key={prompt.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                      {prompt.title}
                    </Typography>
                    <Chip
                      label={prompt.testType.toUpperCase()}
                      color={prompt.testType === 'ui' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {prompt.description}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {prompt.content}
                  </Typography>

                  {prompt.tags && prompt.tags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                      {prompt.tags.length > 3 && (
                        <Chip label={`+${prompt.tags.length - 3} more`} size="small" variant="outlined" />
                      )}
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    Created: {format(new Date(prompt.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewPrompt(prompt)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEditPrompt(prompt)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                      <IconButton size="small" onClick={() => handleDuplicatePrompt(prompt)}>
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeletePrompt(prompt.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={generating === prompt.id ? <CircularProgress size={16} /> : <PlayArrow />}
                    onClick={() => handleGenerateTest(prompt)}
                    disabled={generating === prompt.id}
                  >
                    {generating === prompt.id ? 'Generating...' : 'Generate Test'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(handleCreatePrompt)}>
          <DialogTitle>
            {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: 'Description is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: 'Content is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Prompt Content"
                      fullWidth
                      multiline
                      rows={6}
                      error={!!errors.content}
                      helperText={errors.content?.message}
                      placeholder="Describe the test scenario you want to generate..."
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name="testType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Test Type</InputLabel>
                      <Select {...field} label="Test Type">
                        <MenuItem value="ui">UI Test</MenuItem>
                        <MenuItem value="api">API Test</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tags (comma separated)"
                      fullWidth
                      placeholder="smoke, regression, critical"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Additional Context</Typography>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="additionalContext.baseUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Base URL"
                      fullWidth
                      placeholder="https://example.com"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="additionalContext.additionalInfo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Additional Information"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Any additional context or requirements..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingPrompt ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        {selectedPrompt && (
          <>
            <DialogTitle>{selectedPrompt.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Description:</strong> {selectedPrompt.description}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Type:</strong> {selectedPrompt.testType.toUpperCase()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Content:</strong>
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                  {selectedPrompt.content}
                </Typography>
                {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Tags:</strong>
                    </Typography>
                    {selectedPrompt.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
                {selectedPrompt.additionalContext && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Additional Context:</strong>
                    </Typography>
                    {selectedPrompt.additionalContext.baseUrl && (
                      <Typography variant="body2">Base URL: {selectedPrompt.additionalContext.baseUrl}</Typography>
                    )}
                    {selectedPrompt.additionalContext.additionalInfo && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedPrompt.additionalContext.additionalInfo}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => {
                  setViewDialog(false);
                  handleGenerateTest(selectedPrompt);
                }}
              >
                Generate Test
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Floating Action Button for quick add */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          setEditingPrompt(null);
          reset();
          setOpenDialog(true);
        }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default Prompts; 