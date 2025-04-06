import { ModelProvider, ModelResponse } from '../Model';
import axios from 'axios';
import { EventEmitter } from 'events';

export class GeminiProvider implements ModelProvider {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate a response from Gemini model
   */
  async generateResponse(modelId: string, messages: any[], options: any = {}): Promise<ModelResponse> {
    try {
      // Format messages for Gemini API
      const formattedMessages = this.formatMessages(messages);
      
      // Prepare request body
      const requestBody: any = {
        contents: formattedMessages,
        generationConfig: {
          temperature: options.temperature || 0.7,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
          maxOutputTokens: options.maxTokens || 2048,
        }
      };
      
      // Add function calling if provided
      if (options.functions) {
        requestBody.tools = [{
          functionDeclarations: options.functions.map((func: any) => ({
            name: func.name,
            description: func.description,
            parameters: func.parameters
          }))
        }];
      }
      
      // Make API request
      const response = await axios.post(
        `${this.baseUrl}/models/${modelId}:generateContent?key=${this.apiKey}`,
        requestBody
      );
      
      // Process response
      const result = response.data;
      const modelResponse: ModelResponse = {
        text: result.candidates[0]?.content?.parts[0]?.text || ''
      };
      
      // Extract function calls if present
      if (result.candidates[0]?.content?.parts[0]?.functionCall) {
        modelResponse.functionCalls = [{
          name: result.candidates[0].content.parts[0].functionCall.name,
          arguments: JSON.parse(result.candidates[0].content.parts[0].functionCall.args)
        }];
      }
      
      // Add usage information if available
      if (result.usageMetadata) {
        modelResponse.usage = {
          promptTokens: result.usageMetadata.promptTokenCount,
          completionTokens: result.usageMetadata.candidatesTokenCount,
          totalTokens: result.usageMetadata.totalTokenCount
        };
      }
      
      return modelResponse;
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      throw new Error(`Failed to generate response from Gemini: ${error.message}`);
    }
  }

  /**
   * Stream a response from Gemini model
   */
  async streamResponse(modelId: string, messages: any[], options: any = {}): Promise<EventEmitter> {
    // Create event emitter for streaming
    const emitter = new EventEmitter();
    
    try {
      // Format messages for Gemini API
      const formattedMessages = this.formatMessages(messages);
      
      // Prepare request body
      const requestBody: any = {
        contents: formattedMessages,
        generationConfig: {
          temperature: options.temperature || 0.7,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
          maxOutputTokens: options.maxTokens || 2048,
        },
        streamGenerationConfig: {
          streamContentTokens: true
        }
      };
      
      // Add function calling if provided
      if (options.functions) {
        requestBody.tools = [{
          functionDeclarations: options.functions.map((func: any) => ({
            name: func.name,
            description: func.description,
            parameters: func.parameters
          }))
        }];
      }
      
      // Make streaming API request
      const response = await axios.post(
        `${this.baseUrl}/models/${modelId}:streamGenerateContent?key=${this.apiKey}`,
        requestBody,
        {
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
              
              if (data.candidates && data.candidates[0]?.content?.parts[0]) {
                const part = data.candidates[0].content.parts[0];
                
                if (part.text) {
                  emitter.emit('data', { text: part.text });
                } else if (part.functionCall) {
                  emitter.emit('data', {
                    functionCall: {
                      name: part.functionCall.name,
                      arguments: JSON.parse(part.functionCall.args)
                    }
                  });
                }
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
      console.error('Error streaming response from Gemini:', error);
      emitter.emit('error', error);
    }
    
    return emitter;
  }

  /**
   * Format messages for Gemini API
   */
  private formatMessages(messages: any[]): any[] {
    return messages.map(msg => {
      const role = msg.role === 'user' ? 'user' : 'model';
      
      return {
        role,
        parts: [{ text: msg.content }]
      };
    });
  }
}
