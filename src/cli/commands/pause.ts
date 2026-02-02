/**
 * Pause command - Pause orchestration execution
 * 
 * Implements the `puppet-master pause` command that:
 * - Checks if orchestrator is running
 * - Creates a checkpoint at the pause point
 * - Updates orchestrator state to PAUSED
 * - Supports optional reason and force flags
 */

import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { StatePersistence } from '../../core/state-persistence.js';
import type { CommandModule } from './index.js';

/**
 * Options for the pause command
 */
export interface PauseOptions {
  config?: string;
  reason?: string;
  force?: boolean;
}

/**
 * Generate checkpoint name with timestamp
 */
function generateCheckpointName(reason?: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5); // YYYY-MM-DDTHH-MM-SS
  const baseName = reason ? `pause-${timestamp}-${reason.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 20)}` : `pause-${timestamp}`;
  return baseName;
}

/**
 * Main action function for the pause command
 */
export async function pauseAction(options: PauseOptions): Promise<void> {
  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Load PRD
    const prdManager = new PrdManager(config.memory.prdFile);
    const prd = await prdManager.load();

    // Check current orchestrator state
    const currentState = prd.orchestratorState;

    // Validate state - must be executing to pause
    if (!currentState) {
      console.error('Orchestrator is not running. Nothing to pause.');
      process.exit(1);
    }

    if (currentState === 'paused') {
      console.error('Orchestrator is already paused.');
      process.exit(1);
    }

    if (currentState !== 'executing') {
      console.error(`Cannot pause from state: ${currentState}. Orchestrator must be in 'executing' state.`);
      process.exit(1);
    }

    // Create StatePersistence instance (uses default checkpoint directory)
    const statePersistence = new StatePersistence(prdManager);

    // Check if state exists in PRD (required for checkpoint)
    if (!prd.orchestratorState || !prd.orchestratorContext) {
      console.error('No orchestrator state found in PRD. Cannot create checkpoint.');
      process.exit(1);
    }

    // Generate checkpoint name
    const checkpointName = generateCheckpointName(options.reason);

    // Create checkpoint
    try {
      await statePersistence.createCheckpoint(checkpointName);
      console.log(`Checkpoint created: ${checkpointName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to create checkpoint: ${errorMessage}`);
      process.exit(1);
    }

    // Update PRD state to paused
    prd.orchestratorState = 'paused';
    if (options.reason && prd.orchestratorContext) {
      prd.orchestratorContext.pauseReason = options.reason;
    }

    // Save PRD
    await prdManager.save(prd);

    // Display confirmation
    console.log('Orchestration paused successfully.');
    if (options.reason) {
      console.log(`Reason: ${options.reason}`);
    }
    console.log(`Checkpoint: ${checkpointName}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error pausing orchestration:', errorMessage);
    process.exit(1);
  }
}

/**
 * PauseCommand class implementing CommandModule interface
 */
export class PauseCommand implements CommandModule {
  /**
   * Register the pause command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('pause')
      .description('Pause orchestration execution')
      .option('-c, --config <path>', 'Path to config file')
      .option('-r, --reason <text>', 'Reason for pausing')
      .option('-f, --force', 'Force pause (skip waiting for current iteration)')
      .action(async (options: PauseOptions) => {
        await pauseAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const pauseCommand = new PauseCommand();
