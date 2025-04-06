import { EventEmitter } from 'events';
import { FunctionService } from '../services/FunctionService';
import { ModelIntegrationService } from '../services/ModelIntegrationService';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * WorkflowEngine orchestrates the execution of tasks and function calls
 * between the frontend, backend, and model providers
 */
export class WorkflowEngine {
  private functionService: FunctionService;
  private modelIntegrationService: ModelIntegrationService;
  private activeWorkflows: Map<string, any> = new Map();
  private workflowEmitter: EventEmitter;
  private sandboxBasePath: string;
  
  constructor(functionService: FunctionService, modelIntegrationService: ModelIntegrationService) {
    this.functionService = functionService;
    this.modelIntegrationService = modelIntegrationService;
    this.workflowEmitter = new EventEmitter();
    
    // Set up sandbox base path
    this.sandboxBasePath = process.env.SANDBOX_PATH || path.join(process.cwd(), 'sandbox');
    this.initializeSandbox();
  }
  
  /**
   * Initialize the sandbox environment
   */
  private async initializeSandbox(): Promise<void> {
    try {
      // Create sandbox directory if it doesn't exist
      if (!fs.existsSync(this.sandboxBasePath)) {
        fs.mkdirSync(this.sandboxBasePath, { recursive: true });
      }
      
      // Create subdirectories for different sandboxes
      const sandboxDirs = ['home', 'tmp', 'var'];
      for (const dir of sandboxDirs) {
        const dirPath = path.join(this.sandboxBasePath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      
      console.log('Sandbox environment initialized at:', this.sandboxBasePath);
    } catch (error) {
      console.error('Error initializing sandbox:', error);
    }
  }
  
  /**
   * Create a new workflow
   */
  createWorkflow(initialContext: any = {}): string {
    const workflowId = uuidv4();
    
    // Create workflow context
    const context = {
      id: workflowId,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [],
      variables: {},
      conversationId: null,
      sandboxId: null,
      ...initialContext
    };
    
    // Store workflow
    this.activeWorkflows.set(workflowId, context);
    
    // Create conversation for this workflow
    this.modelIntegrationService.createConversation([])
      .then(conversationId => {
        context.conversationId = conversationId;
        this.activeWorkflows.set(workflowId, context);
      })
      .catch(error => {
        console.error('Error creating conversation for workflow:', error);
      });
    
    // Create sandbox for this workflow
    this.createSandboxEnvironment(workflowId)
      .then(sandboxId => {
        context.sandboxId = sandboxId;
        this.activeWorkflows.set(workflowId, context);
      })
      .catch(error => {
        console.error('Error creating sandbox for workflow:', error);
      });
    
    return workflowId;
  }
  
  /**
   * Create a sandbox environment for a workflow
   */
  private async createSandboxEnvironment(workflowId: string): Promise<string> {
    const sandboxId = `sandbox-${workflowId.slice(0, 8)}`;
    const sandboxPath = path.join(this.sandboxBasePath, 'home', sandboxId);
    
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
        `This is a virtual Linux environment where you can execute commands and run code.\n`
      );
      
      return sandboxId;
    } catch (error) {
      console.error('Error creating sandbox environment:', error);
      throw error;
    }
  }
  
  /**
   * Get a workflow by ID
   */
  getWorkflow(workflowId: string): any {
    return this.activeWorkflows.get(workflowId) || null;
  }
  
