import { ModelProvider, ModelResponse } from '../Model';
import axios from 'axios';
import { EventEmitter } from 'events';

export class ClaudeProvider implements ModelProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate a response from Claude model
   */
  async generateResponse(modelId: string, messages: any[], options: any = {}): Promise<ModelResponse> {
    try {
      // Format messages for Claude API
      const formattedMessages = this.formatMessages(messages);
      
      // Prepare request body
      const requestBody: any = {
        model: modelId,
        messages: formattedMessages,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        stream: false
      };
      
      // Add function calling if provided
      if (options.functions) {
        requestBody.tools = options.functions.map((func: any) => ({
          name: func.name,
          description: func.description,
          input_schema: func.parameters
        }));
      }
      
      // Make API request
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      // Process response
      const result = response.data;
      const modelResponse: ModelResponse = {
        text: result.content[0]?.text || ''
      };
      
      // Extract function calls if present
      if (result.content[0]?.type === 'tool_use') {
        modelResponse.functionCalls = [{
          name: result.content[0].name,
          arguments: result.content[0].input
        }];
      }
      
      // Add usage information if available
      if (result.usage) {
        modelResponse.usage = {
          promptTokens: result.usage.input_tokens,
          completionTokens: result.usage.output_tokens,
          totalTokens: result.usage.input_tokens + result.usage.output_tokens
        };
      }
      
      return modelResponse;
    } catch (error) {
      console.error('Error generating response from Claude:', error);
      throw new Error(`Failed to generate response from Claude: ${error.message}`);
    }
  }

  /**
   * Stream a response from Claude model
   */
  async streamResponse(modelId: string, messages: any[], options: any = {}): Promise<EventEmitter> {
    // Create event emitter for streaming
    const emitter = new EventEmitter();
    
    try {
      // Format messages for Claude API
      const formattedMessages = this.formatMessages(messages);
      
      // Prepare request body
      const requestBody: any = {
        model: modelId,
        messages: formattedMessages,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        stream: true
      };
      
      // Add function calling if provided
      if (options.functions) {
        requestBody.tools = options.functions.map((func: any) => ({
          name: func.name,
          description: func.description,
          input_schema: func.parameters
        }));
      }
      
      // Make streaming API request
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          responseType: 'stream'
        }
      );
      
      let buffer = '';
      
      // Process streaming response
      response.data.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        buffer += chunkStr;
        
        // Process complete JSON objects
        let startIdx = 0;
        let endIdx = buffer.indexOf('\n', startIdx);
        
        while (endIdx !== -1) {
          const line = buffer.substring(startIdx, endIdx).trim();
          startIdx = endIdx + 1;
          endIdx = buffer.indexOf('\n', startIdx);
          
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            
            if (jsonStr === '[DONE]') {
              emitter.emit('end');
              return;
            }
            
            try {
              const data = JSON.parse(jsonStr);
              
              if (data.type === 'content_block_delta') {
                if (data.delta?.text) {
                  emitter.emit('data', { text: data.delta.text });
                }
              } else if (data.type === 'tool_use') {
                emitter.emit('data', {
                  functionCall: {
                    name: data.name,
                    arguments: data.input
                  }
                });
              }
            } catch (error) {
              console.error('Error parsing streaming response:', error);
            }
          }
        }
        
        // Keep any incomplete data in the buffer
        buffer = buffer.substring(startIdx);
      });
      
      response.data.on('end', () => {
        emitter.emit('end');
      });
      
      response.data.on('error', (error: Error) => {
        console.error('Stream error:', error);
        emitter.emit('error', error);
      });
    } catch (error) {
      console.error('Error streaming response from Claude:', error);
      emitter.emit('error', error);
    }
    
    return emitter;
  }

  /**
   * Format messages for Claude API
   */
  private formatMessages(messages: any[]): any[] {
    return messages.map(msg => {
      let role = msg.role;
      
      // Map roles to Claude format
      if (role === 'assistant') role = 'assistant';
      else if (role === 'user') role = 'user';
      else if (role === 'system') role = 'system';
      
      return {
        role,
        content: msg.content
      };
    });
  }
}
