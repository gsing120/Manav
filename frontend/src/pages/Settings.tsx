import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

const Settings = () => {
  // State for API keys
  const [apiKeys, setApiKeys] = useState({
    google: '',
    anthropic: '',
    openai: ''
  });
  
  const [showApiKeys, setShowApiKeys] = useState({
    google: false,
    anthropic: false,
    openai: false
  });
  
  // State for custom providers
  const [customProviders, setCustomProviders] = useState([]);
  const [newProvider, setNewProvider] = useState({ name: '', apiKey: '', endpoint: '' });
  
  // State for application settings
  const [settings, setSettings] = useState({
    defaultModel: 'gemini-pro',
    darkMode: true,
    saveHistory: true,
    autoUpdate: true
  });
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [models, setModels] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, provider: null });
  const [verificationResults, setVerificationResults] = useState({});

  useEffect(() => {
    // Fetch settings, API keys, and models on component mount
    fetchSettings();
    fetchApiKeys();
    fetchModels();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load settings',
        severity: 'error'
      });
    }
  };

  const fetchApiKeys = async () => {
    try {
      // Get provider information (not actual keys)
      const providersResponse = await axios.get('/api/management/providers');
      
      // Get custom providers
      const customProvidersArray = Object.keys(providersResponse.data)
        .filter(key => key.startsWith('custom-'))
        .map(key => ({
          id: key,
          name: key.replace('custom-', ''),
          apiKey: '********',
          endpoint: 'https://api.example.com' // We don't get the actual endpoint back for security
        }));
      
      setCustomProviders(customProvidersArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load API keys',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/models');
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleApiKeyChange = (provider, value) => {
    setApiKeys({
      ...apiKeys,
      [provider]: value
    });
  };

  const handleToggleShowApiKey = (provider) => {
    setShowApiKeys({
      ...showApiKeys,
      [provider]: !showApiKeys[provider]
    });
  };

  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  const handleNewProviderChange = (field, value) => {
    setNewProvider({
      ...newProvider,
      [field]: value
    });
  };

  const handleAddCustomProvider = () => {
    if (newProvider.name && newProvider.apiKey && newProvider.endpoint) {
      // Add to UI immediately for better UX
      setCustomProviders([
        ...customProviders, 
        { 
          id: `custom-${Date.now()}`,
          name: newProvider.name, 
          apiKey: '********', 
          endpoint: newProvider.endpoint 
        }
      ]);
      
      // Reset form
      setNewProvider({ name: '', apiKey: '', endpoint: '' });
    }
  };

  const handleRemoveCustomProvider = (providerId) => {
    setConfirmDialog({
      open: true,
      provider: providerId
    });
  };

  const confirmRemoveProvider = async () => {
    const providerId = confirmDialog.provider;
    
    try {
      await axios.delete(`/api/management/keys/${providerId}`);
      
      // Update UI
      const updated = customProviders.filter(p => p.id !== providerId);
      setCustomProviders(updated);
      
      setSnackbar({
        open: true,
        message: 'Provider removed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing provider:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove provider',
        severity: 'error'
      });
    }
    
    // Close dialog
    setConfirmDialog({ open: false, provider: null });
  };

  const handleVerifyApiKey = async (provider, apiKey) => {
    if (!apiKey) return;
    
    setVerifying(true);
    setVerificationResults({
      ...verificationResults,
      [provider]: 'verifying'
    });
    
    try {
      const response = await axios.post('/api/management/keys/verify', {
        provider,
        apiKey
      });
      
      setVerificationResults({
        ...verificationResults,
        [provider]: response.data.valid ? 'valid' : 'invalid'
      });
    } catch (error) {
      console.error('Error verifying API key:', error);
      setVerificationResults({
        ...verificationResults,
        [provider]: 'error'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      // Save application settings
      await axios.put('/api/settings', settings);
      
      // Save API keys
      for (const [provider, apiKey] of Object.entries(apiKeys)) {
        if (apiKey) {
          await axios.post('/api/management/keys', {
            provider,
            apiKey
          });
        }
      }
      
      // Save custom providers
      if (newProvider.name && newProvider.apiKey && newProvider.endpoint) {
        await axios.post('/api/management/keys', {
          provider: `custom-${newProvider.name.toLowerCase().replace(/\s+/g, '-')}`,
          apiKey: newProvider.apiKey,
          endpoint: newProvider.endpoint
        });
      }
      
      // Refresh providers
      await axios.post('/api/management/providers/refresh');
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
      
      // Refresh data
      fetchApiKeys();
      fetchModels();
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getVerificationIcon = (provider) => {
    if (!verificationResults[provider]) return null;
    
    if (verificationResults[provider] === 'verifying') {
      return <CircularProgress size={20} />;
    } else if (verificationResults[provider] === 'valid') {
      return <CheckCircleIcon color="success" />;
    } else if (verificationResults[provider] === 'invalid' || verificationResults[provider] === 'error') {
      return <ErrorIcon color="error" />;
    }
    
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }} className="settings-section">
        <Typography variant="h5" gutterBottom>
          API Keys
        </Typography>
        <Typography variant="body2" paragraph color="text.secondary">
          Enter your API keys for different model providers
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Google API Key (Gemini)"
              value={apiKeys.google}
              onChange={(e) => handleApiKeyChange('google', e.target.value)}
              margin="normal"
              type={showApiKeys.google ? "text" : "password"}
              placeholder="AIzaSyA..."
              InputProps={{
                endAdornment: (
                  <Box sx={{ display: 'flex' }}>
                    {getVerificationIcon('google')}
                    <IconButton 
                      onClick={() => handleToggleShowApiKey('google')}
                      edge="end"
                    >
                      {showApiKeys.google ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    <Button 
                      size="small" 
                      onClick={() => handleVerifyApiKey('google', apiKeys.google)}
                      disabled={!apiKeys.google || verifying}
                      sx={{ ml: 1 }}
                    >
                      Verify
                    </Button>
                  </Box>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Anthropic API Key (Claude)"
              value={apiKeys.anthropic}
              onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
              margin="normal"
              type={showApiKeys.anthropic ? "text" : "password"}
              placeholder="sk-ant-..."
              InputProps={{
                endAdornment: (
                  <Box sx={{ display: 'flex' }}>
                    {getVerificationIcon('anthropic')}
                    <IconButton 
                      onClick={() => handleToggleShowApiKey('anthropic')}
                      edge="end"
                    >
                      {showApiKeys.anthropic ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    <Button 
                      size="small" 
                      onClick={() => handleVerifyApiKey('anthropic', apiKeys.anthropic)}
                      disabled={!apiKeys.anthropic || verifying}
                      sx={{ ml: 1 }}
                    >
                      Verify
                    </Button>
                  </Box>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="OpenAI API Key"
              value={apiKeys.openai}
              onChange={(e) => handleApiKeyChange('openai', e.target.value)}
              margin="normal"
              type={showApiKeys.openai ? "text" : "password"}
              placeholder="sk-..."
              InputProps={{
                endAdornment: (
                  <Box sx={{ display: 'flex' }}>
                    {getVerificationIcon('openai')}
                    <IconButton 
                      onClick={() => handleToggleShowApiKey('openai')}
                      edge="end"
                    >
                      {showApiKeys.openai ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    <Button 
                      size="small" 
                      onClick={() => handleVerifyApiKey('openai', apiKeys.openai)}
                      disabled={!apiKeys.openai || verifying}
                      sx={{ ml: 1 }}
                    >
                      Verify
                    </Button>
                  </Box>
                )
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }} className="settings-section">
        <Typography variant="h5" gutterBottom>
          Custom API Providers
        </Typography>
        <Typography variant="body2" paragraph color="text.secondary">
          Add custom model providers and endpoints
        </Typography>
        
        {customProviders.map((provider, index) => (
          <Box key={index} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
            <TextField
              label="Provider Name"
              value={provider.name}
              disabled
              sx={{ mr: 2, flexGrow: 1 }}
            />
            <TextField
              label="API Key"
              type="password"
              value="********"
              disabled
              sx={{ mr: 2, flexGrow: 1 }}
            />
            <TextField
              label="Endpoint URL"
              value={provider.endpoint}
              disabled
              sx={{ mr: 2, flexGrow: 2 }}
            />
            <IconButton color="error" onClick={() => handleRemoveCustomProvider(provider.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        
        <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
          <TextField
            label="Provider Name"
            value={newProvider.name}
            onChange={(e) => handleNewProviderChange('name', e.target.value)}
            sx={{ mr: 2, flexGrow: 1 }}
          />
          <TextField
            label="API Key"
            type="password"
            value={newProvider.apiKey}
            onChange={(e) => handleNewProviderChange('apiKey', e.target.value)}
            sx={{ mr: 2, flexGrow: 1 }}
          />
          <TextField
            label="Endpoint URL"
            value={newProvider.endpoint}
            onChange={(e) => handleNewProviderChange('endpoint', e.target.value)}
            placeholder="https://api.example.com/v1/chat/completions"
            sx={{ mr: 2, flexGrow: 2 }}
          />
          <IconButton 
            color="primary" 
            onClick={handleAddCustomProvider}
            disabled={!newProvider.name || !newProvider.apiKey || !newProvider.endpoint}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }} className="settings-section">
        <Typography variant="h5" gutterBottom>
          Application Settings
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Default Model</InputLabel>
          <Select
            value={settings.defaultModel}
            label="Default Model"
            onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
          >
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Switch 
              checked={settings.darkMode} 
              onChange={(e) => handleSettingChange('darkMode', e.target.checked)} 
            />
          }
          label="Dark Mode"
          sx={{ display: 'block', mt: 2 }}
        />
        
        <FormControlLabel
          control={
            <Switch 
              checked={settings.saveHistory} 
              onChange={(e) => handleSettingChange('saveHistory', e.target.checked)} 
            />
          }
          label="Save Chat History"
          sx={{ display: 'block', mt: 1 }}
        />
        
        <FormControlLabel
          control={
            <Switch 
              checked={settings.autoUpdate} 
              onChange={(e) => handleSettingChange('autoUpdate', e.target.checked)} 
            />
          }
          label="Automatic Updates"
          sx={{ display: 'block', mt: 1 }}
        />
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, provider: null })}
      >
        <DialogTitle>Remove Provider</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this provider? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, provider: null })}>
            Cancel
          </Button>
          <Button onClick={confirmRemoveProvider} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