  /**
   * Execute a step in the workflow
   */
  async executeStep(workflowId: string, step: any): Promise<any> {
    const workflow = this.getWorkflow(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    try {
      // Update workflow status
      workflow.status = 'running';
      workflow.updatedAt = new Date();
      
      // Add step to workflow
      const stepId = workflow.steps.length;
      const stepContext = {
        id: stepId,
        type: step.type,
        status: 'running',
        startedAt: new Date(),
        completedAt: null,
        input: step.input,
        output: null,
        error: null,
        ...step
      };
      
      workflow.steps.push(stepContext);
      
      // Execute step based on type
      let result;
      
      switch (step.type) {
        case 'model_query':
          result = await this.executeModelQueryStep(workflow, stepContext);
          break;
        case 'function_call':
          result = await this.executeFunctionCallStep(workflow, stepContext);
          break;
        case 'shell_command':
          result = await this.executeShellCommandStep(workflow, stepContext);
          break;
        case 'file_operation':
          result = await this.executeFileOperationStep(workflow, stepContext);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
      
      // Update step with result
      stepContext.status = 'completed';
      stepContext.completedAt = new Date();
      stepContext.output = result;
      
      // Update workflow
      workflow.steps[stepId] = stepContext;
      workflow.updatedAt = new Date();
      
      // Check if workflow is complete
      if (workflow.steps.every(s => s.status === 'completed')) {
        workflow.status = 'completed';
      }
      
      // Emit step completion event
      this.workflowEmitter.emit('step:completed', { workflowId, stepId, result });
      
      return result;
    } catch (error) {
      console.error(`Error executing step in workflow ${workflowId}:`, error);
      
      // Update step with error
      const stepId = workflow.steps.length - 1;
      workflow.steps[stepId].status = 'failed';
      workflow.steps[stepId].completedAt = new Date();
      workflow.steps[stepId].error = error.message;
      
      // Update workflow
      workflow.status = 'failed';
      workflow.updatedAt = new Date();
      
      // Emit step failure event
      this.workflowEmitter.emit('step:failed', { workflowId, stepId, error });
      
      throw error;
    }
  }
  
  /**
   * Execute a model query step
   */
  private async executeModelQueryStep(workflow: any, step: any): Promise<any> {
    const { modelId, message, options } = step.input;
    
    if (!workflow.conversationId) {
      throw new Error('No conversation ID available for workflow');
    }
    
    return this.modelIntegrationService.sendMessage(
      workflow.conversationId,
      message,
      modelId,
      options
    );
  }
  
  /**
   * Execute a function call step
   */
  private async executeFunctionCallStep(workflow: any, step: any): Promise<any> {
    const { functionName, parameters } = step.input;
    
    return this.functionService.executeFunction(functionName, parameters);
  }
  
  /**
   * Execute a shell command step
   */
  private async executeShellCommandStep(workflow: any, step: any): Promise<any> {
    const { command, execDir } = step.input;
    
    if (!workflow.sandboxId) {
      throw new Error('No sandbox ID available for workflow');
    }
    
    // Determine execution directory
    const sandboxHomePath = path.join(this.sandboxBasePath, 'home', workflow.sandboxId);
    const executionDir = execDir ? path.join(sandboxHomePath, execDir) : sandboxHomePath;
    
    // Ensure execution directory exists
    if (!fs.existsSync(executionDir)) {
      fs.mkdirSync(executionDir, { recursive: true });
    }
    
    try {
      // Execute command
      const { stdout, stderr } = await execAsync(command, { cwd: executionDir });
      
      return {
        stdout,
        stderr,
        exitCode: 0
      };
    } catch (error) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1
      };
    }
  }
  
  /**
   * Execute a file operation step
   */
  private async executeFileOperationStep(workflow: any, step: any): Promise<any> {
    const { operation, file, content, options } = step.input;
    
    if (!workflow.sandboxId) {
      throw new Error('No sandbox ID available for workflow');
    }
    
    // Determine file path
    const sandboxHomePath = path.join(this.sandboxBasePath, 'home', workflow.sandboxId);
    const filePath = path.join(sandboxHomePath, file);
    
    // Ensure parent directory exists
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    
    switch (operation) {
      case 'read':
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Handle line range if specified
          if (options && (options.startLine !== undefined || options.endLine !== undefined)) {
            const lines = fileContent.split('\n');
            const startLine = options.startLine || 0;
            const endLine = options.endLine || lines.length;
            return lines.slice(startLine, endLine).join('\n');
          }
          
          return fileContent;
        } catch (error) {
          throw new Error(`Error reading file: ${error.message}`);
        }
        
      case 'write':
        try {
          if (options && options.append) {
            fs.appendFileSync(filePath, content);
          } else {
            fs.writeFileSync(filePath, content);
          }
          
          return { success: true, file: filePath };
        } catch (error) {
          throw new Error(`Error writing file: ${error.message}`);
        }
        
      case 'delete':
        try {
          fs.unlinkSync(filePath);
          return { success: true, file: filePath };
        } catch (error) {
          throw new Error(`Error deleting file: ${error.message}`);
        }
        
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  }
  
