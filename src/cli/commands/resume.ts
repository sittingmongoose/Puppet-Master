/**
 * Resume command - Resume paused orchestration or from a checkpoint
 * 
 * Implements the `puppet-master resume` command that:
 * - Validates orchestrator is in PAUSED state
 * - Optionally restores from a checkpoint (via positional argument or --checkpoint flag)
 * - Resumes execution from the pause point or checkpoint position
 */

import { access } from 'fs/promises';
import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { CheckpointManager } from '../../core/checkpoint-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import type { OrchestratorDependencies } from '../../core/orchestrator.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import { PlatformRouter } from '../../core/platform-router.js';
import { deriveProjectRootFromConfigPath, resolveUnderProjectRoot } from '../../utils/project-paths.js';
import { join } from 'path';
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
    const configPath = configManager.getConfigPath();
    const projectRoot = deriveProjectRootFromConfigPath(configPath);

    // Load PRD
    const prdPath = resolveUnderProjectRoot(projectRoot, config.memory.prdFile);
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
      // Use CheckpointManager to load checkpoint
      const checkpointDir = join(projectRoot, '.puppet-master', 'checkpoints');
      const checkpointManager = new CheckpointManager(checkpointDir);
      const checkpoint = await checkpointManager.loadCheckpoint(options.checkpoint);
      
      if (!checkpoint) {
        console.error(`Checkpoint not found: ${options.checkpoint}`);
        process.exit(1);
      }

      // Validate checkpoint integrity unless skipValidation is true
      if (!options.skipValidation) {
        if (
          !checkpoint.orchestratorState ||
          !checkpoint.orchestratorContext ||
          !checkpoint.tierStates ||
          !checkpoint.timestamp
        ) {
          console.error('Invalid checkpoint structure');
          process.exit(1);
        }

        // Check that checkpoint state is paused (or allow other states for resume)
        if (checkpoint.orchestratorState !== 'paused' && checkpoint.orchestratorState !== 'executing') {
          console.warn(`Warning: Checkpoint state is ${checkpoint.orchestratorState}, not paused. Resuming anyway...`);
        }
      }

      // Restore checkpoint state to PRD
      prd.orchestratorState = checkpoint.orchestratorState;
      prd.orchestratorContext = checkpoint.orchestratorContext;

      // Restore tier contexts to PRD items
      for (const phase of prd.phases) {
        if (checkpoint.tierStates[phase.id]) {
          phase.tierContext = checkpoint.tierStates[phase.id];
        }

        for (const task of phase.tasks) {
          if (checkpoint.tierStates[task.id]) {
            task.tierContext = checkpoint.tierStates[task.id];
          }

          for (const subtask of task.subtasks) {
            if (checkpoint.tierStates[subtask.id]) {
              subtask.tierContext = checkpoint.tierStates[subtask.id];
            }
          }
        }
      }

      // Save restored state to PRD
      await prdManager.save(prd);
      console.log(`Restored state from checkpoint: ${options.checkpoint}`);
      console.log(`  Position: ${checkpoint.currentPosition.phaseId || 'N/A'}/${checkpoint.currentPosition.taskId || 'N/A'}/${checkpoint.currentPosition.subtaskId || 'N/A'}`);
      console.log(`  Progress: ${checkpoint.metadata.completedSubtasks}/${checkpoint.metadata.totalSubtasks} subtasks, ${checkpoint.metadata.iterationsRun} iterations`);
    }

    // Create container and resolve dependencies
    const container = createContainer(config, projectRoot, configPath);

    // Create orchestrator instance
    const orchestrator = new Orchestrator({
      config,
      projectPath: projectRoot,
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
      branchStrategy: container.resolve('branchStrategy'),
      commitFormatter: container.resolve('commitFormatter'),
      prManager: container.resolve('prManager'),
      platformRegistry: getPlatformRegistry(container, config, projectRoot),
      platformRouter: getPlatformRouter(container, config, projectRoot),
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
 * Get platform registry with runners initialized
 */
function getPlatformRegistry(
  container: ReturnType<typeof createContainer>,
  config: PuppetMasterConfig,
  projectRoot: string
): PlatformRegistry {
  const registry = container.resolve<PlatformRegistry>('platformRegistry');
  
  // Initialize registry with runners if needed
  if (registry.getAvailable().length === 0) {
    const defaultRegistry = PlatformRegistry.createDefault(config, projectRoot);
    // Copy runners from default registry
    for (const p of defaultRegistry.getAvailable()) {
      const runner = defaultRegistry.get(p);
      if (runner) {
        registry.register(p, runner);
      }
    }
  }
  
  return registry;
}

/**
 * Get platform router
 */
function getPlatformRouter(
  container: ReturnType<typeof createContainer>,
  config: PuppetMasterConfig,
  projectRoot: string
): PlatformRouter {
  const registry = getPlatformRegistry(container, config, projectRoot);
  return new PlatformRouter(config, registry);
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
      .command('resume [checkpoint-id]')
      .description('Resume paused orchestration or from a checkpoint')
      .option('-c, --config <path>', 'Path to config file')
      .option('--checkpoint <name>', 'Resume from specific checkpoint (alternative to positional arg)')
      .option('--skip-validation', 'Skip checkpoint validation')
      .action(async (checkpointId: string | undefined, options: ResumeOptions) => {
        // Use positional argument if provided, otherwise use flag
        // Positional argument takes precedence if both are provided
        const finalCheckpointId = checkpointId || options.checkpoint;
        await resumeAction({ ...options, checkpoint: finalCheckpointId });
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const resumeCommand = new ResumeCommand();
