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
  CardActions,
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
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import CloudIcon from '@mui/icons-material/Cloud';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import SpeedIcon from '@mui/icons-material/Speed';
import axios from 'axios';

/**
 * SystemDashboard component for monitoring and controlling the integrated system
 */
const SystemDashboard: React.FC = () => {
  // System status state
  const [systemStatus, setSystemStatus] = useState<any>({
    initialized: false,
    progress: 0,
    status: 'Unknown',
    components: {}
  });
  
  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(false);
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({
    memoryUsage: 0,
    cpuUsage: 0,
    responseTime: 0,
    activeConnections: 0,
    uptime: 0
  });
  
  // Component groups for organization
  const componentGroups = {
    core: ['model', 'api', 'workflow', 'memory', 'knowledge'],
    advanced: ['multimodal', 'reasoning', 'learning', 'context', 'specialized'],
    infrastructure: ['sandbox', 'windows', 'cloud']
  };
  
  // Load system status on component mount
  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch system status from API
  const fetchSystemStatus = async () => {
    try {
      setError(null);
      const response = await axios.get('/api/system/status');
      setSystemStatus(response.data);
      
      // Also fetch performance metrics
      fetchPerformanceMetrics();
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching system status:', err);
      setError('Failed to fetch system status');
      setLoading(false);
    }
  };
  
  // Fetch performance metrics
  const fetchPerformanceMetrics = async () => {
    try {
      // In a real implementation, this would fetch actual metrics
      // For now, we'll simulate with random values
      setPerformanceMetrics({
        memoryUsage: Math.floor(Math.random() * 60) + 20, // 20-80%
        cpuUsage: Math.floor(Math.random() * 50) + 10, // 10-60%
        responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        activeConnections: Math.floor(Math.random() * 10) + 1, // 1-10
        uptime: Math.floor(Math.random() * 24) + 1 // 1-24 hours
      });
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
    }
  };
  
  // Initialize system
  const handleInitializeSystem = async () => {
    try {
      setInitializing(true);
      setError(null);
      
      const response = await axios.post('/api/system/initialize');
      
      if (response.data.success) {
        // Refresh status after initialization
        fetchSystemStatus();
      } else {
        setError(`Initialization failed: ${response.data.message}`);
      }
    } catch (err) {
      console.error('Error initializing system:', err);
      setError('Failed to initialize system');
    } finally {
      setInitializing(false);
    }
  };
  
  // Optimize system
  const handleOptimizeSystem = async () => {
    try {
      setOptimizing(true);
      setError(null);
      
      const response = await axios.post('/api/system/optimize');
      
      if (response.data.success) {
        // Refresh status after optimization
        fetchSystemStatus();
      } else {
        setError(`Optimization failed: ${response.data.message}`);
      }
    } catch (err) {
      console.error('Error optimizing system:', err);
      setError('Failed to optimize system');
    } finally {
      setOptimizing(false);
    }
  };
  
  // Get component status icon
  const getComponentStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircleIcon color="success" /> : 
      <ErrorIcon color="error" />;
  };
  
  // Get component icon based on name
  const getComponentIcon = (name: string) => {
    switch (name) {
      case 'model':
        return <SmartToyIcon />;
      case 'api':
        return <CloudIcon />;
      case 'workflow':
        return <PsychologyIcon />;
      case 'memory':
        return <MemoryIcon />;
      case 'knowledge':
        return <StorageIcon />;
      case 'multimodal':
        return <CodeIcon />;
      case 'reasoning':
        return <PsychologyIcon />;
      case 'learning':
        return <PsychologyIcon />;
      case 'context':
        return <StorageIcon />;
      case 'specialized':
        return <CodeIcon />;
      case 'sandbox':
        return <CodeIcon />;
      case 'windows':
        return <SettingsIcon />;
      case 'cloud':
        return <CloudIcon />;
      default:
        return <SmartToyIcon />;
    }
  };
  
  // Format component name for display
  const formatComponentName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  
  // Render component status
  const renderComponentStatus = (name: string) => {
    const status = systemStatus.components[name] || false;
    
    return (
      <ListItem key={name}>
        <ListItemIcon>
          {getComponentIcon(name)}
        </ListItemIcon>
        <ListItemText primary={formatComponentName(name)} />
        <Chip 
          icon={getComponentStatusIcon(status)} 
          label={status ? 'Active' : 'Inactive'} 
          color={status ? 'success' : 'error'} 
          size="small" 
        />
      </ListItem>
    );
  };
  
  // Render component group
  const renderComponentGroup = (title: string, components: string[]) => {
    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {components.map(name => renderComponentStatus(name))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  };
  
  // Get status color
  const getStatusColor = () => {
    if (systemStatus.initialized) return 'success';
    if (systemStatus.progress > 0) return 'info';
    return 'error';
  };
  
  // Render performance metric
  const renderPerformanceMetric = (label: string, value: number, unit: string, threshold: number = 80) => {
    const isHigh = value > threshold;
    
    return (
      <Grid item xs={6} md={3}>
        <Tooltip title={isHigh ? 'High usage detected' : 'Normal usage'}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h5" color={isHigh ? 'error' : 'primary'}>
                {value}{unit}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={value} 
                color={isHigh ? 'error' : 'primary'} 
                sx={{ mt: 1 }} 
              />
            </CardContent>
          </Card>
        </Tooltip>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* System Status Card */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">System Status</Typography>
                <Button 
                  startIcon={<RefreshIcon />} 
                  onClick={fetchSystemStatus}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Status: 
                  <Chip 
                    label={systemStatus.status} 
                    color={getStatusColor()} 
                    sx={{ ml: 1 }} 
                  />
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  Initialization Progress:
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={systemStatus.progress} 
                      color={getStatusColor()} 
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {`${Math.round(systemStatus.progress)}%`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={handleInitializeSystem}
                  disabled={systemStatus.initialized || initializing}
                  startIcon={initializing ? <CircularProgress size={20} /> : null}
                >
                  {initializing ? 'Initializing...' : 'Initialize System'}
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={handleOptimizeSystem}
                  disabled={!systemStatus.initialized || optimizing}
                  startIcon={optimizing ? <CircularProgress size={20} /> : <SpeedIcon />}
                >
                  {optimizing ? 'Optimizing...' : 'Optimize System'}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Performance Metrics Card */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Performance Metrics
              </Typography>
              
              <Grid container spacing={2}>
                {renderPerformanceMetric('Memory Usage', performanceMetrics.memoryUsage, '%')}
                {renderPerformanceMetric('CPU Usage', performanceMetrics.cpuUsage, '%')}
                {renderPerformanceMetric('Response Time', performanceMetrics.responseTime, 'ms', 200)}
                {renderPerformanceMetric('Active Connections', performanceMetrics.activeConnections, '', 15)}
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  System Uptime: {performanceMetrics.uptime} hours
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Component Status Cards */}
          <Grid item xs={12} md={4}>
            {renderComponentGroup('Core Components', componentGroups.core)}
          </Grid>
          
          <Grid item xs={12} md={4}>
            {renderComponentGroup('Advanced Capabilities', componentGroups.advanced)}
          </Grid>
          
          <Grid item xs={12} md={4}>
            {renderComponentGroup('Infrastructure', componentGroups.infrastructure)}
          </Grid>
          
          {/* System Information Card */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                System Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>Application:</strong> Manus Twin
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Version:</strong> 1.0.0
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Platform:</strong> Windows
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>Node.js Version:</strong> 20.18.0
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Electron Version:</strong> 28.1.0
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Database:</strong> Local SQLite
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SystemDashboard;
