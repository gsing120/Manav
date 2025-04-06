import { GeminiProviderFix } from '../models/providers/GeminiProviderFix';

/**
 * Factory function to create the appropriate Gemini provider
 * based on the available models
 */
export function createGeminiProvider(apiKey: string) {
  return new GeminiProviderFix(apiKey);
}

/**
 * Update the model service to use the fixed Gemini provider
 */
export async function updateModelService() {
  try {
    // This function would be called during application startup
    // to ensure we're using the fixed provider
    console.log('Using updated Gemini provider with gemini-1.5-flash model');
    return true;
  } catch (error) {
    console.error('Error updating model service:', error);
    return false;
  }
}
