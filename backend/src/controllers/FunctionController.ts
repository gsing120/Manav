import { Request, Response } from 'express';
import { FunctionService } from '../services/FunctionService';

export class FunctionController {
  private functionService: FunctionService;

  constructor() {
    this.functionService = new FunctionService();
  }

  /**
   * Get all available functions
   */
  getFunctions = async (req: Request, res: Response): Promise<void> => {
    try {
      const functions = await this.functionService.getAllFunctions();
      res.status(200).json(functions);
    } catch (error) {
      console.error('Error getting functions:', error);
      res.status(500).json({ error: 'Failed to retrieve functions' });
    }
  };

  /**
   * Get function by ID
   */
  getFunctionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { functionId } = req.params;
      const func = await this.functionService.getFunctionById(functionId);
      
      if (!func) {
        res.status(404).json({ error: 'Function not found' });
        return;
      }
      
      res.status(200).json(func);
    } catch (error) {
      console.error(`Error getting function ${req.params.functionId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve function' });
    }
  };

  /**
   * Execute a function
   */
  executeFunction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { functionName, parameters } = req.body;
      
      if (!functionName) {
        res.status(400).json({ error: 'Missing function name' });
        return;
      }
      
      const result = await this.functionService.executeFunction(functionName, parameters || {});
      res.status(200).json(result);
    } catch (error) {
      console.error('Error executing function:', error);
      res.status(500).json({ error: 'Failed to execute function' });
    }
  };

  /**
   * Register a custom function
   */
  registerFunction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, parameters, implementation } = req.body;
      
      if (!name || !description || !parameters) {
        res.status(400).json({ error: 'Missing required function definition fields' });
        return;
      }
      
      const registeredFunction = await this.functionService.registerFunction({
        name,
        description,
        parameters,
        implementation
      });
      
      res.status(201).json(registeredFunction);
    } catch (error) {
      console.error('Error registering function:', error);
      res.status(500).json({ error: 'Failed to register function' });
    }
  };
}
