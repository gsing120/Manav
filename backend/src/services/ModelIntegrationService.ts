import { ModelIntegration } from '../models/integration/ModelIntegration';
import { FunctionService } from './FunctionService';
import { SettingsService } from './SettingsService';
import { GeminiProvider } from '../models/providers/GeminiProvider';
import { ClaudeProvider } from '../models/providers/ClaudeProvider';
import { EventEmitter } from 'events';

/**
 * ModelIntegrationService provides a high-level interface for the application
 * to interact with the model integration layer
 */
export class ModelIntegrationService {
  private modelIntegration: ModelIntegration;
  private settingsService: SettingsService;
  private conversationCounter: number = 0;
  
  constructor(functionService: FunctionService, settingsService: SettingsService) {
    this.modelIntegration = new ModelIntegration(functionService);
    this.settingsService = settingsService;
    this.initializeProviders();
  }
  
  /**
   * Initialize model providers based on settings
   */
  private async initializeProviders(): Promise<void> {
    try {
      // Get API keys from settings
      const apiKeys = await this.settingsService.getApiKeys();
      
      // Initialize built-in providers
      if (apiKeys.google) {
        const geminiProvider = new GeminiProvider(apiKeys.google);
        this.modelIntegration.registerProvider('gemini', geminiProvider);
      }
      
      if (apiKeys.anthropic) {
        const claudeProvider = new ClaudeProvider(apiKeys.anthropic);
        this.modelIntegration.registerProvider('claude', claudeProvider);
      }
      
      // Initialize custom providers
      const customProviders = await this.settingsService.getCustomProviders();
      for (const provider of customProviders) {
        const { CustomProvider } = await import('../models/providers/CustomProvider');
        const customProvider = new CustomProvider(provider.name, provider.apiKey, provider.endpoint);
        this.modelIntegration.registerProvider(provider.id, customProvider);
      }
    } catch (error) {
      console.error('Error initializing providers:', error);
    }
  }
  
  /**
   * Create a new conversation
   */
  createConversation(initialMessages: any[] = []): string {
    const conversationId = `conv-${Date.now()}-${this.conversationCounter++}`;
    this.modelIntegration.createConversation(conversationId, initialMessages);
    return conversationId;
  }
  
  /**
   * Get conversation history
   */
  getConversation(conversationId: string): any[] {
    return this.modelIntegration.getConversation(conversationId);
  }
  
  /**
   * Send a message to a model and get a response
   */
  async sendMessage(
    conversationId: string,
    message: string,
    modelId?: string,
    options: any = {}
  ): Promise<any> {
    try {
      // Get settings for default model if not specified
      if (!modelId) {
        const settings = await this.settingsService.getSettings();
        modelId = settings.defaultModel;
      }
      
      // Determine provider based on model ID
      const providerName = this.getProviderForModel(modelId);
      
      if (!providerName) {
        throw new Error(`Could not determine provider for model ${modelId}`);
      }
      
      // Send message to model
      return await this.modelIntegration.sendMessage(
        conversationId,
        modelId,
        providerName,
        message,
        options
      );
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  /**
   * Stream a response from a model
   */
  async streamMessage(
    conversationId: string,
    message: string,
    modelId?: string,
    options: any = {}
  ): Promise<EventEmitter> {
    try {
      // Get settings for default model if not specified
      if (!modelId) {
        const settings = await this.settingsService.getSettings();
        modelId = settings.defaultModel;
      }
      
      // Determine provider based on model ID
      const providerName = this.getProviderForModel(modelId);
      
      if (!providerName) {
        throw new Error(`Could not determine provider for model ${modelId}`);
      }
      
      // Stream message from model
      return await this.modelIntegration.streamMessage(
        conversationId,
        modelId,
        providerName,
        message,
        options
      );
    } catch (error) {
      console.error('Error streaming message:', error);
      const emitter = new EventEmitter();
      emitter.emit('error', error);
      return emitter;
    }
  }
  
  /**
   * Determine the provider for a given model ID
   */
  private getProviderForModel(modelId: string): string | null {
    // Map model IDs to providers
    if (modelId.startsWith('gemini-')) {
      return 'gemini';
    } else if (modelId.startsWith('claude-')) {
      return 'claude';
    } else if (modelId.startsWith('gpt-')) {
      return 'openai';
    } else if (modelId.includes('-')) {
      // Custom provider models are expected to have the format: "{providerId}-model"
      return modelId.split('-')[0];
    }
    
    return null;
  }
  
  /**
   * Refresh providers (e.g., after API key updates)
   */
  async refreshProviders(): Promise<void> {
    await this.initializeProviders();
  }
}
