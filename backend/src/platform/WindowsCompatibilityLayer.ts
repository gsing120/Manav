import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * WindowsCompatibilityLayer provides platform-specific adaptations
 * to ensure the application runs smoothly on Windows
 */
export class WindowsCompatibilityLayer {
  private isWindows: boolean;
  private appDataPath: string;
  
  constructor() {
    this.isWindows = os.platform() === 'win32';
    this.appDataPath = this.getAppDataPath();
    this.initializeAppDataDirectory();
  }
  
  /**
   * Check if running on Windows
   */
  isWindowsPlatform(): boolean {
    return this.isWindows;
  }
  
  /**
   * Get the appropriate app data path for the platform
   */
  private getAppDataPath(): string {
    if (this.isWindows) {
      // On Windows, use %APPDATA%\manus-twin
      return path.join(process.env.APPDATA || '', 'manus-twin');
    } else if (os.platform() === 'darwin') {
      // On macOS, use ~/Library/Application Support/manus-twin
      return path.join(os.homedir(), 'Library', 'Application Support', 'manus-twin');
    } else {
      // On Linux, use ~/.manus-twin
      return path.join(os.homedir(), '.manus-twin');
    }
  }
  
  /**
   * Initialize the app data directory
   */
  private initializeAppDataDirectory(): void {
    try {
      // Create app data directory if it doesn't exist
      if (!fs.existsSync(this.appDataPath)) {
        fs.mkdirSync(this.appDataPath, { recursive: true });
      }
      
      // Create subdirectories
      const subdirs = ['config', 'data', 'logs', 'sandbox', 'memory'];
      for (const dir of subdirs) {
        const dirPath = path.join(this.appDataPath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      
      console.log('App data directory initialized at:', this.appDataPath);
    } catch (error) {
      console.error('Error initializing app data directory:', error);
    }
  }
  
  /**
   * Get the app data path
   */
  getAppDataDirectory(): string {
    return this.appDataPath;
  }
  
  /**
   * Normalize a path for the current platform
   */
  normalizePath(inputPath: string): string {
    if (this.isWindows) {
      // Convert forward slashes to backslashes on Windows
      return inputPath.replace(/\//g, '\\');
    }
    return inputPath;
  }
  
  /**
   * Convert a Windows path to a Unix-style path
   * (useful for the virtual Linux sandbox)
   */
  windowsToUnixPath(windowsPath: string): string {
    if (!this.isWindows) return windowsPath;
    
    // Replace backslashes with forward slashes
    let unixPath = windowsPath.replace(/\\/g, '/');
    
    // Handle drive letters (C: -> /c)
    if (/^[A-Z]:/i.test(unixPath)) {
      const driveLetter = unixPath.charAt(0).toLowerCase();
      unixPath = `/${driveLetter}${unixPath.slice(2)}`;
    }
    
    return unixPath;
  }
  
  /**
   * Convert a Unix-style path to a Windows path
   */
  unixToWindowsPath(unixPath: string): string {
    if (!this.isWindows) return unixPath;
    
    // Handle /c/ style paths
    if (/^\/[a-z]\//i.test(unixPath)) {
      const driveLetter = unixPath.charAt(1).toUpperCase();
      unixPath = `${driveLetter}:${unixPath.slice(2)}`;
    }
    
    // Replace forward slashes with backslashes
    return unixPath.replace(/\//g, '\\');
  }
  
  /**
   * Check if WSL (Windows Subsystem for Linux) is available
   */
  async isWSLAvailable(): Promise<boolean> {
    if (!this.isWindows) return false;
    
    try {
      await execAsync('wsl --status');
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Execute a command in WSL
   */
  async executeInWSL(command: string): Promise<{ stdout: string; stderr: string }> {
    if (!this.isWindows) {
      throw new Error('WSL execution is only available on Windows');
    }
    
    try {
      return await execAsync(`wsl ${command}`);
    } catch (error) {
      throw new Error(`Failed to execute in WSL: ${error.message}`);
    }
  }
  
  /**
   * Create a sandbox environment appropriate for the platform
   */
  async createSandboxEnvironment(): Promise<string> {
    const sandboxId = `sandbox-${Date.now().toString(36)}`;
    const sandboxPath = path.join(this.appDataPath, 'sandbox', sandboxId);
    
    try {
      // Create sandbox directory
      fs.mkdirSync(sandboxPath, { recursive: true });
      
      // Initialize sandbox with basic structure
      const dirs = ['documents', 'downloads', 'projects', 'temp'];
      for (const dir of dirs) {
        fs.mkdirSync(path.join(sandboxPath, dir), { recursive: true });
      }
      
      // Create a welcome file
      fs.writeFileSync(
        path.join(sandboxPath, 'welcome.txt'),
        `Welcome to Manus Twin Sandbox (ID: ${sandboxId})\n` +
        `Created at: ${new Date().toISOString()}\n` +
        `Platform: ${os.platform()}\n` +
        `This is a sandbox environment where you can execute commands and run code.\n`
      );
      
      // If on Windows, check for WSL
      if (this.isWindows) {
        const wslAvailable = await this.isWSLAvailable();
        if (wslAvailable) {
          fs.writeFileSync(
            path.join(sandboxPath, 'wsl-info.txt'),
            `WSL is available on this system.\n` +
            `You can execute Linux commands using the WSL integration.\n`
          );
        }
      }
      
      return sandboxId;
    } catch (error) {
      console.error('Error creating sandbox environment:', error);
      throw error;
    }
  }
  
  /**
   * Execute a command appropriate for the platform
   */
  async executeCommand(command: string, options: { cwd?: string } = {}): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    try {
      // Determine the appropriate shell
      const shell = this.isWindows ? 'cmd.exe' : 'bash';
      const shellArgs = this.isWindows ? ['/c', command] : ['-c', command];
      
      // Set working directory
      const cwd = options.cwd || process.cwd();
      
      // Execute command
      return new Promise((resolve, reject) => {
        const process = spawn(shell, shellArgs, { cwd });
        
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        process.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        process.on('close', (code) => {
          resolve({
            stdout,
            stderr,
            exitCode: code || 0
          });
        });
        
        process.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error executing command:', error);
      return {
        stdout: '',
        stderr: error.message,
        exitCode: 1
      };
    }
  }
  
  /**
   * Get platform-specific environment variables
   */
  getPlatformEnv(): Record<string, string> {
    const env: Record<string, string> = {
      MANUS_TWIN_APP_DATA: this.appDataPath,
      MANUS_TWIN_PLATFORM: os.platform(),
      MANUS_TWIN_ARCH: os.arch(),
      MANUS_TWIN_VERSION: '1.0.0'
    };
    
    if (this.isWindows) {
      env.MANUS_TWIN_WINDOWS = 'true';
      env.MANUS_TWIN_SHELL = 'cmd.exe';
    } else {
      env.MANUS_TWIN_WINDOWS = 'false';
      env.MANUS_TWIN_SHELL = 'bash';
    }
    
    return env;
  }
  
  /**
   * Check if the application has administrative privileges
   */
  async hasAdminPrivileges(): Promise<boolean> {
    try {
      if (this.isWindows) {
        // On Windows, try to access a protected directory
        const { exitCode } = await this.executeCommand('net session >nul 2>&1');
        return exitCode === 0;
      } else {
        // On Unix-like systems, check if user is root
        const { stdout } = await execAsync('id -u');
        return stdout.trim() === '0';
      }
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get available drive letters on Windows
   */
  async getWindowsDrives(): Promise<string[]> {
    if (!this.isWindows) {
      return [];
    }
    
    try {
      const { stdout } = await execAsync('wmic logicaldisk get caption');
      return stdout
        .split('\n')
        .filter(line => /^[A-Z]:/.test(line.trim()))
        .map(line => line.trim());
    } catch (error) {
      console.error('Error getting Windows drives:', error);
      return [];
    }
  }
}
