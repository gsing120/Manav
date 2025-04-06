import express from 'express';
import { APIManagementController } from '../controllers/APIManagementController';
import { SettingsService } from '../services/SettingsService';
import { ModelIntegrationService } from '../services/ModelIntegrationService';
import { FunctionService } from '../services/FunctionService';

// Create services
const settingsService = new SettingsService();
const functionService = new FunctionService();
const modelIntegrationService = new ModelIntegrationService(functionService, settingsService);

// Create controller
const apiManagementController = new APIManagementController(settingsService, modelIntegrationService);

const router = express.Router();

// API key routes
router.get('/providers', apiManagementController.getProviders);
router.post('/keys', apiManagementController.setAPIKey);
router.delete('/keys/:provider', apiManagementController.removeAPIKey);
router.post('/keys/verify', apiManagementController.verifyAPIKey);

export default router;
