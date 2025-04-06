import { Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  /**
   * Get all settings
   */
  getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = await this.settingsService.getSettings();
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).json({ error: 'Failed to retrieve settings' });
    }
  };

  /**
   * Update settings
   */
  updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = req.body;
      const updatedSettings = await this.settingsService.updateSettings(settings);
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  };

  /**
   * Get API keys
   */
  getApiKeys = async (req: Request, res: Response): Promise<void> => {
    try {
      const apiKeys = await this.settingsService.getApiKeys();
      // Don't return actual keys, just provider info
      const safeApiKeys = Object.keys(apiKeys).reduce((acc, provider) => {
        acc[provider] = apiKeys[provider] ? true : false;
        return acc;
      }, {});
      
      res.status(200).json(safeApiKeys);
    } catch (error) {
      console.error('Error getting API keys:', error);
      res.status(500).json({ error: 'Failed to retrieve API keys' });
    }
  };

  /**
   * Update API keys
   */
  updateApiKeys = async (req: Request, res: Response): Promise<void> => {
    try {
      const apiKeys = req.body;
      const updatedApiKeys = await this.settingsService.updateApiKeys(apiKeys);
      
      // Don't return actual keys, just provider info
      const safeApiKeys = Object.keys(updatedApiKeys).reduce((acc, provider) => {
        acc[provider] = updatedApiKeys[provider] ? true : false;
        return acc;
      }, {});
      
      res.status(200).json(safeApiKeys);
    } catch (error) {
      console.error('Error updating API keys:', error);
      res.status(500).json({ error: 'Failed to update API keys' });
    }
  };

  /**
   * Add custom provider
   */
  addCustomProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, apiKey, endpoint } = req.body;
      
      if (!name || !apiKey || !endpoint) {
        res.status(400).json({ error: 'Missing required provider fields' });
        return;
      }
      
      const provider = await this.settingsService.addCustomProvider({
        name,
        apiKey,
        endpoint
      });
      
      // Don't return actual key
      const safeProvider = {
        ...provider,
        apiKey: provider.apiKey ? true : false
      };
      
      res.status(201).json(safeProvider);
    } catch (error) {
      console.error('Error adding custom provider:', error);
      res.status(500).json({ error: 'Failed to add custom provider' });
    }
  };

  /**
   * Remove custom provider
   */
  removeCustomProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;
      await this.settingsService.removeCustomProvider(providerId);
      res.status(204).send();
    } catch (error) {
      console.error(`Error removing provider ${req.params.providerId}:`, error);
      res.status(500).json({ error: 'Failed to remove custom provider' });
    }
  };
}
