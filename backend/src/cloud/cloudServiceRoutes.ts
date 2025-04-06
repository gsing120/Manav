import express from 'express';
import { Request, Response } from 'express';
import { CloudServiceIntegrationFramework, ServiceDefinition, ServiceConnection } from './CloudServiceIntegrationFramework';

// Create cloud service integration framework
const cloudServiceFramework = new CloudServiceIntegrationFramework();

/**
 * CloudServiceController provides HTTP endpoints for cloud service integration capabilities
 */
export class CloudServiceController {
  /**
   * Get all available services
   */
  getServices = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if framework is initialized
      if (!cloudServiceFramework.isReady()) {
        await cloudServiceFramework.initialize();
      }
      
      // Get all services
      const services = cloudServiceFramework.getServices();
      
      res.status(200).json(services);
    } catch (error) {
      console.error('Error getting services:', error);
      res.status(500).json({ error: 'Failed to get services' });
    }
  };

  /**
   * Get a service by ID
   */
  getService = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if framework is initialized
      if (!cloudServiceFramework.isReady()) {
        await cloudServiceFramework.initialize();
      }
      
      // Get service ID from request
      const { serviceId } = req.params;
      
      if (!serviceId) {
        res.status(400).json({ error: 'Service ID is required' });
        return;
      }
      
      // Get service
      const service = cloudServiceFramework.getService(serviceId);
      
      if (!service) {
        res.status(404).json({ error: `Service '${serviceId}' not found` });
        return;
      }
      
      res.status(200).json(service);
    } catch (error) {
      console.error('Error getting service:', error);
      res.status(500).json({ error: 'Failed to get service' });
    }
  };

  /**
   * Register a new service
   */
  registerService = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if framework is initialized
      if (!cloudServiceFramework.isReady()) {
        await cloudServiceFramework.initialize();
      }
      
      // Get service definition from request
      const serviceDefinition: ServiceDefinition = req.body;
      
      if (!serviceDefinition || !serviceDefinition.id) {
        res.status(400).json({ error: 'Invalid service definition' });
        return;
      }
      
      // Register service
      const success = cloudServiceFramework.registerService(serviceDefinition);
      
      if (!success) {
        res.status(400).json({ error: 'Failed to register service' });
        return;
      }
      
      res.status(201).json({ success: true, serviceId: serviceDefinition.id });
    } catch (error) {
      console.error('Error registering service:', error);
      res.status(500).json({ error: 'Failed to register service' });
    }
  };

  /**
   * Connect to a service
   */
  connectToService = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if framework is initialized
      if (!cloudServiceFramework.isReady()) {
        await cloudServiceFramework.initialize();
      }
      
      // Get service ID and auth config from request
      const { serviceId, authConfig } = req.body;
      
      if (!serviceId) {
        res.status(400).json({ error: 'Service ID is required' });
        return;
      }
      
      // Connect to service
      const connectionId = await cloudServiceFramework.connectToService(serviceId, authConfig);
      
      res.status(200).json({ success: true, connectionId });
    } catch (error) {
      console.error('Error connecting to service:', error);
      res.status(500).json({ error: 'Failed to connect to service' });
    }
  };

  /**
   * Disconnect from a service
   */
  disconnectFromService = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if framework is initialized
      if (!cloudServiceFramework.isReady()) {
        await cloudServiceFramework.initialize();
      }
      
      // Get connection ID from request
      const { connectionId } = req.params;
      
      if (!connectionId) {
        res.status(400).json({ error: 'Connection ID is required' });
        return;
      }
      
      // Disconnect from service
      const success = cloudServiceFramework.disconnectFromService(connectionId);
      
      if (!success) {
        res.status(400).json({ error: 'Failed to disconnect from service' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error disconnecting from service:', error);
      res.status(500).json({ error: 'Failed to disconnect from service' });
    }
  };

  /**
   * Call a service endpoint
   */
  callServiceEndpoint = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if framework is initialized
      if (!cloudServiceFramework.isReady()) {
        await cloudServiceFramework.initialize();
      }
      
      // Get request data
      const { connectionId, endpointId, params, queryParams, data } = req.body;
      
      if (!connectionId || !endpointId) {
        res.status(400).json({ error: 'Connection ID and endpoint ID are required' });
        return;
      }
      
      // Call service endpoint
      const result = await cloudServiceFramework.callServiceEndpoint(
        connectionId,
        endpointId,
        params || {},
        queryParams || {},
        data || null
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error calling service endpoint:', error);
      res.status(500).json({ error: 'Failed to call service endpoint' });
    }
  };

  /**
   * Get all active connections
   */
  getActiveConnections = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if framework is initialized
      if (!cloudServiceFramework.isReady()) {
        await cloudServiceFramework.initialize();
      }
      
      // Get active connections
      const connections = cloudServiceFramework.getActiveConnections();
      
      res.status(200).json(connections);
    } catch (error) {
      console.error('Error getting active connections:', error);
      res.status(500).json({ error: 'Failed to get active connections' });
    }
  };

  /**
   * Get connection details
   */
  getConnectionDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if framework is initialized
      if (!cloudServiceFramework.isReady()) {
        await cloudServiceFramework.initialize();
      }
      
      // Get connection ID from request
      const { connectionId } = req.params;
      
      if (!connectionId) {
        res.status(400).json({ error: 'Connection ID is required' });
        return;
      }
      
      // Get connection details
      const connection = cloudServiceFramework.getConnectionDetails(connectionId);
      
      if (!connection) {
        res.status(404).json({ error: `Connection '${connectionId}' not found` });
        return;
      }
      
      res.status(200).json(connection);
    } catch (error) {
      console.error('Error getting connection details:', error);
      res.status(500).json({ error: 'Failed to get connection details' });
    }
  };

  /**
   * Check if the cloud service framework is ready
   */
  checkStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const isReady = cloudServiceFramework.isReady();
      
      res.status(200).json({
        status: isReady ? 'ready' : 'initializing',
        message: isReady ? 'Cloud service integration framework is ready' : 'Cloud service integration framework is initializing'
      });
    } catch (error) {
      console.error('Error checking cloud service framework status:', error);
      res.status(500).json({ error: 'Failed to check cloud service framework status' });
    }
  };
}

// Create controller
const cloudServiceController = new CloudServiceController();

// Create router
const router = express.Router();

// Cloud service routes
router.get('/status', cloudServiceController.checkStatus);
router.get('/services', cloudServiceController.getServices);
router.get('/services/:serviceId', cloudServiceController.getService);
router.post('/services', cloudServiceController.registerService);
router.post('/connect', cloudServiceController.connectToService);
router.delete('/connections/:connectionId', cloudServiceController.disconnectFromService);
router.post('/call', cloudServiceController.callServiceEndpoint);
router.get('/connections', cloudServiceController.getActiveConnections);
router.get('/connections/:connectionId', cloudServiceController.getConnectionDetails);

export default router;
