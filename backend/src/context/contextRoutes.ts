import express from 'express';
import { Request, Response } from 'express';
import { ContextualAwarenessSystem, KnowledgeItem, CurrentEvent, EntityRelationship, TemporalReference } from './ContextualAwarenessSystem';

// Create contextual awareness system
const contextualAwarenessSystem = new ContextualAwarenessSystem();

/**
 * ContextualAwarenessController provides HTTP endpoints for contextual awareness capabilities
 */
export class ContextualAwarenessController {
  /**
   * Get all knowledge items
   */
  getKnowledgeItems = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get all knowledge items
      const knowledgeItems = await contextualAwarenessSystem.getKnowledgeItems();
      
      res.status(200).json(knowledgeItems);
    } catch (error) {
      console.error('Error getting knowledge items:', error);
      res.status(500).json({ error: 'Failed to get knowledge items' });
    }
  };

  /**
   * Add a knowledge item
   */
  addKnowledgeItem = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get knowledge item from request
      const knowledgeItem = req.body;
      
      if (!knowledgeItem || !knowledgeItem.topic || !knowledgeItem.content) {
        res.status(400).json({ error: 'Invalid knowledge item' });
        return;
      }
      
      // Add knowledge item
      const newItem = await contextualAwarenessSystem.addKnowledgeItem(knowledgeItem);
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error adding knowledge item:', error);
      res.status(500).json({ error: 'Failed to add knowledge item' });
    }
  };

  /**
   * Update a knowledge item
   */
  updateKnowledgeItem = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get knowledge item ID from request
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Knowledge item ID is required' });
        return;
      }
      
      // Get updates from request
      const updates = req.body;
      
      if (!updates) {
        res.status(400).json({ error: 'Updates are required' });
        return;
      }
      
      // Update knowledge item
      const updatedItem = await contextualAwarenessSystem.updateKnowledgeItem(id, updates);
      
      if (!updatedItem) {
        res.status(404).json({ error: `Knowledge item '${id}' not found` });
        return;
      }
      
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating knowledge item:', error);
      res.status(500).json({ error: 'Failed to update knowledge item' });
    }
  };

  /**
   * Delete a knowledge item
   */
  deleteKnowledgeItem = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get knowledge item ID from request
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Knowledge item ID is required' });
        return;
      }
      
      // Delete knowledge item
      const success = await contextualAwarenessSystem.deleteKnowledgeItem(id);
      
      if (!success) {
        res.status(404).json({ error: `Knowledge item '${id}' not found` });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      res.status(500).json({ error: 'Failed to delete knowledge item' });
    }
  };

  /**
   * Search knowledge items
   */
  searchKnowledgeItems = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get query from request
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required' });
        return;
      }
      
      // Search knowledge items
      const knowledgeItems = await contextualAwarenessSystem.searchKnowledgeItems(query);
      
      res.status(200).json(knowledgeItems);
    } catch (error) {
      console.error('Error searching knowledge items:', error);
      res.status(500).json({ error: 'Failed to search knowledge items' });
    }
  };

  /**
   * Get all current events
   */
  getCurrentEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get all current events
      const currentEvents = await contextualAwarenessSystem.getCurrentEvents();
      
      res.status(200).json(currentEvents);
    } catch (error) {
      console.error('Error getting current events:', error);
      res.status(500).json({ error: 'Failed to get current events' });
    }
  };

  /**
   * Add a current event
   */
  addCurrentEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get current event from request
      const currentEvent = req.body;
      
      if (!currentEvent || !currentEvent.title || !currentEvent.description) {
        res.status(400).json({ error: 'Invalid current event' });
        return;
      }
      
      // Add current event
      const newEvent = await contextualAwarenessSystem.addCurrentEvent(currentEvent);
      
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error adding current event:', error);
      res.status(500).json({ error: 'Failed to add current event' });
    }
  };

  /**
   * Search current events
   */
  searchCurrentEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get query from request
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required' });
        return;
      }
      
      // Search current events
      const currentEvents = await contextualAwarenessSystem.searchCurrentEvents(query);
      
      res.status(200).json(currentEvents);
    } catch (error) {
      console.error('Error searching current events:', error);
      res.status(500).json({ error: 'Failed to search current events' });
    }
  };

  /**
   * Get all entity relationships
   */
  getEntityRelationships = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get all entity relationships
      const entityRelationships = await contextualAwarenessSystem.getEntityRelationships();
      
      res.status(200).json(entityRelationships);
    } catch (error) {
      console.error('Error getting entity relationships:', error);
      res.status(500).json({ error: 'Failed to get entity relationships' });
    }
  };

  /**
   * Add an entity relationship
   */
  addEntityRelationship = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get entity relationship from request
      const entityRelationship = req.body;
      
      if (!entityRelationship || !entityRelationship.sourceEntityId || !entityRelationship.targetEntityId || !entityRelationship.relationshipType) {
        res.status(400).json({ error: 'Invalid entity relationship' });
        return;
      }
      
      // Add entity relationship
      const newRelationship = await contextualAwarenessSystem.addEntityRelationship(entityRelationship);
      
      res.status(201).json(newRelationship);
    } catch (error) {
      console.error('Error adding entity relationship:', error);
      res.status(500).json({ error: 'Failed to add entity relationship' });
    }
  };

  /**
   * Get entity relationships for an entity
   */
  getEntityRelationshipsForEntity = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get entity ID from request
      const { entityId } = req.params;
      
      if (!entityId) {
        res.status(400).json({ error: 'Entity ID is required' });
        return;
      }
      
      // Get entity relationships for entity
      const entityRelationships = await contextualAwarenessSystem.getEntityRelationshipsForEntity(entityId);
      
      res.status(200).json(entityRelationships);
    } catch (error) {
      console.error('Error getting entity relationships for entity:', error);
      res.status(500).json({ error: 'Failed to get entity relationships for entity' });
    }
  };

  /**
   * Get temporal context
   */
  getTemporalContext = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get temporal context
      const temporalContext = await contextualAwarenessSystem.getTemporalContext();
      
      res.status(200).json(temporalContext);
    } catch (error) {
      console.error('Error getting temporal context:', error);
      res.status(500).json({ error: 'Failed to get temporal context' });
    }
  };

  /**
   * Add a temporal reference
   */
  addTemporalReference = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get temporal reference from request
      const temporalReference = req.body;
      
      if (!temporalReference || !temporalReference.type || !temporalReference.referenceText || !temporalReference.resolvedDate) {
        res.status(400).json({ error: 'Invalid temporal reference' });
        return;
      }
      
      // Add temporal reference
      const updatedContext = await contextualAwarenessSystem.addTemporalReference(temporalReference);
      
      res.status(201).json(updatedContext);
    } catch (error) {
      console.error('Error adding temporal reference:', error);
      res.status(500).json({ error: 'Failed to add temporal reference' });
    }
  };

  /**
   * Set time zone
   */
  setTimeZone = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get time zone from request
      const { timeZone } = req.body;
      
      if (!timeZone) {
        res.status(400).json({ error: 'Time zone is required' });
        return;
      }
      
      // Set time zone
      const updatedContext = await contextualAwarenessSystem.setTimeZone(timeZone);
      
      res.status(200).json(updatedContext);
    } catch (error) {
      console.error('Error setting time zone:', error);
      res.status(500).json({ error: 'Failed to set time zone' });
    }
  };

  /**
   * Get context for a query
   */
  getContextForQuery = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get query from request
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required' });
        return;
      }
      
      // Get context for query
      const context = await contextualAwarenessSystem.getContextForQuery(query);
      
      res.status(200).json(context);
    } catch (error) {
      console.error('Error getting context for query:', error);
      res.status(500).json({ error: 'Failed to get context for query' });
    }
  };

  /**
   * Analyze temporal references in text
   */
  analyzeTemporalReferences = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get text from request
      const { text } = req.body;
      
      if (!text) {
        res.status(400).json({ error: 'Text is required' });
        return;
      }
      
      // Analyze temporal references
      const temporalReferences = await contextualAwarenessSystem.analyzeTemporalReferences(text);
      
      res.status(200).json(temporalReferences);
    } catch (error) {
      console.error('Error analyzing temporal references:', error);
      res.status(500).json({ error: 'Failed to analyze temporal references' });
    }
  };

  /**
   * Update knowledge base from web search
   */
  updateKnowledgeFromWebSearch = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get query from request
      const { query } = req.body;
      
      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }
      
      // Update knowledge from web search
      const knowledgeItems = await contextualAwarenessSystem.updateKnowledgeFromWebSearch(query);
      
      res.status(200).json(knowledgeItems);
    } catch (error) {
      console.error('Error updating knowledge from web search:', error);
      res.status(500).json({ error: 'Failed to update knowledge from web search' });
    }
  };

  /**
   * Update current events from news API
   */
  updateCurrentEventsFromNewsAPI = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Update current events from news API
      const currentEvents = await contextualAwarenessSystem.updateCurrentEventsFromNewsAPI();
      
      res.status(200).json(currentEvents);
    } catch (error) {
      console.error('Error updating current events from news API:', error);
      res.status(500).json({ error: 'Failed to update current events from news API' });
    }
  };

  /**
   * Enhance query with contextual awareness
   */
  enhanceQueryWithContext = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!contextualAwarenessSystem.isReady()) {
        await contextualAwarenessSystem.initialize();
      }
      
      // Get query from request
      const { query } = req.body;
      
      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }
      
      // Enhance query with context
      const enhancedQuery = await contextualAwarenessSystem.enhanceQueryWithContext(query);
      
      res.status(200).json(enhancedQuery);
    } catch (error) {
      console.error('Error enhancing query with context:', error);
      res.status(500).json({ error: 'Failed to enhance query with context' });
    }
  };

  /**
   * Check if the contextual awareness system is ready
   */
  checkStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const isReady = contextualAwarenessSystem.isReady();
      
      res.status(200).json({
        status: isReady ? 'ready' : 'initializing',
        message: isReady ? 'Contextual awareness system is ready' : 'Contextual awareness system is initializing'
      });
    } catch (error) {
      console.error('Error checking contextual awareness system status:', error);
      res.status(500).json({ error: 'Failed to check contextual awareness system status' });
    }
  };
}

