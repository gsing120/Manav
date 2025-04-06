import express from 'express';
import { ModelIntegrationController } from '../controllers/ModelIntegrationController';
import { ModelIntegrationService } from '../services/ModelIntegrationService';
import { FunctionService } from '../services/FunctionService';
import { SettingsService } from '../services/SettingsService';

// Create services
const functionService = new FunctionService();
const settingsService = new SettingsService();
const modelIntegrationService = new ModelIntegrationService(functionService, settingsService);

// Create controller
const modelIntegrationController = new ModelIntegrationController(modelIntegrationService);

const router = express.Router();

// Conversation routes
router.post('/conversations', modelIntegrationController.createConversation);
router.get('/conversations/:conversationId', modelIntegrationController.getConversation);

// Message routes
router.post('/messages', modelIntegrationController.sendMessage);
router.post('/messages/stream', modelIntegrationController.streamMessage);

// Provider routes
router.post('/providers/refresh', modelIntegrationController.refreshProviders);

export default router;
