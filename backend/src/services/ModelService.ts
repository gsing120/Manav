import { Model } from '../models/Model';
import { ModelProvider } from '../models/ModelProvider';
import { SettingsService } from './SettingsService';

export class ModelService {
  private models: Model[] = [];
  private providers: Record<string, ModelProvider> = {};
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
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
        const { GeminiProvider } = await import('../models/providers/GeminiProvider');
        this.providers.gemini = new GeminiProvider(apiKeys.google);
        
        // Add Gemini models
        this.models.push(
          { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini', capabilities: ['text', 'function-calling'] },
          { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'gemini', capabilities: ['text', 'vision', 'function-calling'] },
          { id: 'gemini-ultra', name: 'Gemini Ultra', provider: 'gemini', capabilities: ['text', 'vision', 'function-calling'] },
          { id: 'gemini-flash', name: 'Gemini Flash', provider: 'gemini', capabilities: ['text', 'function-calling'] }
        );
      }
      
      if (apiKeys.anthropic) {
        const { ClaudeProvider } = await import('../models/providers/ClaudeProvider');
        this.providers.claude = new ClaudeProvider(apiKeys.anthropic);
        
        // Add Claude models
        this.models.push(
          { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'claude', capabilities: ['text', 'vision', 'function-calling'] },
          { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'claude', capabilities: ['text', 'vision', 'function-calling'] },
          { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'claude', capabilities: ['text', 'vision', 'function-calling'] }
        );
      }
      
      if (apiKeys.openai) {
        const { OpenAIProvider } = await import('../models/providers/OpenAIProvider');
        this.providers.openai = new OpenAIProvider(apiKeys.openai);
        
        // Add OpenAI models
        this.models.push(
          { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', capabilities: ['text', 'vision', 'function-calling'] },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', capabilities: ['text', 'vision', 'function-calling'] },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', capabilities: ['text', 'function-calling'] }
        );
      }
      
      // Initialize custom providers
      const customProviders = await this.settingsService.getCustomProviders();
      for (const provider of customProviders) {
        const { CustomProvider } = await import('../models/providers/CustomProvider');
        this.providers[provider.id] = new CustomProvider(provider.name, provider.apiKey, provider.endpoint);
        
        // Add custom model
        this.models.push({
          id: `${provider.id}-model`,
          name: `${provider.name} Model`,
          provider: provider.id,
          capabilities: ['text']
        });
      }
    } catch (error) {
      console.error('Error initializing providers:', error);
    }
  }

  /**
   * Get all available models
   */
  async getAllModels(): Promise<Model[]> {
    // Refresh providers to ensure we have the latest models
    await this.initializeProviders();
    return this.models;
  }

  /**
   * Get model by ID
   */
  async getModelById(modelId: string): Promise<Model | null> {
    const models = await this.getAllModels();
    return models.find(model => model.id === modelId) || null;
  }

  /**
   * Query a model with messages
   */
  async queryModel(modelId: string, messages: any[], options: any = {}): Promise<any> {
    const model = await this.getModelById(modelId);
    
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    const provider = this.providers[model.provider];
    
    if (!provider) {
      throw new Error(`Provider for model ${modelId} not found`);
    }
    
    return provider.generateResponse(modelId, messages, options);
  }

  /**
   * Stream a response from a model
   */
  async streamModelResponse(modelId: string, messages: any[], options: any = {}): Promise<any> {
    const model = await this.getModelById(modelId);
    
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    const provider = this.providers[model.provider];
    
    if (!provider) {
      throw new Error(`Provider for model ${modelId} not found`);
    }
    
    return provider.streamResponse(modelId, messages, options);
  }
}
