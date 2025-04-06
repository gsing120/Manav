import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';

const Dashboard = () => {
  const [models, setModels] = useState([]);
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState('loading');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Fetch models and providers on component mount
    fetchModels();
    fetchProviders();
    checkSystemStatus();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/models');
      setModels(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Failed to load models. Please check your connection.');
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get('/api/management/providers');
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError('Failed to load provider information.');
    }
  };

  const checkSystemStatus = async () => {
    try {
      const response = await axios.get('/api/health');
      if (response.data.status === 'ok') {
        setSystemStatus('ready');
      } else {
        setSystemStatus('error');
      }
    } catch (error) {
      console.error('Error checking system status:', error);
      setSystemStatus('error');
    }
  };

  const handleModelSelect = (modelId) => {
    // Update default model in settings
    axios.put('/api/settings', { defaultModel: modelId })
      .then(() => {
        setSnackbar({
          open: true,
          message: `${modelId} set as default model`,
          severity: 'success'
        });
      })
      .catch(error => {
        console.error('Error setting default model:', error);
        setSnackbar({
          open: true,
          message: 'Failed to set default model',
          severity: 'error'
        });
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getProviderStatus = (provider) => {
    return providers[provider] ? 'Configured' : 'Not Configured';
  };

  const getProviderStatusColor = (provider) => {
    return providers[provider] ? 'success.main' : 'error.main';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to Manus Twin - a local Windows application with the same architecture as Manus.im
      </Typography>
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Available Models
      </Typography>
      <Grid container spacing={3}>
        {models.map((model) => (
          <Grid item xs={12} sm={6} md={4} key={model.id}>
            <Card className="model-card">
              <CardActionArea onClick={() => handleModelSelect(model.id)}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {model.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Provider: {model.provider}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Status:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ color: getProviderStatusColor(model.provider) }}
                    >
                      {getProviderStatus(model.provider)}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Capabilities: {model.capabilities?.join(', ')}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        System Status
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          Status: {' '}
          <span style={{ 
            color: systemStatus === 'ready' ? 'green' : 
                  systemStatus === 'loading' ? 'orange' : 'red' 
          }}>
            {systemStatus === 'ready' ? 'Ready' : 
             systemStatus === 'loading' ? 'Loading' : 'Error'}
          </span>
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">API Providers</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1">Google (Gemini)</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: getProviderStatusColor('google') }}
                >
                  {getProviderStatus('google')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1">Anthropic (Claude)</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: getProviderStatusColor('anthropic') }}
                >
                  {getProviderStatus('anthropic')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1">Custom Providers</Typography>
                <Typography 
                  variant="body2"
                >
                  {Object.keys(providers).filter(p => p.startsWith('custom-')).length} Configured
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.href = '/#/settings'}
          >
            Configure API Keys
          </Button>
        </Box>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
