import express from 'express';
import { Request, Response } from 'express';
import { AdvancedReasoningFramework, ReasoningResult } from './AdvancedReasoningFramework';

// Create advanced reasoning framework
const reasoningFramework = new AdvancedReasoningFramework();

/**
 * ReasoningController provides HTTP endpoints for advanced reasoning capabilities
 */
export class ReasoningController {
  /**
   * Perform reasoning on a complex problem
   */
  performReasoning = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if framework is initialized
      if (!reasoningFramework.isReady()) {
        await reasoningFramework.initialize();
      }
      
      // Get problem from request
      const { problem } = req.body;
      
      if (!problem) {
        res.status(400).json({ error: 'No problem provided' });
        return;
      }
      
      // Perform reasoning
      const result = await reasoningFramework.performReasoning(problem);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error performing reasoning:', error);
      res.status(500).json({ error: 'Failed to perform reasoning' });
    }
  };

  /**
   * Check if the reasoning framework is ready
   */
  checkStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const isReady = reasoningFramework.isReady();
      
      res.status(200).json({
        status: isReady ? 'ready' : 'initializing',
        message: isReady ? 'Advanced reasoning framework is ready' : 'Advanced reasoning framework is initializing'
      });
    } catch (error) {
      console.error('Error checking reasoning framework status:', error);
      res.status(500).json({ error: 'Failed to check reasoning framework status' });
    }
  };
}

// Create controller
const reasoningController = new ReasoningController();

// Create router
const router = express.Router();

// Reasoning routes
router.get('/status', reasoningController.checkStatus);
router.post('/reason', reasoningController.performReasoning);

export default router;
