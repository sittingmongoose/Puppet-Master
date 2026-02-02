/**
 * Stop command - Stop orchestration completely
 * 
 * Implements the `puppet-master stop` command that:
 * - Checks if orchestrator is running
 * - Gracefully stops orchestration
 * - Terminates running processes
 * - Creates final checkpoint
 * - Cleans up resources
 */

import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import { StatePersistence } from '../../core/state-persistence.js';
import { ProcessRegistry } from '../../core/process-registry.js';
import type { OrchestratorDependencies } from '../../core/orchestrator.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { OrchestratorState } from '../../types/state.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import { PlatformRouter } from '../../core/platform-router.js';
import { deriveProjectRootFromConfigPath, resolveUnderProjectRoot } from '../../utils/project-paths.js';
import type { CommandModule } from './index.js';
import { join } from 'path';

/**
 * Options for the stop command
 */
export interface StopOptions {
  config?: string;
  force?: boolean;
  timeout?: number;
  saveCheckpoint?: boolean;
}

/**
 * Default grace period timeout in seconds
 */
const DEFAULT_TIMEOUT_SECONDS = 10;

/**
 * Check if orchestrator is in a running state
 */
function isOrchestratorRunning(state: OrchestratorState | undefined): boolean {
  if (!state) {
    return false;
  }
  return state === 'executing' || state === 'planning' || state === 'paused';
}

/**
 * Wait for a specified duration
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Terminate all running processes via ProcessRegistry
 */
async function terminateAllProcesses(
  projectRoot: string,
  sessionId: string,
  force: boolean
): Promise<void> {
  try {
    const registryPath = join(projectRoot, '.puppet-master', 'sessions', `${sessionId}.json`);
    const processRegistry = new ProcessRegistry(sessionId, registryPath);

    // Initialize registry (loads from file if exists)
    await processRegistry.initialize();

    // Get running processes
    const runningProcesses = await processRegistry.getRunningProcesses();

    if (runningProcesses.length === 0) {
      console.log('No running processes to terminate');
      return;
    }

    console.log(`Terminating ${runningProcesses.length} process(es)...`);

    // Terminate all processes
    await processRegistry.terminateAll(force);

    console.log('All processes terminated');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`Warning: Error terminating processes: ${errorMessage}`);
    // Don't throw - we want stop to continue even if process termination fails
  }
}

/**
 * Main action function for the stop command
 */
export async function stopAction(options: StopOptions): Promise<void> {
  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();
    const configPath = configManager.getConfigPath();
    const projectRoot = deriveProjectRootFromConfigPath(configPath);

    // Load PRD to check state
    const prdPath = resolveUnderProjectRoot(projectRoot, config.memory.prdFile);
    const prdManager = new PrdManager(prdPath);
    const prd = await prdManager.load();

    // Check if orchestrator is running
    const orchestratorState = prd.orchestratorState;
    if (!isOrchestratorRunning(orchestratorState)) {
      console.log('Orchestrator is not running.');
      return;
    }

    console.log('Stopping orchestrator...');

    // Create container and resolve dependencies
    const container = createContainer(config, projectRoot, configPath);

    // Resolve minimal dependencies needed for stop
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
      // Memory auto-promotion dependencies (optional for stop)
      promotionEngine: container.resolve('promotionEngine'),
      multiLevelLoader: container.resolve('multiLevelLoader'),
    };

    // Create orchestrator instance (minimal, just for stop)
    const orchestrator = new Orchestrator({
      config,
      projectPath: projectRoot,
    });

    // Initialize orchestrator (required before stop)
    await orchestrator.initialize(deps);

    // Request graceful stop
    if (options.force) {
      console.log('Force stopping...');
      await orchestrator.stop();

      // Get session ID from orchestrator context
      const sessionId = prd.orchestratorContext?.currentIterationId || 'unknown';

      // Force terminate all processes via ProcessRegistry
      await terminateAllProcesses(projectRoot, sessionId, true);
    } else {
      console.log('Requesting graceful stop...');
      await orchestrator.stop();

      // Get session ID from orchestrator context
      const sessionId = prd.orchestratorContext?.currentIterationId || 'unknown';

      // Gracefully terminate all processes via ProcessRegistry
      await terminateAllProcesses(projectRoot, sessionId, false);

      // Wait for grace period
      const timeoutSeconds = options.timeout ?? DEFAULT_TIMEOUT_SECONDS;
      console.log(`Waiting up to ${timeoutSeconds} seconds for processes to terminate...`);

      await wait(timeoutSeconds * 1000);
    }

    // Create final checkpoint if requested
    if (options.saveCheckpoint !== false) {
      try {
        const statePersistence = new StatePersistence(prdManager);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const checkpointName = `stop-${timestamp}`;
        console.log(`Creating checkpoint: ${checkpointName}`);
        await statePersistence.createCheckpoint(checkpointName);
        console.log('Checkpoint created successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Warning: Could not create checkpoint: ${errorMessage}`);
        // Don't fail the stop command if checkpoint creation fails
      }
    }

    // Cleanup is handled by orchestrator.stop() which syncs state to PRD
    console.log('Orchestrator stopped successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error stopping orchestrator:', errorMessage);
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
 * StopCommand class implementing CommandModule interface
 */
export class StopCommand implements CommandModule {
  /**
   * Register the stop command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('stop')
      .description('Stop orchestration completely')
      .option('-c, --config <path>', 'Path to config file')
      .option('--force', 'Kill processes immediately without grace period')
      .option('--timeout <seconds>', 'Grace period timeout in seconds', String(DEFAULT_TIMEOUT_SECONDS))
      .option('--no-save-checkpoint', 'Skip creating final checkpoint')
      .action(async (options: StopOptions) => {
        // Parse timeout as number
        if (options.timeout !== undefined) {
          options.timeout = parseInt(String(options.timeout), 10);
          if (isNaN(options.timeout)) {
            console.error('Invalid timeout value, using default');
            options.timeout = DEFAULT_TIMEOUT_SECONDS;
          }
        }
        await stopAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const stopCommand = new StopCommand();
