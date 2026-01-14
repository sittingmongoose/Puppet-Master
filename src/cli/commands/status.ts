/**
 * Status command - Show current orchestration status
 * 
 * Implements the `puppet-master status` command that:
 * - Loads configuration and PRD files
 * - Displays current progress and status
 * - Shows current phase/task/subtask
 * - Supports JSON and text output formats
 */

import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import type { PRD } from '../../types/prd.js';
import type { OrchestratorState } from '../../types/state.js';
import type { CommandModule } from './index.js';

/**
 * Options for the status command
 */
export interface StatusOptions {
  config?: string;
  json?: boolean;
}

/**
 * Status interface for output
 */
export interface Status {
  project: string;
  state: 'not_started' | 'in_progress' | 'paused' | 'complete';
  progress: {
    phases: { completed: number; total: number };
    tasks: { completed: number; total: number };
    subtasks: { completed: number; total: number };
  };
  currentPhase?: { id: string; title: string; status: string };
  currentTask?: { id: string; title: string; status: string };
  currentSubtask?: { id: string; title: string; status: string };
}

/**
 * Map orchestrator state to status state
 */
function mapOrchestratorStateToStatusState(orchestratorState: OrchestratorState | undefined): Status['state'] {
  if (!orchestratorState) {
    return 'not_started';
  }

  switch (orchestratorState) {
    case 'idle':
      return 'not_started';
    case 'planning':
    case 'executing':
    case 'error':
      return 'in_progress';
    case 'paused':
      return 'paused';
    case 'complete':
      return 'complete';
    default:
      return 'not_started';
  }
}

/**
 * Infer state from PRD metadata
 */
function inferStateFromPrd(prd: PRD): Status['state'] {
  const { metadata } = prd;

  // All phases passed means complete
  if (metadata.completedPhases === metadata.totalPhases && metadata.totalPhases > 0) {
    return 'complete';
  }

  // Check if any item is in progress
  for (const phase of prd.phases) {
    if (phase.status === 'running' || phase.status === 'planning' || phase.status === 'gating') {
      return 'in_progress';
    }

    for (const task of phase.tasks) {
      if (task.status === 'running' || task.status === 'planning' || task.status === 'gating') {
        return 'in_progress';
      }

      for (const subtask of task.subtasks) {
        if (subtask.status === 'running' || subtask.status === 'planning' || subtask.status === 'gating') {
          return 'in_progress';
        }
      }
    }
  }

  // If some items are passed but not all, it's in progress
  if (metadata.completedPhases > 0 || metadata.completedTasks > 0 || metadata.completedSubtasks > 0) {
    return 'in_progress';
  }

  return 'not_started';
}

/**
 * Find current phase/task/subtask from orchestrator context or infer from statuses
 */
function findCurrentItems(prd: PRD): {
  currentPhase?: { id: string; title: string; status: string };
  currentTask?: { id: string; title: string; status: string };
  currentSubtask?: { id: string; title: string; status: string };
} {
  const result: {
    currentPhase?: { id: string; title: string; status: string };
    currentTask?: { id: string; title: string; status: string };
    currentSubtask?: { id: string; title: string; status: string };
  } = {};

  // If orchestrator context exists, use it
  if (prd.orchestratorContext) {
    const context = prd.orchestratorContext;

    if (context.currentPhaseId) {
      const phase = prd.phases.find((p) => p.id === context.currentPhaseId);
      if (phase) {
        result.currentPhase = { id: phase.id, title: phase.title, status: phase.status };
      }
    }

    if (context.currentTaskId && context.currentPhaseId) {
      const phase = prd.phases.find((p) => p.id === context.currentPhaseId);
      if (phase) {
        const task = phase.tasks.find((t) => t.id === context.currentTaskId);
        if (task) {
          result.currentTask = { id: task.id, title: task.title, status: task.status };
        }
      }
    }

    if (context.currentSubtaskId && context.currentTaskId && context.currentPhaseId) {
      const phase = prd.phases.find((p) => p.id === context.currentPhaseId);
      if (phase) {
        const task = phase.tasks.find((t) => t.id === context.currentTaskId);
        if (task) {
          const subtask = task.subtasks.find((s) => s.id === context.currentSubtaskId);
          if (subtask) {
            result.currentSubtask = { id: subtask.id, title: subtask.title, status: subtask.status };
          }
        }
      }
    }

    return result;
  }

  // Otherwise, infer from statuses - find first item with running/planning/gating status
  for (const phase of prd.phases) {
    if (phase.status === 'running' || phase.status === 'planning' || phase.status === 'gating') {
      result.currentPhase = { id: phase.id, title: phase.title, status: phase.status };

      for (const task of phase.tasks) {
        if (task.status === 'running' || task.status === 'planning' || task.status === 'gating') {
          result.currentTask = { id: task.id, title: task.title, status: task.status };

          for (const subtask of task.subtasks) {
            if (subtask.status === 'running' || subtask.status === 'planning' || subtask.status === 'gating') {
              result.currentSubtask = { id: subtask.id, title: subtask.title, status: subtask.status };
              return result;
            }
          }

          return result;
        }
      }

      return result;
    }
  }

  return result;
}

