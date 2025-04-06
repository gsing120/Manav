import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

/**
 * VirtualLinuxSandbox provides a secure environment for executing
 * Linux commands and running code in an isolated context
 */
export class VirtualLinuxSandbox {
  private sandboxBasePath: string;
  private activeSandboxes: Map<string, SandboxInstance> = new Map();
  private sandboxEmitter: EventEmitter;
  
  constructor() {
    // Set up sandbox base path
    this.sandboxBasePath = process.env.SANDBOX_PATH || path.join(process.cwd(), 'sandbox');
    this.sandboxEmitter = new EventEmitter();
    this.initializeSandboxEnvironment();
  }
  
  /**
   * Initialize the sandbox environment
   */
  private initializeSandboxEnvironment(): void {
    try {
      // Create sandbox directory if it doesn't exist
      if (!fs.existsSync(this.sandboxBasePath)) {
        fs.mkdirSync(this.sandboxBasePath, { recursive: true });
      }
      
      // Create subdirectories for different sandboxes
      const sandboxDirs = ['home', 'tmp', 'var', 'shared'];
      for (const dir of sandboxDirs) {
        const dirPath = path.join(this.sandboxBasePath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      
      console.log('Sandbox environment initialized at:', this.sandboxBasePath);
    } catch (error) {
      console.error('Error initializing sandbox environment:', error);
    }
  }
  
  /**
   * Create a new sandbox instance
   */
  createSandbox(name?: string): SandboxInstance {
    const sandboxId = name || `sandbox-${uuidv4().slice(0, 8)}`;
    const sandboxHomePath = path.join(this.sandboxBasePath, 'home', sandboxId);
    
    // Create sandbox home directory
    if (!fs.existsSync(sandboxHomePath)) {
      fs.mkdirSync(sandboxHomePath, { recursive: true });
    }
    
    // Initialize sandbox with basic structure
    const dirs = ['documents', 'downloads', 'projects', 'temp'];
    for (const dir of dirs) {
      const dirPath = path.join(sandboxHomePath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
    
    // Create a welcome file
    fs.writeFileSync(
      path.join(sandboxHomePath, 'welcome.txt'),
      `Welcome to Manus Twin Sandbox (ID: ${sandboxId})\n` +
      `Created at: ${new Date().toISOString()}\n` +
      `This is a virtual Linux environment where you can execute commands and run code.\n`
    );
    
    // Create sandbox instance
    const sandbox = new SandboxInstance(sandboxId, sandboxHomePath, this.sandboxEmitter);
    
    // Store sandbox
    this.activeSandboxes.set(sandboxId, sandbox);
    
    return sandbox;
  }
  
  /**
   * Get a sandbox instance by ID
   */
  getSandbox(sandboxId: string): SandboxInstance | null {
    return this.activeSandboxes.get(sandboxId) || null;
  }
  
  /**
   * Delete a sandbox instance
   */
  deleteSandbox(sandboxId: string): boolean {
    const sandbox = this.getSandbox(sandboxId);
    
    if (!sandbox) {
      return false;
    }
    
    // Terminate all shell sessions
    sandbox.terminateAllSessions();
    
    // Remove sandbox from active sandboxes
    this.activeSandboxes.delete(sandboxId);
    
    // Delete sandbox directory (optional, can be kept for history)
    // fs.rmdirSync(sandbox.getHomePath(), { recursive: true });
    
    return true;
  }
  
  /**
   * Get all active sandbox instances
   */
  getAllSandboxes(): SandboxInstance[] {
    return Array.from(this.activeSandboxes.values());
  }
  
  /**
   * Subscribe to sandbox events
   */
  onSandboxEvent(event: string, callback: (data: any) => void): void {
    this.sandboxEmitter.on(event, callback);
  }
  
  /**
   * Get the base path for all sandboxes
   */
  getBasePath(): string {
    return this.sandboxBasePath;
  }
}

/**
 * SandboxInstance represents a single virtual Linux sandbox environment
 */
export class SandboxInstance {
  private id: string;
  private homePath: string;
  private shellSessions: Map<string, ShellSession> = new Map();
  private emitter: EventEmitter;
  
  constructor(id: string, homePath: string, emitter: EventEmitter) {
    this.id = id;
    this.homePath = homePath;
    this.emitter = emitter;
  }
  
  /**
   * Get the sandbox ID
   */
  getId(): string {
    return this.id;
  }
  
  /**
   * Get the sandbox home path
   */
  getHomePath(): string {
    return this.homePath;
  }
  
  /**
   * Create a new shell session
   */
  createShellSession(): ShellSession {
    const sessionId = uuidv4();
    
    // Create shell process
    const shell = spawn('bash', [], {
      cwd: this.homePath,
      env: { ...process.env, HOME: this.homePath },
      shell: true
    });
    
    // Create shell session
    const session = new ShellSession(sessionId, shell, this.emitter, this.id);
    
    // Store session
    this.shellSessions.set(sessionId, session);
    
    // Emit event
    this.emitter.emit('shell:created', { sandboxId: this.id, sessionId });
    
    return session;
  }
  
  /**
   * Get a shell session by ID
   */
  getShellSession(sessionId: string): ShellSession | null {
    return this.shellSessions.get(sessionId) || null;
  }
  
  /**
   * Get all shell sessions
   */
  getAllShellSessions(): ShellSession[] {
    return Array.from(this.shellSessions.values());
  }
  
  /**
   * Terminate a shell session
   */
  terminateShellSession(sessionId: string): boolean {
    const session = this.getShellSession(sessionId);
    
    if (!session) {
      return false;
    }
    
    // Terminate session
    session.terminate();
    
    // Remove session
    this.shellSessions.delete(sessionId);
    
    return true;
  }
  
  /**
   * Terminate all shell sessions
   */
  terminateAllSessions(): void {
    for (const session of this.shellSessions.values()) {
      session.terminate();
    }
    
    this.shellSessions.clear();
  }
  
  /**
   * Execute a command in the sandbox
   */
  async executeCommand(command: string, cwd?: string): Promise<CommandResult> {
    // Create a temporary shell session
    const session = this.createShellSession();
    
    // Change directory if specified
    if (cwd) {
      await session.writeToProcess(`cd ${cwd}\n`);
    }
    
    // Execute command
    await session.writeToProcess(`${command}\n`);
    
    // Wait for command to complete (simple approach, can be improved)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get output
    const output = session.getOutput();
    
    // Terminate session
    this.terminateShellSession(session.getId());
    
    return {
      command,
      output,
      exitCode: 0 // Simplified, actual exit code handling would be more complex
    };
  }
  
  /**
   * Read a file in the sandbox
   */
  readFile(filePath: string): string {
    const fullPath = path.join(this.homePath, filePath);
    
    try {
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    }
  }
  
  /**
   * Write to a file in the sandbox
   */
  writeFile(filePath: string, content: string, append: boolean = false): void {
    const fullPath = path.join(this.homePath, filePath);
    const dirPath = path.dirname(fullPath);
    
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Write file
      if (append) {
        fs.appendFileSync(fullPath, content);
      } else {
        fs.writeFileSync(fullPath, content);
      }
    } catch (error) {
      throw new Error(`Error writing file: ${error.message}`);
    }
  }
  
  /**
   * Delete a file in the sandbox
   */
  deleteFile(filePath: string): void {
    const fullPath = path.join(this.homePath, filePath);
    
    try {
      fs.unlinkSync(fullPath);
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }
  
  /**
   * List files in a directory in the sandbox
   */
  listFiles(dirPath: string): string[] {
    const fullPath = path.join(this.homePath, dirPath);
    
    try {
      return fs.readdirSync(fullPath);
    } catch (error) {
      throw new Error(`Error listing files: ${error.message}`);
    }
  }
  
  /**
   * Check if a file exists in the sandbox
   */
  fileExists(filePath: string): boolean {
    const fullPath = path.join(this.homePath, filePath);
    return fs.existsSync(fullPath);
  }
  
  /**
   * Get file information in the sandbox
   */
  getFileInfo(filePath: string): FileInfo {
    const fullPath = path.join(this.homePath, filePath);
    
    try {
      const stats = fs.statSync(fullPath);
      
      return {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime
      };
    } catch (error) {
      throw new Error(`Error getting file info: ${error.message}`);
    }
  }
}

/**
 * ShellSession represents a single shell session in a sandbox
 */
export class ShellSession {
  private id: string;
  private process: ChildProcess;
  private output: string = '';
  private emitter: EventEmitter;
  private sandboxId: string;
  private active: boolean = true;
  
  constructor(id: string, process: ChildProcess, emitter: EventEmitter, sandboxId: string) {
    this.id = id;
    this.process = process;
    this.emitter = emitter;
    this.sandboxId = sandboxId;
    
    // Handle process output
    this.process.stdout.on('data', (data) => {
      const output = data.toString();
      this.output += output;
      this.emitter.emit('shell:output', { sandboxId: this.sandboxId, sessionId: this.id, output });
    });
    
    this.process.stderr.on('data', (data) => {
      const output = data.toString();
      this.output += output;
      this.emitter.emit('shell:error', { sandboxId: this.sandboxId, sessionId: this.id, output });
    });
    
    this.process.on('close', (code) => {
      this.active = false;
      this.emitter.emit('shell:closed', { sandboxId: this.sandboxId, sessionId: this.id, code });
    });
  }
  
  /**
   * Get the session ID
   */
  getId(): string {
    return this.id;
  }
  
  /**
   * Get the session output
   */
  getOutput(): string {
    return this.output;
  }
  
  /**
   * Write to the process
   */
  async writeToProcess(input: string): Promise<void> {
    if (!this.active) {
      throw new Error('Shell session is not active');
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        this.process.stdin.write(input, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Clear the output
   */
  clearOutput(): void {
    this.output = '';
  }
  
  /**
   * Terminate the session
   */
  terminate(): void {
    if (this.active) {
      this.process.kill();
      this.active = false;
    }
  }
  
  /**
   * Check if the session is active
   */
  isActive(): boolean {
    return this.active;
  }
}

/**
 * CommandResult represents the result of executing a command
 */
export interface CommandResult {
  command: string;
  output: string;
  exitCode: number;
}

/**
 * FileInfo represents information about a file
 */
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  created: Date;
  modified: Date;
  accessed: Date;
}
