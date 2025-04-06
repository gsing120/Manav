import express from 'express';
import { Request, Response } from 'express';
import { RealTimeLearningSystem, FeedbackInput, FeedbackResult, KnowledgeGap, LearningStats, ImprovedResponse } from './RealTimeLearningSystem';

// Create real-time learning system
const learningSystem = new RealTimeLearningSystem();

/**
 * LearningController provides HTTP endpoints for real-time learning capabilities
 */
export class LearningController {
  /**
   * Collect feedback from user interaction
   */
  collectFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!learningSystem.isReady()) {
        await learningSystem.initialize();
      }
      
      // Get feedback from request
      const feedback: FeedbackInput = req.body;
      
      if (!feedback || !feedback.content) {
        res.status(400).json({ error: 'Invalid feedback data' });
        return;
      }
      
      // Collect feedback
      const result = await learningSystem.collectFeedback(feedback);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error collecting feedback:', error);
      res.status(500).json({ error: 'Failed to collect feedback' });
    }
  };

  /**
   * Get identified knowledge gaps
   */
  getKnowledgeGaps = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!learningSystem.isReady()) {
        await learningSystem.initialize();
      }
      
      // Get knowledge gaps
      const gaps = await learningSystem.getKnowledgeGaps();
      
      res.status(200).json(gaps);
    } catch (error) {
      console.error('Error getting knowledge gaps:', error);
      res.status(500).json({ error: 'Failed to get knowledge gaps' });
    }
  };

  /**
   * Get learning statistics
   */
  getLearningStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!learningSystem.isReady()) {
        await learningSystem.initialize();
      }
      
      // Get learning statistics
      const stats = await learningSystem.getLearningStats();
      
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error getting learning statistics:', error);
      res.status(500).json({ error: 'Failed to get learning statistics' });
    }
  };

  /**
   * Improve a response using learned improvements
   */
  improveResponse = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if system is initialized
      if (!learningSystem.isReady()) {
        await learningSystem.initialize();
      }
      
      // Get response and context from request
      const { response, context } = req.body;
      
      if (!response) {
        res.status(400).json({ error: 'Response is required' });
        return;
      }
      
      // Improve response
      const improvedResponse = await learningSystem.improveResponse(response, context || '');
      
      res.status(200).json(improvedResponse);
    } catch (error) {
      console.error('Error improving response:', error);
      res.status(500).json({ error: 'Failed to improve response' });
    }
  };

  /**
   * Check if the learning system is ready
   */
  checkStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const isReady = learningSystem.isReady();
      
      res.status(200).json({
        status: isReady ? 'ready' : 'initializing',
        message: isReady ? 'Real-time learning system is ready' : 'Real-time learning system is initializing'
      });
    } catch (error) {
      console.error('Error checking learning system status:', error);
      res.status(500).json({ error: 'Failed to check learning system status' });
    }
  };
}

// Create controller
const learningController = new LearningController();

// Create router
const router = express.Router();

// Learning routes
router.get('/status', learningController.checkStatus);
router.post('/feedback', learningController.collectFeedback);
router.get('/knowledge-gaps', learningController.getKnowledgeGaps);
router.get('/stats', learningController.getLearningStats);
router.post('/improve-response', learningController.improveResponse);

export default router;
