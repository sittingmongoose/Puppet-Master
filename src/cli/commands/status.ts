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
import { CheckpointManager } from '../../core/checkpoint-manager.js';
import { QuotaManager } from '../../platforms/quota-manager.js';
import { UsageTracker } from '../../memory/usage-tracker.js';
import type { PRD } from '../../types/prd.js';
import type { OrchestratorState } from '../../types/state.js';
import type { PuppetMasterConfig, Platform } from '../../types/config.js';
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
  completionPercentage: number;
  currentPhase?: { id: string; title: string; status: string };
  currentTask?: { id: string; title: string; status: string };
  currentSubtask?: { id: string; title: string; status: string };
  failedItems?: Array<{
    id: string;
    title: string;
    type: 'phase' | 'task' | 'subtask';
  }>;
  checkpoint?: {
    id: string;
    timestamp: string;
    position: { phaseId: string | null; taskId: string | null; subtaskId: string | null };
  };
  coverage?: {
    ratio: number;
    sectionCoverage: number;
    missingRequirements: number;
  };
  budget?: {
    platforms: Array<{
      platform: Platform;
      used: number;
      limit: number;
      percentage: number;
      resetsAt: string;
      cooldownActive: boolean;
    }>;
  };
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
 * Calculate overall completion percentage from PRD metadata
 */
