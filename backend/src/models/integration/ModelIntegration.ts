import { ModelProvider, ModelResponse, Message, FunctionCall } from '../Model';
import { EventEmitter } from 'events';
import { FunctionService } from '../../services/FunctionService';

/**
 * ModelIntegration class serves as the central interface for interacting with AI models
 * It handles the communication between the application and various model providers
 */
export class ModelIntegration {
  private providers: Record<string, ModelProvider> = {};
  private functionService: FunctionService;
  private activeConversations: Map<string, Message[]> = new Map();
  
  constructor(functionService: FunctionService) {
    this.functionService = functionService;
  }
  
  /**
   * Register a model provider
   */
  registerProvider(providerName: string, provider: ModelProvider): void {
    this.providers[providerName] = provider;
    console.log(`Registered provider: ${providerName}`);
  }
  
  /**
   * Get a model provider by name
   */
  getProvider(providerName: string): ModelProvider | null {
    return this.providers[providerName] || null;
  }
  
  /**
   * Create a new conversation
   */
  createConversation(conversationId: string, initialMessages: Message[] = []): void {
    this.activeConversations.set(conversationId, initialMessages);
  }
  
  /**
   * Get conversation history
   */
  getConversation(conversationId: string): Message[] {
    return this.activeConversations.get(conversationId) || [];
  }
  
  /**
   * Add a message to a conversation
   */
  addMessage(conversationId: string, message: Message): void {
    const conversation = this.getConversation(conversationId);
    conversation.push(message);
    this.activeConversations.set(conversationId, conversation);
  }
  
  /**
   * Send a message to a model and get a response
   */
  async sendMessage(
    conversationId: string, 
    modelId: string, 
    providerName: string, 
    message: string, 
    options: any = {}
  ): Promise<ModelResponse> {
    // Get or create conversation
    if (!this.activeConversations.has(conversationId)) {
      this.createConversation(conversationId);
    }
    
    // Add user message to conversation
    const userMessage: Message = { role: 'user', content: message };
    this.addMessage(conversationId, userMessage);
    
    // Get conversation history
    const conversation = this.getConversation(conversationId);
    
    // Get provider
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }
    
    // Add available functions if function calling is enabled
    if (options.enableFunctionCalling) {
      const functions = await this.functionService.getAllFunctions();
      options.functions = functions.map(func => ({
        name: func.name,
        description: func.description,
        parameters: func.parameters
      }));
    }
    
    // Send message to model
    const response = await provider.generateResponse(modelId, conversation, options);
    
    // Handle function calls if present
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const functionCall of response.functionCalls) {
        await this.handleFunctionCall(conversationId, functionCall);
      }
      
      // Get updated conversation with function results
      const updatedConversation = this.getConversation(conversationId);
      
      // Generate a follow-up response that incorporates function results
      const followUpResponse = await provider.generateResponse(modelId, updatedConversation, options);
      
      // Add assistant message to conversation
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: followUpResponse.text 
      };
      this.addMessage(conversationId, assistantMessage);
      
      return followUpResponse;
    }
    
    // Add assistant message to conversation
    const assistantMessage: Message = { 
      role: 'assistant', 
      content: response.text 
    };
    this.addMessage(conversationId, assistantMessage);
    
    return response;
  }
  
  /**
   * Stream a response from a model
   */
  async streamMessage(
    conversationId: string, 
    modelId: string, 
    providerName: string, 
    message: string, 
    options: any = {}
  ): Promise<EventEmitter> {
    // Create event emitter for streaming
    const emitter = new EventEmitter();
    
    try {
      // Get or create conversation
      if (!this.activeConversations.has(conversationId)) {
        this.createConversation(conversationId);
      }
      
      // Add user message to conversation
      const userMessage: Message = { role: 'user', content: message };
      this.addMessage(conversationId, userMessage);
      
      // Get conversation history
      const conversation = this.getConversation(conversationId);
      
      // Get provider
      const provider = this.getProvider(providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
        emitter.emit('error', new Error(`Provider ${providerName} not found`));
        return emitter;
      }
      
      // Add available functions if function calling is enabled
      if (options.enableFunctionCalling) {
        const functions = await this.functionService.getAllFunctions();
        options.functions = functions.map(func => ({
          name: func.name,
          description: func.description,
          parameters: func.parameters
        }));
      }
      
      // Stream response from model
      const stream = await provider.streamResponse(modelId, conversation, options);
      
      let assistantMessage: Message = { role: 'assistant', content: '' };
      let functionCallData: any = null;
      
      // Handle stream events
      stream.on('data', async (chunk) => {
        if (chunk.text) {
          // Append text to assistant message
          assistantMessage.content += chunk.text;
          emitter.emit('data', { text: chunk.text });
        } else if (chunk.functionCall) {
          // Store function call data
          functionCallData = chunk.functionCall;
          emitter.emit('data', { functionCall: functionCallData });
        }
      });
      
      stream.on('end', async () => {
        // Add assistant message to conversation
        this.addMessage(conversationId, assistantMessage);
        
        // Handle function call if present
        if (functionCallData) {
          await this.handleFunctionCall(conversationId, functionCallData);
          
          // Get updated conversation with function results
          const updatedConversation = this.getConversation(conversationId);
          
          // Generate a follow-up response that incorporates function results
          const followUpResponse = await provider.generateResponse(modelId, updatedConversation, options);
          
          // Add follow-up assistant message to conversation
          const followUpMessage: Message = { 
            role: 'assistant', 
            content: followUpResponse.text 
          };
          this.addMessage(conversationId, followUpMessage);
          
          // Emit follow-up response
          emitter.emit('data', { text: followUpResponse.text });
        }
        
        emitter.emit('end');
      });
      
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        emitter.emit('error', error);
      });
    } catch (error) {
      console.error('Error streaming message:', error);
      emitter.emit('error', error);
    }
    
    return emitter;
  }
  
  /**
   * Handle a function call from a model
   */
  private async handleFunctionCall(conversationId: string, functionCall: FunctionCall): Promise<void> {
    try {
      // Execute function
      const result = await this.functionService.executeFunction(
        functionCall.name, 
        functionCall.arguments
      );
      
      // Add function message to conversation
      const functionMessage: Message = {
        role: 'function',
        name: functionCall.name,
        content: JSON.stringify(result)
      };
      
      this.addMessage(conversationId, functionMessage);
      
      return result;
    } catch (error) {
      console.error(`Error executing function ${functionCall.name}:`, error);
      
      // Add error message to conversation
      const errorMessage: Message = {
        role: 'function',
        name: functionCall.name,
        content: JSON.stringify({ error: error.message })
      };
      
      this.addMessage(conversationId, errorMessage);
      
      throw error;
    }
  }
}
