/**
 * PrdManager - Manages the structured work queue (prd.json)
 * 
 * Provides full CRUD operations for the PRD hierarchy (Phases → Tasks → Subtasks)
 * with automatic metadata recalculation and hierarchical item queries.
 * 
 * See STATE_FILES.md Section 3.3 for the PRD schema specification.
 */

import { promises as fs } from 'fs';
import { dirname } from 'path';
import { withFileLock } from '../utils/index.js';
import { AtomicWriter } from '../state/index.js';
import type {
  PRD,
  Phase,
  Task,
  Subtask,
  ItemStatus,
  Iteration,
  Evidence,
  GateReport,
  PRDMetadata,
} from '../types/prd.js';

/**
 * PrdManager class.
 * Manages reading, writing, and querying the PRD file.
 */
export class PrdManager {
  private readonly filePath: string;
  private readonly atomicWriter: AtomicWriter;

  /**
   * Creates a new PrdManager instance.
   * @param filePath - Path to the prd.json file (default: '.puppet-master/prd.json')
   * @param backupCount - Number of backups to keep (default: 3)
   */
  constructor(filePath: string = '.puppet-master/prd.json', backupCount: number = 3) {
    this.filePath = filePath;
    this.atomicWriter = new AtomicWriter(backupCount);
  }

  /**
   * Loads the PRD from the file system.
   * Returns an empty PRD structure if the file doesn't exist.
   * Uses AtomicWriter for recovery from backups if main file is corrupted.
   * @returns The loaded PRD
   */
  async load(): Promise<PRD> {
    try {
      // Use AtomicWriter for recovery support
      const content = await this.atomicWriter.read(this.filePath);
      const prd = JSON.parse(content) as PRD;
      
      // Validate structure
      if (!prd.phases || !Array.isArray(prd.phases)) {
        throw new Error('Invalid PRD structure: missing or invalid phases array');
      }
      
      // Recalculate metadata to ensure consistency
      prd.metadata = this.recalculateMetadata(prd);
      
      return prd;
    } catch (error) {
      // If it's a recovery error, file doesn't exist - return empty PRD
      if (error instanceof Error && error.name === 'StateRecoveryError') {
        return this.createEmptyPRD();
      }
      // Re-throw other errors (like JSON parse errors or validation errors)
      throw error;
    }
  }

  /**
   * Saves the PRD to the file system.
   * Automatically recalculates metadata before saving.
   * Uses AtomicWriter for atomic writes with backup and recovery.
   * @param prd - The PRD to save
   */
  async save(prd: PRD): Promise<void> {
    await withFileLock(this.filePath, async () => {
      // Recalculate metadata before saving
      prd.metadata = this.recalculateMetadata(prd);
      prd.updatedAt = new Date().toISOString();

      // Write atomically using AtomicWriter (handles temp file, verification, backup, and rename)
      const content = JSON.stringify(prd, null, 2);
      await this.atomicWriter.write(this.filePath, content);
    });
  }

  /**
   * Updates the status of an item (phase, task, or subtask).
   * @param itemId - The ID of the item to update (e.g., 'PH-001', 'TK-001-001', 'ST-001-001-001')
   * @param status - The new status
   * @param evidence - Optional evidence to attach
   */
  async updateItemStatus(
    itemId: string,
    status: ItemStatus,
    evidence?: Evidence
  ): Promise<void> {
    const prd = await this.load();
    let item: Phase | Task | Subtask | null;
    
    try {
      item = this.findItemInHierarchy(prd, itemId);
    } catch (error) {
      // If parseItemId throws, rethrow with clearer message
      throw new Error(`Item not found: ${itemId}`);
    }
    
    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }
    
    item.status = status;
    
    // Update timestamps based on status
    if (status === 'running' && !item.startedAt) {
      item.startedAt = new Date().toISOString();
    }
    
    if ((status === 'passed' || status === 'failed' || status === 'escalated') && !item.completedAt) {
      item.completedAt = new Date().toISOString();
    }
    
