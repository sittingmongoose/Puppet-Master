/**
 * Kill-spawn command - Kill current process and spawn fresh iteration
 *
 * Implements `puppet-master kill-spawn`:
 * - Kills the current CLI process
 * - Spawns a fresh iteration for the current item
 *
 * Feature parity with GUI POST /api/controls/kill-spawn endpoint.
 * 
 * Note: This command is primarily useful when orchestration is running
 * in a subprocess or when you need to force a fresh process for the
 * current iteration. When running standalone, it will reset state
 * to allow a fresh start.
 */

import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import type { CommandModule } from './index.js';

export interface KillSpawnOptions {
  config?: string;
}

/**
 * Main kill-spawn action
 */
export async function killSpawnAction(options: KillSpawnOptions): Promise<void> {
  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Load PRD to find current item
    const prdManager = new PrdManager(config.memory.prdFile);
    const prd = await prdManager.load();

    // Find current running item (running or gating status)
    let currentItem: { id: string; title: string; type: string } | null = null;

    for (const phase of prd.phases) {
      for (const task of phase.tasks) {
        for (const subtask of task.subtasks) {
          if (subtask.status === 'running' || subtask.status === 'gating') {
            currentItem = { id: subtask.id, title: subtask.title, type: 'subtask' };
            break;
          }
        }
        if (currentItem) break;
        if (task.status === 'running' || task.status === 'gating') {
          currentItem = { id: task.id, title: task.title, type: 'task' };
          break;
        }
      }
      if (currentItem) break;
      if (phase.status === 'running' || phase.status === 'gating') {
        currentItem = { id: phase.id, title: phase.title, type: 'phase' };
        break;
      }
    }

    if (!currentItem) {
      console.log('No running item found to kill-spawn.');
      console.log('Use `puppet-master status` to see current state.');
      return;
    }

    console.log(`Found running ${currentItem.type}: ${currentItem.id} - ${currentItem.title}`);
    console.log();

    // Reset the running item's status back to pending for a fresh iteration
    if (currentItem.type === 'subtask') {
      for (const phase of prd.phases) {
        for (const task of phase.tasks) {
          const subtask = task.subtasks.find((s) => s.id === currentItem!.id);
          if (subtask) {
            subtask.status = 'pending';
            // Keep iteration count to track total attempts
            const iterationCount = subtask.iterations?.length ?? 0;
            console.log(`Reset ${subtask.id} to pending (iteration ${iterationCount})`);
            break;
          }
        }
      }
    } else if (currentItem.type === 'task') {
      for (const phase of prd.phases) {
        const task = phase.tasks.find((t) => t.id === currentItem!.id);
        if (task) {
          task.status = 'pending';
          break;
        }
      }
    } else if (currentItem.type === 'phase') {
      const phase = prd.phases.find((p) => p.id === currentItem!.id);
      if (phase) {
        phase.status = 'pending';
      }
    }

    // Save updated PRD
    await prdManager.save(prd);

    console.log();
    console.log('✓ Process state reset. A fresh iteration will be spawned on next start.');
    console.log();
    console.log('To continue with fresh iteration:');
    console.log('  puppet-master start');
    console.log();
    console.log('Note: If orchestration is running in another process, you may need to');
    console.log('stop it first with `puppet-master stop` before starting fresh.');
  } catch (error) {
    console.error('Error in kill-spawn:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export class KillSpawnCommand implements CommandModule {
  register(program: Command): void {
    program
      .command('kill-spawn')
      .description('Kill current CLI process and prepare for fresh iteration')
      .option('-c, --config <path>', 'Path to config file')
      .action(async (opts) => {
        await killSpawnAction({ config: opts.config });
      });
  }
}

export const killSpawnCommand = new KillSpawnCommand();
