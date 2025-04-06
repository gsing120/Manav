import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { WindowsCompatibilityLayer } from './WindowsCompatibilityLayer';

const execAsync = promisify(exec);

/**
 * LocalDeploymentManager handles the deployment of the application
 * for local execution on Windows computers
 */
export class LocalDeploymentManager {
  private windowsCompatibilityLayer: WindowsCompatibilityLayer;
  private appDirectory: string;
  private deploymentDirectory: string;
  
  constructor(windowsCompatibilityLayer: WindowsCompatibilityLayer) {
    this.windowsCompatibilityLayer = windowsCompatibilityLayer;
    this.appDirectory = process.cwd();
    this.deploymentDirectory = path.join(this.windowsCompatibilityLayer.getAppDataDirectory(), 'deployment');
    this.initializeDeploymentDirectory();
  }
  
  /**
   * Initialize the deployment directory
   */
  private initializeDeploymentDirectory(): void {
    try {
      // Create deployment directory if it doesn't exist
      if (!fs.existsSync(this.deploymentDirectory)) {
        fs.mkdirSync(this.deploymentDirectory, { recursive: true });
      }
      
      console.log('Deployment directory initialized at:', this.deploymentDirectory);
    } catch (error) {
      console.error('Error initializing deployment directory:', error);
    }
  }
  
  /**
   * Get the deployment directory
   */
  getDeploymentDirectory(): string {
    return this.deploymentDirectory;
  }
  
