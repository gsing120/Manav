import express from 'express';
import { EnhancedVirtualLinuxSandbox } from '../sandbox/EnhancedVirtualLinuxSandbox';
import { Request, Response } from 'express';

// Create enhanced virtual Linux sandbox
const enhancedSandbox = new EnhancedVirtualLinuxSandbox();

/**
 * EnhancedSandboxController provides HTTP endpoints for interacting with the enhanced virtual Linux sandbox
 */
export class EnhancedSandboxController {
  /**
   * Create a new sandbox
   */
  createSandbox = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      const sandbox = enhancedSandbox.createSandbox(name);
      
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
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
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
      const result = enhancedSandbox.deleteSandbox(sandboxId);
      
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
      
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
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
   * Store credentials for a website
   */
  storeCredentials = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { website, username, password } = req.body;
      
      if (!website || !username || !password) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }
      
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const result = sandbox.storeCredentials(website, username, password);
      
      if (result) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to store credentials' });
      }
    } catch (error) {
      console.error(`Error storing credentials in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to store credentials' });
    }
  };

  /**
   * Get credentials for a website
   */
  getCredentials = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { website } = req.query;
      
      if (!website) {
        res.status(400).json({ error: 'Missing website parameter' });
        return;
      }
      
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const credentials = sandbox.getCredentials(website as string);
      
      if (credentials) {
        res.status(200).json(credentials);
      } else {
        res.status(404).json({ error: 'Credentials not found' });
      }
    } catch (error) {
      console.error(`Error getting credentials in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to get credentials' });
    }
  };

  /**
   * List all stored website credentials
   */
  listCredentials = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const websites = sandbox.listCredentials();
      
      res.status(200).json({ websites });
    } catch (error) {
      console.error(`Error listing credentials in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to list credentials' });
    }
  };

  /**
   * Create a browser instance
   */
  createBrowserInstance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const browser = sandbox.createBrowserInstance();
      
      res.status(201).json({
        sandboxId,
        browserId: browser.isActive() ? 'active' : 'inactive'
      });
    } catch (error) {
      console.error(`Error creating browser instance in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to create browser instance' });
    }
  };

  /**
   * Navigate to a URL
   */
  navigateToUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { url } = req.body;
      
      if (!url) {
        res.status(400).json({ error: 'Missing URL' });
        return;
      }
      
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const browser = sandbox.getBrowserInstance();
      
      if (!browser) {
        res.status(400).json({ error: 'No active browser instance' });
        return;
      }
      
      const response = await browser.navigateTo(url);
      
      res.status(200).json({
        url: response.url,
        status: response.status,
        content: typeof response.content === 'string' ? response.content : JSON.stringify(response.content)
      });
    } catch (error) {
      console.error(`Error navigating to URL in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to navigate to URL' });
    }
  };

  /**
   * Submit a form
   */
  submitForm = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { url, formData, method } = req.body;
      
      if (!url || !formData) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }
      
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const browser = sandbox.getBrowserInstance();
      
      if (!browser) {
        res.status(400).json({ error: 'No active browser instance' });
        return;
      }
      
      const response = await browser.submitForm(url, formData, method);
      
      res.status(200).json({
        url: response.url,
        status: response.status,
        content: typeof response.content === 'string' ? response.content : JSON.stringify(response.content)
      });
    } catch (error) {
      console.error(`Error submitting form in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to submit form' });
    }
  };

  /**
   * Login to a website
   */
  loginToWebsite = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { url, usernameField, passwordField, submitButtonSelector } = req.body;
      
      if (!url) {
        res.status(400).json({ error: 'Missing URL' });
        return;
      }
      
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const browser = sandbox.getBrowserInstance();
      
      if (!browser) {
        res.status(400).json({ error: 'No active browser instance' });
        return;
      }
      
      const response = await browser.loginToWebsite(
        url, 
        usernameField || 'username', 
        passwordField || 'password',
        submitButtonSelector || ''
      );
      
      res.status(200).json({
        url: response.url,
        status: response.status,
        success: !response.error && response.status >= 200 && response.status < 400,
        error: response.error
      });
    } catch (error) {
      console.error(`Error logging into website in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to login to website' });
    }
  };

  /**
   * Download a file
   */
  downloadFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId } = req.params;
      const { url, filePath } = req.body;
      
      if (!url || !filePath) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }
      
      const sandbox = enhancedSandbox.getSandbox(sandboxId);
      
      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }
      
      const browser = sandbox.getBrowserInstance();
      
      if (!browser) {
        res.status(400).json({ error: 'No active browser instance' });
        return;
      }
      
      const savedPath = await browser.downloadFile(url, filePath);
      
      res.status(200).json({
        url,
        filePath: savedPath,
        success: true
      });
    } catch (error) {
      console.error(`Error downloading file in sandbox ${req.params.sandboxId}:`, error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  };
}

// Create controller
const enhancedSandboxController = new EnhancedSandboxController();

// Create router
const router = express.Router();

// Sandbox routes
router.post('/sandboxes', enhancedSandboxController.createSandbox);
router.get('/sandboxes/:sandboxId', enhancedSandboxController.getSandbox);
router.delete('/sandboxes/:sandboxId', enhancedSandboxController.deleteSandbox);

// Command execution route
router.post('/sandboxes/:sandboxId/exec', enhancedSandboxController.executeCommand);

// Credential management routes
router.post('/sandboxes/:sandboxId/credentials', enhancedSandboxController.storeCredentials);
router.get('/sandboxes/:sandboxId/credentials', enhancedSandboxController.getCredentials);
router.get('/sandboxes/:sandboxId/credentials/list', enhancedSandboxController.listCredentials);

// Browser routes
router.post('/sandboxes/:sandboxId/browser', enhancedSandboxController.createBrowserInstance);
router.post('/sandboxes/:sandboxId/browser/navigate', enhancedSandboxController.navigateToUrl);
router.post('/sandboxes/:sandboxId/browser/form', enhancedSandboxController.submitForm);
router.post('/sandboxes/:sandboxId/browser/login', enhancedSandboxController.loginToWebsite);
router.post('/sandboxes/:sandboxId/browser/download', enhancedSandboxController.downloadFile);

export default router;
