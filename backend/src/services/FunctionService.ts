import { Function } from '../models/Function';
import { EventEmitter } from 'events';

export class FunctionService {
  private functions: Record<string, Function> = {};
  private functionEmitter: EventEmitter;

  constructor() {
    this.functionEmitter = new EventEmitter();
    this.initializeBuiltInFunctions();
  }

  /**
   * Initialize built-in functions
   */
  private initializeBuiltInFunctions(): void {
    // File operations
    this.registerFunction({
      name: 'file_read',
      description: 'Read file content',
      parameters: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            description: 'Absolute path of the file to read'
          },
          start_line: {
            type: 'integer',
            description: '(Optional) Starting line to read from, 0-based'
          },
          end_line: {
            type: 'integer',
            description: '(Optional) Ending line number (exclusive)'
          }
        },
        required: ['file']
      },
      implementation: async (params: any) => {
        try {
          const fs = require('fs');
          const content = fs.readFileSync(params.file, 'utf8');
          
          if (params.start_line !== undefined || params.end_line !== undefined) {
            const lines = content.split('\n');
            const start = params.start_line || 0;
            const end = params.end_line || lines.length;
            return lines.slice(start, end).join('\n');
          }
          
          return content;
        } catch (error) {
          throw new Error(`Error reading file: ${error.message}`);
        }
      }
    });

    this.registerFunction({
      name: 'file_write',
      description: 'Write content to a file',
      parameters: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            description: 'Absolute path of the file to write'
          },
          content: {
            type: 'string',
            description: 'Content to write to the file'
          },
          append: {
            type: 'boolean',
            description: '(Optional) Whether to append to the file instead of overwriting'
          }
        },
        required: ['file', 'content']
      },
      implementation: async (params: any) => {
        try {
          const fs = require('fs');
          const path = require('path');
          
          // Create directory if it doesn't exist
          const dir = path.dirname(params.file);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          if (params.append) {
            fs.appendFileSync(params.file, params.content);
          } else {
            fs.writeFileSync(params.file, params.content);
          }
          
          return { success: true, file: params.file };
        } catch (error) {
          throw new Error(`Error writing file: ${error.message}`);
        }
      }
    });

    // Web search
    this.registerFunction({
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          },
          num_results: {
            type: 'integer',
            description: '(Optional) Number of results to return'
          }
        },
        required: ['query']
      },
      implementation: async (params: any) => {
        // This is a placeholder. In a real implementation, you would integrate with a search API
        return {
          results: [
            {
              title: 'Example search result 1',
              url: 'https://example.com/1',
              snippet: 'This is an example search result snippet.'
            },
            {
              title: 'Example search result 2',
              url: 'https://example.com/2',
              snippet: 'This is another example search result snippet.'
            }
          ]
        };
      }
    });

    // System information
    this.registerFunction({
      name: 'system_info',
      description: 'Get system information',
      parameters: {
        type: 'object',
        properties: {}
      },
      implementation: async () => {
        const os = require('os');
        return {
          platform: os.platform(),
          arch: os.arch(),
          hostname: os.hostname(),
          cpus: os.cpus().length,
          memory: {
            total: os.totalmem(),
            free: os.freemem()
          }
        };
      }
    });
  }

  /**
   * Get all available functions
   */
  async getAllFunctions(): Promise<Function[]> {
    return Object.values(this.functions);
  }

  /**
   * Get function by ID
   */
  async getFunctionById(functionId: string): Promise<Function | null> {
    return this.functions[functionId] || null;
  }

  /**
   * Execute a function
   */
  async executeFunction(functionName: string, parameters: any = {}): Promise<any> {
    const func = this.functions[functionName];
    
    if (!func) {
      throw new Error(`Function ${functionName} not found`);
    }
    
    try {
      // Emit event before execution
      this.functionEmitter.emit('function:before', { name: functionName, parameters });
      
      // Execute function
      const result = await func.implementation(parameters);
      
      // Emit event after execution
      this.functionEmitter.emit('function:after', { name: functionName, parameters, result });
      
      return result;
    } catch (error) {
      // Emit error event
      this.functionEmitter.emit('function:error', { name: functionName, parameters, error });
      throw error;
    }
  }

  /**
   * Register a function
   */
  async registerFunction(functionDef: Partial<Function>): Promise<Function> {
    if (!functionDef.name) {
      throw new Error('Function name is required');
    }
    
    const func: Function = {
      name: functionDef.name,
      description: functionDef.description || '',
      parameters: functionDef.parameters || { type: 'object', properties: {} },
      implementation: functionDef.implementation || (async () => ({}))
    };
    
    this.functions[func.name] = func;
    
    // Emit registration event
    this.functionEmitter.emit('function:register', { name: func.name });
    
    return func;
  }

  /**
   * Subscribe to function events
   */
  onFunctionEvent(event: string, callback: (data: any) => void): void {
    this.functionEmitter.on(event, callback);
  }
}
