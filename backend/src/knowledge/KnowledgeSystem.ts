import { MemoryModule } from '../memory/MemoryModule';

/**
 * KnowledgeSystem extends the memory module to provide a specialized
 * knowledge management system with increased capacity (up to 100 entries)
 */
export class KnowledgeSystem {
  private memoryModule: MemoryModule;
  private maxKnowledgeEntries: number = 100; // Increased from 20 in Manus
  
  constructor(memoryModule: MemoryModule) {
    this.memoryModule = memoryModule;
  }
  
  /**
   * Add a knowledge entry
   */
  addKnowledge(content: string, name: string, tags: string[] = []): string {
    // Create knowledge object
    const knowledge = {
      name,
      content,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if we're at capacity
    const existingKnowledge = this.getAllKnowledge();
    if (existingKnowledge.length >= this.maxKnowledgeEntries) {
      throw new Error(`Knowledge system at capacity (${this.maxKnowledgeEntries} entries)`);
    }
    
    // Store in memory module
    return this.memoryModule.createKnowledgeMemory(knowledge, tags);
  }
  
  /**
   * Get a knowledge entry by ID
   */
  getKnowledge(knowledgeId: string): any {
    const memory = this.memoryModule.getMemory(knowledgeId);
    
    if (!memory || memory.type !== 'knowledge') {
      return null;
    }
    
    return memory.content;
  }
  
  /**
   * Update a knowledge entry
   */
  updateKnowledge(knowledgeId: string, content?: string, name?: string, tags?: string[]): boolean {
    const memory = this.memoryModule.getMemory(knowledgeId);
    
    if (!memory || memory.type !== 'knowledge') {
      return false;
    }
    
    // Update knowledge
    const knowledge = { ...memory.content };
    
    if (content !== undefined) {
      knowledge.content = content;
    }
    
    if (name !== undefined) {
      knowledge.name = name;
    }
    
    knowledge.updatedAt = new Date();
    
    // Update in memory module
    return this.memoryModule.updateMemory(knowledgeId, knowledge, tags);
  }
  
  /**
   * Delete a knowledge entry
   */
  deleteKnowledge(knowledgeId: string): boolean {
    return this.memoryModule.deleteMemory(knowledgeId);
  }
  
  /**
   * Activate a knowledge entry
   */
  activateKnowledge(knowledgeId: string): boolean {
    const memory = this.memoryModule.getMemory(knowledgeId);
    
    if (!memory || memory.type !== 'knowledge') {
      return false;
    }
    
    // Update knowledge
    const knowledge = { ...memory.content, active: true };
    
    // Update in memory module
    return this.memoryModule.updateMemory(knowledgeId, knowledge);
  }
  
  /**
   * Deactivate a knowledge entry
   */
  deactivateKnowledge(knowledgeId: string): boolean {
    const memory = this.memoryModule.getMemory(knowledgeId);
    
    if (!memory || memory.type !== 'knowledge') {
      return false;
    }
    
    // Update knowledge
    const knowledge = { ...memory.content, active: false };
    
    // Update in memory module
    return this.memoryModule.updateMemory(knowledgeId, knowledge);
  }
  
  /**
   * Get all knowledge entries
   */
  getAllKnowledge(): any[] {
    const memories = this.memoryModule.getAllMemoriesByType('knowledge');
    return memories.map(memory => ({
      id: memory.id,
      ...memory.content,
      tags: memory.tags
    }));
  }
  
  /**
   * Get active knowledge entries
   */
  getActiveKnowledge(): any[] {
    return this.getAllKnowledge().filter(knowledge => knowledge.active);
  }
  
  /**
   * Search knowledge entries by tags
   */
  searchKnowledgeByTags(tags: string[]): any[] {
    const memories = this.memoryModule.searchMemoriesByTags(tags, 'knowledge');
    return memories.map(memory => ({
      id: memory.id,
      ...memory.content,
      tags: memory.tags
    }));
  }
  
  /**
   * Search knowledge entries by content
   */
  searchKnowledgeByContent(query: string): any[] {
    const memories = this.memoryModule.searchMemoriesByContent(query, 'knowledge');
    return memories.map(memory => ({
      id: memory.id,
      ...memory.content,
      tags: memory.tags
    }));
  }
  
  /**
   * Get knowledge entries for a specific context
   * This is used to provide relevant knowledge to the AI model
   */
  getKnowledgeForContext(context: string, maxEntries: number = 10): any[] {
    // First, try to find knowledge entries with matching tags
    const contextWords = context.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const tagMatches = this.searchKnowledgeByTags(contextWords);
    
    // Then, search by content
    const contentMatches = this.searchKnowledgeByContent(context);
    
    // Combine and deduplicate results
    const combinedMatches = [...tagMatches];
    
    for (const match of contentMatches) {
      if (!combinedMatches.some(m => m.id === match.id)) {
        combinedMatches.push(match);
      }
    }
    
    // Filter to active knowledge only
    const activeMatches = combinedMatches.filter(knowledge => knowledge.active);
    
    // Return up to maxEntries
    return activeMatches.slice(0, maxEntries);
  }
  
  /**
   * Get the maximum number of knowledge entries allowed
   */
  getMaxKnowledgeEntries(): number {
    return this.maxKnowledgeEntries;
  }
  
  /**
   * Set the maximum number of knowledge entries allowed
   */
  setMaxKnowledgeEntries(max: number): void {
    this.maxKnowledgeEntries = max;
  }
}