// Create controller
const contextualAwarenessController = new ContextualAwarenessController();

// Create router
const router = express.Router();

// Contextual awareness routes
router.get('/status', contextualAwarenessController.checkStatus);

// Knowledge routes
router.get('/knowledge', contextualAwarenessController.getKnowledgeItems);
router.post('/knowledge', contextualAwarenessController.addKnowledgeItem);
router.put('/knowledge/:id', contextualAwarenessController.updateKnowledgeItem);
router.delete('/knowledge/:id', contextualAwarenessController.deleteKnowledgeItem);
router.get('/knowledge/search', contextualAwarenessController.searchKnowledgeItems);
router.post('/knowledge/web-search', contextualAwarenessController.updateKnowledgeFromWebSearch);

// Current events routes
router.get('/events', contextualAwarenessController.getCurrentEvents);
router.post('/events', contextualAwarenessController.addCurrentEvent);
router.get('/events/search', contextualAwarenessController.searchCurrentEvents);
router.post('/events/news-api', contextualAwarenessController.updateCurrentEventsFromNewsAPI);

// Entity relationship routes
router.get('/relationships', contextualAwarenessController.getEntityRelationships);
router.post('/relationships', contextualAwarenessController.addEntityRelationship);
router.get('/relationships/entity/:entityId', contextualAwarenessController.getEntityRelationshipsForEntity);

// Temporal context routes
router.get('/temporal', contextualAwarenessController.getTemporalContext);
router.post('/temporal/reference', contextualAwarenessController.addTemporalReference);
router.post('/temporal/timezone', contextualAwarenessController.setTimeZone);
router.post('/temporal/analyze', contextualAwarenessController.analyzeTemporalReferences);

// Context routes
router.get('/context', contextualAwarenessController.getContextForQuery);
router.post('/enhance', contextualAwarenessController.enhanceQueryWithContext);

export default router;
