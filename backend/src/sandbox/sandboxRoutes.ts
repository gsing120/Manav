import express from 'express';
import { VirtualLinuxSandbox } from '../sandbox/VirtualLinuxSandbox';
import { Request, Response } from 'express';

// Create virtual Linux sandbox
const virtualLinuxSandbox = new VirtualLinuxSandbox();

/**
 * SandboxController provides HTTP endpoints for interacting with the virtual Linux sandbox
 */
export class SandboxController {
  /**
   * Create a new sandbox
   */
  createSandbox = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      const sandbox = virtualLinuxSandbox.createSandbox(name);
      
      res.status(201).json({
        id: sandbox.getId(),
        homePath: sandbox.getHomePath()
      });
    } catch (error) {
      console.error('Error creating sandbox:', error);
      res.status(500).json({ error: 'Failed to create sandbox' });
    }
  };

  /**
   * Get a sandbox by ID
   */
  getSandbox = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      res.status(200).json({
        id: sandbox.getId(),
        homePath: sandbox.getHomePath()
      });
    } catch (error) {
      console.error(`Error getting sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve sandbox' });
    }
  };

  /**
   * Delete a sandbox
   */
  deleteSandbox = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const result = virtualLinuxSandbox.deleteSandbox(sandboxId);
      
      if (!result) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error deleting sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to delete sandbox' });
    }
  };

  /**
   * Get all sandboxes
   */
  getAllSandboxes = async (req: Request, res: Response): Promise<void> => {
    try {
      const sandboxes = virtualLinuxSandbox.getAllSandboxes().map(sandbox => ({
        id: sandbox.getId(),
        homePath: sandbox.getHomePath()
      }));
      
      res.status(200).json(sandboxes);
    } catch (error) {
      console.error('Error getting all sandboxes:', error);
      res.status(500).json({ error: 'Failed to retrieve sandboxes' });
    }
  };

  /**
   * Create a shell session in a sandbox
   */
  createShellSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const session = sandbox.createShellSession();
      
      res.status(201).json({
        sessionId: session.getId(),
        sandboxId: sandbox.getId()
      });
    } catch (error) {
      console.error(`Error creating shell session in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to create shell session' });
    }
  };

  /**
   * Get a shell session
   */
  getShellSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId, sessionId } = req.params;
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const session = sandbox.getShellSession(sessionId);
      
      if (!session) {
        res.status(404).json({ error: 'Shell session not found' });
        return;
      }
      
      res.status(200).json({
        sessionId: session.getId(),
        output: session.getOutput(),
        active: session.isActive()
      });
    } catch (error) {
      console.error(`Error getting shell session ${req.params.sessionId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve shell session' });
    }
  };

  /**
   * Write to a shell session
   */
  writeToShellSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId, sessionId } = req.params;
      const { input, pressEnter } = req.body;
      
      if (!input) {
        res.status(400).json({ error: 'Missing input' });
        return;
      }
      
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const session = sandbox.getShellSession(sessionId);
      
      if (!session) {
        res.status(404).json({ error: 'Shell session not found' });
        return;
      }
      
      // Add newline if pressEnter is true
      const formattedInput = pressEnter ? `${input}\n` : input;
      
      await session.writeToProcess(formattedInput);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error writing to shell session ${req.params.sessionId}:`, error);
      res.status(500).json({ error: 'Failed to write to shell session' });
    }
  };

  /**
   * Terminate a shell session
   */
  terminateShellSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId, sessionId } = req.params;
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const result = sandbox.terminateShellSession(sessionId);
      
      if (!result) {
        res.status(404).json({ error: 'Shell session not found' });
        return;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error terminating shell session ${req.params.sessionId}:`, error);
      res.status(500).json({ error: 'Failed to terminate shell session' });
    }
  };

  /**
   * Execute a command in a sandbox
   */
  executeCommand = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { command, cwd } = req.body;
      
      if (!command) {
        res.status(400).json({ error: 'Missing command' });
        return;
      }
      
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const result = await sandbox.executeCommand(command, cwd);
      
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error executing command in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to execute command' });
    }
  };

  /**
   * Read a file in a sandbox
   */
  readFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { filePath } = req.query;
      
      if (!filePath) {
        res.status(400).json({ error: 'Missing filePath' });
        return;
      }
      
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const content = sandbox.readFile(filePath as string);
      
      res.status(200).json({ content });
    } catch (error) {
      console.error(`Error reading file in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: error.message || 'Failed to read file' });
    }
  };

  /**
   * Write to a file in a sandbox
   */
  writeFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { filePath, content, append } = req.body;
      
      if (!filePath || content === undefined) {
        res.status(400).json({ error: 'Missing filePath or content' });
        return;
      }
      
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      sandbox.writeFile(filePath, content, append);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error writing file in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: error.message || 'Failed to write file' });
    }
  };

  /**
   * Delete a file in a sandbox
   */
  deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { filePath } = req.query;
      
      if (!filePath) {
        res.status(400).json({ error: 'Missing filePath' });
        return;
      }
      
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      sandbox.deleteFile(filePath as string);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error deleting file in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: error.message || 'Failed to delete file' });
    }
  };

  /**
   * List files in a directory in a sandbox
   */
  listFiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { dirPath } = req.query;
      
      if (!dirPath) {
        res.status(400).json({ error: 'Missing dirPath' });
        return;
      }
      
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const files = sandbox.listFiles(dirPath as string);
      
      res.status(200).json({ files });
    } catch (error) {
      console.error(`Error listing files in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: error.message || 'Failed to list files' });
    }
  };

  /**
   * Get file information in a sandbox
   */
  getFileInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { filePath } = req.query;
      
      if (!filePath) {
        res.status(400).json({ error: 'Missing filePath' });
        return;
      }
      
      const sandbox = virtualLinuxSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const fileInfo = sandbox.getFileInfo(filePath as string);
      
      res.status(200).json(fileInfo);
    } catch (error) {
      console.error(`Error getting file info in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: error.message || 'Failed to get file info' });
    }
  };
}

// Create controller
const sandboxController = new SandboxController();

// Create router
const router = express.Router();

// Sandbox routes
router.post('/sandboxes', sandboxController.createSandbox);
router.get('/sandboxes/:sandboxId', sandboxController.getSandbox);
router.delete('/sandboxes/:sandboxId', sandboxController.deleteSandbox);
router.get('/sandboxes', sandboxController.getAllSandboxes);

// Shell session routes
router.post('/sandboxes/:sandboxId/shell', sandboxController.createShellSession);
router.get('/sandboxes/:sandboxId/shell/:sessionId', sandboxController.getShellSession);
router.post('/sandboxes/:sandboxId/shell/:sessionId', sandboxController.writeToShellSession);
router.delete('/sandboxes/:sandboxId/shell/:sessionId', sandboxController.terminateShellSession);

// Command execution route
router.post('/sandboxes/:sandboxId/exec', sandboxController.executeCommand);

// File operation routes
router.get('/sandboxes/:sandboxId/files', sandboxController.readFile);
router.post('/sandboxes/:sandboxId/files', sandboxController.writeFile);
router.delete('/sandboxes/:sandboxId/files', sandboxController.deleteFile);
router.get('/sandboxes/:sandboxId/files/list', sandboxController.listFiles);
router.get('/sandboxes/:sandboxId/files/info', sandboxController.getFileInfo);

export default router;
