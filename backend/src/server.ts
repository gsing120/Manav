import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import modelRoutes from './api/modelRoutes';
import functionRoutes from './api/functionRoutes';
import settingsRoutes from './api/settingsRoutes';
import modelIntegrationRoutes from './api/modelIntegrationRoutes';
import apiManagementRoutes from './api/apiManagementRoutes';
import workflowRoutes from './workflow/workflowRoutes';
import memoryRoutes from './memory/memoryRoutes';
import knowledgeRoutes from './knowledge/knowledgeRoutes';
import sandboxRoutes from './sandbox/sandboxRoutes';
import enhancedSandboxRoutes from './sandbox/enhancedSandboxRoutes';
import platformRoutes from './platform/platformRoutes';
import deploymentRoutes from './platform/deploymentRoutes';
import multimodalRoutes from './multimodal/multimodalRoutes';
import reasoningRoutes from './reasoning/reasoningRoutes';
import learningRoutes from './learning/learningRoutes';
import cloudServiceRoutes from './cloud/cloudServiceRoutes';
import contextRoutes from './context/contextRoutes';
import specializedRoutes from './specialized/specializedRoutes';

// Import system integration module
import { SystemIntegration } from './integration/SystemIntegration';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize system integration
const systemIntegration = new SystemIntegration();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// API routes
app.use('/api/models', modelRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/integration', modelIntegrationRoutes);
app.use('/api/apiManagement', apiManagementRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/sandbox', sandboxRoutes);
app.use('/api/enhancedSandbox', enhancedSandboxRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/deployment', deploymentRoutes);
app.use('/api/multimodal', multimodalRoutes);
app.use('/api/reasoning', reasoningRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/cloudService', cloudServiceRoutes);
app.use('/api/context', contextRoutes);
app.use('/api/specialized', specializedRoutes);

// System status endpoint
app.get('/api/system/status', async (req, res) => {
  try {
    const status = await systemIntegration.getSystemStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

// System initialization endpoint
app.post('/api/system/initialize', async (req, res) => {
  try {
    const result = await systemIntegration.initializeSystem();
    res.json(result);
  } catch (error) {
    console.error('Error initializing system:', error);
    res.status(500).json({ error: 'Failed to initialize system' });
  }
});

// Serve frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize system on startup
  systemIntegration.initializeSystem()
    .then(() => {
      console.log('System initialized successfully');
    })
    .catch((error) => {
      console.error('Error initializing system:', error);
    });
});

export default app;
