import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * MemoryModule provides long-term memory storage for conversations and context
 * allowing AI models to maintain context across sessions
 */
export class MemoryModule {
  private memoryBasePath: string;
  private memories: Map<string, any> = new Map();
  private indexedMemories: Map<string, string[]> = new Map();
  
  constructor() {
    // Set up memory base path
    this.memoryBasePath = process.env.MEMORY_PATH || path.join(process.cwd(), 'memory');
    this.initializeMemoryStorage();
  }
  
  /**
   * Initialize the memory storage
   */
  private async initializeMemoryStorage(): Promise<void> {
    try {
      // Create memory directory if it doesn't exist
      if (!fs.existsSync(this.memoryBasePath)) {
        fs.mkdirSync(this.memoryBasePath, { recursive: true });
      }
      
      // Create subdirectories for different memory types
      const memoryDirs = ['conversations', 'knowledge', 'context'];
      for (const dir of memoryDirs) {
        const dirPath = path.join(this.memoryBasePath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      
      // Load existing memories
      await this.loadExistingMemories();
      
      console.log('Memory storage initialized at:', this.memoryBasePath);
    } catch (error) {
      console.error('Error initializing memory storage:', error);
    }
  }
  
  /**
   * Load existing memories from disk
   */
  private async loadExistingMemories(): Promise<void> {
    try {
      // Load conversation memories
      const conversationsPath = path.join(this.memoryBasePath, 'conversations');
      const conversationFiles = fs.readdirSync(conversationsPath);
      
      for (const file of conversationFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(conversationsPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const memory = JSON.parse(content);
          
          this.memories.set(memory.id, memory);
          
          // Index memory by tags
          if (memory.tags && Array.isArray(memory.tags)) {
            for (const tag of memory.tags) {
              if (!this.indexedMemories.has(tag)) {
                this.indexedMemories.set(tag, []);
              }
              this.indexedMemories.get(tag).push(memory.id);
            }
          }
        }
      }
      
      // Load knowledge memories
      const knowledgePath = path.join(this.memoryBasePath, 'knowledge');
      const knowledgeFiles = fs.readdirSync(knowledgePath);
      
      for (const file of knowledgeFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(knowledgePath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const memory = JSON.parse(content);
          
          this.memories.set(memory.id, memory);
          
          // Index memory by tags
          if (memory.tags && Array.isArray(memory.tags)) {
            for (const tag of memory.tags) {
              if (!this.indexedMemories.has(tag)) {
                this.indexedMemories.set(tag, []);
              }
              this.indexedMemories.get(tag).push(memory.id);
            }
          }
        }
      }
      
      // Load context memories
      const contextPath = path.join(this.memoryBasePath, 'context');
      const contextFiles = fs.readdirSync(contextPath);
      
      for (const file of contextFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(contextPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const memory = JSON.parse(content);
          
          this.memories.set(memory.id, memory);
          
          // Index memory by tags
          if (memory.tags && Array.isArray(memory.tags)) {
            for (const tag of memory.tags) {
              if (!this.indexedMemories.has(tag)) {
                this.indexedMemories.set(tag, []);
              }
              this.indexedMemories.get(tag).push(memory.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading existing memories:', error);
    }
  }
  
  /**
   * Create a new memory
   */
  createMemory(type: 'conversation' | 'knowledge' | 'context', content: any, tags: string[] = []): string {
    const memoryId = uuidv4();
    
    // Create memory object
    const memory = {
      id: memoryId,
      type,
      content,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store memory
    this.memories.set(memoryId, memory);
    
    // Index memory by tags
    for (const tag of tags) {
      if (!this.indexedMemories.has(tag)) {
        this.indexedMemories.set(tag, []);
      }
      this.indexedMemories.get(tag).push(memoryId);
    }
    
    // Save memory to disk
    this.saveMemoryToDisk(memory);
    
    return memoryId;
  }
  
  /**
   * Get a memory by ID
   */
  getMemory(memoryId: string): any {
    return this.memories.get(memoryId) || null;
  }
  
  /**
   * Update a memory
   */
  updateMemory(memoryId: string, content: any, tags?: string[]): boolean {
    const memory = this.getMemory(memoryId);
    
    if (!memory) {
      return false;
    }
    
    // Update memory
    memory.content = content;
    memory.updatedAt = new Date();
    
    // Update tags if provided
    if (tags) {
      // Remove old tag indices
      for (const tag of memory.tags) {
        const memoryIds = this.indexedMemories.get(tag) || [];
        const index = memoryIds.indexOf(memoryId);
        if (index !== -1) {
          memoryIds.splice(index, 1);
        }
      }
      
      // Set new tags
      memory.tags = tags;
      
      // Index memory by new tags
      for (const tag of tags) {
        if (!this.indexedMemories.has(tag)) {
          this.indexedMemories.set(tag, []);
        }
        this.indexedMemories.get(tag).push(memoryId);
      }
    }
    
    // Save memory to disk
    this.saveMemoryToDisk(memory);
    
    return true;
  }
  
  /**
   * Delete a memory
   */
  deleteMemory(memoryId: string): boolean {
    const memory = this.getMemory(memoryId);
    
    if (!memory) {
      return false;
    }
    
    // Remove memory from indices
    for (const tag of memory.tags) {
      const memoryIds = this.indexedMemories.get(tag) || [];
      const index = memoryIds.indexOf(memoryId);
      if (index !== -1) {
        memoryIds.splice(index, 1);
      }
    }
    
    // Remove memory from storage
    this.memories.delete(memoryId);
    
    // Delete memory file
    const filePath = path.join(this.memoryBasePath, memory.type + 's', memoryId + '.json');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return true;
  }
  
  /**
   * Search memories by tags
   */
  searchMemoriesByTags(tags: string[], type?: 'conversation' | 'knowledge' | 'context'): any[] {
    // Find memories that match all tags
    let matchingMemoryIds: string[] = [];
    
    if (tags.length === 0) {
      // If no tags provided, return all memories
      matchingMemoryIds = Array.from(this.memories.keys());
    } else {
      // Start with memories matching the first tag
      matchingMemoryIds = this.indexedMemories.get(tags[0]) || [];
      
      // Filter by remaining tags
      for (let i = 1; i < tags.length; i++) {
        const tagMemoryIds = this.indexedMemories.get(tags[i]) || [];
        matchingMemoryIds = matchingMemoryIds.filter(id => tagMemoryIds.includes(id));
      }
    }
    
    // Get memory objects
    const memories = matchingMemoryIds.map(id => this.getMemory(id));
    
    // Filter by type if provided
    if (type) {
      return memories.filter(memory => memory.type === type);
    }
    
    return memories;
  }
  
  /**
   * Search memories by content
   */
  searchMemoriesByContent(query: string, type?: 'conversation' | 'knowledge' | 'context'): any[] {
    // Simple string matching search
    const matchingMemories = Array.from(this.memories.values()).filter(memory => {
      // Check if content contains query
      const contentStr = JSON.stringify(memory.content).toLowerCase();
      return contentStr.includes(query.toLowerCase());
    });
    
    // Filter by type if provided
    if (type) {
      return matchingMemories.filter(memory => memory.type === type);
    }
    
    return matchingMemories;
  }
  
  /**
   * Save memory to disk
   */
  private saveMemoryToDisk(memory: any): void {
    try {
      const dirPath = path.join(this.memoryBasePath, memory.type + 's');
      const filePath = path.join(dirPath, memory.id + '.json');
      
      fs.writeFileSync(filePath, JSON.stringify(memory, null, 2));
    } catch (error) {
      console.error('Error saving memory to disk:', error);
    }
  }
  
  /**
   * Get all memories of a specific type
   */
  getAllMemoriesByType(type: 'conversation' | 'knowledge' | 'context'): any[] {
    return Array.from(this.memories.values()).filter(memory => memory.type === type);
  }
  
  /**
   * Create a conversation memory from messages
   */
  createConversationMemory(messages: any[], tags: string[] = []): string {
    return this.createMemory('conversation', { messages }, tags);
  }
  
  /**
   * Add message to conversation memory
   */
  addMessageToConversation(memoryId: string, message: any): boolean {
    const memory = this.getMemory(memoryId);
    
    if (!memory || memory.type !== 'conversation') {
      return false;
    }
    
    // Add message to conversation
    memory.content.messages.push(message);
    memory.updatedAt = new Date();
    
    // Save memory to disk
    this.saveMemoryToDisk(memory);
    
    return true;
  }
  
  /**
   * Get conversation messages
   */
  getConversationMessages(memoryId: string): any[] {
    const memory = this.getMemory(memoryId);
    
    if (!memory || memory.type !== 'conversation') {
      return [];
    }
    
    return memory.content.messages;
  }
  
  /**
   * Create a knowledge memory
   */
  createKnowledgeMemory(knowledge: any, tags: string[] = []): string {
    return this.createMemory('knowledge', knowledge, tags);
  }
  
  /**
   * Create a context memory
   */
  createContextMemory(context: any, tags: string[] = []): string {
    return this.createMemory('context', context, tags);
  }
}