/**
 * Build status object from PRD
 */
function buildStatus(prd: PRD): Status {
  // Determine state
  const orchestratorState = prd.orchestratorState;
  let state: Status['state'];
  if (orchestratorState) {
    state = mapOrchestratorStateToStatusState(orchestratorState);
  } else {
    state = inferStateFromPrd(prd);
  }

  // Extract progress from metadata
  const progress = {
    phases: {
      completed: prd.metadata.completedPhases,
      total: prd.metadata.totalPhases,
    },
    tasks: {
      completed: prd.metadata.completedTasks,
      total: prd.metadata.totalTasks,
    },
    subtasks: {
      completed: prd.metadata.completedSubtasks,
      total: prd.metadata.totalSubtasks,
    },
  };

  // Find current items
  const { currentPhase, currentTask, currentSubtask } = findCurrentItems(prd);

  return {
    project: prd.project,
    state,
    progress,
    currentPhase,
    currentTask,
    currentSubtask,
  };
}

/**
 * Print status in human-readable format
 */
function printStatus(status: Status): void {
  console.log(`Project: ${status.project}`);
  console.log(`State: ${status.state}`);
  console.log();
  console.log('Progress:');
  console.log(`  Phases: ${status.progress.phases.completed}/${status.progress.phases.total}`);
  console.log(`  Tasks: ${status.progress.tasks.completed}/${status.progress.tasks.total}`);
  console.log(`  Subtasks: ${status.progress.subtasks.completed}/${status.progress.subtasks.total}`);

  if (status.currentPhase) {
    console.log();
    console.log(`Current Phase: ${status.currentPhase.id} - ${status.currentPhase.title}`);
    console.log(`  Status: ${status.currentPhase.status}`);
  }
  if (status.currentTask) {
    console.log(`Current Task: ${status.currentTask.id} - ${status.currentTask.title}`);
    console.log(`  Status: ${status.currentTask.status}`);
  }
  if (status.currentSubtask) {
    console.log(`Current Subtask: ${status.currentSubtask.id} - ${status.currentSubtask.title}`);
    console.log(`  Status: ${status.currentSubtask.status}`);
  }
}

/**
 * Main action function for the status command
 */
export async function statusAction(options: StatusOptions): Promise<void> {
  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Load PRD
    const prdManager = new PrdManager(config.memory.prdFile);
    const prd = await prdManager.load();

    // Build status
    const status = buildStatus(prd);

    // Output
    if (options.json) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      printStatus(status);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error getting status:', errorMessage);
    process.exit(1);
  }
}

/**
 * StatusCommand class implementing CommandModule interface
 */
export class StatusCommand implements CommandModule {
  /**
   * Register the status command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('status')
      .description('Show current orchestration status')
      .option('-c, --config <path>', 'Path to config file')
      .option('--json', 'Output as JSON')
      .action(async (options: StatusOptions) => {
        await statusAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const statusCommand = new StatusCommand();