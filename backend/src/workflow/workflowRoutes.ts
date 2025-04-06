import express from 'express';
import { WorkflowEngine } from '../workflow/WorkflowEngine';
import { FunctionService } from '../services/FunctionService';
import { ModelIntegrationService } from '../services/ModelIntegrationService';
import { SettingsService } from '../services/SettingsService';
import { Request, Response } from 'express';

// Create services
const settingsService = new SettingsService();
const functionService = new FunctionService();
const modelIntegrationService = new ModelIntegrationService(functionService, settingsService);

// Create workflow engine
const workflowEngine = new WorkflowEngine(functionService, modelIntegrationService);

/**
 * WorkflowController provides HTTP endpoints for interacting with the workflow engine
 */
export class WorkflowController {
  /**
   * Create a new workflow
   */
  createWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
      const { initialContext } = req.body;
      const workflowId = workflowEngine.createWorkflow(initialContext || {});
      res.status(201).json({ workflowId });
    } catch (error) {
      console.error('Error creating workflow:', error);
      res.status(500).json({ error: 'Failed to create workflow' });
    }
  };

  /**
   * Get a workflow by ID
   */
  getWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId } = req.params;
      const workflow = workflowEngine.getWorkflow(workflowId);
      
      if (!workflow) {
        res.status(404).json({ error: 'Workflow not found' });
        return;
      }
      
      // Remove process objects from shell sessions for JSON serialization
      const sanitizedWorkflow = { ...workflow };
      if (sanitizedWorkflow.shellSessions) {
        for (const sessionId in sanitizedWorkflow.shellSessions) {
          const session = { ...sanitizedWorkflow.shellSessions[sessionId] };
          delete session.process;
          sanitizedWorkflow.shellSessions[sessionId] = session;
        }
      }
      
      res.status(200).json(sanitizedWorkflow);
    } catch (error) {
      console.error(`Error getting workflow ${req.params.workflowId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve workflow' });
    }
  };

  /**
   * Execute a step in a workflow
   */
  executeStep = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId } = req.params;
      const step = req.body;
      
      if (!step || !step.type || !step.input) {
        res.status(400).json({ error: 'Invalid step definition' });
        return;
      }
      
      const result = await workflowEngine.executeStep(workflowId, step);
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error executing step in workflow ${req.params.workflowId}:`, error);
      res.status(500).json({ error: 'Failed to execute step' });
    }
  };

  /**
   * Start a shell session in a workflow
   */
  startShellSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId } = req.params;
      const session = workflowEngine.startShellSession(workflowId);
      res.status(200).json(session);
    } catch (error) {
      console.error(`Error starting shell session in workflow ${req.params.workflowId}:`, error);
      res.status(500).json({ error: 'Failed to start shell session' });
    }
  };

  /**
   * Write to a shell session
   */
  writeToShellSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId, sessionId } = req.params;
      const { input, pressEnter } = req.body;
      
      if (!input) {
        res.status(400).json({ error: 'Missing input' });
        return;
      }
      
      // Add newline if pressEnter is true
      const formattedInput = pressEnter ? `${input}\n` : input;
      
      const result = workflowEngine.writeToShellSession(workflowId, sessionId, formattedInput);
      res.status(200).json({ success: result });
    } catch (error) {
      console.error(`Error writing to shell session ${req.params.sessionId}:`, error);
      res.status(500).json({ error: 'Failed to write to shell session' });
    }
  };

  /**
   * Get shell session output
   */
  getShellSessionOutput = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId, sessionId } = req.params;
      const output = workflowEngine.getShellSessionOutput(workflowId, sessionId);
      res.status(200).json({ output });
    } catch (error) {
      console.error(`Error getting shell session output ${req.params.sessionId}:`, error);
      res.status(500).json({ error: 'Failed to get shell session output' });
    }
  };

  /**
   * Kill a shell session
   */
  killShellSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId, sessionId } = req.params;
      const result = workflowEngine.killShellSession(workflowId, sessionId);
      res.status(200).json({ success: result });
    } catch (error) {
      console.error(`Error killing shell session ${req.params.sessionId}:`, error);
      res.status(500).json({ error: 'Failed to kill shell session' });
    }
  };

  /**
   * Clean up a workflow
   */
  cleanupWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId } = req.params;
      const result = workflowEngine.cleanupWorkflow(workflowId);
      res.status(200).json({ success: result });
    } catch (error) {
      console.error(`Error cleaning up workflow ${req.params.workflowId}:`, error);
      res.status(500).json({ error: 'Failed to clean up workflow' });
    }
  };
}

// Create controller
const workflowController = new WorkflowController();

// Create router
const router = express.Router();

// Workflow routes
router.post('/workflows', workflowController.createWorkflow);
router.get('/workflows/:workflowId', workflowController.getWorkflow);
router.post('/workflows/:workflowId/steps', workflowController.executeStep);
router.delete('/workflows/:workflowId', workflowController.cleanupWorkflow);

// Shell session routes
router.post('/workflows/:workflowId/shell', workflowController.startShellSession);
router.post('/workflows/:workflowId/shell/:sessionId', workflowController.writeToShellSession);
router.get('/workflows/:workflowId/shell/:sessionId', workflowController.getShellSessionOutput);
router.delete('/workflows/:workflowId/shell/:sessionId', workflowController.killShellSession);

export default router;
