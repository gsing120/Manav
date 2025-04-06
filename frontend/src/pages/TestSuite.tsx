import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button, 
  Card, 
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  TextField,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';

/**
 * TestSuite component for testing the complete application
 */
const TestSuite: React.FC = () => {
  // Test state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<string>('');
  const [customTestInput, setCustomTestInput] = useState<string>('');
  
  // Test categories
  const testCategories = [
    { id: 'core', name: 'Core Components' },
    { id: 'multimodal', name: 'Multimodal Understanding' },
    { id: 'reasoning', name: 'Advanced Reasoning' },
    { id: 'learning', name: 'Real-time Learning' },
    { id: 'cloud', name: 'Cloud Integration' },
    { id: 'context', name: 'Contextual Awareness' },
    { id: 'conversation', name: 'Conversation Abilities' },
    { id: 'specialized', name: 'Specialized Capabilities' },
    { id: 'sandbox', name: 'Enhanced Sandbox' },
    { id: 'integration', name: 'System Integration' },
    { id: 'custom', name: 'Custom Tests' }
  ];
  
  // Test definitions
  const testDefinitions: { [key: string]: any[] } = {
    core: [
      { id: 'core-init', name: 'System Initialization', endpoint: '/api/system/initialize' },
      { id: 'core-model', name: 'Model Integration', endpoint: '/api/models/test' },
      { id: 'core-api', name: 'API Management', endpoint: '/api/apiManagement/test' },
      { id: 'core-workflow', name: 'Workflow Engine', endpoint: '/api/workflow/test' },
      { id: 'core-memory', name: 'Memory Module', endpoint: '/api/memory/test' },
      { id: 'core-knowledge', name: 'Knowledge System', endpoint: '/api/knowledge/test' }
    ],
    multimodal: [
      { id: 'multimodal-image', name: 'Image Analysis', endpoint: '/api/multimodal/test/image' },
      { id: 'multimodal-ocr', name: 'OCR Capabilities', endpoint: '/api/multimodal/test/ocr' },
      { id: 'multimodal-description', name: 'Image Description', endpoint: '/api/multimodal/test/description' }
    ],
    reasoning: [
      { id: 'reasoning-cot', name: 'Chain-of-Thought', endpoint: '/api/reasoning/test/cot' },
      { id: 'reasoning-verification', name: 'Self-Verification', endpoint: '/api/reasoning/test/verification' },
      { id: 'reasoning-complex', name: 'Complex Problem Solving', endpoint: '/api/reasoning/test/complex' }
    ],
    learning: [
      { id: 'learning-feedback', name: 'Feedback Collection', endpoint: '/api/learning/test/feedback' },
      { id: 'learning-adaptation', name: 'Model Adaptation', endpoint: '/api/learning/test/adaptation' },
      { id: 'learning-knowledge', name: 'Knowledge Acquisition', endpoint: '/api/learning/test/knowledge' }
    ],
    cloud: [
      { id: 'cloud-connection', name: 'Service Connection', endpoint: '/api/cloudService/test/connection' },
      { id: 'cloud-auth', name: 'Authentication', endpoint: '/api/cloudService/test/auth' },
      { id: 'cloud-data', name: 'Data Exchange', endpoint: '/api/cloudService/test/data' }
    ],
    context: [
      { id: 'context-awareness', name: 'Context Awareness', endpoint: '/api/context/test/awareness' },
      { id: 'context-update', name: 'Knowledge Updates', endpoint: '/api/context/test/update' },
      { id: 'context-entity', name: 'Entity Recognition', endpoint: '/api/context/test/entity' }
    ],
    conversation: [
      { id: 'conversation-dialog', name: 'Dialog Management', endpoint: '/api/conversation/test/dialog' },
      { id: 'conversation-context', name: 'Context Tracking', endpoint: '/api/conversation/test/context' },
      { id: 'conversation-sentiment', name: 'Sentiment Analysis', endpoint: '/api/conversation/test/sentiment' }
    ],
    specialized: [
      { id: 'specialized-code', name: 'Code Generation', endpoint: '/api/specialized/test/code' },
      { id: 'specialized-writing', name: 'Creative Writing', endpoint: '/api/specialized/test/writing' },
      { id: 'specialized-problem', name: 'Problem Solving', endpoint: '/api/specialized/test/problem' }
    ],
    sandbox: [
      { id: 'sandbox-shell', name: 'Shell Commands', endpoint: '/api/enhancedSandbox/test/shell' },
      { id: 'sandbox-internet', name: 'Internet Access', endpoint: '/api/enhancedSandbox/test/internet' },
      { id: 'sandbox-auth', name: 'Website Authentication', endpoint: '/api/enhancedSandbox/test/auth' }
    ],
    integration: [
      { id: 'integration-workflow', name: 'Workflow Integration', endpoint: '/api/integration/test/workflow' },
      { id: 'integration-components', name: 'Component Integration', endpoint: '/api/integration/test/components' },
      { id: 'integration-e2e', name: 'End-to-End Test', endpoint: '/api/integration/test/e2e' }
    ],
    custom: []
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Run a single test
  const runTest = async (test: any) => {
    try {
      setError(null);
      setTestOutput(prev => `${prev}\nRunning test: ${test.name}...\n`);
      
      const response = await axios.post(test.endpoint);
      
      const result = {
        success: response.data.success,
        message: response.data.message,
        details: response.data.details || {},
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: result
      }));
      
      setTestOutput(prev => `${prev}Result: ${result.success ? 'PASS' : 'FAIL'}\nMessage: ${result.message}\n\n`);
      
      return result;
    } catch (err) {
      console.error(`Error running test ${test.name}:`, err);
      
      const result = {
        success: false,
        message: `Error: ${err.response?.data?.message || err.message}`,
        details: {},
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: result
      }));
      
      setTestOutput(prev => `${prev}Result: FAIL\nError: ${err.response?.data?.message || err.message}\n\n`);
      
      return result;
    }
  };
  
  // Run all tests in a category
  const runCategoryTests = async (categoryId: string) => {
    setLoading(true);
    setTestOutput(`Running all tests in category: ${categoryId}\n\n`);
    
    const tests = testDefinitions[categoryId] || [];
    const results = [];
    
    for (const test of tests) {
      const result = await runTest(test);
      results.push(result);
    }
    
    const passCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    setTestOutput(prev => `${prev}Category Summary: ${passCount}/${totalCount} tests passed\n`);
    setLoading(false);
  };
  
  // Run all tests
  const runAllTests = async () => {
    setLoading(true);
    setTestOutput('Running all tests...\n\n');
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const category of testCategories) {
      if (category.id === 'custom') continue; // Skip custom tests
      
      setTestOutput(prev => `${prev}Category: ${category.name}\n`);
      
      const tests = testDefinitions[category.id] || [];
      totalTests += tests.length;
      
      for (const test of tests) {
        const result = await runTest(test);
        if (result.success) passedTests++;
      }
      
      setTestOutput(prev => `${prev}\n`);
    }
    
    setTestOutput(prev => `${prev}Overall Summary: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)\n`);
    setLoading(false);
  };
  
  // Run custom test
  const runCustomTest = async () => {
    if (!customTestInput.trim()) {
      setError('Please enter a custom test script');
      return;
    }
    
    setLoading(true);
    setError(null);
    setTestOutput('Running custom test...\n\n');
    
    try {
      const response = await axios.post('/api/test/custom', {
        script: customTestInput
      });
      
      setTestOutput(prev => `${prev}${response.data.output}\n\nResult: ${response.data.success ? 'PASS' : 'FAIL'}\n`);
    } catch (err) {
      console.error('Error running custom test:', err);
      setError(`Failed to run custom test: ${err.response?.data?.message || err.message}`);
      setTestOutput(prev => `${prev}Error: ${err.response?.data?.message || err.message}\n`);
    } finally {
      setLoading(false);
    }
  };
  
  // Get test result status
  const getTestStatus = (testId: string) => {
    const result = testResults[testId];
    if (!result) return 'pending';
    return result.success ? 'pass' : 'fail';
  };
  
  // Render test item
  const renderTestItem = (test: any) => {
    const status = getTestStatus(test.id);
    
    return (
      <ListItem key={test.id} divider>
        <ListItemText 
          primary={test.name} 
          secondary={testResults[test.id]?.message || 'Not run yet'} 
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {status === 'pending' && (
            <Chip label="Not Run" color="default" size="small" />
          )}
          {status === 'pass' && (
            <Chip icon={<CheckIcon />} label="Pass" color="success" size="small" />
          )}
          {status === 'fail' && (
            <Chip icon={<ErrorIcon />} label="Fail" color="error" size="small" />
          )}
          <IconButton 
            size="small" 
            onClick={() => runTest(test)}
            disabled={loading}
          >
            <PlayArrowIcon />
          </IconButton>
        </Box>
      </ListItem>
    );
  };
  
  // Render test category
  const renderTestCategory = (categoryId: string) => {
    const tests = testDefinitions[categoryId] || [];
    
    if (categoryId === 'custom') {
      return (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Enter custom test script:
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            value={customTestInput}
            onChange={(e) => setCustomTestInput(e.target.value)}
            placeholder="// Enter your custom test script here"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={runCustomTest}
            disabled={loading}
            startIcon={<PlayArrowIcon />}
          >
            Run Custom Test
          </Button>
        </Box>
      );
    }
    
    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">
            {tests.length} tests in this category
          </Typography>
          <Button
            variant="outlined"
            onClick={() => runCategoryTests(categoryId)}
            disabled={loading}
            startIcon={<PlayArrowIcon />}
            size="small"
          >
            Run All in Category
          </Button>
        </Box>
        
        <List>
          {tests.map(test => renderTestItem(test))}
        </List>
        
        {tests.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No tests defined for this category
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Suite
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                System Test Controls
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  onClick={runAllTests}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                  sx={{ mr: 1 }}
                >
                  Run All Tests
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setTestResults({})}
                  disabled={loading}
                  startIcon={<RefreshIcon />}
                >
                  Reset Results
                </Button>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 200, overflow: 'auto', bgcolor: 'background.default', p: 2, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {testOutput || 'Test output will appear here...'}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {testCategories.map((category, index) => (
                <Tab key={category.id} label={category.name} />
              ))}
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {testCategories.map((category, index) => (
                <Box key={category.id} hidden={activeTab !== index}>
                  {activeTab === index && renderTestCategory(category.id)}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TestSuite;
