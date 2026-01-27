/**
 * Start command - Begin orchestration loop
 * 
 * Implements the main `puppet-master start` command that:
 * - Loads configuration
 * - Validates PRD file existence
 * - Creates and initializes orchestrator
 * - Handles signals gracefully
 * - Outputs progress to console
 */

import { access } from 'fs/promises';
import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import type { OrchestratorDependencies } from '../../core/orchestrator.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import { PlatformRouter } from '../../core/platform-router.js';
import { deriveProjectRootFromConfigPath, resolveUnderProjectRoot } from '../../utils/project-paths.js';
import type { CommandModule } from './index.js';

/**
 * Options for the start command
 */
export interface StartOptions {
  config?: string;
  prd?: string;
  verbose?: boolean;
  dryRun?: boolean;
  keepAliveOnFailure?: boolean;
  /** Enable auto-promotion of extracted patterns to AGENTS.md */
  autoPromotePatterns?: boolean;
  /** Enforce gate failure when AGENTS.md update is required but not provided */
  enforceGateAgentsUpdate?: boolean;
}

/**
 * Progress update interval in milliseconds
 */
const PROGRESS_UPDATE_INTERVAL = 5000; // 5 seconds

/**
 * Main action function for the start command
 */
export async function startAction(options: StartOptions): Promise<void> {
  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();
    const configPath = configManager.getConfigPath();
    const projectRoot = deriveProjectRootFromConfigPath(configPath);

    // Override killAgentOnFailure if CLI flag is provided
    if (options.keepAliveOnFailure !== undefined) {
      if (!config.execution) {
        config.execution = {};
      }
      config.execution.killAgentOnFailure = !options.keepAliveOnFailure;
    }

    // Override memory auto-promotion options if CLI flags are provided
    if (options.autoPromotePatterns !== undefined || options.enforceGateAgentsUpdate !== undefined) {
      if (!config.memory.agentsEnforcement) {
        config.memory.agentsEnforcement = {
          requireUpdateOnFailure: true,
          requireUpdateOnGotcha: true,
          gateFailsOnMissingUpdate: true,
          reviewerMustAcknowledge: true,
        };
      }
      if (options.autoPromotePatterns !== undefined) {
        config.memory.agentsEnforcement.autoPromotePatterns = options.autoPromotePatterns;
      }
      if (options.enforceGateAgentsUpdate !== undefined) {
        config.memory.agentsEnforcement.enforceGateAgentsUpdate = options.enforceGateAgentsUpdate;
      }
    }

    // Validate PRD exists
    const prdPath = resolveUnderProjectRoot(projectRoot, options.prd || config.memory.prdFile);
    try {
      await access(prdPath);
    } catch {
      console.error(`PRD file not found: ${prdPath}`);
      process.exit(1);
    }

    // Dry run check
    if (options.dryRun) {
      console.log('Configuration validated successfully');
      console.log(`PRD file found: ${prdPath}`);
      console.log(`Project: ${config.project.name}`);
      console.log(`Working directory: ${config.project.workingDirectory}`);
      return;
    }

    // Create container and resolve dependencies
    // Pass prdPath override if --prd was provided, so PrdManager uses CLI override instead of config
    // Pass relative path (options.prd) so createContainer can resolve it properly
    const prdPathOverride = options.prd ? options.prd : undefined;
    const container = createContainer(config, projectRoot, configPath, prdPathOverride);

    // Create orchestrator instance
    const orchestrator = new Orchestrator({
      config,
      projectPath: projectRoot,
    });

    // Initialize platform registry with runners if needed
    const platformRegistry = container.resolve<PlatformRegistry>('platformRegistry');
    if (platformRegistry.getAvailable().length === 0) {
      const defaultRegistry = PlatformRegistry.createDefault(config, projectRoot);
      // Copy runners from default registry
      for (const p of defaultRegistry.getAvailable()) {
        const runner = defaultRegistry.get(p);
        if (runner) {
          platformRegistry.register(p, runner);
        }
      }
    }

    // Create platform router
    const platformRouter = new PlatformRouter(config, platformRegistry);

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
      platformRegistry,
      platformRouter,
      verificationIntegration: container.resolve('verificationIntegration'),
      // Memory auto-promotion dependencies
      promotionEngine: container.resolve('promotionEngine'),
      multiLevelLoader: container.resolve('multiLevelLoader'),
    };

    // Setup signal handlers
    setupSignalHandlers(orchestrator);

    // Setup progress output
    const progressInterval = setupProgressOutput(orchestrator, options.verbose ?? false);

    // Initialize
    console.log('Initializing orchestrator...');
    await orchestrator.initialize(deps);

    // Start
    console.log('Starting orchestration...');
    await orchestrator.start();

    // Clear progress interval when done
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    console.log('Orchestration complete');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error starting orchestration:', errorMessage);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}


