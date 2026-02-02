/**
 * Retry command - Retry current failed subtask
 *
 * Implements `puppet-master retry`:
 * - Spawns a fresh iteration for the current failed item
 * - Requires an active orchestration session
 *
 * Feature parity with GUI POST /api/controls/retry endpoint.
 */

import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import type { CommandModule } from './index.js';

export interface RetryOptions {
  config?: string;
}

/**
 * Main retry action
 */
export async function retryAction(options: RetryOptions): Promise<void> {
  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Load PRD to check current state
    const prdManager = new PrdManager(config.memory.prdFile);
    const prd = await prdManager.load();

    // Find current failed subtask
    let currentFailedItem: { id: string; title: string; type: string } | null = null;

    for (const phase of prd.phases) {
      for (const task of phase.tasks) {
        for (const subtask of task.subtasks) {
          if (subtask.status === 'failed') {
            currentFailedItem = { id: subtask.id, title: subtask.title, type: 'subtask' };
            break;
          }
        }
        if (currentFailedItem) break;
        if (task.status === 'failed') {
          currentFailedItem = { id: task.id, title: task.title, type: 'task' };
          break;
        }
      }
      if (currentFailedItem) break;
      if (phase.status === 'failed') {
        currentFailedItem = { id: phase.id, title: phase.title, type: 'phase' };
        break;
      }
    }

    if (!currentFailedItem) {
      console.log('No failed items found to retry.');
      console.log('Use `puppet-master status` to see current state.');
      return;
    }

    console.log(`Found failed ${currentFailedItem.type}: ${currentFailedItem.id} - ${currentFailedItem.title}`);
    console.log();

    // Reset the failed item's status to pending
    if (currentFailedItem.type === 'subtask') {
      for (const phase of prd.phases) {
        for (const task of phase.tasks) {
          const subtask = task.subtasks.find((s) => s.id === currentFailedItem!.id);
          if (subtask) {
            subtask.status = 'pending';
            // Clear last iteration if it failed, or remove one to allow another try
            if (subtask.iterations && subtask.iterations.length > 0) {
              const lastIter = subtask.iterations[subtask.iterations.length - 1];
              if (lastIter && lastIter.status === 'failed') {
                subtask.iterations.pop();
              }
            }
            break;
          }
        }
      }
    } else if (currentFailedItem.type === 'task') {
      for (const phase of prd.phases) {
        const task = phase.tasks.find((t) => t.id === currentFailedItem!.id);
        if (task) {
          task.status = 'pending';
          break;
        }
      }
    } else if (currentFailedItem.type === 'phase') {
      const phase = prd.phases.find((p) => p.id === currentFailedItem!.id);
      if (phase) {
        phase.status = 'pending';
      }
    }

    // Save updated PRD
    await prdManager.save(prd);

    console.log(`✓ Reset ${currentFailedItem.id} to pending status.`);
    console.log();
    console.log('To continue execution, run:');
    console.log('  puppet-master start');
    console.log();
    console.log('Or to resume from a checkpoint:');
    console.log('  puppet-master resume');
  } catch (error) {
    console.error('Error retrying:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export class RetryCommand implements CommandModule {
  register(program: Command): void {
    program
      .command('retry')
      .description('Retry current failed subtask with a fresh iteration')
      .option('-c, --config <path>', 'Path to config file')
      .action(async (opts) => {
        await retryAction({ config: opts.config });
      });
  }
}

export const retryCommand = new RetryCommand();
