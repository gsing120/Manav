import express from 'express';
import { KnowledgeSystem } from '../knowledge/KnowledgeSystem';
import { MemoryModule } from '../memory/MemoryModule';
import { Request, Response } from 'express';

// Create memory module and knowledge system
const memoryModule = new MemoryModule();
const knowledgeSystem = new KnowledgeSystem(memoryModule);

/**
 * KnowledgeController provides HTTP endpoints for interacting with the knowledge system
 */
export class KnowledgeController {
  /**
   * Add a knowledge entry
   */
  addKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { content, name, tags } = req.body;
      
      if (!content || !name) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }
      
      const knowledgeId = knowledgeSystem.addKnowledge(content, name, tags || []);
      res.status(201).json({ knowledgeId });
    } catch (error) {
      console.error('Error adding knowledge:', error);
      res.status(500).json({ error: error.message || 'Failed to add knowledge' });
    }
  };

  /**
   * Get a knowledge entry by ID
   */
  getKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { knowledgeId } = req.params;
      const knowledge = knowledgeSystem.getKnowledge(knowledgeId);
      
      if (!knowledge) {
        res.status(404).json({ error: 'Knowledge not found' });
        return;
      }
      
      res.status(200).json(knowledge);
    } catch (error) {
      console.error(`Error getting knowledge ${req.params.knowledgeId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve knowledge' });
    }
  };

  /**
   * Update a knowledge entry
   */
  updateKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { knowledgeId } = req.params;
      const { content, name, tags } = req.body;
      
      const result = knowledgeSystem.updateKnowledge(knowledgeId, content, name, tags);
      
      if (!result) {
        res.status(404).json({ error: 'Knowledge not found' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error updating knowledge ${req.params.knowledgeId}:`, error);
      res.status(500).json({ error: 'Failed to update knowledge' });
    }
  };

  /**
   * Delete a knowledge entry
   */
  deleteKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { knowledgeId } = req.params;
      const result = knowledgeSystem.deleteKnowledge(knowledgeId);
      
      if (!result) {
        res.status(404).json({ error: 'Knowledge not found' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error deleting knowledge ${req.params.knowledgeId}:`, error);
      res.status(500).json({ error: 'Failed to delete knowledge' });
    }
  };

  /**
   * Activate a knowledge entry
   */
  activateKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { knowledgeId } = req.params;
      const result = knowledgeSystem.activateKnowledge(knowledgeId);
      
      if (!result) {
        res.status(404).json({ error: 'Knowledge not found' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error activating knowledge ${req.params.knowledgeId}:`, error);
      res.status(500).json({ error: 'Failed to activate knowledge' });
    }
  };

  /**
   * Deactivate a knowledge entry
   */
  deactivateKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { knowledgeId } = req.params;
      const result = knowledgeSystem.deactivateKnowledge(knowledgeId);
      
      if (!result) {
        res.status(404).json({ error: 'Knowledge not found' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error deactivating knowledge ${req.params.knowledgeId}:`, error);
      res.status(500).json({ error: 'Failed to deactivate knowledge' });
    }
  };

  /**
   * Get all knowledge entries
   */
  getAllKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const knowledge = knowledgeSystem.getAllKnowledge();
      res.status(200).json(knowledge);
    } catch (error) {
      console.error('Error getting all knowledge:', error);
      res.status(500).json({ error: 'Failed to retrieve knowledge' });
    }
  };

  /**
   * Get active knowledge entries
   */
  getActiveKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const knowledge = knowledgeSystem.getActiveKnowledge();
      res.status(200).json(knowledge);
    } catch (error) {
      console.error('Error getting active knowledge:', error);
      res.status(500).json({ error: 'Failed to retrieve active knowledge' });
    }
  };

  /**
   * Search knowledge entries by tags
   */
  searchKnowledgeByTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tags } = req.query;
      
      if (!tags) {
        res.status(400).json({ error: 'Missing tags parameter' });
        return;
      }
      
      const tagArray = Array.isArray(tags) ? tags : [tags];
      const knowledge = knowledgeSystem.searchKnowledgeByTags(tagArray as string[]);
      
      res.status(200).json(knowledge);
    } catch (error) {
      console.error('Error searching knowledge by tags:', error);
      res.status(500).json({ error: 'Failed to search knowledge' });
    }
  };

  /**
   * Search knowledge entries by content
   */
  searchKnowledgeByContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.query;
      
      if (!query) {
        res.status(400).json({ error: 'Missing query parameter' });
        return;
      }
      
      const knowledge = knowledgeSystem.searchKnowledgeByContent(query as string);
      
      res.status(200).json(knowledge);
    } catch (error) {
      console.error('Error searching knowledge by content:', error);
      res.status(500).json({ error: 'Failed to search knowledge' });
    }
  };

  /**
   * Get knowledge entries for a specific context
   */
  getKnowledgeForContext = async (req: Request, res: Response): Promise<void> => {
    try {
      const { context } = req.body;
      const { maxEntries } = req.query;
      
      if (!context) {
        res.status(400).json({ error: 'Missing context parameter' });
        return;
      }
      
      const max = maxEntries ? parseInt(maxEntries as string, 10) : undefined;
      const knowledge = knowledgeSystem.getKnowledgeForContext(context, max);
      
      res.status(200).json(knowledge);
    } catch (error) {
      console.error('Error getting knowledge for context:', error);
      res.status(500).json({ error: 'Failed to retrieve knowledge for context' });
    }
  };

  /**
   * Get the maximum number of knowledge entries allowed
   */
  getMaxKnowledgeEntries = async (req: Request, res: Response): Promise<void> => {
    try {
      const max = knowledgeSystem.getMaxKnowledgeEntries();
      res.status(200).json({ max });
    } catch (error) {
      console.error('Error getting max knowledge entries:', error);
      res.status(500).json({ error: 'Failed to retrieve max knowledge entries' });
    }
  };

  /**
   * Set the maximum number of knowledge entries allowed
   */
  setMaxKnowledgeEntries = async (req: Request, res: Response): Promise<void> => {
    try {
      const { max } = req.body;
      
      if (!max || typeof max !== 'number' || max <= 0) {
        res.status(400).json({ error: 'Invalid max parameter' });
        return;
      }
      
      knowledgeSystem.setMaxKnowledgeEntries(max);
      res.status(200).json({ success: true, max });
    } catch (error) {
      console.error('Error setting max knowledge entries:', error);
      res.status(500).json({ error: 'Failed to set max knowledge entries' });
    }
  };
}

// Create controller
const knowledgeController = new KnowledgeController();

// Create router
const router = express.Router();

// Knowledge routes
router.post('/knowledge', knowledgeController.addKnowledge);
router.get('/knowledge/:knowledgeId', knowledgeController.getKnowledge);
router.put('/knowledge/:knowledgeId', knowledgeController.updateKnowledge);
router.delete('/knowledge/:knowledgeId', knowledgeController.deleteKnowledge);

// Activation routes
router.post('/knowledge/:knowledgeId/activate', knowledgeController.activateKnowledge);
router.post('/knowledge/:knowledgeId/deactivate', knowledgeController.deactivateKnowledge);

// List routes
router.get('/knowledge', knowledgeController.getAllKnowledge);
router.get('/knowledge/active/list', knowledgeController.getActiveKnowledge);

// Search routes
router.get('/knowledge/search/tags', knowledgeController.searchKnowledgeByTags);
router.get('/knowledge/search/content', knowledgeController.searchKnowledgeByContent);
router.post('/knowledge/context', knowledgeController.getKnowledgeForContext);

// Configuration routes
router.get('/knowledge/config/max', knowledgeController.getMaxKnowledgeEntries);
router.post('/knowledge/config/max', knowledgeController.setMaxKnowledgeEntries);

export default router;
