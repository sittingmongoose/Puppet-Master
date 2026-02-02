/**
 * Checkpoint Manager
 *
 * Manages checkpoint creation, loading, listing, and cleanup for long-running executions.
 * Checkpoints allow resuming execution after crash/restart.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T12.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import type { OrchestratorState, OrchestratorContext } from '../types/state.js';
import type { TierContext } from './tier-state-machine.js';
import type { PersistedState } from './state-persistence.js';
import { AtomicWriter } from '../state/index.js';

/**
 * Current position in execution.
 */
export interface CurrentPosition {
  phaseId: string | null;
  taskId: string | null;
  subtaskId: string | null;
  iterationNumber: number;
}

/**
 * Checkpoint metadata.
 */
export interface CheckpointMetadata {
  projectName: string;
  completedSubtasks: number;
  totalSubtasks: number;
  iterationsRun: number;
}

/**
 * Checkpoint interface.
 * Represents a complete state snapshot at a point in time.
 */
export interface Checkpoint {
  id: string;
  timestamp: string;
  orchestratorState: OrchestratorState;
  orchestratorContext: OrchestratorContext;
  tierStates: Record<string, TierContext>;
  currentPosition: CurrentPosition;
  metadata: CheckpointMetadata;
}

/**
 * Checkpoint summary for listing.
 */
export interface CheckpointSummary {
  id: string;
  timestamp: string;
  position: CurrentPosition;
  metadata: CheckpointMetadata;
}

/**
 * CheckpointManager class.
 * Manages checkpoint lifecycle: creation, loading, listing, deletion, and cleanup.
 */
export class CheckpointManager {
  private readonly checkpointDir: string;
  private readonly maxCheckpoints: number;
  private readonly atomicWriter: AtomicWriter;

  /**
   * Creates a new CheckpointManager instance.
   * @param checkpointDir - Directory where checkpoints are stored
   * @param maxCheckpoints - Maximum number of checkpoints to keep (default: 10)
   */
  constructor(checkpointDir: string = '.puppet-master/checkpoints', maxCheckpoints: number = 10) {
    this.checkpointDir = checkpointDir;
    this.maxCheckpoints = maxCheckpoints;
    this.atomicWriter = new AtomicWriter(3); // 3 backups for checkpoint files
  }

  /**
   * Creates a checkpoint with the current state.
   * @param state - The persisted state to checkpoint
   * @param position - Current position in execution
   * @returns The checkpoint ID
   */
  async createCheckpoint(state: PersistedState, position: CurrentPosition): Promise<string> {
    const checkpointId = `checkpoint-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const checkpoint: Checkpoint = {
      id: checkpointId,
      timestamp,
      orchestratorState: state.orchestratorState,
      orchestratorContext: state.orchestratorContext,
      tierStates: state.tierStates,
      currentPosition: position,
      metadata: {
        projectName: state.orchestratorContext.currentPhaseId || 'unknown',
        completedSubtasks: 0, // Will be populated by caller if needed
        totalSubtasks: 0, // Will be populated by caller if needed
        iterationsRun: 0, // Will be populated by caller if needed
      },
    };

    const checkpointPath = join(this.checkpointDir, `${checkpointId}.json`);

    // Ensure directory exists
    await fs.mkdir(dirname(checkpointPath), { recursive: true });

    // Write checkpoint file atomically
    const content = JSON.stringify(checkpoint, null, 2);
    await this.atomicWriter.write(checkpointPath, content);

    // Clean up old checkpoints
    await this.cleanOldCheckpoints();

    return checkpointId;
  }

  /**
   * Creates a checkpoint with full metadata.
   * @param state - The persisted state to checkpoint
   * @param position - Current position in execution
   * @param metadata - Checkpoint metadata
   * @returns The checkpoint ID
   */
  async createCheckpointWithMetadata(
    state: PersistedState,
    position: CurrentPosition,
    metadata: CheckpointMetadata
  ): Promise<string> {
    const checkpointId = `checkpoint-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const checkpoint: Checkpoint = {
      id: checkpointId,
      timestamp,
      orchestratorState: state.orchestratorState,
      orchestratorContext: state.orchestratorContext,
      tierStates: state.tierStates,
      currentPosition: position,
      metadata,
    };

    const checkpointPath = join(this.checkpointDir, `${checkpointId}.json`);

    // Ensure directory exists
    await fs.mkdir(dirname(checkpointPath), { recursive: true });

    // Write checkpoint file atomically
    const content = JSON.stringify(checkpoint, null, 2);
    await this.atomicWriter.write(checkpointPath, content);

    // Clean up old checkpoints
    await this.cleanOldCheckpoints();

    return checkpointId;
  }

  /**
   * Loads a checkpoint by ID.
   * @param id - Checkpoint ID
   * @returns The checkpoint, or null if not found
   */
  async loadCheckpoint(id: string): Promise<Checkpoint | null> {
    const checkpointPath = join(this.checkpointDir, `${id}.json`);

    try {
      const content = await this.atomicWriter.read(checkpointPath);
      const checkpoint = JSON.parse(content) as Checkpoint;

      // Validate checkpoint structure
      if (
        !checkpoint.id ||
        !checkpoint.timestamp ||
        !checkpoint.orchestratorState ||
        !checkpoint.orchestratorContext ||
        !checkpoint.tierStates ||
        !checkpoint.currentPosition ||
        !checkpoint.metadata
      ) {
        throw new Error('Invalid checkpoint structure');
      }

      return checkpoint;
    } catch (error) {
      if (error instanceof Error && error.name === 'StateRecoveryError') {
        return null;
      }
      // Re-throw other errors (like JSON parse errors or validation errors)
      throw error;
    }
  }

