import { MultimodalUnderstandingModule } from '../multimodal/MultimodalUnderstandingModule';
import { AdvancedReasoningFramework } from '../reasoning/AdvancedReasoningFramework';
import { RealTimeLearningSystem } from '../learning/RealTimeLearningSystem';
import { CloudServiceIntegrationFramework } from '../cloud/CloudServiceIntegrationFramework';
import { ContextualAwarenessSystem } from '../context/ContextualAwarenessSystem';
import { SpecializedCapabilities } from '../specialized/SpecializedCapabilities';
import { EnhancedVirtualLinuxSandbox } from '../sandbox/EnhancedVirtualLinuxSandbox';
import { WindowsCompatibilityLayer } from '../platform/WindowsCompatibilityLayer';
import { WorkflowEngine } from '../workflow/WorkflowEngine';
import { MemoryModule } from '../memory/MemoryModule';
import { KnowledgeSystem } from '../knowledge/KnowledgeSystem';
import { ModelIntegration } from '../models/integration/ModelIntegration';
import { APIKeyManager } from '../api/APIKeyManager';

/**
 * SystemIntegration class coordinates all components of the system
 * and provides a unified interface for system-wide operations
 */
export class SystemIntegration {
  private multimodalModule: MultimodalUnderstandingModule;
  private reasoningFramework: AdvancedReasoningFramework;
  private learningSystem: RealTimeLearningSystem;
  private cloudIntegration: CloudServiceIntegrationFramework;
  private contextSystem: ContextualAwarenessSystem;
  private specializedCapabilities: SpecializedCapabilities;
  private sandbox: EnhancedVirtualLinuxSandbox;
  private windowsCompat: WindowsCompatibilityLayer;
  private workflowEngine: WorkflowEngine;
  private memoryModule: MemoryModule;
  private knowledgeSystem: KnowledgeSystem;
  private modelIntegration: ModelIntegration;
  private apiKeyManager: APIKeyManager;
  
  private isInitialized: boolean = false;
  private initializationProgress: number = 0;
  private initializationStatus: string = 'Not started';
  private componentStatuses: Map<string, boolean> = new Map();
  
  constructor() {
    // Initialize all components
    this.multimodalModule = new MultimodalUnderstandingModule();
    this.reasoningFramework = new AdvancedReasoningFramework();
    this.learningSystem = new RealTimeLearningSystem();
    this.cloudIntegration = new CloudServiceIntegrationFramework();
    this.contextSystem = new ContextualAwarenessSystem();
    this.specializedCapabilities = new SpecializedCapabilities();
    this.sandbox = new EnhancedVirtualLinuxSandbox();
    this.windowsCompat = new WindowsCompatibilityLayer();
    this.workflowEngine = new WorkflowEngine();
    this.memoryModule = new MemoryModule();
    this.knowledgeSystem = new KnowledgeSystem();
    this.modelIntegration = new ModelIntegration();
    this.apiKeyManager = new APIKeyManager();
    
    // Set initial component statuses
    this.componentStatuses.set('multimodal', false);
    this.componentStatuses.set('reasoning', false);
    this.componentStatuses.set('learning', false);
    this.componentStatuses.set('cloud', false);
    this.componentStatuses.set('context', false);
    this.componentStatuses.set('specialized', false);
    this.componentStatuses.set('sandbox', false);
    this.componentStatuses.set('windows', false);
    this.componentStatuses.set('workflow', false);
    this.componentStatuses.set('memory', false);
    this.componentStatuses.set('knowledge', false);
    this.componentStatuses.set('model', false);
    this.componentStatuses.set('api', false);
  }
  
  /**
   * Initialize the entire system
   */
  async initializeSystem(): Promise<{ success: boolean, message: string }> {
    try {
      this.initializationStatus = 'Initializing';
      this.initializationProgress = 0;
      
      // Initialize API Key Manager
      await this.initializeComponent('api', async () => {
        await this.apiKeyManager.initialize();
      });
      
      // Initialize Model Integration
      await this.initializeComponent('model', async () => {
        await this.modelIntegration.initialize(this.apiKeyManager);
      });
      
      // Initialize Knowledge System
      await this.initializeComponent('knowledge', async () => {
        await this.knowledgeSystem.initialize();
      });
      
      // Initialize Memory Module
      await this.initializeComponent('memory', async () => {
        await this.memoryModule.initialize();
      });
      
      // Initialize Windows Compatibility Layer
      await this.initializeComponent('windows', async () => {
        await this.windowsCompat.initialize();
      });
      
      // Initialize Enhanced Sandbox
      await this.initializeComponent('sandbox', async () => {
        await this.sandbox.initialize();
      });
      
      // Initialize Workflow Engine
      await this.initializeComponent('workflow', async () => {
        await this.workflowEngine.initialize(
          this.modelIntegration,
          this.memoryModule,
          this.knowledgeSystem,
          this.sandbox
        );
      });
      
      // Initialize Multimodal Understanding Module
      await this.initializeComponent('multimodal', async () => {
        await this.multimodalModule.initialize();
      });
      
      // Initialize Advanced Reasoning Framework
      await this.initializeComponent('reasoning', async () => {
        await this.reasoningFramework.initialize();
      });
      
      // Initialize Real-time Learning System
      await this.initializeComponent('learning', async () => {
        await this.learningSystem.initialize();
      });
      
      // Initialize Cloud Service Integration
      await this.initializeComponent('cloud', async () => {
        await this.cloudIntegration.initialize();
      });
      
      // Initialize Contextual Awareness System
      await this.initializeComponent('context', async () => {
        await this.contextSystem.initialize();
      });
      
      // Initialize Specialized Capabilities
      await this.initializeComponent('specialized', async () => {
        await this.specializedCapabilities.initialize();
      });
      
      // Connect all components through the workflow engine
      await this.connectComponents();
      
      this.isInitialized = true;
      this.initializationStatus = 'Initialized';
      this.initializationProgress = 100;
      
      return { success: true, message: 'System initialized successfully' };
    } catch (error) {
      this.initializationStatus = 'Failed';
      console.error('Error initializing system:', error);
      return { success: false, message: `Initialization failed: ${error.message}` };
    }
  }
  
