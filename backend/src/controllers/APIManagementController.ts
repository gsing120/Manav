import { Request, Response } from 'express';
import { APIKeyManager } from '../api/APIKeyManager';
import { SettingsService } from '../services/SettingsService';
import { ModelIntegrationService } from '../services/ModelIntegrationService';

/**
 * APIManagementController provides HTTP endpoints for managing API keys
 */
export class APIManagementController {
  private apiKeyManager: APIKeyManager;
  private modelIntegrationService: ModelIntegrationService;

  constructor(settingsService: SettingsService, modelIntegrationService: ModelIntegrationService) {
    this.apiKeyManager = new APIKeyManager(settingsService);
    this.modelIntegrationService = modelIntegrationService;
  }

  /**
   * Get all providers with API keys (without exposing the actual keys)
   */
  getProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const providers = await this.apiKeyManager.getProviders();
      
      // Create a map of provider names to boolean values
      const providerMap: Record<string, boolean> = {};
      for (const provider of providers) {
        providerMap[provider] = true;
      }
      
      res.status(200).json(providerMap);
    } catch (error) {
      console.error('Error getting providers:', error);
      res.status(500).json({ error: 'Failed to retrieve providers' });
    }
  };

  /**
   * Set an API key for a provider
   */
  setAPIKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provider, apiKey } = req.body;
      
      if (!provider || !apiKey) {
        res.status(400).json({ error: 'Missing provider or API key' });
        return;
      }
      
      await this.apiKeyManager.setAPIKey(provider, apiKey);
      
      // Refresh model providers to apply the new API key
      await this.modelIntegrationService.refreshProviders();
      
      res.status(200).json({ success: true, provider });
    } catch (error) {
      console.error('Error setting API key:', error);
      res.status(500).json({ error: 'Failed to set API key' });
    }
  };

  /**
   * Remove an API key for a provider
   */
  removeAPIKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provider } = req.params;
      
      if (!provider) {
        res.status(400).json({ error: 'Missing provider' });
        return;
      }
      
      await this.apiKeyManager.removeAPIKey(provider);
      
      // Refresh model providers to apply the change
      await this.modelIntegrationService.refreshProviders();
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error removing API key:', error);
      res.status(500).json({ error: 'Failed to remove API key' });
    }
  };

  /**
   * Verify an API key for a provider
   */
  verifyAPIKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provider, apiKey } = req.body;
      
      if (!provider || !apiKey) {
        res.status(400).json({ error: 'Missing provider or API key' });
        return;
      }
      
      // This is a simple implementation that just checks if the API key is not empty
      // In a real implementation, you would make a test request to the provider's API
      
      // For Gemini
      if (provider === 'google') {
        try {
          const axios = require('axios');
          const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
          );
          
          if (response.status === 200) {
            res.status(200).json({ valid: true });
          } else {
            res.status(200).json({ valid: false });
          }
        } catch (error) {
          res.status(200).json({ valid: false, error: error.message });
        }
      }
      // For Claude
      else if (provider === 'anthropic') {
        try {
          const axios = require('axios');
          const response = await axios.get(
            'https://api.anthropic.com/v1/models',
            {
              headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
              }
            }
          );
          
          if (response.status === 200) {
            res.status(200).json({ valid: true });
          } else {
            res.status(200).json({ valid: false });
          }
        } catch (error) {
          res.status(200).json({ valid: false, error: error.message });
        }
      }
      // For custom providers
      else if (provider.startsWith('custom-')) {
        // For custom providers, we can't verify the API key without knowing the endpoint
        // So we'll just return true
        res.status(200).json({ valid: true });
      }
      // For unsupported providers
      else {
        res.status(400).json({ error: 'Unsupported provider' });
      }
    } catch (error) {
      console.error('Error verifying API key:', error);
      res.status(500).json({ error: 'Failed to verify API key' });
    }
  };
}
