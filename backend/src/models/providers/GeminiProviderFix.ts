import { GeminiProvider } from '../models/providers/GeminiProvider';

/**
 * Updates the GeminiProvider class to use the gemini-1.5-flash model
 * instead of the deprecated gemini-pro model
 */
export class GeminiProviderFix extends GeminiProvider {
  constructor(apiKey: string) {
    super(apiKey);
    // Override the model name to use gemini-1.5-flash instead of gemini-pro
    this.modelName = 'gemini-1.5-flash';
  }

  /**
   * Get available models from the Gemini API
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get available models: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter for Gemini models that support content generation
      const geminiModels = data.models
        .filter(model => 
          model.name.includes('gemini') && 
          model.supportedGenerationMethods?.includes('generateContent')
        )
        .map(model => model.name.split('/').pop());
      
      return geminiModels;
    } catch (error) {
      console.error('Error getting available Gemini models:', error);
      // Return default models as fallback
      return ['gemini-1.5-flash', 'gemini-2.0-flash'];
    }
  }

  /**
   * Generate content using the Gemini API
   */
  async generateContent(prompt: string, options: any = {}): Promise<any> {
    try {
      // If a specific model is requested in options, use that instead
      const modelToUse = options.model || this.modelName;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelToUse}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: options.temperature || 0.7,
              maxOutputTokens: options.maxTokens || 100,
              topP: options.topP || 0.95,
              topK: options.topK || 40
            }
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      return {
        text: data.candidates[0].content.parts[0].text,
        raw: data
      };
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw error;
    }
  }
}
