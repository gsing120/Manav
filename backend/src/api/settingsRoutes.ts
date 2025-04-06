import express from 'express';
import { SettingsController } from '../controllers/SettingsController';

const router = express.Router();
const settingsController = new SettingsController();

// Get all settings
router.get('/', settingsController.getSettings);

// Update settings
router.put('/', settingsController.updateSettings);

// Get API keys
router.get('/api-keys', settingsController.getApiKeys);

// Update API keys
router.put('/api-keys', settingsController.updateApiKeys);

// Add custom provider
router.post('/providers', settingsController.addCustomProvider);

// Remove custom provider
router.delete('/providers/:providerId', settingsController.removeCustomProvider);

export default router;