  /**
   * Initialize a specific component and update progress
   */
  private async initializeComponent(name: string, initFunction: () => Promise<void>): Promise<void> {
    try {
      this.initializationStatus = `Initializing ${name}`;
      await initFunction();
      this.componentStatuses.set(name, true);
      this.updateInitializationProgress();
    } catch (error) {
      console.error(`Error initializing ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * Update initialization progress based on component statuses
   */
  private updateInitializationProgress(): void {
    const totalComponents = this.componentStatuses.size;
    const initializedComponents = Array.from(this.componentStatuses.values()).filter(status => status).length;
    this.initializationProgress = Math.floor((initializedComponents / totalComponents) * 100);
  }
  
  /**
   * Connect all components through the workflow engine
   */
  private async connectComponents(): Promise<void> {
    try {
      this.initializationStatus = 'Connecting components';
      
      // Connect multimodal module to workflow engine
      this.workflowEngine.registerMultimodalModule(this.multimodalModule);
      
      // Connect reasoning framework to workflow engine
      this.workflowEngine.registerReasoningFramework(this.reasoningFramework);
      
      // Connect learning system to workflow engine
      this.workflowEngine.registerLearningSystem(this.learningSystem);
      
      // Connect cloud integration to workflow engine
      this.workflowEngine.registerCloudIntegration(this.cloudIntegration);
      
      // Connect context system to workflow engine
      this.workflowEngine.registerContextSystem(this.contextSystem);
      
      // Connect specialized capabilities to workflow engine
      this.workflowEngine.registerSpecializedCapabilities(this.specializedCapabilities);
      
      this.initializationStatus = 'Components connected';
    } catch (error) {
      console.error('Error connecting components:', error);
      throw error;
    }
  }
  
  /**
   * Get system status
   */
  async getSystemStatus(): Promise<{
    initialized: boolean;
    progress: number;
    status: string;
    components: { [key: string]: boolean };
  }> {
    // Convert component statuses map to object
    const componentStatusObj: { [key: string]: boolean } = {};
    this.componentStatuses.forEach((value, key) => {
      componentStatusObj[key] = value;
    });
    
    return {
      initialized: this.isInitialized,
      progress: this.initializationProgress,
      status: this.initializationStatus,
      components: componentStatusObj
    };
  }
  
  /**
   * Process a user request through the workflow engine
   */
  async processRequest(request: any): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }
    
    try {
      return await this.workflowEngine.processRequest(request);
    } catch (error) {
      console.error('Error processing request:', error);
      throw error;
    }
  }
  
  /**
   * Optimize system performance
   */
  async optimizeSystem(): Promise<{ success: boolean, message: string }> {
    try {
      // Optimize memory usage
      await this.memoryModule.optimize();
      
      // Optimize knowledge system
      await this.knowledgeSystem.optimize();
      
      // Optimize model integration
      await this.modelIntegration.optimize();
      
      // Optimize workflow engine
      await this.workflowEngine.optimize();
      
      return { success: true, message: 'System optimized successfully' };
    } catch (error) {
      console.error('Error optimizing system:', error);
      return { success: false, message: `Optimization failed: ${error.message}` };
    }
  }
  
  /**
   * Shutdown the system gracefully
   */
  async shutdownSystem(): Promise<{ success: boolean, message: string }> {
    try {
      // Shutdown all components in reverse order of initialization
      
      // Shutdown specialized capabilities
      await this.specializedCapabilities.shutdown?.();
      
      // Shutdown contextual awareness system
      await this.contextSystem.shutdown?.();
      
      // Shutdown cloud integration
      await this.cloudIntegration.shutdown?.();
      
      // Shutdown learning system
      await this.learningSystem.shutdown?.();
      
      // Shutdown reasoning framework
      await this.reasoningFramework.shutdown?.();
      
      // Shutdown multimodal module
      await this.multimodalModule.shutdown?.();
      
      // Shutdown workflow engine
      await this.workflowEngine.shutdown?.();
      
      // Shutdown sandbox
      await this.sandbox.shutdown?.();
      
      // Shutdown windows compatibility layer
      await this.windowsCompat.shutdown?.();
      
      // Shutdown memory module
      await this.memoryModule.shutdown?.();
      
      // Shutdown knowledge system
      await this.knowledgeSystem.shutdown?.();
      
      // Shutdown model integration
      await this.modelIntegration.shutdown?.();
      
      // Shutdown API key manager
      await this.apiKeyManager.shutdown?.();
      
      this.isInitialized = false;
      this.initializationStatus = 'Shutdown';
      this.initializationProgress = 0;
      
      // Reset component statuses
      this.componentStatuses.forEach((_, key) => {
        this.componentStatuses.set(key, false);
      });
      
      return { success: true, message: 'System shutdown successfully' };
    } catch (error) {
      console.error('Error shutting down system:', error);
      return { success: false, message: `Shutdown failed: ${error.message}` };
    }
  }
}