  /**
   * Lists all available checkpoints.
   * @returns Array of checkpoint summaries
   */
  async listCheckpoints(): Promise<CheckpointSummary[]> {
    try {
      const files = await fs.readdir(this.checkpointDir);
      const checkpointFiles = files.filter((file) => file.endsWith('.json') && file.startsWith('checkpoint-'));

      const summaries: CheckpointSummary[] = [];

      for (const file of checkpointFiles) {
        const checkpointId = file.replace(/\.json$/, '');
        try {
          const checkpoint = await this.loadCheckpoint(checkpointId);
          if (checkpoint) {
            summaries.push({
              id: checkpoint.id,
              timestamp: checkpoint.timestamp,
              position: checkpoint.currentPosition,
              metadata: checkpoint.metadata,
            });
          }
        } catch (error) {
          // Skip corrupted checkpoints
          console.warn(`Skipping corrupted checkpoint: ${checkpointId}`, error);
        }
      }

      // Sort by timestamp (newest first)
      summaries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return summaries;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Deletes a checkpoint by ID.
   * @param id - Checkpoint ID
   */
  async deleteCheckpoint(id: string): Promise<void> {
    const checkpointPath = join(this.checkpointDir, `${id}.json`);

    try {
      await fs.unlink(checkpointPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Checkpoint not found: ${id}`);
      }
      throw error;
    }
  }

  /**
   * Cleans up old checkpoints, keeping only the most recent N checkpoints.
   */
  private async cleanOldCheckpoints(): Promise<void> {
    try {
      const summaries = await this.listCheckpoints();

      if (summaries.length <= this.maxCheckpoints) {
        return;
      }

      // Delete oldest checkpoints (summaries are sorted newest first)
      const toDelete = summaries.slice(this.maxCheckpoints);

      for (const summary of toDelete) {
        try {
          await this.deleteCheckpoint(summary.id);
        } catch (error) {
          // Log but continue cleanup
          console.warn(`Failed to delete old checkpoint ${summary.id}:`, error);
        }
      }
    } catch (error) {
      // Log but don't fail checkpoint creation
      console.warn('Failed to clean old checkpoints:', error);
    }
  }

  /**
   * P1-G13: Gets the most recent checkpoint for automatic recovery.
   * @returns The most recent checkpoint, or null if none exist
   */
  async getLatestCheckpoint(): Promise<Checkpoint | null> {
    const summaries = await this.listCheckpoints();
    if (summaries.length === 0) {
      return null;
    }
    // Summaries are sorted newest first
    return this.loadCheckpoint(summaries[0].id);
  }

  /**
   * P1-G13: Checks if there's an incomplete run that can be recovered.
   * A run is considered incomplete if a checkpoint exists and the orchestrator
   * state is not COMPLETE or FAILED.
   * @returns Recovery information or null if no recovery needed
   */
  async checkForRecovery(): Promise<{
    checkpoint: Checkpoint;
    reason: string;
    recoverable: boolean;
  } | null> {
    const latest = await this.getLatestCheckpoint();
    if (!latest) {
      return null;
    }

    const state = latest.orchestratorState;
    
    // Check if the run was in progress (not complete, error, or idle)
    // Use lowercase state names per OrchestratorState type
    if (state !== 'complete' && state !== 'error' && state !== 'idle') {
      return {
        checkpoint: latest,
        reason: `Found incomplete run in state '${state}' at position: ` +
          `phase=${latest.currentPosition.phaseId || 'none'}, ` +
          `task=${latest.currentPosition.taskId || 'none'}, ` +
          `subtask=${latest.currentPosition.subtaskId || 'none'}`,
        recoverable: true,
      };
    }

    return null;
  }

  /**
   * P1-G13: Creates state that can be used to restore the orchestrator.
   * @param checkpoint - Checkpoint to convert to persisted state
   * @returns PersistedState for restoration
   */
  checkpointToPersistedState(checkpoint: Checkpoint): PersistedState {
    return {
      orchestratorState: checkpoint.orchestratorState,
      orchestratorContext: checkpoint.orchestratorContext,
      tierStates: checkpoint.tierStates,
      savedAt: checkpoint.timestamp,
    };
  }

  /**
   * P1-G13: Gets recovery suggestions based on checkpoint state.
   * @param checkpoint - Checkpoint to analyze
   * @returns Array of suggested recovery actions
   */
  getRecoverySuggestions(checkpoint: Checkpoint): string[] {
    const suggestions: string[] = [];
    const pos = checkpoint.currentPosition;
    const state = checkpoint.orchestratorState;

    // Use lowercase state names per OrchestratorState type
    if (state === 'executing' || state === 'planning') {
      suggestions.push(`Resume from checkpoint: puppet-master resume ${checkpoint.id}`);
      suggestions.push('Or restart with fresh state: puppet-master run --no-resume');
    }

    if (pos.subtaskId) {
      suggestions.push(`Rerun current subtask: puppet-master run --from-subtask ${pos.subtaskId}`);
    } else if (pos.taskId) {
      suggestions.push(`Rerun current task: puppet-master run --from-task ${pos.taskId}`);
    } else if (pos.phaseId) {
      suggestions.push(`Rerun current phase: puppet-master run --from-phase ${pos.phaseId}`);
    }

    if (checkpoint.metadata.completedSubtasks > 0) {
      const progress = Math.round(
        (checkpoint.metadata.completedSubtasks / checkpoint.metadata.totalSubtasks) * 100
      );
      suggestions.push(`Progress: ${checkpoint.metadata.completedSubtasks}/${checkpoint.metadata.totalSubtasks} subtasks (${progress}%)`);
    }

    return suggestions;
  }
}
