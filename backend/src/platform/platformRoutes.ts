import express from 'express';
import { WindowsCompatibilityLayer } from '../platform/WindowsCompatibilityLayer';
import { Request, Response } from 'express';

// Create Windows compatibility layer
const windowsCompatibilityLayer = new WindowsCompatibilityLayer();

/**
 * PlatformController provides HTTP endpoints for interacting with platform-specific functionality
 */
export class PlatformController {
  /**
   * Get platform information
   */
  getPlatformInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const isWindows = windowsCompatibilityLayer.isWindowsPlatform();
      const appDataDir = windowsCompatibilityLayer.getAppDataDirectory();
      const platformEnv = windowsCompatibilityLayer.getPlatformEnv();
      const hasAdmin = await windowsCompatibilityLayer.hasAdminPrivileges();
      
      let wslAvailable = false;
      let windowsDrives: string[] = [];
      
      if (isWindows) {
        wslAvailable = await windowsCompatibilityLayer.isWSLAvailable();
        windowsDrives = await windowsCompatibilityLayer.getWindowsDrives();
      }
      
      res.status(200).json({
        isWindows,
        appDataDir,
        platformEnv,
        hasAdmin,
        wslAvailable,
        windowsDrives
      });
    } catch (error) {
      console.error('Error getting platform info:', error);
      res.status(500).json({ error: 'Failed to get platform info' });
    }
  };

  /**
   * Execute a command appropriate for the platform
   */
  executeCommand = async (req: Request, res: Response): Promise<void> => {
    try {
      const { command, cwd } = req.body;
      
      if (!command) {
        res.status(400).json({ error: 'Missing command' });
        return;
      }
      
      const result = await windowsCompatibilityLayer.executeCommand(command, { cwd });
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error executing command:', error);
      res.status(500).json({ error: 'Failed to execute command' });
    }
  };

  /**
   * Execute a command in WSL (Windows only)
   */
  executeInWSL = async (req: Request, res: Response): Promise<void> => {
    try {
      const { command } = req.body;
      
      if (!command) {
        res.status(400).json({ error: 'Missing command' });
        return;
      }
      
      if (!windowsCompatibilityLayer.isWindowsPlatform()) {
        res.status(400).json({ error: 'WSL execution is only available on Windows' });
        return;
      }
      
      const wslAvailable = await windowsCompatibilityLayer.isWSLAvailable();
      
      if (!wslAvailable) {
        res.status(400).json({ error: 'WSL is not available on this system' });
        return;
      }
      
      const result = await windowsCompatibilityLayer.executeInWSL(command);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error executing in WSL:', error);
      res.status(500).json({ error: 'Failed to execute in WSL' });
    }
  };

  /**
   * Create a sandbox environment appropriate for the platform
   */
  createSandboxEnvironment = async (req: Request, res: Response): Promise<void> => {
    try {
      const sandboxId = await windowsCompatibilityLayer.createSandboxEnvironment();
      
      res.status(201).json({ sandboxId });
    } catch (error) {
      console.error('Error creating sandbox environment:', error);
      res.status(500).json({ error: 'Failed to create sandbox environment' });
    }
  };

  /**
   * Normalize a path for the current platform
   */
  normalizePath = async (req: Request, res: Response): Promise<void> => {
    try {
      const { path } = req.body;
      
      if (!path) {
        res.status(400).json({ error: 'Missing path' });
        return;
      }
      
      const normalizedPath = windowsCompatibilityLayer.normalizePath(path);
      
      res.status(200).json({ normalizedPath });
    } catch (error) {
      console.error('Error normalizing path:', error);
      res.status(500).json({ error: 'Failed to normalize path' });
    }
  };

  /**
   * Convert a Windows path to a Unix-style path
   */
  windowsToUnixPath = async (req: Request, res: Response): Promise<void> => {
    try {
      const { path } = req.body;
      
      if (!path) {
        res.status(400).json({ error: 'Missing path' });
        return;
      }
      
      const unixPath = windowsCompatibilityLayer.windowsToUnixPath(path);
      
      res.status(200).json({ unixPath });
    } catch (error) {
      console.error('Error converting Windows path to Unix path:', error);
      res.status(500).json({ error: 'Failed to convert path' });
    }
  };

  /**
   * Convert a Unix-style path to a Windows path
   */
  unixToWindowsPath = async (req: Request, res: Response): Promise<void> => {
    try {
      const { path } = req.body;
      
      if (!path) {
        res.status(400).json({ error: 'Missing path' });
        return;
      }
      
      const windowsPath = windowsCompatibilityLayer.unixToWindowsPath(path);
      
      res.status(200).json({ windowsPath });
    } catch (error) {
      console.error('Error converting Unix path to Windows path:', error);
      res.status(500).json({ error: 'Failed to convert path' });
    }
  };
}

// Create controller
const platformController = new PlatformController();

// Create router
const router = express.Router();

// Platform routes
router.get('/info', platformController.getPlatformInfo);
router.post('/exec', platformController.executeCommand);
router.post('/wsl/exec', platformController.executeInWSL);
router.post('/sandbox', platformController.createSandboxEnvironment);
router.post('/path/normalize', platformController.normalizePath);
router.post('/path/to-unix', platformController.windowsToUnixPath);
router.post('/path/to-windows', platformController.unixToWindowsPath);

export default router;
