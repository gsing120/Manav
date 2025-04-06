import fs from 'fs';
import path from 'path';
import { CustomProvider } from '../models/providers/CustomProvider';

interface Settings {
  defaultModel: string;
  darkMode: boolean;
  saveHistory: boolean;
  autoUpdate: boolean;
  [key: string]: any;
}

interface ApiKeys {
  google?: string;
  anthropic?: string;
  openai?: string;
  [key: string]: string | undefined;
}

export class SettingsService {
  private settingsPath: string;
  private apiKeysPath: string;
  private customProvidersPath: string;
  
  constructor() {
    // Use app data directory for settings
    const appDataPath = process.env.APPDATA || 
      (process.platform === 'darwin' ? 
        path.join(process.env.HOME || '', 'Library', 'Application Support', 'manus-twin') : 
        path.join(process.env.HOME || '', '.manus-twin'));
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }
    
    this.settingsPath = path.join(appDataPath, 'settings.json');
    this.apiKeysPath = path.join(appDataPath, 'api-keys.json');
    this.customProvidersPath = path.join(appDataPath, 'custom-providers.json');
    
    // Initialize files if they don't exist
    this.initializeFiles();
  }
  
  /**
   * Initialize settings files if they don't exist
   */
  private initializeFiles(): void {
    // Initialize settings
    if (!fs.existsSync(this.settingsPath)) {
      const defaultSettings: Settings = {
        defaultModel: 'gemini-pro',
        darkMode: true,
        saveHistory: true,
        autoUpdate: true
      };
      fs.writeFileSync(this.settingsPath, JSON.stringify(defaultSettings, null, 2));
    }
    
    // Initialize API keys
    if (!fs.existsSync(this.apiKeysPath)) {
      const defaultApiKeys: ApiKeys = {};
      fs.writeFileSync(this.apiKeysPath, JSON.stringify(defaultApiKeys, null, 2));
    }
    
    // Initialize custom providers
    if (!fs.existsSync(this.customProvidersPath)) {
      fs.writeFileSync(this.customProvidersPath, JSON.stringify([], null, 2));
    }
  }
  
  /**
   * Get all settings
   */
  async getSettings(): Promise<Settings> {
    try {
      const data = fs.readFileSync(this.settingsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading settings:', error);
      // Return default settings if file can't be read
      return {
        defaultModel: 'gemini-pro',
        darkMode: true,
        saveHistory: true,
        autoUpdate: true
      };
    }
  }
  
  /**
   * Update settings
   */
  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      
      fs.writeFileSync(this.settingsPath, JSON.stringify(updatedSettings, null, 2));
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  }
  
  /**
   * Get API keys
   */
  async getApiKeys(): Promise<ApiKeys> {
    try {
      const data = fs.readFileSync(this.apiKeysPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading API keys:', error);
      // Return empty object if file can't be read
      return {};
    }
  }
  
  /**
   * Update API keys
   */
  async updateApiKeys(apiKeys: Partial<ApiKeys>): Promise<ApiKeys> {
    try {
      const currentApiKeys = await this.getApiKeys();
      const updatedApiKeys = { ...currentApiKeys, ...apiKeys };
      
      fs.writeFileSync(this.apiKeysPath, JSON.stringify(updatedApiKeys, null, 2));
      return updatedApiKeys;
    } catch (error) {
      console.error('Error updating API keys:', error);
      throw new Error('Failed to update API keys');
    }
  }
  
  /**
   * Get custom providers
   */
  async getCustomProviders(): Promise<CustomProvider[]> {
    try {
      const data = fs.readFileSync(this.customProvidersPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading custom providers:', error);
      // Return empty array if file can't be read
      return [];
    }
  }
  
  /**
   * Add custom provider
   */
  async addCustomProvider(provider: { name: string; apiKey: string; endpoint: string }): Promise<CustomProvider> {
    try {
      const providers = await this.getCustomProviders();
      
      const newProvider: CustomProvider = {
        id: `custom-${Date.now()}`,
        name: provider.name,
        apiKey: provider.apiKey,
        endpoint: provider.endpoint
      };
      
      providers.push(newProvider);
      fs.writeFileSync(this.customProvidersPath, JSON.stringify(providers, null, 2));
      
      return newProvider;
    } catch (error) {
      console.error('Error adding custom provider:', error);
      throw new Error('Failed to add custom provider');
    }
  }
  
  /**
   * Remove custom provider
   */
  async removeCustomProvider(providerId: string): Promise<void> {
    try {
      const providers = await this.getCustomProviders();
      const updatedProviders = providers.filter(p => p.id !== providerId);
      
      fs.writeFileSync(this.customProvidersPath, JSON.stringify(updatedProviders, null, 2));
    } catch (error) {
      console.error('Error removing custom provider:', error);
      throw new Error('Failed to remove custom provider');
    }
  }
}
