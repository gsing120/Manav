import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cloud-tabpanel-${index}`}
      aria-labelledby={`cloud-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * CloudServiceIntegrationPage component for connecting to and using cloud services
 */
const CloudServiceIntegrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Services state
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  
  // Connections state
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<any | null>(null);
  
  // Dialog state
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectServiceId, setConnectServiceId] = useState('');
  const [authConfig, setAuthConfig] = useState<any>({});
  
  // Endpoint call state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [callConnectionId, setCallConnectionId] = useState('');
  const [callEndpointId, setCallEndpointId] = useState('');
  const [callParams, setCallParams] = useState<any>({});
  const [callQueryParams, setCallQueryParams] = useState<any>({});
  const [callData, setCallData] = useState<any>({});
  const [callResult, setCallResult] = useState<any | null>(null);
  
  // Load services and connections on component mount
  useEffect(() => {
    loadServices();
    loadConnections();
  }, []);
  
  /**
   * Handle tab change
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Refresh data when switching tabs
    if (newValue === 0) {
      loadServices();
    } else if (newValue === 1) {
      loadConnections();
    }
  };
  
  /**
   * Load available services
   */
  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/cloud/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Load active connections
   */
  const loadConnections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/cloud/connections');
      setConnections(response.data);
    } catch (error) {
      console.error('Error loading connections:', error);
      setError('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle service selection
   */
  const handleSelectService = async (serviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/cloud/services/${serviceId}`);
      setSelectedService(response.data);
    } catch (error) {
      console.error('Error selecting service:', error);
      setError('Failed to load service details');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle connection selection
   */
  const handleSelectConnection = async (connectionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/cloud/connections/${connectionId}`);
      setSelectedConnection(response.data);
      
      // Load service details for this connection
      const serviceResponse = await axios.get(`/api/cloud/services/${response.data.serviceId}`);
      setSelectedService(serviceResponse.data);
    } catch (error) {
      console.error('Error selecting connection:', error);
      setError('Failed to load connection details');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Open connect dialog
   */
  const handleOpenConnectDialog = (serviceId: string) => {
    setConnectServiceId(serviceId);
    
    // Find service to get default auth config
    const service = services.find(s => s.id === serviceId);
    if (service && service.authConfig) {
      setAuthConfig({ ...service.authConfig });
    } else {
      setAuthConfig({});
    }
    
    setConnectDialogOpen(true);
  };
  
  /**
   * Close connect dialog
   */
  const handleCloseConnectDialog = () => {
    setConnectDialogOpen(false);
    setConnectServiceId('');
    setAuthConfig({});
  };
  
  /**
   * Handle connect to service
   */
  const handleConnectToService = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/cloud/connect', {
        serviceId: connectServiceId,
        authConfig
      });
      
      if (response.data.success) {
        // Close dialog
        handleCloseConnectDialog();
        
        // Refresh connections
        loadConnections();
        
        // Switch to connections tab
        setActiveTab(1);
      } else {
        setError(response.data.error || 'Failed to connect to service');
      }
    } catch (error) {
      console.error('Error connecting to service:', error);
      setError('Failed to connect to service');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle disconnect from service
   */
  const handleDisconnectFromService = async (connectionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.delete(`/api/cloud/connections/${connectionId}`);
      
      if (response.data.success) {
        // Refresh connections
        loadConnections();
        
        // Clear selected connection if it was the one disconnected
        if (selectedConnection && selectedConnection.id === connectionId) {
          setSelectedConnection(null);
        }
      } else {
        setError(response.data.error || 'Failed to disconnect from service');
      }
    } catch (error) {
      console.error('Error disconnecting from service:', error);
      setError('Failed to disconnect from service');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Open call endpoint dialog
   */
  const handleOpenCallDialog = (connectionId: string) => {
    setCallConnectionId(connectionId);
    setCallEndpointId('');
    setCallParams({});
    setCallQueryParams({});
    setCallData({});
    setCallResult(null);
    setCallDialogOpen(true);
  };
  
  /**
   * Close call endpoint dialog
   */
  const handleCloseCallDialog = () => {
    setCallDialogOpen(false);
    setCallConnectionId('');
    setCallEndpointId('');
    setCallParams({});
    setCallQueryParams({});
    setCallData({});
    setCallResult(null);
  };
  
  /**
   * Handle call service endpoint
   */
  const handleCallServiceEndpoint = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/cloud/call', {
        connectionId: callConnectionId,
        endpointId: callEndpointId,
        params: callParams,
        queryParams: callQueryParams,
        data: callData
      });
      
      setCallResult(response.data);
    } catch (error) {
      console.error('Error calling service endpoint:', error);
      setError('Failed to call service endpoint');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle auth config change
   */
  const handleAuthConfigChange = (key: string, value: any) => {
    setAuthConfig({
      ...authConfig,
      [key]: value
    });
  };
  
  /**
   * Handle call params change
   */
  const handleCallParamsChange = (key: string, value: any) => {
    setCallParams({
      ...callParams,
      [key]: value
    });
  };
  
  /**
   * Handle call query params change
   */
  const handleCallQueryParamsChange = (key: string, value: any) => {
    setCallQueryParams({
      ...callQueryParams,
      [key]: value
    });
  };
  
  /**
   * Handle call data change
   */
  const handleCallDataChange = (key: string, value: any) => {
    setCallData({
      ...callData,
      [key]: value
    });
  };
  
  /**
   * Render service card
   */
  const renderServiceCard = (service: any) => {
    const isSelected = selectedService && selectedService.id === service.id;
    
    return (
      <Card 
        key={service.id} 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          border: isSelected ? '2px solid' : 'none',
          borderColor: 'primary.main'
        }}
        onClick={() => handleSelectService(service.id)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              {service.name}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LinkIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConnectDialog(service.id);
              }}
            >
              Connect
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {service.description}
          </Typography>
          
          <Box sx={{ display: 'flex', mt: 1 }}>
            <Chip 
              label={`Auth: ${service.authProvider}`} 
              size="small" 
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Data: ${service.dataTransformer}`} 
              size="small" 
            />
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  /**
   * Render connection card
   */
  const renderConnectionCard = (connection: any) => {
    const isSelected = selectedConnection && selectedConnection.id === connection.id;
    const service = services.find(s => s.id === connection.serviceId);
    
    return (
      <Card 
        key={connection.id} 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          border: isSelected ? '2px solid' : 'none',
          borderColor: 'primary.main'
        }}
        onClick={() => handleSelectConnection(connection.id)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              {service ? service.name : connection.serviceId}
            </Typography>
            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayArrowIcon />}
                sx={{ mr: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCallDialog(connection.id);
                }}
              >
                Call
              </Button>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDisconnectFromService(connection.id);
                }}
              >
                <LinkOffIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Connected: {new Date(connection.connectedAt).toLocaleString()}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            ID: {connection.id}
          </Typography>
        </CardContent>
      </Card>
    );
  };
  
  /**
   * Render service details
   */
  const renderServiceDetails = () => {
    if (!selectedService) {
      return (
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="body1" color="text.secondary" align="center">
            Select a service to view details
          </Typography>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h5" gutterBottom>
          {selectedService.name}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {selectedService.description}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Service Details
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              ID: {selectedService.id}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Base URL: {selectedService.baseUrl}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Auth Provider: {selectedService.authProvider}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Data Transformer: {selectedService.dataTransformer}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Available Endpoints
        </Typography>
        
        {selectedService.endpoints && Object.entries(selectedService.endpoints).length > 0 ? (
          <List>
            {Object.entries(selectedService.endpoints).map(([id, endpoint]: [string, any]) => (
              <Accordion key={id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    <strong>{id}</strong> - {endpoint.method} {endpoint.path}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Method: {endpoint.method}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Path: {endpoint.path}
                  </Typography>
                  {endpoint.contentType && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Content Type: {endpoint.contentType}
                    </Typography>
                  )}
                  {endpoint.params && Object.keys(endpoint.params).length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        Default Parameters:
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {Object.entries(endpoint.params).map(([key, value]: [string, any]) => (
                          <Typography key={key} variant="body2" color="text.secondary">
                            {key}: {JSON.stringify(value)}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No endpoints available
          </Typography>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={() => handleOpenConnectDialog(selectedService.id)}
          >
            Connect to {selectedService.name}
          </Button>
        </Box>
      </Paper>
    );
  };
  
  /**
   * Render connection details
   */
  const renderConnectionDetails = () => {
    if (!selectedConnection) {
      return (
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="body1" color="text.secondary" align="center">
            Select a connection to view details
          </Typography>
        </Paper>
      );
    }
    
    const service = services.find(s => s.id === selectedConnection.serviceId);
    
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h5" gutterBottom>
          {service ? service.name : selectedConnection.serviceId} Connection
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Connection ID: {selectedConnection.id}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Service ID: {selectedConnection.serviceId}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Status: {selectedConnection.connected ? 'Connected' : 'Disconnected'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Connected At: {new Date(selectedConnection.connectedAt).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
        
        {service && service.endpoints && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Available Endpoints
            </Typography>
            
            <List>
              {Object.entries(service.endpoints).map(([id, endpoint]: [string, any]) => (
                <ListItem 
                  key={id} 
                  button
                  onClick={() => {
                    setCallConnectionId(selectedConnection.id);
                    setCallEndpointId(id);
                    setCallParams({});
                    setCallQueryParams({});
                    setCallData({});
                    setCallResult(null);
                    setCallDialogOpen(true);
                  }}
                >
                  <ListItemText
                    primary={id}
                    secondary={`${endpoint.method} ${endpoint.path}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="call">
                      <PlayArrowIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => handleOpenCallDialog(selectedConnection.id)}
          >
            Call Endpoint
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<LinkOffIcon />}
            onClick={() => handleDisconnectFromService(selectedConnection.id)}
          >
            Disconnect
          </Button>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        <CloudIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Cloud Service Integration
      </Typography>
      
      <Typography variant="body1" paragraph>
        Connect to and interact with various cloud services through a unified interface.
        This framework supports authentication, data transformation, and service discovery.
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="cloud service tabs">
          <Tab label="Available Services" icon={<CloudIcon />} iconPosition="start" />
          <Tab label="Active Connections" icon={<LinkIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Available Services
            </Typography>
            
            {services.length > 0 ? (
              services.map(service => renderServiceCard(service))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No services available
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            {renderServiceDetails()}
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Active Connections
            </Typography>
            
            {connections.length > 0 ? (
              connections.map(connection => renderConnectionCard(connection))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active connections
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            {renderConnectionDetails()}
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onClose={handleCloseConnectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Connect to Service</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Service: {services.find(s => s.id === connectServiceId)?.name || connectServiceId}
            </Typography>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            Authentication Configuration
          </Typography>
          
          {Object.entries(authConfig).map(([key, value]) => (
            <TextField
              key={key}
              label={key}
              value={value}
              onChange={(e) => handleAuthConfigChange(key, e.target.value)}
              fullWidth
              margin="normal"
              type={key.includes('secret') || key.includes('password') || key.includes('key') ? 'password' : 'text'}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConnectDialog}>Cancel</Button>
          <Button 
            onClick={handleConnectToService} 
            variant="contained" 
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <LinkIcon />}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Call Endpoint Dialog */}
      <Dialog open={callDialogOpen} onClose={handleCloseCallDialog} maxWidth="md" fullWidth>
        <DialogTitle>Call Service Endpoint</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Connection: {connections.find(c => c.id === callConnectionId)?.id || callConnectionId}
            </Typography>
          </Box>
          
          {selectedService && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Endpoint</InputLabel>
              <Select
                value={callEndpointId}
                onChange={(e) => setCallEndpointId(e.target.value)}
                label="Endpoint"
              >
                {Object.entries(selectedService.endpoints).map(([id, endpoint]: [string, any]) => (
                  <MenuItem key={id} value={id}>
                    {id} - {endpoint.method} {endpoint.path}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {callEndpointId && selectedService && selectedService.endpoints[callEndpointId] && (
            <>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Path Parameters
              </Typography>
              
              {selectedService.endpoints[callEndpointId].path.includes('{') ? (
                selectedService.endpoints[callEndpointId].path.match(/\{([^}]+)\}/g)?.map((param: string) => {
                  const paramName = param.substring(1, param.length - 1);
                  return (
                    <TextField
                      key={paramName}
                      label={paramName}
                      value={callParams[paramName] || ''}
                      onChange={(e) => handleCallParamsChange(paramName, e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No path parameters required
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Query Parameters
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.entries(selectedService.endpoints[callEndpointId].params || {}).map(([key, defaultValue]: [string, any]) => (
                  <TextField
                    key={key}
                    label={key}
                    value={callQueryParams[key] !== undefined ? callQueryParams[key] : defaultValue}
                    onChange={(e) => handleCallQueryParamsChange(key, e.target.value)}
                    margin="normal"
                    sx={{ flexBasis: '48%', flexGrow: 1 }}
                  />
                ))}
                
                <TextField
                  label="Add Parameter"
                  placeholder="Parameter name"
                  margin="normal"
                  sx={{ flexBasis: '48%', flexGrow: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      handleCallQueryParamsChange(e.currentTarget.value, '');
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Request Data
              </Typography>
              
              {selectedService.endpoints[callEndpointId].method !== 'GET' ? (
                <TextField
                  label="JSON Data"
                  value={JSON.stringify(callData, null, 2)}
                  onChange={(e) => {
                    try {
                      setCallData(JSON.parse(e.target.value));
                    } catch (error) {
                      // Allow invalid JSON during editing
                    }
                  }}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  GET requests do not support request body
                </Typography>
              )}
              
              {callResult && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Response
                  </Typography>
                  
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <pre style={{ margin: 0, overflow: 'auto' }}>
                      {JSON.stringify(callResult, null, 2)}
                    </pre>
                  </Paper>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCallDialog}>Close</Button>
          <Button 
            onClick={handleCallServiceEndpoint} 
            variant="contained" 
            disabled={isLoading || !callEndpointId}
            startIcon={isLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            Call Endpoint
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CloudServiceIntegrationPage;
