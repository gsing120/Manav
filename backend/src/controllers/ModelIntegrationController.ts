import { ModelIntegrationService } from '../services/ModelIntegrationService';
import { Request, Response } from 'express';

/**
 * ModelIntegrationController provides HTTP endpoints for interacting with the model integration layer
 */
export class ModelIntegrationController {
  private modelIntegrationService: ModelIntegrationService;

  constructor(modelIntegrationService: ModelIntegrationService) {
    this.modelIntegrationService = modelIntegrationService;
  }

  /**
   * Create a new conversation
   */
  createConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { initialMessages } = req.body;
      const conversationId = this.modelIntegrationService.createConversation(initialMessages || []);
      res.status(201).json({ conversationId });
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  };

  /**
   * Get conversation history
   */
  getConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const conversation = this.modelIntegrationService.getConversation(conversationId);
      
      if (!conversation || conversation.length === 0) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
      
      res.status(200).json({ conversation });
    } catch (error) {
      console.error(`Error getting conversation ${req.params.conversationId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve conversation' });
    }
  };

  /**
   * Send a message to a model and get a response
   */
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId, message, modelId, options } = req.body;
      
      if (!conversationId || !message) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }
      
      const response = await this.modelIntegrationService.sendMessage(
        conversationId,
        message,
        modelId,
        options || {}
      );
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  };

  /**
   * Stream a response from a model
   */
  streamMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId, message, modelId, options } = req.body;
      
      if (!conversationId || !message) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }
      
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Stream message from model
      const stream = await this.modelIntegrationService.streamMessage(
        conversationId,
        message,
        modelId,
        options || {}
      );
      
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
        stream.removeAllListeners();
      });
    } catch (error) {
      console.error('Error streaming message:', error);
      res.status(500).json({ error: 'Failed to stream message' });
    }
  };

  /**
   * Refresh model providers
   */
  refreshProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.modelIntegrationService.refreshProviders();
      res.status(200).json({ message: 'Providers refreshed successfully' });
    } catch (error) {
      console.error('Error refreshing providers:', error);
      res.status(500).json({ error: 'Failed to refresh providers' });
    }
  };
}