  /**
   * Start an interactive shell session
   */
  startShellSession(workflowId: string): any {
    const workflow = this.getWorkflow(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    if (!workflow.sandboxId) {
      throw new Error('No sandbox ID available for workflow');
    }
    
    const sessionId = uuidv4();
    const sandboxHomePath = path.join(this.sandboxBasePath, 'home', workflow.sandboxId);
    
    // Create shell process
    const shell = spawn('bash', [], {
      cwd: sandboxHomePath,
      env: { ...process.env, HOME: sandboxHomePath },
      shell: true
    });
    
    // Store session in workflow
    if (!workflow.shellSessions) {
      workflow.shellSessions = {};
    }
    
    workflow.shellSessions[sessionId] = {
      id: sessionId,
      process: shell,
      status: 'running',
      createdAt: new Date(),
      output: ''
    };
    
    // Handle shell output
    shell.stdout.on('data', (data) => {
      const session = workflow.shellSessions[sessionId];
      if (session) {
        session.output += data.toString();
        this.workflowEmitter.emit('shell:output', { workflowId, sessionId, data: data.toString() });
      }
    });
    
    shell.stderr.on('data', (data) => {
      const session = workflow.shellSessions[sessionId];
      if (session) {
        session.output += data.toString();
        this.workflowEmitter.emit('shell:error', { workflowId, sessionId, data: data.toString() });
      }
    });
    
    shell.on('close', (code) => {
      const session = workflow.shellSessions[sessionId];
      if (session) {
        session.status = 'closed';
        session.exitCode = code;
        this.workflowEmitter.emit('shell:close', { workflowId, sessionId, code });
      }
    });
    
    return {
      sessionId,
      workflowId
    };
  }
  
  /**
   * Write to a shell session
   */
  writeToShellSession(workflowId: string, sessionId: string, input: string): boolean {
    const workflow = this.getWorkflow(workflowId);
    
    if (!workflow || !workflow.shellSessions || !workflow.shellSessions[sessionId]) {
      throw new Error(`Shell session ${sessionId} not found in workflow ${workflowId}`);
    }
    
    const session = workflow.shellSessions[sessionId];
    
    if (session.status !== 'running') {
      throw new Error(`Shell session ${sessionId} is not running`);
    }
    
    session.process.stdin.write(input);
    return true;
  }
  
  /**
   * Get shell session output
   */
  getShellSessionOutput(workflowId: string, sessionId: string): string {
    const workflow = this.getWorkflow(workflowId);
    
    if (!workflow || !workflow.shellSessions || !workflow.shellSessions[sessionId]) {
      throw new Error(`Shell session ${sessionId} not found in workflow ${workflowId}`);
    }
    
    return workflow.shellSessions[sessionId].output;
  }
  
  /**
   * Kill a shell session
   */
  killShellSession(workflowId: string, sessionId: string): boolean {
    const workflow = this.getWorkflow(workflowId);
    
    if (!workflow || !workflow.shellSessions || !workflow.shellSessions[sessionId]) {
      throw new Error(`Shell session ${sessionId} not found in workflow ${workflowId}`);
    }
    
    const session = workflow.shellSessions[sessionId];
    
    if (session.status !== 'running') {
      return false;
    }
    
    session.process.kill();
    session.status = 'killed';
    
    return true;
  }
  
  /**
   * Subscribe to workflow events
   */
  onWorkflowEvent(event: string, callback: (data: any) => void): void {
    this.workflowEmitter.on(event, callback);
  }
  
  /**
   * Clean up a workflow
   */
  cleanupWorkflow(workflowId: string): boolean {
    const workflow = this.getWorkflow(workflowId);
    
    if (!workflow) {
      return false;
    }
    
    // Kill any active shell sessions
    if (workflow.shellSessions) {
      for (const sessionId in workflow.shellSessions) {
        const session = workflow.shellSessions[sessionId];
        if (session.status === 'running') {
          session.process.kill();
        }
      }
    }
    
    // Remove workflow
    this.activeWorkflows.delete(workflowId);
    
    return true;
  }
}