    // Attach evidence if provided
    if (evidence) {
      item.evidence = evidence;
    }
    
    await this.save(prd);
  }

  /**
   * Gets the next pending item of the specified type.
   * Traverses the hierarchy in order (phases → tasks → subtasks).
   * @param type - The type of item to find ('phase', 'task', or 'subtask')
   * @returns The next pending item, or null if none found
   */
  async getNextPending(
    type: 'phase' | 'task' | 'subtask'
  ): Promise<Phase | Task | Subtask | null> {
    const prd = await this.load();
    
    if (type === 'phase') {
      return prd.phases.find(p => p.status === 'pending') || null;
    }
    
    if (type === 'task') {
      for (const phase of prd.phases) {
        const task = phase.tasks.find(t => 
          t.status === 'pending' || t.status === 'running'
        );
        if (task) {
          return task;
        }
      }
      return null;
    }
    
    // type === 'subtask'
    for (const phase of prd.phases) {
      for (const task of phase.tasks) {
        const subtask = task.subtasks.find(s => s.status === 'pending');
        if (subtask) {
          return subtask;
        }
      }
    }
    return null;
  }

  /**
   * Finds an item by its ID.
   * @param itemId - The ID of the item (e.g., 'PH-001', 'TK-001-001', 'ST-001-001-001')
   * @returns The found item, or null if not found
   */
  async findItem(itemId: string): Promise<Phase | Task | Subtask | null> {
    const prd = await this.load();
    return this.findItemInHierarchy(prd, itemId);
  }

  /**
   * Finds a phase by its ID.
   * @param phaseId - The phase ID (e.g., 'PH-001')
   * @returns The found phase, or null if not found
   */
  async findPhase(phaseId: string): Promise<Phase | null> {
    const prd = await this.load();
    return prd.phases.find(p => p.id === phaseId) || null;
  }

  /**
   * Finds a task by its ID.
   * @param taskId - The task ID (e.g., 'TK-001-001')
   * @returns The found task, or null if not found
   */
  async findTask(taskId: string): Promise<Task | null> {
    const prd = await this.load();
    for (const phase of prd.phases) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) {
        return task;
      }
    }
    return null;
  }

  /**
   * Finds a subtask by its ID.
   * @param subtaskId - The subtask ID (e.g., 'ST-001-001-001')
   * @returns The found subtask, or null if not found
   */
  async findSubtask(subtaskId: string): Promise<Subtask | null> {
    const prd = await this.load();
    for (const phase of prd.phases) {
      for (const task of phase.tasks) {
        const subtask = task.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
          return subtask;
        }
      }
    }
    return null;
  }

  /**
   * Adds an iteration record to a subtask.
   * @param subtaskId - The subtask ID
   * @param record - The iteration record to add
   */
  async addIterationRecord(subtaskId: string, record: Iteration): Promise<void> {
    const prd = await this.load();
    const subtask = this.findItemInHierarchy(prd, subtaskId) as Subtask | null;
    
    if (!subtask) {
      throw new Error(`Subtask not found: ${subtaskId}`);
    }
    
    subtask.iterations.push(record);
    
    await this.save(prd);
  }

  /**
   * Sets a gate report on a task or phase.
   * @param itemId - The item ID (task or phase)
   * @param report - The gate report to set
   */
  async setGateReport(itemId: string, report: GateReport): Promise<void> {
    const prd = await this.load();
    const parsed = this.parseItemId(itemId);
    
    if (parsed.type === 'phase') {
      const phase = prd.phases.find(p => p.id === itemId);
      if (!phase) {
        throw new Error(`Phase not found: ${itemId}`);
      }
      phase.gateReport = report;
    } else if (parsed.type === 'task') {
      const task = this.findItemInHierarchy(prd, itemId) as Task | null;
      if (!task) {
        throw new Error(`Task not found: ${itemId}`);
      }
      task.gateReport = report;
    } else {
      throw new Error(`Gate reports can only be set on phases or tasks, not subtasks: ${itemId}`);
    }
    
    await this.save(prd);
  }

  /**
   * Reopens an item that was previously completed.
   * @param itemId - The item ID to reopen
   * @param reason - The reason for reopening
   */
  async reopenItem(itemId: string, reason: string): Promise<void> {
    const prd = await this.load();
    const item = this.findItemInHierarchy(prd, itemId);
    
    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }
    
    item.status = 'reopened';
    item.notes = `${item.notes}\n\nReopened: ${reason}`;
    
    // Clear completion timestamp
    item.completedAt = undefined;
    
    await this.save(prd);
  }

  /**
   * Recalculates the metadata counts for the PRD.
   * @param prd - The PRD to recalculate metadata for
   * @returns The recalculated metadata
   */
  recalculateMetadata(prd: PRD): PRDMetadata {
    const totalPhases = prd.phases.length;
    let completedPhases = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    
    for (const phase of prd.phases) {
      if (phase.status === 'passed') {
        completedPhases++;
      }
      
      totalTasks += phase.tasks.length;
      
      for (const task of phase.tasks) {
        if (task.status === 'passed') {
          completedTasks++;
        }
        
        totalSubtasks += task.subtasks.length;
        
        for (const subtask of task.subtasks) {
          if (subtask.status === 'passed') {
            completedSubtasks++;
          }
        }
      }
    }
    
    return {
      totalPhases,
      completedPhases,
      totalTasks,
      completedTasks,
      totalSubtasks,
      completedSubtasks,
    };
  }

  /**
   * Ensures the directory for the file path exists.
   * @param filePath - The file path
   */
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = dirname(filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Parses an item ID to determine its type and parts.
   * @param itemId - The item ID (e.g., 'PH-001', 'TK-001-001', 'ST-001-001-001')
   * @returns The parsed item information
   */
  private parseItemId(itemId: string): {
    type: 'phase' | 'task' | 'subtask';
    parts: string[];
  } {
    if (itemId.startsWith('PH-')) {
      const parts = itemId.substring(3).split('-');
      return { type: 'phase', parts };
    }
    
    if (itemId.startsWith('TK-')) {
      const parts = itemId.substring(3).split('-');
      return { type: 'task', parts };
    }
    
    if (itemId.startsWith('ST-')) {
      const parts = itemId.substring(3).split('-');
      return { type: 'subtask', parts };
    }
    
    throw new Error(`Invalid item ID format: ${itemId}`);
  }

  /**
   * Finds an item in the PRD hierarchy by its ID.
   * @param prd - The PRD to search
   * @param itemId - The item ID to find
   * @returns The found item, or null if not found
   */
  private findItemInHierarchy(
    prd: PRD,
    itemId: string
  ): Phase | Task | Subtask | null {
    const parsed = this.parseItemId(itemId);
    
    if (parsed.type === 'phase') {
      return prd.phases.find(p => p.id === itemId) || null;
    }
    
    if (parsed.type === 'task') {
      for (const phase of prd.phases) {
        const task = phase.tasks.find(t => t.id === itemId);
        if (task) {
          return task;
        }
      }
      return null;
    }
    
    // parsed.type === 'subtask'
    for (const phase of prd.phases) {
      for (const task of phase.tasks) {
        const subtask = task.subtasks.find(s => s.id === itemId);
        if (subtask) {
          return subtask;
        }
      }
    }
    return null;
  }

  /**
   * Creates an empty PRD structure.
   * @returns An empty PRD with default values
   */
  private createEmptyPRD(): PRD {
    const now = new Date().toISOString();
    return {
      project: '',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'main',
      description: '',
      phases: [],
      metadata: {
        totalPhases: 0,
        completedPhases: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalSubtasks: 0,
        completedSubtasks: 0,
      },
    };
  }
}
