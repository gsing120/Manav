export interface Model {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
}

export interface ModelProvider {
  generateResponse(modelId: string, messages: any[], options?: any): Promise<any>;
  streamResponse(modelId: string, messages: any[], options?: any): Promise<any>;
}

export interface ModelResponse {
  text: string;
  functionCalls?: FunctionCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: FunctionCall;
}
