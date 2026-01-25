/**
 * Checkpoints command - Manage checkpoints
 *
 * Implements the `puppet-master checkpoints` command that:
 * - Lists all available checkpoints
 * - Shows detailed checkpoint information
 * - Deletes specific checkpoints
 * - Supports JSON and text output formats
 */

import { Command } from 'commander';
import { join } from 'path';
import { ConfigManager } from '../../config/config-manager.js';
import { CheckpointManager } from '../../core/checkpoint-manager.js';
import { deriveProjectRootFromConfigPath } from '../../utils/project-paths.js';
import type { CommandModule } from './index.js';

/**
 * Options for the checkpoints command
 */
export interface CheckpointsOptions {
  config?: string;
  json?: boolean;
}

/**
 * Options for the checkpoints list subcommand
 */
export interface CheckpointsListOptions extends CheckpointsOptions {}

/**
 * Options for the checkpoints info subcommand
 */
export interface CheckpointsInfoOptions extends CheckpointsOptions {
  id: string;
}

/**
 * Options for the checkpoints delete subcommand
 */
export interface CheckpointsDeleteOptions extends CheckpointsOptions {
  id: string;
}

/**
 * Get checkpoint manager instance
 */
function getCheckpointManager(configPath?: string): CheckpointManager {
  const configManager = new ConfigManager(configPath);
  const projectRoot = deriveProjectRootFromConfigPath(configManager.getConfigPath());
  const checkpointDir = join(projectRoot, '.puppet-master', 'checkpoints');
  return new CheckpointManager(checkpointDir);
}

/**
 * List all checkpoints
 */
export async function checkpointsListAction(options: CheckpointsListOptions): Promise<void> {
  try {
    const checkpointManager = getCheckpointManager(options.config);
    const checkpoints = await checkpointManager.listCheckpoints();

    if (options.json) {
      console.log(JSON.stringify(checkpoints, null, 2));
      return;
    }

    if (checkpoints.length === 0) {
      console.log('No checkpoints found.');
      return;
    }

    console.log(`Found ${checkpoints.length} checkpoint(s):\n`);
    console.log('ID'.padEnd(30) + 'Timestamp'.padEnd(30) + 'Position'.padEnd(40) + 'Progress');
    console.log('-'.repeat(100));

    for (const checkpoint of checkpoints) {
      const positionStr = checkpoint.position.subtaskId
        ? `${checkpoint.position.phaseId}/${checkpoint.position.taskId}/${checkpoint.position.subtaskId}`
        : checkpoint.position.taskId
          ? `${checkpoint.position.phaseId}/${checkpoint.position.taskId}`
          : checkpoint.position.phaseId || 'N/A';
      const progressStr = `${checkpoint.metadata.completedSubtasks}/${checkpoint.metadata.totalSubtasks} subtasks, ${checkpoint.metadata.iterationsRun} iterations`;
      const timestamp = new Date(checkpoint.timestamp).toLocaleString();

      console.log(
        checkpoint.id.padEnd(30) +
          timestamp.padEnd(30) +
          positionStr.padEnd(40) +
          progressStr
      );
    }
  } catch (error) {
    console.error('Failed to list checkpoints:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Show detailed checkpoint information
 */
export async function checkpointsInfoAction(options: CheckpointsInfoOptions): Promise<void> {
  try {
    const checkpointManager = getCheckpointManager(options.config);
    const checkpoint = await checkpointManager.loadCheckpoint(options.id);

    if (!checkpoint) {
      console.error(`Checkpoint not found: ${options.id}`);
      process.exit(1);
    }

    if (options.json) {
      console.log(JSON.stringify(checkpoint, null, 2));
      return;
    }

    console.log(`Checkpoint: ${checkpoint.id}`);
    console.log(`Timestamp: ${new Date(checkpoint.timestamp).toLocaleString()}`);
    console.log(`Orchestrator State: ${checkpoint.orchestratorState}`);
    console.log(`\nCurrent Position:`);
    console.log(`  Phase: ${checkpoint.currentPosition.phaseId || 'N/A'}`);
    console.log(`  Task: ${checkpoint.currentPosition.taskId || 'N/A'}`);
    console.log(`  Subtask: ${checkpoint.currentPosition.subtaskId || 'N/A'}`);
    console.log(`  Iteration: ${checkpoint.currentPosition.iterationNumber}`);
    console.log(`\nMetadata:`);
    console.log(`  Project: ${checkpoint.metadata.projectName}`);
    console.log(`  Completed Subtasks: ${checkpoint.metadata.completedSubtasks}`);
    console.log(`  Total Subtasks: ${checkpoint.metadata.totalSubtasks}`);
    console.log(`  Iterations Run: ${checkpoint.metadata.iterationsRun}`);
    console.log(`\nTier States: ${Object.keys(checkpoint.tierStates).length} tiers`);
  } catch (error) {
    console.error('Failed to get checkpoint info:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Delete a checkpoint
 */
export async function checkpointsDeleteAction(options: CheckpointsDeleteOptions): Promise<void> {
  try {
    const checkpointManager = getCheckpointManager(options.config);
    await checkpointManager.deleteCheckpoint(options.id);
    console.log(`Checkpoint deleted: ${options.id}`);
  } catch (error) {
    console.error('Failed to delete checkpoint:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Checkpoints command module
 */
export class CheckpointsCommand implements CommandModule {
  register(program: Command): void {
    const checkpointsCmd = program
      .command('checkpoints')
      .description('Manage checkpoints for long-running executions');

    checkpointsCmd
      .command('list')
      .description('List all available checkpoints')
      .option('--config <path>', 'Path to configuration file')
      .option('--json', 'Output as JSON')
      .action(checkpointsListAction);

    checkpointsCmd
      .command('info <id>')
      .description('Show detailed information about a checkpoint')
      .option('--config <path>', 'Path to configuration file')
      .option('--json', 'Output as JSON')
      .action(async (id: string, options: CheckpointsInfoOptions) => {
        await checkpointsInfoAction({ ...options, id });
      });

    checkpointsCmd
      .command('delete <id>')
      .description('Delete a checkpoint')
      .option('--config <path>', 'Path to configuration file')
      .action(async (id: string, options: CheckpointsDeleteOptions) => {
        await checkpointsDeleteAction({ ...options, id });
      });
  }
}
