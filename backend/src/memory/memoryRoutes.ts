import express from 'express';
import { MemoryModule } from '../memory/MemoryModule';
import { Request, Response } from 'express';

// Create memory module
const memoryModule = new MemoryModule();

/**
 * MemoryController provides HTTP endpoints for interacting with the memory module
 */
export class MemoryController {
  /**
   * Create a new memory
   */
  createMemory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, content, tags } = req.body;
      
      if (!type || !content) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }
      
      if (!['conversation', 'knowledge', 'context'].includes(type)) {
        res.status(400).json({ error: 'Invalid memory type' });
        return;
      }
      
      const memoryId = memoryModule.createMemory(type, content, tags || []);
      res.status(201).json({ memoryId });
    } catch (error) {
      console.error('Error creating memory:', error);
      res.status(500).json({ error: 'Failed to create memory' });
    }
  };

  /**
   * Get a memory by ID
   */
  getMemory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memoryId } = req.params;
      const memory = memoryModule.getMemory(memoryId);
      
      if (!memory) {
        res.status(404).json({ error: 'Memory not found' });
        return;
      }
      
      res.status(200).json(memory);
    } catch (error) {
      console.error(`Error getting memory ${req.params.memoryId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve memory' });
    }
  };

  /**
   * Update a memory
   */
  updateMemory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memoryId } = req.params;
      const { content, tags } = req.body;
      
      if (!content) {
        res.status(400).json({ error: 'Missing content' });
        return;
      }
      
      const result = memoryModule.updateMemory(memoryId, content, tags);
      
      if (!result) {
        res.status(404).json({ error: 'Memory not found' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error updating memory ${req.params.memoryId}:`, error);
      res.status(500).json({ error: 'Failed to update memory' });
    }
  };

  /**
   * Delete a memory
   */
  deleteMemory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memoryId } = req.params;
      const result = memoryModule.deleteMemory(memoryId);
      
      if (!result) {
        res.status(404).json({ error: 'Memory not found' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error deleting memory ${req.params.memoryId}:`, error);
      res.status(500).json({ error: 'Failed to delete memory' });
    }
  };

  /**
   * Search memories by tags
   */
  searchMemoriesByTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tags, type } = req.query;
      
      if (!tags) {
        res.status(400).json({ error: 'Missing tags parameter' });
        return;
      }
      
      const tagArray = Array.isArray(tags) ? tags : [tags];
      const memories = memoryModule.searchMemoriesByTags(tagArray as string[], type as any);
      
      res.status(200).json(memories);
    } catch (error) {
      console.error('Error searching memories by tags:', error);
      res.status(500).json({ error: 'Failed to search memories' });
    }
  };

  /**
   * Search memories by content
   */
  searchMemoriesByContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, type } = req.query;
      
      if (!query) {
        res.status(400).json({ error: 'Missing query parameter' });
        return;
      }
      
      const memories = memoryModule.searchMemoriesByContent(query as string, type as any);
      
      res.status(200).json(memories);
    } catch (error) {
      console.error('Error searching memories by content:', error);
      res.status(500).json({ error: 'Failed to search memories' });
    }
  };

  /**
   * Get all memories of a specific type
   */
  getAllMemoriesByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      
      if (!['conversation', 'knowledge', 'context'].includes(type)) {
        res.status(400).json({ error: 'Invalid memory type' });
        return;
      }
      
      const memories = memoryModule.getAllMemoriesByType(type as any);
      
      res.status(200).json(memories);
    } catch (error) {
      console.error(`Error getting memories of type ${req.params.type}:`, error);
      res.status(500).json({ error: 'Failed to retrieve memories' });
    }
  };

  /**
   * Create a conversation memory
   */
  createConversationMemory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messages, tags } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'Missing or invalid messages' });
        return;
      }
      
      const memoryId = memoryModule.createConversationMemory(messages, tags || []);
      res.status(201).json({ memoryId });
    } catch (error) {
      console.error('Error creating conversation memory:', error);
      res.status(500).json({ error: 'Failed to create conversation memory' });
    }
  };

  /**
   * Add message to conversation memory
   */
  addMessageToConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memoryId } = req.params;
      const { message } = req.body;
      
      if (!message) {
        res.status(400).json({ error: 'Missing message' });
        return;
      }
      
      const result = memoryModule.addMessageToConversation(memoryId, message);
      
      if (!result) {
        res.status(404).json({ error: 'Conversation memory not found' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error adding message to conversation ${req.params.memoryId}:`, error);
      res.status(500).json({ error: 'Failed to add message to conversation' });
    }
  };

  /**
   * Get conversation messages
   */
  getConversationMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memoryId } = req.params;
      const messages = memoryModule.getConversationMessages(memoryId);
      
      res.status(200).json(messages);
    } catch (error) {
      console.error(`Error getting conversation messages ${req.params.memoryId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve conversation messages' });
    }
  };
}

// Create controller
const memoryController = new MemoryController();

// Create router
const router = express.Router();

// Memory routes
router.post('/memories', memoryController.createMemory);
router.get('/memories/:memoryId', memoryController.getMemory);
router.put('/memories/:memoryId', memoryController.updateMemory);
router.delete('/memories/:memoryId', memoryController.deleteMemory);

// Search routes
router.get('/memories/search/tags', memoryController.searchMemoriesByTags);
router.get('/memories/search/content', memoryController.searchMemoriesByContent);

// Type-specific routes
router.get('/memories/type/:type', memoryController.getAllMemoriesByType);

// Conversation-specific routes
router.post('/conversations', memoryController.createConversationMemory);
router.post('/conversations/:memoryId/messages', memoryController.addMessageToConversation);
router.get('/conversations/:memoryId/messages', memoryController.getConversationMessages);

export default router;
