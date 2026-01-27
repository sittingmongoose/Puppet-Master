/**
 * Reset command - Reset orchestrator state machine
 *
 * Implements `puppet-master reset`:
 * - Resets the orchestrator state to IDLE
 * - Optionally clears PRD progress
 * - Optionally clears usage tracking
 *
 * Feature parity with GUI POST /api/controls/reset endpoint.
 */

import { Command } from 'commander';
import * as readline from 'node:readline';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import type { CommandModule } from './index.js';

export interface ResetOptions {
  config?: string;
  clearProgress?: boolean;
  clearUsage?: boolean;
  yes?: boolean;
}

/**
 * Prompt for confirmation
 */
async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Main reset action
 */
export async function resetAction(options: ResetOptions): Promise<void> {
  try {
    // Confirm if not using --yes flag
    if (!options.yes) {
      console.log('This will reset the orchestrator state machine to IDLE.');
      if (options.clearProgress) {
        console.log('WARNING: This will also clear all PRD progress!');
      }
      if (options.clearUsage) {
        console.log('WARNING: This will also clear usage tracking data!');
      }
      console.log();

      const confirmed = await confirm('Are you sure you want to continue?');
      if (!confirmed) {
        console.log('Reset cancelled.');
        return;
      }
    }

    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Load and update PRD
    const prdManager = new PrdManager(config.memory.prdFile);
    const prd = await prdManager.load();

    // Reset orchestrator state
    prd.orchestratorState = 'idle';
    if (prd.orchestratorContext) {
      prd.orchestratorContext.currentPhaseId = null;
      prd.orchestratorContext.currentTaskId = null;
      prd.orchestratorContext.currentSubtaskId = null;
    }

    // Clear progress if requested
    if (options.clearProgress) {
      for (const phase of prd.phases) {
        phase.status = 'pending';
        for (const task of phase.tasks) {
          task.status = 'pending';
          for (const subtask of task.subtasks) {
            subtask.status = 'pending';
            // Clear iterations array
            subtask.iterations = [];
          }
        }
      }

      // Reset metadata counts
      prd.metadata.completedPhases = 0;
      prd.metadata.completedTasks = 0;
      prd.metadata.completedSubtasks = 0;
    }

    // Save updated PRD
    await prdManager.save(prd);

    // Clear usage tracking if requested
    if (options.clearUsage) {
      const { promises: fs } = await import('fs');
      const usagePath = '.puppet-master/usage/usage.jsonl';
      try {
        await fs.writeFile(usagePath, '', 'utf-8');
        console.log('✓ Usage tracking data cleared.');
      } catch {
        // File may not exist, that's okay
      }
    }

    console.log('✓ Orchestrator state reset to IDLE.');
    if (options.clearProgress) {
      console.log('✓ PRD progress cleared.');
    }
    console.log();
    console.log('To start a fresh run:');
    console.log('  puppet-master start');
  } catch (error) {
    console.error('Error resetting:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export class ResetCommand implements CommandModule {
  register(program: Command): void {
    program
      .command('reset')
      .description('Reset orchestrator state machine to IDLE')
      .option('-c, --config <path>', 'Path to config file')
      .option('--clear-progress', 'Also clear all PRD progress')
      .option('--clear-usage', 'Also clear usage tracking data')
      .option('-y, --yes', 'Skip confirmation prompt')
      .action(async (opts) => {
        await resetAction({
          config: opts.config,
          clearProgress: opts.clearProgress,
          clearUsage: opts.clearUsage,
          yes: opts.yes,
        });
      });
  }
}

export const resetCommand = new ResetCommand();
