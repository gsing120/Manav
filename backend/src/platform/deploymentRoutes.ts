import express from 'express';
import { LocalDeploymentManager } from '../platform/LocalDeploymentManager';
import { WindowsCompatibilityLayer } from '../platform/WindowsCompatibilityLayer';
import { Request, Response } from 'express';

// Create Windows compatibility layer and local deployment manager
const windowsCompatibilityLayer = new WindowsCompatibilityLayer();
const localDeploymentManager = new LocalDeploymentManager(windowsCompatibilityLayer);

/**
 * DeploymentController provides HTTP endpoints for managing local deployment
 */
export class DeploymentController {
  /**
   * Get deployment information
   */
  getDeploymentInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const deploymentDir = localDeploymentManager.getDeploymentDirectory();
      const isWindows = windowsCompatibilityLayer.isWindowsPlatform();
      const hasAdmin = await windowsCompatibilityLayer.hasAdminPrivileges();
      
      res.status(200).json({
        deploymentDirectory: deploymentDir,
        isWindows,
        hasAdmin
      });
    } catch (error) {
      console.error('Error getting deployment info:', error);
      res.status(500).json({ error: 'Failed to get deployment info' });
    }
  };

  /**
   * Create a Windows executable
   */
  createWindowsExecutable = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!windowsCompatibilityLayer.isWindowsPlatform()) {
        res.status(400).json({ error: 'Windows executable can only be created on Windows platform' });
        return;
      }
      
      const exePath = await localDeploymentManager.createWindowsExecutable();
      
      res.status(200).json({ exePath });
    } catch (error) {
      console.error('Error creating Windows executable:', error);
      res.status(500).json({ error: error.message || 'Failed to create Windows executable' });
    }
  };

  /**
   * Create a Windows installer
   */
  createWindowsInstaller = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!windowsCompatibilityLayer.isWindowsPlatform()) {
        res.status(400).json({ error: 'Windows installer can only be created on Windows platform' });
        return;
      }
      
      const installerPath = await localDeploymentManager.createWindowsInstaller();
      
      res.status(200).json({ installerPath });
    } catch (error) {
      console.error('Error creating Windows installer:', error);
      res.status(500).json({ error: error.message || 'Failed to create Windows installer' });
    }
  };

  /**
   * Start the application in development mode
   */
  startDevelopmentMode = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await localDeploymentManager.startDevelopmentMode();
      
      res.status(200).json({
        url: result.url,
        message: 'Application started in development mode'
      });
    } catch (error) {
      console.error('Error starting development mode:', error);
      res.status(500).json({ error: 'Failed to start development mode' });
    }
  };

  /**
   * Start the application in production mode
   */
  startProductionMode = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await localDeploymentManager.startProductionMode();
      
      res.status(200).json({
        url: result.url,
        message: 'Application started in production mode'
      });
    } catch (error) {
      console.error('Error starting production mode:', error);
      res.status(500).json({ error: 'Failed to start production mode' });
    }
  };

  /**
   * Create a desktop shortcut
   */
  createDesktopShortcut = async (req: Request, res: Response): Promise<void> => {
    try {
      const { exePath } = req.body;
      
      if (!exePath) {
        res.status(400).json({ error: 'Missing exePath' });
        return;
      }
      
      if (!windowsCompatibilityLayer.isWindowsPlatform()) {
        res.status(400).json({ error: 'Desktop shortcut can only be created on Windows platform' });
        return;
      }
      
      const shortcutPath = await localDeploymentManager.createDesktopShortcut(exePath);
      
      res.status(200).json({ shortcutPath });
    } catch (error) {
      console.error('Error creating desktop shortcut:', error);
      res.status(500).json({ error: error.message || 'Failed to create desktop shortcut' });
    }
  };

  /**
   * Register the application with Windows
   */
  registerWithWindows = async (req: Request, res: Response): Promise<void> => {
    try {
      const { exePath } = req.body;
      
      if (!exePath) {
        res.status(400).json({ error: 'Missing exePath' });
        return;
      }
      
      if (!windowsCompatibilityLayer.isWindowsPlatform()) {
        res.status(400).json({ error: 'Application can only be registered on Windows platform' });
        return;
      }
      
      const result = await localDeploymentManager.registerWithWindows(exePath);
      
      if (result) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: 'Failed to register application with Windows. Admin privileges may be required.' });
      }
    } catch (error) {
      console.error('Error registering with Windows:', error);
      res.status(500).json({ error: error.message || 'Failed to register with Windows' });
    }
  };

  /**
   * Create a portable version of the application
   */
  createPortableVersion = async (req: Request, res: Response): Promise<void> => {
    try {
      const portableDir = await localDeploymentManager.createPortableVersion();
      
      res.status(200).json({ portableDir });
    } catch (error) {
      console.error('Error creating portable version:', error);
      res.status(500).json({ error: error.message || 'Failed to create portable version' });
    }
  };
}

// Create controller
const deploymentController = new DeploymentController();

// Create router
const router = express.Router();

// Deployment routes
router.get('/info', deploymentController.getDeploymentInfo);
router.post('/executable', deploymentController.createWindowsExecutable);
router.post('/installer', deploymentController.createWindowsInstaller);
router.post('/start/dev', deploymentController.startDevelopmentMode);
router.post('/start/prod', deploymentController.startProductionMode);
router.post('/shortcut', deploymentController.createDesktopShortcut);
router.post('/register', deploymentController.registerWithWindows);
router.post('/portable', deploymentController.createPortableVersion);

export default router;