/**
 * Setup signal handlers for graceful shutdown
 */
function setupSignalHandlers(orchestrator: Orchestrator): void {
  let sigintReceived = false;

  process.on('SIGINT', async () => {
    if (!sigintReceived) {
      sigintReceived = true;
      console.log('\nReceived SIGINT, pausing...');
      try {
        await orchestrator.pause('User interrupt');
        console.log('Orchestrator paused. Press Ctrl+C again to stop.');
        
        // Reset after 2 seconds to allow second Ctrl+C
        setTimeout(() => {
          sigintReceived = false;
        }, 2000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error pausing orchestrator:', errorMessage);
      }
    } else {
      console.log('\nReceived second SIGINT, stopping...');
      try {
        await orchestrator.stop();
        process.exit(0);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error stopping orchestrator:', errorMessage);
        process.exit(1);
      }
    }
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, stopping...');
    try {
      await orchestrator.stop();
      process.exit(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error stopping orchestrator:', errorMessage);
      process.exit(1);
    }
  });
}

/**
 * Setup periodic progress output
 * Returns interval ID that can be cleared when done
 */
function setupProgressOutput(orchestrator: Orchestrator, verbose: boolean): NodeJS.Timeout | null {
  // Only show progress if orchestrator has getProgress method
  if (typeof orchestrator.getProgress !== 'function') {
    return null;
  }

  const interval = setInterval(() => {
    try {
      const progress = orchestrator.getProgress();
      
      if (progress.currentPhase || progress.currentTask || progress.currentSubtask) {
        const parts: string[] = [];
        
        if (progress.currentPhase) {
          parts.push(`Phase: ${progress.currentPhase.id} - ${progress.currentPhase.title}`);
        }
        if (progress.currentTask) {
          parts.push(`Task: ${progress.currentTask.id} - ${progress.currentTask.title}`);
        }
        if (progress.currentSubtask) {
          parts.push(`Subtask: ${progress.currentSubtask.id} - ${progress.currentSubtask.title}`);
        }
        
        if (parts.length > 0) {
          console.log(`\n[Progress] ${parts.join(' | ')}`);
          
          if (verbose) {
            console.log(`  State: ${progress.state}`);
            console.log(`  Completed: ${progress.completedSubtasks}/${progress.totalSubtasks} subtasks`);
            console.log(`  Iterations: ${progress.iterationsRun}`);
            console.log(`  Elapsed: ${formatElapsedTime(progress.elapsedTime)}`);
          }
        }
      }
    } catch (error) {
      // Silently ignore progress errors to avoid cluttering output
      if (verbose) {
        console.error('Error getting progress:', error);
      }
    }
  }, PROGRESS_UPDATE_INTERVAL);

  return interval;
}

/**
 * Format elapsed time in seconds to human-readable string
 */
function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * StartCommand class implementing CommandModule interface
 */
export class StartCommand implements CommandModule {
  /**
   * Register the start command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('start')
      .description('Start the orchestration loop')
      .option('-c, --config <path>', 'Path to config file')
      .option('-p, --prd <path>', 'Path to PRD file')
      .option('-v, --verbose', 'Enable verbose output')
      .option('--dry-run', 'Validate configuration without executing')
      .option('--keep-alive-on-failure', 'Keep failed agents alive for debugging instead of killing them')
      .option('--auto-promote-patterns', 'Auto-promote extracted learnings to AGENTS.md after successful iterations')
      .option('--no-auto-promote-patterns', 'Disable auto-promotion of patterns (default)')
      .option('--enforce-gate-agents-update', 'Fail gate when AGENTS.md update is required but not provided')
      .option('--no-enforce-gate-agents-update', 'Disable gate enforcement for AGENTS.md updates (default)')
      .action(async (options: StartOptions) => {
        await startAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const startCommand = new StartCommand();
