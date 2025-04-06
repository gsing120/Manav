import { SettingsService } from '../services/SettingsService';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * APIKeyManager handles secure storage and retrieval of API keys
 * for different model providers
 */
export class APIKeyManager {
  private settingsService: SettingsService;
  private encryptionKey: Buffer;
  private encryptionIV: Buffer;
  private encryptedKeysPath: string;
  
  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
    this.initializeEncryption();
    
    // Use app data directory for encrypted keys
    const appDataPath = process.env.APPDATA || 
      (process.platform === 'darwin' ? 
        path.join(process.env.HOME || '', 'Library', 'Application Support', 'manus-twin') : 
        path.join(process.env.HOME || '', '.manus-twin'));
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }
    
    this.encryptedKeysPath = path.join(appDataPath, 'encrypted-keys.dat');
  }
  
  /**
   * Initialize encryption key and IV
   */
  private initializeEncryption(): void {
    // In a production environment, this should use a secure key management system
    // For this implementation, we'll use a derived key from a machine-specific identifier
    
    try {
      // Get machine-specific identifier (hostname + MAC address)
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      const hostname = os.hostname();
      
      // Find a non-internal MAC address
      let macAddress = '';
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
          if (!iface.internal) {
            macAddress = iface.mac;
            break;
          }
        }
        if (macAddress) break;
      }
      
      // If no MAC address found, use a fallback
      if (!macAddress) {
        macAddress = '00:00:00:00:00:00';
      }
      
      // Create a derived key using PBKDF2
      const salt = 'manus-twin-salt';
      const keyMaterial = `${hostname}-${macAddress}-${salt}`;
      
      // Generate a 32-byte key for AES-256
      this.encryptionKey = crypto.pbkdf2Sync(
        keyMaterial,
        salt,
        10000,
        32,
        'sha256'
      );
      
      // Generate a 16-byte IV
      this.encryptionIV = crypto.pbkdf2Sync(
        keyMaterial,
        'manus-twin-iv',
        10000,
        16,
        'sha256'
      );
    } catch (error) {
      console.error('Error initializing encryption:', error);
      // Fallback to a static key/IV (not secure, but prevents crashes)
      this.encryptionKey = Buffer.from('manus-twin-default-encryption-key-32b', 'utf8');
      this.encryptionIV = Buffer.from('manus-twin-iv-16b', 'utf8');
    }
  }
  
  /**
   * Encrypt a string
   */
  private encrypt(text: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, this.encryptionIV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  /**
   * Decrypt a string
   */
  private decrypt(encrypted: string): string {
    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, this.encryptionIV);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Error decrypting:', error);
      return '';
    }
  }
  
  /**
   * Save API keys securely
   */
  async saveAPIKeys(apiKeys: Record<string, string>): Promise<void> {
    try {
      // Encrypt each API key
      const encryptedKeys: Record<string, string> = {};
      
      for (const [provider, key] of Object.entries(apiKeys)) {
        if (key) {
          encryptedKeys[provider] = this.encrypt(key);
        }
      }
      
      // Save encrypted keys to file
      fs.writeFileSync(this.encryptedKeysPath, JSON.stringify(encryptedKeys));
      
      // Update settings service with provider information (but not actual keys)
      const providerInfo: Record<string, boolean> = {};
      for (const provider in encryptedKeys) {
        providerInfo[provider] = true;
      }
      
      await this.settingsService.updateApiKeys(providerInfo);
    } catch (error) {
      console.error('Error saving API keys:', error);
      throw new Error('Failed to save API keys');
    }
  }
  
  /**
   * Load API keys securely
   */
  async loadAPIKeys(): Promise<Record<string, string>> {
    try {
      if (!fs.existsSync(this.encryptedKeysPath)) {
        return {};
      }
      
      // Read encrypted keys from file
      const encryptedKeysJson = fs.readFileSync(this.encryptedKeysPath, 'utf8');
      const encryptedKeys = JSON.parse(encryptedKeysJson);
      
      // Decrypt each API key
      const apiKeys: Record<string, string> = {};
      
      for (const [provider, encryptedKey] of Object.entries(encryptedKeys)) {
        apiKeys[provider] = this.decrypt(encryptedKey as string);
      }
      
      return apiKeys;
    } catch (error) {
      console.error('Error loading API keys:', error);
      return {};
    }
  }
  
  /**
   * Add or update an API key
   */
  async setAPIKey(provider: string, apiKey: string): Promise<void> {
    try {
      const apiKeys = await this.loadAPIKeys();
      apiKeys[provider] = apiKey;
      await this.saveAPIKeys(apiKeys);
    } catch (error) {
      console.error(`Error setting API key for ${provider}:`, error);
      throw new Error(`Failed to set API key for ${provider}`);
    }
  }
  
  /**
   * Remove an API key
   */
  async removeAPIKey(provider: string): Promise<void> {
    try {
      const apiKeys = await this.loadAPIKeys();
      delete apiKeys[provider];
      await this.saveAPIKeys(apiKeys);
    } catch (error) {
      console.error(`Error removing API key for ${provider}:`, error);
      throw new Error(`Failed to remove API key for ${provider}`);
    }
  }
  
  /**
   * Get an API key
   */
  async getAPIKey(provider: string): Promise<string | null> {
    try {
      const apiKeys = await this.loadAPIKeys();
      return apiKeys[provider] || null;
    } catch (error) {
      console.error(`Error getting API key for ${provider}:`, error);
      return null;
    }
  }
  
  /**
   * Check if an API key exists
   */
  async hasAPIKey(provider: string): Promise<boolean> {
    const apiKey = await this.getAPIKey(provider);
    return apiKey !== null && apiKey !== '';
  }
  
  /**
   * Get all provider names with API keys
   */
  async getProviders(): Promise<string[]> {
    try {
      const apiKeys = await this.loadAPIKeys();
      return Object.keys(apiKeys);
    } catch (error) {
      console.error('Error getting providers:', error);
      return [];
    }
  }
}
