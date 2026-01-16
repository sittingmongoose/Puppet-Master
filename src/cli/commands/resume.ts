/**
 * Resume command - Resume paused orchestration
 * 
 * Implements the `puppet-master resume` command that:
 * - Validates orchestrator is in PAUSED state
 * - Optionally restores from a checkpoint
 * - Resumes execution from the pause point
 */

import { access } from 'fs/promises';
import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { StatePersistence } from '../../core/state-persistence.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import type { OrchestratorDependencies } from '../../core/orchestrator.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import type { CommandModule } from './index.js';

/**
 * Options for the resume command
 */
export interface ResumeOptions {
  config?: string;
  checkpoint?: string;
  skipValidation?: boolean;
}

/**
 * Main action function for the resume command
 */
export async function resumeAction(options: ResumeOptions): Promise<void> {
  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Load PRD
    const prdPath = config.memory.prdFile;
    try {
      await access(prdPath);
    } catch {
      console.error(`PRD file not found: ${prdPath}`);
      process.exit(1);
    }

    const prdManager = new PrdManager(prdPath);
    const prd = await prdManager.load();

    // Check orchestrator state
    const orchestratorState = prd.orchestratorState;
    if (!orchestratorState) {
      console.error('Cannot resume: orchestrator state not found in PRD');
      process.exit(1);
    }

    if (orchestratorState !== 'paused') {
      console.error(`Cannot resume: orchestrator is not in paused state (current state: ${orchestratorState})`);
      process.exit(1);
    }

    // Handle checkpoint restoration if specified
    if (options.checkpoint) {
      const statePersistence = new StatePersistence(prdManager);
      const checkpointState = await statePersistence.restoreCheckpoint(options.checkpoint);
      
      if (!checkpointState) {
        console.error(`Checkpoint not found: ${options.checkpoint}`);
        process.exit(1);
      }

      // Validate checkpoint integrity unless skipValidation is true
      if (!options.skipValidation) {
        if (
          !checkpointState.orchestratorState ||
          !checkpointState.orchestratorContext ||
          !checkpointState.tierStates ||
          !checkpointState.savedAt
        ) {
          console.error('Invalid checkpoint structure');
          process.exit(1);
        }

        // Check that checkpoint state is paused
        if (checkpointState.orchestratorState !== 'paused') {
          console.error(`Cannot resume from checkpoint: checkpoint state is not paused (state: ${checkpointState.orchestratorState})`);
          process.exit(1);
        }
      }

      // Restore checkpoint state to PRD
      prd.orchestratorState = checkpointState.orchestratorState;
      prd.orchestratorContext = checkpointState.orchestratorContext;

      // Restore tier contexts to PRD items
      for (const phase of prd.phases) {
        if (checkpointState.tierStates[phase.id]) {
          phase.tierContext = checkpointState.tierStates[phase.id];
        }

        for (const task of phase.tasks) {
          if (checkpointState.tierStates[task.id]) {
            task.tierContext = checkpointState.tierStates[task.id];
          }

          for (const subtask of task.subtasks) {
            if (checkpointState.tierStates[subtask.id]) {
              subtask.tierContext = checkpointState.tierStates[subtask.id];
            }
          }
        }
      }

      // Save restored state to PRD
      await prdManager.save(prd);
      console.log(`Restored state from checkpoint: ${options.checkpoint}`);
    }

    // Create container and resolve dependencies
    const projectPath = process.cwd();
    const container = createContainer(config, projectPath);

    // Create orchestrator instance
    const orchestrator = new Orchestrator({
      config,
      projectPath,
      prdPath,
    });

    // Resolve all dependencies from container
    const deps: OrchestratorDependencies = {
      configManager: container.resolve('configManager'),
      prdManager: container.resolve('prdManager'),
      progressManager: container.resolve('progressManager'),
      agentsManager: container.resolve('agentsManager'),
      evidenceStore: container.resolve('evidenceStore'),
      usageTracker: container.resolve('usageTracker'),
      gitManager: container.resolve('gitManager'),
      platformRunner: getPlatformRunner(container, config),
      verificationIntegration: container.resolve('verificationIntegration'),
    };

    // Initialize orchestrator (this will load state from PRD)
    console.log('Initializing orchestrator...');
    await orchestrator.initialize(deps);

    // Verify state is still paused after initialization
    const currentState = orchestrator.getState();
    if (currentState !== 'paused') {
      console.error(`Cannot resume: orchestrator state is ${currentState}, expected 'paused'`);
      process.exit(1);
    }

    // Resume execution
    console.log('Resuming orchestration...');
    await orchestrator.resume();

    console.log('Orchestration resumed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error resuming orchestration:', errorMessage);
    process.exit(1);
  }
}

/**
 * Get platform runner for the configured subtask platform
 */
function getPlatformRunner(container: ReturnType<typeof createContainer>, config: PuppetMasterConfig): OrchestratorDependencies['platformRunner'] {
  const registry = container.resolve<PlatformRegistry>('platformRegistry');
  const platform = config.tiers.subtask.platform;
  
  // Initialize registry with runners if needed
  if (registry.getAvailable().length === 0) {
    const defaultRegistry = PlatformRegistry.createDefault(config);
    // Copy runners from default registry
    for (const p of defaultRegistry.getAvailable()) {
      const runner = defaultRegistry.get(p);
      if (runner) {
        registry.register(p, runner);
      }
    }
  }
  
  // Try to get runner from registry
  const runner = registry.get(platform);
  if (runner) {
    return runner as OrchestratorDependencies['platformRunner'];
  }

  // If not found, throw error
  throw new Error(`Platform runner for '${platform}' not found. Ensure the platform is properly configured.`);
}

/**
 * ResumeCommand class implementing CommandModule interface
 */
export class ResumeCommand implements CommandModule {
  /**
   * Register the resume command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('resume')
      .description('Resume paused orchestration')
      .option('-c, --config <path>', 'Path to config file')
      .option('--checkpoint <name>', 'Resume from specific checkpoint')
      .option('--skip-validation', 'Skip checkpoint validation')
      .action(async (options: ResumeOptions) => {
        await resumeAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const resumeCommand = new ResumeCommand();
