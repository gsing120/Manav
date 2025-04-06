import express from 'express';
import { SpecializedCapabilities } from '../specialized/SpecializedCapabilities';

const router = express.Router();
const specializedCapabilities = new SpecializedCapabilities();

/**
 * Initialize specialized capabilities
 */
router.get('/initialize', async (req, res) => {
  try {
    await specializedCapabilities.initialize();
    res.json({ success: true, message: 'Specialized capabilities initialized successfully' });
  } catch (error) {
    console.error('Error initializing specialized capabilities:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize specialized capabilities' });
  }
});

/**
 * Check if specialized capabilities are ready
 */
router.get('/status', (req, res) => {
  try {
    const isReady = specializedCapabilities.isReady();
    res.json({ success: true, isReady });
  } catch (error) {
    console.error('Error checking specialized capabilities status:', error);
    res.status(500).json({ success: false, message: 'Failed to check specialized capabilities status' });
  }
});

/**
 * Generate code
 */
router.post('/code', async (req, res) => {
  try {
    const { language, requirements, context } = req.body;
    
    if (!language || !requirements) {
      return res.status(400).json({ success: false, message: 'Language and requirements are required' });
    }
    
    const result = await specializedCapabilities.generateCode(language, requirements, context);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ success: false, message: 'Failed to generate code' });
  }
});

/**
 * Generate creative content
 */
router.post('/creative', async (req, res) => {
  try {
    const { type, topic, requirements } = req.body;
    
    if (!type || !topic) {
      return res.status(400).json({ success: false, message: 'Type and topic are required' });
    }
    
    const result = await specializedCapabilities.generateCreativeContent(type, topic, requirements);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error generating creative content:', error);
    res.status(500).json({ success: false, message: 'Failed to generate creative content' });
  }
});

/**
 * Solve problem
 */
router.post('/problem', async (req, res) => {
  try {
    const { problemType, problemStatement, constraints } = req.body;
    
    if (!problemType || !problemStatement) {
      return res.status(400).json({ success: false, message: 'Problem type and statement are required' });
    }
    
    const result = await specializedCapabilities.solveProblem(problemType, problemStatement, constraints);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error solving problem:', error);
    res.status(500).json({ success: false, message: 'Failed to solve problem' });
  }
});

export default router;
