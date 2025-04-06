import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { spawn, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

/**
 * Enhanced VirtualLinuxSandbox provides a secure environment for executing
 * Linux commands, running code, and accessing the internet with credential management
 */
export class EnhancedVirtualLinuxSandbox {
  private sandboxBasePath: string;
  private activeSandboxes: Map<string, EnhancedSandboxInstance> = new Map();
  private sandboxEmitter: EventEmitter;
  private credentialManager: CredentialManager;
  
  constructor() {
    // Set up sandbox base path
    this.sandboxBasePath = process.env.SANDBOX_PATH || path.join(process.cwd(), 'sandbox');
    this.sandboxEmitter = new EventEmitter();
    this.credentialManager = new CredentialManager();
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
      const sandboxDirs = ['home', 'tmp', 'var', 'shared', 'credentials'];
      for (const dir of sandboxDirs) {
        const dirPath = path.join(this.sandboxBasePath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      
      console.log('Enhanced sandbox environment initialized at:', this.sandboxBasePath);
    } catch (error) {
      console.error('Error initializing sandbox environment:', error);
    }
  }
  
  /**
   * Create a new sandbox instance
   */
  createSandbox(name?: string): EnhancedSandboxInstance {
    const sandboxId = name || `sandbox-${uuidv4().slice(0, 8)}`;
    const sandboxHomePath = path.join(this.sandboxBasePath, 'home', sandboxId);
    
    // Create sandbox home directory
    if (!fs.existsSync(sandboxHomePath)) {
      fs.mkdirSync(sandboxHomePath, { recursive: true });
    }
    
    // Initialize sandbox with basic structure
    const dirs = ['documents', 'downloads', 'projects', 'temp', 'browser_data'];
    for (const dir of dirs) {
      const dirPath = path.join(sandboxHomePath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
    
    // Create a welcome file
    fs.writeFileSync(
      path.join(sandboxHomePath, 'welcome.txt'),
      `Welcome to Enhanced Manus Twin Sandbox (ID: ${sandboxId})\n` +
      `Created at: ${new Date().toISOString()}\n` +
      `This is a virtual Linux environment where you can execute commands, run code, and access the internet.\n`
    );
    
    // Create sandbox instance with credential manager
    const sandbox = new EnhancedSandboxInstance(
      sandboxId, 
      sandboxHomePath, 
      this.sandboxEmitter,
      this.credentialManager
    );
    
    // Store sandbox
    this.activeSandboxes.set(sandboxId, sandbox);
    
    return sandbox;
  }
  
  /**
   * Get a sandbox instance by ID
   */
  getSandbox(sandboxId: string): EnhancedSandboxInstance | null {
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
  getAllSandboxes(): EnhancedSandboxInstance[] {
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
  
  /**
   * Get the credential manager
   */
  getCredentialManager(): CredentialManager {
    return this.credentialManager;
  }
}

/**
 * EnhancedSandboxInstance represents a single virtual Linux sandbox environment
 * with internet access and credential management
 */
export class EnhancedSandboxInstance {
  private id: string;
  private homePath: string;
  private shellSessions: Map<string, ShellSession> = new Map();
  private emitter: EventEmitter;
  private credentialManager: CredentialManager;
  private browserInstance: BrowserInstance | null = null;
  
  constructor(
    id: string, 
    homePath: string, 
    emitter: EventEmitter, 
    credentialManager: CredentialManager
  ) {
    this.id = id;
    this.homePath = homePath;
    this.emitter = emitter;
    this.credentialManager = credentialManager;
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
    
    // Also terminate browser instance if exists
    if (this.browserInstance) {
      this.browserInstance.close();
      this.browserInstance = null;
    }
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
  
  /**
   * Create a browser instance for internet access
   */
  createBrowserInstance(): BrowserInstance {
    // Close existing browser instance if any
    if (this.browserInstance) {
      this.browserInstance.close();
    }
    
    // Create browser data directory
    const browserDataDir = path.join(this.homePath, 'browser_data');
    if (!fs.existsSync(browserDataDir)) {
      fs.mkdirSync(browserDataDir, { recursive: true });
    }
    
    // Create new browser instance
    this.browserInstance = new BrowserInstance(
      this.id,
      browserDataDir,
      this.emitter,
      this.credentialManager
    );
    
    return this.browserInstance;
  }
  
  /**
   * Get the current browser instance
   */
  getBrowserInstance(): BrowserInstance | null {
    return this.browserInstance;
  }
  
  /**
   * Store credentials for a website
   */
  storeCredentials(website: string, username: string, password: string): boolean {
    return this.credentialManager.storeCredentials(website, username, password);
  }
  
  /**
   * Get credentials for a website
   */
  getCredentials(website: string): Credential | null {
    return this.credentialManager.getCredentials(website);
  }
  
  /**
   * List all stored website credentials
   */
  listCredentials(): string[] {
    return this.credentialManager.listWebsites();
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
 * BrowserInstance represents a browser for internet access
 */
export class BrowserInstance {
  private id: string;
  private dataDir: string;
  private emitter: EventEmitter;
  private credentialManager: CredentialManager;
  private currentUrl: string = '';
  private cookies: Map<string, Map<string, string>> = new Map();
  private active: boolean = true;
  
  constructor(
    id: string, 
    dataDir: string, 
    emitter: EventEmitter,
    credentialManager: CredentialManager
  ) {
    this.id = id;
    this.dataDir = dataDir;
    this.emitter = emitter;
    this.credentialManager = credentialManager;
    
    // Initialize browser
    this.initialize();
  }
  
  /**
   * Initialize the browser
   */
  private initialize(): void {
    // Create cookies file
    const cookiesFile = path.join(this.dataDir, 'cookies.json');
    if (!fs.existsSync(cookiesFile)) {
      fs.writeFileSync(cookiesFile, JSON.stringify({}));
    }
    
    // Emit event
    this.emitter.emit('browser:created', { id: this.id });
  }
  
  /**
   * Navigate to a URL
   */
  async navigateTo(url: string): Promise<BrowserResponse> {
    if (!this.active) {
      throw new Error('Browser instance is not active');
    }
    
    try {
      // Update current URL
      this.currentUrl = url;
      
      // Make HTTP request
      const response = await axios.get(url, {
        headers: this.getHeaders(url),
        maxRedirects: 5
      });
      
      // Store cookies from response
      if (response.headers['set-cookie']) {
        this.processCookies(url, response.headers['set-cookie']);
      }
      
      // Emit event
      this.emitter.emit('browser:navigated', { id: this.id, url, status: response.status });
      
      return {
        url,
        status: response.status,
        content: response.data,
        headers: response.headers
      };
    } catch (error) {
      this.emitter.emit('browser:error', { id: this.id, url, error: error.message });
      
      return {
        url,
        status: error.response?.status || 500,
        content: error.response?.data || '',
        headers: error.response?.headers || {},
        error: error.message
      };
    }
  }
  
  /**
   * Get HTTP headers for a request
   */
  private getHeaders(url: string): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    };
    
    // Add cookies if available
    const domain = new URL(url).hostname;
    const cookies = this.getCookiesForDomain(domain);
    
    if (cookies.length > 0) {
      headers['Cookie'] = cookies.join('; ');
    }
    
    return headers;
  }
  
  /**
   * Process cookies from response
   */
  private processCookies(url: string, cookieHeaders: string[]): void {
    const domain = new URL(url).hostname;
    
    if (!this.cookies.has(domain)) {
      this.cookies.set(domain, new Map<string, string>());
    }
    
    const domainCookies = this.cookies.get(domain)!;
    
    for (const cookieHeader of cookieHeaders) {
      const cookieParts = cookieHeader.split(';')[0].split('=');
      if (cookieParts.length >= 2) {
        const name = cookieParts[0].trim();
        const value = cookieParts.slice(1).join('=').trim();
        domainCookies.set(name, value);
      }
    }
  }
  
  /**
   * Get cookies for a domain
   */
  private getCookiesForDomain(domain: string): string[] {
    const result: string[] = [];
    
    // Check exact domain
    if (this.cookies.has(domain)) {
      const domainCookies = this.cookies.get(domain)!;
      for (const [name, value] of domainCookies.entries()) {
        result.push(`${name}=${value}`);
      }
    }
    
    // Check parent domains
    const parts = domain.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
      const parentDomain = parts.slice(i).join('.');
      if (this.cookies.has(parentDomain)) {
        const domainCookies = this.cookies.get(parentDomain)!;
        for (const [name, value] of domainCookies.entries()) {
          result.push(`${name}=${value}`);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Submit a form
   */
  async submitForm(url: string, formData: Record<string, string>, method: 'GET' | 'POST' = 'POST'): Promise<BrowserResponse> {
    if (!this.active) {
      throw new Error('Browser instance is not active');
    }
    
    try {
      let response;
      
      if (method === 'GET') {
        // For GET requests, append form data to URL
        const urlObj = new URL(url);
        for (const [key, value] of Object.entries(formData)) {
          urlObj.searchParams.append(key, value);
        }
        
        response = await axios.get(urlObj.toString(), {
          headers: this.getHeaders(url),
          maxRedirects: 5
        });
      } else {
        // For POST requests, send form data in request body
        response = await axios.post(url, formData, {
          headers: {
            ...this.getHeaders(url),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          maxRedirects: 5
        });
      }
      
      // Update current URL
      this.currentUrl = response.request.res.responseUrl || url;
      
      // Store cookies from response
      if (response.headers['set-cookie']) {
        this.processCookies(this.currentUrl, response.headers['set-cookie']);
      }
      
      // Emit event
      this.emitter.emit('browser:form-submitted', { 
        id: this.id, 
        url, 
        method,
        status: response.status 
      });
      
      return {
        url: this.currentUrl,
        status: response.status,
        content: response.data,
        headers: response.headers
      };
    } catch (error) {
      this.emitter.emit('browser:error', { 
        id: this.id, 
        url, 
        method,
        error: error.message 
      });
      
      return {
        url,
        status: error.response?.status || 500,
        content: error.response?.data || '',
        headers: error.response?.headers || {},
        error: error.message
      };
    }
  }
  
  /**
   * Login to a website using stored credentials
   */
  async loginToWebsite(url: string, usernameField: string = 'username', passwordField: string = 'password', submitButtonSelector: string = ''): Promise<BrowserResponse> {
    if (!this.active) {
      throw new Error('Browser instance is not active');
    }
    
    try {
      // Get domain from URL
      const domain = new URL(url).hostname;
      
      // Get credentials for this website
      const credentials = this.credentialManager.getCredentials(domain);
      
      if (!credentials) {
        throw new Error(`No credentials found for ${domain}`);
      }
      
      // Navigate to the login page first
      await this.navigateTo(url);
      
      // Create form data with credentials
      const formData: Record<string, string> = {
        [usernameField]: credentials.username,
        [passwordField]: credentials.password
      };
      
      // Submit the login form
      const response = await this.submitForm(url, formData);
      
      // Emit event
      this.emitter.emit('browser:login', { 
        id: this.id, 
        url, 
        domain,
        success: response.status >= 200 && response.status < 400
      });
      
      return response;
    } catch (error) {
      this.emitter.emit('browser:error', { 
        id: this.id, 
        url, 
        error: error.message 
      });
      
      return {
        url,
        status: 500,
        content: '',
        headers: {},
        error: error.message
      };
    }
  }
  
  /**
   * Download a file
   */
  async downloadFile(url: string, filePath: string): Promise<string> {
    if (!this.active) {
      throw new Error('Browser instance is not active');
    }
    
    try {
      // Make HTTP request
      const response = await axios.get(url, {
        headers: this.getHeaders(url),
        responseType: 'arraybuffer'
      });
      
      // Determine file path
      const fullPath = path.join(this.dataDir, filePath);
      const dirPath = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(fullPath, response.data);
      
      // Emit event
      this.emitter.emit('browser:file-downloaded', { 
        id: this.id, 
        url, 
        filePath: fullPath
      });
      
      return fullPath;
    } catch (error) {
      this.emitter.emit('browser:error', { 
        id: this.id, 
        url, 
        error: error.message 
      });
      
      throw error;
    }
  }
  
  /**
   * Get the current URL
   */
  getCurrentUrl(): string {
    return this.currentUrl;
  }
  
  /**
   * Close the browser instance
   */
  close(): void {
    if (this.active) {
      this.active = false;
      
      // Save cookies to file
      const cookiesFile = path.join(this.dataDir, 'cookies.json');
      const cookiesObj: Record<string, Record<string, string>> = {};
      
      for (const [domain, cookies] of this.cookies.entries()) {
        cookiesObj[domain] = {};
        for (const [name, value] of cookies.entries()) {
          cookiesObj[domain][name] = value;
        }
      }
      
      fs.writeFileSync(cookiesFile, JSON.stringify(cookiesObj, null, 2));
      
      // Emit event
      this.emitter.emit('browser:closed', { id: this.id });
    }
  }
  
  /**
   * Check if the browser instance is active
   */
  isActive(): boolean {
    return this.active;
  }
}

/**
 * CredentialManager handles secure storage and retrieval of website credentials
 */
export class CredentialManager {
  private credentialsPath: string;
  private credentials: Map<string, Credential> = new Map();
  private encryptionKey: string;
  
  constructor() {
    // Set up credentials path
    this.credentialsPath = process.env.CREDENTIALS_PATH || path.join(process.cwd(), 'sandbox', 'credentials');
    
    // Set up encryption key (in a real app, this would be securely stored)
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'manus-twin-encryption-key';
    
    // Load credentials
    this.loadCredentials();
  }
  
  /**
   * Load credentials from storage
   */
  private loadCredentials(): void {
    try {
      // Create credentials directory if it doesn't exist
      if (!fs.existsSync(this.credentialsPath)) {
        fs.mkdirSync(this.credentialsPath, { recursive: true });
      }
      
      // Create credentials file if it doesn't exist
      const credentialsFile = path.join(this.credentialsPath, 'credentials.enc');
      if (!fs.existsSync(credentialsFile)) {
        fs.writeFileSync(credentialsFile, '');
        return;
      }
      
      // Read and decrypt credentials
      const encryptedData = fs.readFileSync(credentialsFile, 'utf8');
      if (!encryptedData) {
        return;
      }
      
      const decryptedData = this.decrypt(encryptedData);
      const credentialsData = JSON.parse(decryptedData);
      
      // Load credentials into map
      for (const [website, credential] of Object.entries(credentialsData)) {
        this.credentials.set(website, credential as Credential);
      }
      
      console.log(`Loaded ${this.credentials.size} website credentials`);
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  }
  
  /**
   * Save credentials to storage
   */
  private saveCredentials(): void {
    try {
      // Convert credentials map to object
      const credentialsObj: Record<string, Credential> = {};
      for (const [website, credential] of this.credentials.entries()) {
        credentialsObj[website] = credential;
      }
      
      // Encrypt and save credentials
      const data = JSON.stringify(credentialsObj);
      const encryptedData = this.encrypt(data);
      
      fs.writeFileSync(
        path.join(this.credentialsPath, 'credentials.enc'),
        encryptedData
      );
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  }
  
  /**
   * Encrypt data
   */
  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32)), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * Decrypt data
   */
  private decrypt(data: string): string {
    const parts = data.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32)), iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Store credentials for a website
   */
  storeCredentials(website: string, username: string, password: string): boolean {
    try {
      // Normalize website (remove protocol, path, etc.)
      const normalizedWebsite = this.normalizeWebsite(website);
      
      // Store credentials
      this.credentials.set(normalizedWebsite, { username, password });
      
      // Save credentials
      this.saveCredentials();
      
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  }
  
  /**
   * Get credentials for a website
   */
  getCredentials(website: string): Credential | null {
    try {
      // Normalize website
      const normalizedWebsite = this.normalizeWebsite(website);
      
      // Get credentials
      return this.credentials.get(normalizedWebsite) || null;
    } catch (error) {
      console.error('Error getting credentials:', error);
      return null;
    }
  }
  
  /**
   * Delete credentials for a website
   */
  deleteCredentials(website: string): boolean {
    try {
      // Normalize website
      const normalizedWebsite = this.normalizeWebsite(website);
      
      // Delete credentials
      const result = this.credentials.delete(normalizedWebsite);
      
      // Save credentials
      if (result) {
        this.saveCredentials();
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return false;
    }
  }
  
  /**
   * List all websites with stored credentials
   */
  listWebsites(): string[] {
    return Array.from(this.credentials.keys());
  }
  
  /**
   * Normalize website URL to domain
   */
  private normalizeWebsite(website: string): string {
    try {
      // Add protocol if missing
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        website = 'https://' + website;
      }
      
      // Parse URL and return hostname
      const url = new URL(website);
      return url.hostname;
    } catch (error) {
      // If URL parsing fails, return as is
      return website;
    }
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

/**
 * BrowserResponse represents the response from a browser request
 */
export interface BrowserResponse {
  url: string;
  status: number;
  content: any;
  headers: Record<string, string>;
  error?: string;
}

/**
 * Credential represents a username and password for a website
 */
export interface Credential {
  username: string;
  password: string;
}