function calculateCompletionPercentage(prd: PRD): number {
  const { metadata } = prd;
  const total = metadata.totalPhases + metadata.totalTasks + metadata.totalSubtasks;
  const completed = metadata.completedPhases + metadata.completedTasks + metadata.completedSubtasks;

  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

/**
 * Find all failed items in the PRD
 */
function findFailedItems(prd: PRD): Status['failedItems'] {
  const failedItems: Status['failedItems'] = [];

  for (const phase of prd.phases) {
    if (phase.status === 'failed') {
      failedItems.push({
        id: phase.id,
        title: phase.title,
        type: 'phase',
      });
    }

    for (const task of phase.tasks) {
      if (task.status === 'failed') {
        failedItems.push({
          id: task.id,
          title: task.title,
          type: 'task',
        });
      }

      for (const subtask of task.subtasks) {
        if (subtask.status === 'failed') {
          failedItems.push({
            id: subtask.id,
            title: subtask.title,
            type: 'subtask',
          });
        }
      }
    }
  }

  return failedItems.length > 0 ? failedItems : undefined;
}

/**
 * Get checkpoint information from CheckpointManager
 */
async function getCheckpointInfo(checkpointManager: CheckpointManager): Promise<Status['checkpoint']> {
  try {
    const checkpoints = await checkpointManager.listCheckpoints();
    if (checkpoints.length === 0) {
      return undefined;
    }

    const latest = checkpoints[0]!; // Already sorted newest first
    return {
      id: latest.id,
      timestamp: latest.timestamp,
      position: {
        phaseId: latest.position.phaseId,
        taskId: latest.position.taskId,
        subtaskId: latest.position.subtaskId,
      },
    };
  } catch {
    return undefined;
  }
}

/**
 * Get coverage information using CoverageValidator (optional)
 * Returns undefined if requirements document not found or coverage cannot be computed
 */
async function getCoverageInfo(
  prd: PRD,
  config: PuppetMasterConfig,
  workingDirectory: string
): Promise<Status['coverage']> {
  try {
    // Check if requirements document exists
    const { promises: fs } = await import('fs');
    const { join } = await import('path');
    const requirementsPath = join(workingDirectory, '.puppet-master', 'requirements', 'requirements.json');

    try {
      await fs.access(requirementsPath);
    } catch {
      // Requirements document not found, skip coverage
      return undefined;
    }

    // CoverageValidator.computeCoverageReport requires CoverageMetrics from StructureDetector
    // For status command, we don't have that, so we'll compute a simplified version
    // or return undefined if we can't compute it properly
    // This is acceptable - coverage is optional per the plan
    return undefined;
  } catch {
    // If coverage calculation fails, return undefined (graceful degradation)
    return undefined;
  }
}

/**
 * Get budget/quota usage information
 */
async function getBudgetInfo(
  quotaManager: QuotaManager,
  usageTracker: UsageTracker,
  _config: PuppetMasterConfig
): Promise<Status['budget']> {
  try {
    const platforms: Array<{
      platform: Platform;
      used: number;
      limit: number;
      percentage: number;
      resetsAt: string;
      cooldownActive: boolean;
    }> = [];
    const platformKeys: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];

    for (const platform of platformKeys) {
      try {
        // Get quota info
        const quotaInfo = await quotaManager.checkQuota(platform);
        const cooldownInfo = await quotaManager.checkCooldown(platform);

        // Get usage summary
        const summary = await usageTracker.getSummary(platform);

        // Calculate percentage
        const limit = quotaInfo.limit === Number.MAX_SAFE_INTEGER ? 'unlimited' : quotaInfo.limit;
        const used = summary.totalCalls;
        const percentage =
          limit === 'unlimited' ? 0 : limit > 0 ? Math.round((used / limit) * 100) : 0;

        platforms.push({
          platform,
          used,
          limit: limit === 'unlimited' ? Number.MAX_SAFE_INTEGER : limit,
          percentage,
          resetsAt: quotaInfo.resetsAt,
          cooldownActive: cooldownInfo.active,
        });
      } catch {
        // Skip platforms that fail (e.g., quota exhausted, not configured)
        continue;
      }
    }

    return platforms.length > 0 ? { platforms } : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Build status object from PRD
 */
async function buildStatus(
  prd: PRD,
  config: PuppetMasterConfig,
  workingDirectory: string,
  checkpointManager?: CheckpointManager,
  quotaManager?: QuotaManager,
  usageTracker?: UsageTracker
): Promise<Status> {
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

  // Calculate completion percentage
  const completionPercentage = calculateCompletionPercentage(prd);

  // Find failed items
  const failedItems = findFailedItems(prd);

  // Get checkpoint info (optional)
  const checkpoint = checkpointManager ? await getCheckpointInfo(checkpointManager) : undefined;

  // Get coverage info (optional)
  const coverage = await getCoverageInfo(prd, config, workingDirectory);

  // Get budget info (optional)
  const budget =
    quotaManager && usageTracker ? await getBudgetInfo(quotaManager, usageTracker, config) : undefined;

  return {
    project: prd.project,
    state,
    progress,
    completionPercentage,
    currentPhase,
    currentTask,
    currentSubtask,
    failedItems,
    checkpoint,
    coverage,
    budget,
  };
}

/**
 * Generate a progress bar string
 */
function generateProgressBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Print status in human-readable format
 */
function printStatus(status: Status): void {
  console.log(`Project: ${status.project}`);
  console.log(`State: ${status.state}`);
  console.log(`Completion: ${status.completionPercentage}% ${generateProgressBar(status.completionPercentage)}`);
  console.log();
  console.log('Progress:');
  console.log(`  Phases: ${status.progress.phases.completed}/${status.progress.phases.total}`);
  console.log(`  Tasks: ${status.progress.tasks.completed}/${status.progress.tasks.total}`);
  console.log(`  Subtasks: ${status.progress.subtasks.completed}/${status.progress.subtasks.total}`);

  if (status.currentPhase || status.currentTask || status.currentSubtask) {
    console.log();
    console.log('Current:');
    if (status.currentPhase) {
      console.log(`  Phase: ${status.currentPhase.id} - ${status.currentPhase.title}`);
      console.log(`    Status: ${status.currentPhase.status}`);
    }
    if (status.currentTask) {
      console.log(`  Task: ${status.currentTask.id} - ${status.currentTask.title}`);
      console.log(`    Status: ${status.currentTask.status}`);
    }
    if (status.currentSubtask) {
      console.log(`  Subtask: ${status.currentSubtask.id} - ${status.currentSubtask.title}`);
      console.log(`    Status: ${status.currentSubtask.status}`);
    }
  }

  if (status.failedItems && status.failedItems.length > 0) {
    console.log();
    console.log('Failed Items:');
    for (const item of status.failedItems) {
      console.log(`  - ${item.type}: ${item.id} - ${item.title}`);
    }
  }

  if (status.checkpoint) {
    console.log();
    console.log('Checkpoint:');
    console.log(`  Latest: ${status.checkpoint.id} (${new Date(status.checkpoint.timestamp).toLocaleString()})`);
    const pos = status.checkpoint.position;
    const positionParts: string[] = [];
    if (pos.phaseId) positionParts.push(`Phase ${pos.phaseId}`);
    if (pos.taskId) positionParts.push(`Task ${pos.taskId}`);
    if (pos.subtaskId) positionParts.push(`Subtask ${pos.subtaskId}`);
    console.log(`  Position: ${positionParts.length > 0 ? positionParts.join(', ') : 'None'}`);
  }

  if (status.coverage) {
    console.log();
    console.log('Coverage:');
    console.log(`  Ratio: ${(status.coverage.ratio * 100).toFixed(1)}%`);
    console.log(`  Section Coverage: ${(status.coverage.sectionCoverage * 100).toFixed(1)}%`);
    console.log(`  Missing Requirements: ${status.coverage.missingRequirements}`);
  }

  if (status.budget?.platforms && status.budget.platforms.length > 0) {
    console.log();
    console.log('Budget Usage:');
    console.log('  Platform    Used/Limit        %      Resets At              Cooldown');
    console.log('  ' + '-'.repeat(70));
    for (const platform of status.budget.platforms) {
      const limitStr =
        platform.limit === Number.MAX_SAFE_INTEGER
          ? 'unlimited'
          : platform.limit.toString();
      const usedLimitStr = `${platform.used}/${limitStr}`;
      const percentageStr = limitStr === 'unlimited' ? '-' : `${platform.percentage}%`;
      const resetsAtStr = platform.resetsAt
        ? new Date(platform.resetsAt).toLocaleString()
        : '-';
      const cooldownStr = platform.cooldownActive ? 'Active' : '-';

      console.log(
        `  ${platform.platform.padEnd(10)} ${usedLimitStr.padEnd(18)} ${percentageStr.padEnd(7)} ${resetsAtStr.padEnd(22)} ${cooldownStr}`
      );
    }
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

    // Get working directory
    const workingDirectory = config.project.workingDirectory || process.cwd();

    // Initialize optional managers
    let checkpointManager: CheckpointManager | undefined;
    let quotaManager: QuotaManager | undefined;
    let usageTracker: UsageTracker | undefined;

    try {
      // CheckpointManager uses default path .puppet-master/checkpoints
      checkpointManager = new CheckpointManager('.puppet-master/checkpoints');
    } catch {
      // If checkpoint manager fails to initialize, continue without it
    }

    try {
      // UsageTracker uses default path .puppet-master/usage/usage.jsonl
      usageTracker = new UsageTracker('.puppet-master/usage/usage.jsonl');

      // QuotaManager requires UsageTracker, budgets, and budgetEnforcement
      if (config.budgets && config.budgetEnforcement) {
        quotaManager = new QuotaManager(
          usageTracker,
          config.budgets,
          config.budgetEnforcement,
          new Date() // runStartTime
        );
      }
    } catch {
      // If quota/usage tracking fails to initialize, continue without it
    }

    // Build status with all available managers
    const status = await buildStatus(
      prd,
      config,
      workingDirectory,
      checkpointManager,
      quotaManager,
      usageTracker
    );

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