  /**
   * Create a Windows executable using Electron
   */
  async createWindowsExecutable(): Promise<string> {
    try {
      // Check if we're on Windows
      if (!this.windowsCompatibilityLayer.isWindowsPlatform()) {
        throw new Error('Windows executable can only be created on Windows platform');
      }
      
      // Create build directory
      const buildDir = path.join(this.deploymentDirectory, 'build');
      if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
      }
      
      // Run electron-packager
      console.log('Building Windows executable...');
      await execAsync(
        'npx electron-packager . manus-twin --platform=win32 --arch=x64 --out=./build --overwrite',
        { cwd: this.appDirectory }
      );
      
      const exePath = path.join(buildDir, 'manus-twin-win32-x64', 'manus-twin.exe');
      
      if (fs.existsSync(exePath)) {
        console.log('Windows executable created successfully at:', exePath);
        return exePath;
      } else {
        throw new Error('Failed to create Windows executable');
      }
    } catch (error) {
      console.error('Error creating Windows executable:', error);
      throw error;
    }
  }
  
  /**
   * Create a Windows installer using electron-builder
   */
  async createWindowsInstaller(): Promise<string> {
    try {
      // Check if we're on Windows
      if (!this.windowsCompatibilityLayer.isWindowsPlatform()) {
        throw new Error('Windows installer can only be created on Windows platform');
      }
      
      // Create dist directory
      const distDir = path.join(this.deploymentDirectory, 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      
      // Run electron-builder
      console.log('Building Windows installer...');
      await execAsync(
        'npx electron-builder --win --x64',
        { cwd: this.appDirectory }
      );
      
      const installerPath = path.join(distDir, 'manus-twin-setup.exe');
      
      if (fs.existsSync(installerPath)) {
        console.log('Windows installer created successfully at:', installerPath);
        return installerPath;
      } else {
        throw new Error('Failed to create Windows installer');
      }
    } catch (error) {
      console.error('Error creating Windows installer:', error);
      throw error;
    }
  }
  
  /**
   * Start the application in development mode
   */
  async startDevelopmentMode(): Promise<{ process: any; url: string }> {
    try {
      // Start the backend server
      const serverProcess = spawn('npm', ['run', 'start:server'], {
        cwd: this.appDirectory,
        detached: true,
        stdio: 'pipe'
      });
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start the frontend
      const frontendProcess = spawn('npm', ['run', 'start:frontend'], {
        cwd: this.appDirectory,
        detached: true,
        stdio: 'pipe'
      });
      
      // Wait for frontend to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return processes and URL
      return {
        process: {
          server: serverProcess,
          frontend: frontendProcess
        },
        url: 'http://localhost:3000'
      };
    } catch (error) {
      console.error('Error starting development mode:', error);
      throw error;
    }
  }
  
  /**
   * Start the application in production mode
   */
  async startProductionMode(): Promise<{ process: any; url: string }> {
    try {
      // Start the application
      const appProcess = spawn('npm', ['run', 'start'], {
        cwd: this.appDirectory,
        detached: true,
        stdio: 'pipe'
      });
      
      // Wait for app to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return process and URL
      return {
        process: appProcess,
        url: 'http://localhost:3000'
      };
    } catch (error) {
      console.error('Error starting production mode:', error);
      throw error;
    }
  }
  
  /**
   * Create a desktop shortcut
   */
  async createDesktopShortcut(exePath: string): Promise<string> {
    try {
      // Check if we're on Windows
      if (!this.windowsCompatibilityLayer.isWindowsPlatform()) {
        throw new Error('Desktop shortcut can only be created on Windows platform');
      }
      
      // Get desktop path
      const desktopPath = path.join(os.homedir(), 'Desktop');
      const shortcutPath = path.join(desktopPath, 'Manus Twin.lnk');
      
      // Create shortcut using PowerShell
      const powershellCommand = `
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut("${shortcutPath}")
        $Shortcut.TargetPath = "${exePath}"
        $Shortcut.Save()
      `;
      
      await execAsync(`powershell -Command "${powershellCommand}"`);
      
      if (fs.existsSync(shortcutPath)) {
        console.log('Desktop shortcut created successfully at:', shortcutPath);
        return shortcutPath;
      } else {
        throw new Error('Failed to create desktop shortcut');
      }
    } catch (error) {
      console.error('Error creating desktop shortcut:', error);
      throw error;
    }
  }
  
  /**
   * Register the application with Windows
   */
  async registerWithWindows(exePath: string): Promise<boolean> {
    try {
      // Check if we're on Windows
      if (!this.windowsCompatibilityLayer.isWindowsPlatform()) {
        throw new Error('Application can only be registered on Windows platform');
      }
      
      // Check if we have admin privileges
      const hasAdmin = await this.windowsCompatibilityLayer.hasAdminPrivileges();
      
      if (!hasAdmin) {
        console.warn('Admin privileges required to register application with Windows');
        return false;
      }
      
      // Register application with Windows
      const registryCommand = `
        reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\manus-twin.exe" /ve /d "${exePath}" /f
        reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\manus-twin.exe" /v "Path" /d "${path.dirname(exePath)}" /f
      `;
      
      await execAsync(`powershell -Command "${registryCommand}"`);
      
      console.log('Application registered with Windows successfully');
      return true;
    } catch (error) {
      console.error('Error registering application with Windows:', error);
      return false;
    }
  }
  
  /**
   * Create a portable version of the application
   */
  async createPortableVersion(): Promise<string> {
    try {
      // Create portable directory
      const portableDir = path.join(this.deploymentDirectory, 'portable');
      if (!fs.existsSync(portableDir)) {
        fs.mkdirSync(portableDir, { recursive: true });
      }
      
      // Copy application files
      console.log('Creating portable version...');
      
      // Copy backend
      fs.mkdirSync(path.join(portableDir, 'backend'), { recursive: true });
      this.copyDirectory(
        path.join(this.appDirectory, 'backend'),
        path.join(portableDir, 'backend')
      );
      
      // Copy frontend
      fs.mkdirSync(path.join(portableDir, 'frontend'), { recursive: true });
      this.copyDirectory(
        path.join(this.appDirectory, 'frontend'),
        path.join(portableDir, 'frontend')
      );
      
      // Copy package.json and other root files
      fs.copyFileSync(
        path.join(this.appDirectory, 'package.json'),
        path.join(portableDir, 'package.json')
      );
      
      // Create start script
      const startScript = this.windowsCompatibilityLayer.isWindowsPlatform()
        ? '@echo off\nnpm start'
        : '#!/bin/bash\nnpm start';
      
      const startScriptPath = this.windowsCompatibilityLayer.isWindowsPlatform()
        ? path.join(portableDir, 'start.bat')
        : path.join(portableDir, 'start.sh');
      
      fs.writeFileSync(startScriptPath, startScript);
      
      if (this.windowsCompatibilityLayer.isWindowsPlatform()) {
        // Make start.sh executable on Unix-like systems
        await execAsync(`chmod +x "${startScriptPath}"`);
      }
      
      console.log('Portable version created successfully at:', portableDir);
      return portableDir;
    } catch (error) {
      console.error('Error creating portable version:', error);
      throw error;
    }
  }
  
  /**
   * Copy a directory recursively
   */
  private copyDirectory(source: string, destination: string): void {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    // Get all files and directories in source
    const entries = fs.readdirSync(source, { withFileTypes: true });
    
    // Copy each entry
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively copy directory
        this.copyDirectory(sourcePath, destinationPath);
      } else {
        // Copy file
        fs.copyFileSync(sourcePath, destinationPath);
      }
    }
  }
}
