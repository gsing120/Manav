import { Request, Response } from 'express';
import { ModelService } from '../services/ModelService';

export class ModelController {
  private modelService: ModelService;

  constructor() {
    this.modelService = new ModelService();
  }

  /**
   * Get all available models
   */
  getModels = async (req: Request, res: Response): Promise<void> => {
    try {
      const models = await this.modelService.getAllModels();
      res.status(200).json(models);
    } catch (error) {
      console.error('Error getting models:', error);
      res.status(500).json({ error: 'Failed to retrieve models' });
    }
  };

  /**
   * Get model by ID
   */
  getModelById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { modelId } = req.params;
      const model = await this.modelService.getModelById(modelId);
      
      if (!model) {
        res.status(404).json({ error: 'Model not found' });
        return;
      }
      
      res.status(200).json(model);
    } catch (error) {
      console.error(`Error getting model ${req.params.modelId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve model' });
    }
  };

  /**
   * Query a model with a prompt
   */
  queryModel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { modelId, messages, options } = req.body;
      
      if (!modelId || !messages) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }
      
      const response = await this.modelService.queryModel(modelId, messages, options);
      res.status(200).json(response);
    } catch (error) {
      console.error('Error querying model:', error);
      res.status(500).json({ error: 'Failed to query model' });
    }
  };

  /**
   * Stream a response from a model
   */
  streamModelResponse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { modelId, messages, options } = req.body;
      
      if (!modelId || !messages) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }
      
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Create stream
      const stream = await this.modelService.streamModelResponse(modelId, messages, options);
      
      // Handle stream events
      stream.on('data', (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      });
      
      stream.on('end', () => {
        res.write('data: [DONE]\n\n');
        res.end();
      });
      
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
        res.end();
      });
      
      // Handle client disconnect
      req.on('close', () => {
        stream.destroy();
      });
    } catch (error) {
      console.error('Error streaming model response:', error);
      res.status(500).json({ error: 'Failed to stream model response' });
    }
  };
}
