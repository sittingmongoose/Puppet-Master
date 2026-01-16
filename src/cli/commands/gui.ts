/**
 * GUI command - Launch the web-based GUI server
 *
 * Implements the `puppet-master gui` command that:
 * - Loads configuration
 * - Creates EventBus and dependency injection container
 * - Initializes GuiServer
 * - Creates Orchestrator instance
 * - Wires orchestrator to GUI server
 * - Starts HTTP and WebSocket servers
 * - Opens browser automatically (unless --no-open flag is used)
 */

import { Command } from 'commander';
import net from 'net';
import open from 'open';
import { ConfigManager } from '../../config/config-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import { GuiServer } from '../../gui/server.js';
import { EventBus } from '../../logging/event-bus.js';
import type { TierStateManager } from '../../core/tier-state-manager.js';
import type { OrchestratorStateMachine } from '../../core/orchestrator-state-machine.js';
import type { ProgressManager, AgentsManager } from '../../memory/index.js';
import type { CommandModule } from './index.js';

/**
 * Options for the GUI command
 */
export interface GuiOptions {
  config?: string;
  port?: number;
  host?: string;
  open?: boolean;
  verbose?: boolean;
}

/**
 * Check if a port is available for binding
 */
async function checkPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

/**
 * Main action function for the GUI command
 */
export async function guiAction(options: GuiOptions): Promise<void> {
  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    if (options.verbose) {
      console.log('Configuration loaded successfully');
      console.log(`Project: ${config.project.name}`);
      console.log(`Working directory: ${config.project.workingDirectory}`);
    }

    // Determine port and host
    const port = options.port || 3847;
    const host = options.host || 'localhost';

    // Check if port is available
    if (options.verbose) {
      console.log(`Checking if port ${port} is available...`);
    }
    const portAvailable = await checkPortAvailable(port, host);
    if (!portAvailable) {
      console.error(`Error: Port ${port} on ${host} is already in use.`);
      console.error(`Please choose a different port using --port <number>`);
      process.exit(1);
    }

    // Create EventBus
    const eventBus = new EventBus();

    // Create dependency injection container
    const projectPath = process.cwd();
    const container = createContainer(config, projectPath);

    // Create GUI server
    const guiConfig = {
      port,
      host,
    };
    const guiServer = new GuiServer(guiConfig, eventBus);

    // Register state dependencies
    const tierManager = container.resolve<TierStateManager>('tierManager');
    const orchestrator = container.resolve<OrchestratorStateMachine>('orchestrator');
    const progressManager = container.resolve<ProgressManager>('progressManager');
    const agentsManager = container.resolve<AgentsManager>('agentsManager');

    guiServer.registerStateDependencies(
      tierManager,
      orchestrator,
      progressManager,
      agentsManager
    );

    // Create Orchestrator instance for controls
    const prdPath = config.memory.prdFile;
    const orchestratorInstance = new Orchestrator({
      config,
      projectPath,
      prdPath,
      eventBus, // Pass EventBus for real-time updates
    });

    // Register orchestrator instance for control routes
    guiServer.registerOrchestratorInstance(orchestratorInstance);

    if (options.verbose) {
      console.log('Orchestrator instance registered with GUI server');
    }

    // Setup signal handlers for graceful shutdown
    setupSignalHandlers(guiServer, orchestratorInstance);

    // Start GUI server
    console.log('Starting GUI server...');
    await guiServer.start();

    const url = guiServer.getUrl();
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║         RWM Puppet Master GUI Server Started             ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  🌐 Dashboard:     ${url}`);
    console.log(`  📁 Projects:      ${url}/projects`);
    console.log(`  🧙 Wizard:        ${url}/wizard`);
    console.log(`  ⚙️  Configuration: ${url}/config`);
    console.log(`  🏥 Doctor:        ${url}/doctor`);
    console.log('');

    // Open browser if enabled (default: true, unless --no-open flag is set)
    if (options.open !== false) {
      try {
        await open(url);
        if (options.verbose) {
          console.log(`  Browser opened to ${url}`);
        }
      } catch (error) {
        // Log warning but don't fail - browser opening is optional
        console.warn('  Could not open browser automatically. Please open manually.');
        if (options.verbose) {
          console.warn(`  Error: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    console.log('  Press Ctrl+C to stop the server');
    console.log('');

    // Keep process alive
    await new Promise(() => {
      // Intentionally empty - wait forever until signal
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error starting GUI server:', errorMessage);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Setup signal handlers for graceful shutdown
 */
function setupSignalHandlers(guiServer: GuiServer, orchestrator: Orchestrator): void {
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);

    try {
      // Stop orchestrator if running
      if (orchestrator && typeof orchestrator.stop === 'function') {
        await orchestrator.stop();
      }

      // Stop GUI server
      await guiServer.stop();

      console.log('Shutdown complete');
      process.exit(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error during shutdown:', errorMessage);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * GuiCommand class implementing CommandModule interface
 */
export class GuiCommand implements CommandModule {
  /**
   * Register the gui command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('gui')
      .description('Launch the web-based GUI server')
      .option('-c, --config <path>', 'Path to config file')
      .option('-p, --port <number>', 'Port to listen on (default: 3847)', (value) => parseInt(value, 10))
      .option('-h, --host <host>', 'Host to bind to (default: localhost)', 'localhost')
      .option('--no-open', 'Prevent browser from opening automatically')
      .option('-v, --verbose', 'Enable verbose output')
      .action(async (options: GuiOptions) => {
        // Handle --no-open flag (Commander.js sets open to false when --no-open is used)
        if (options.open === undefined) {
          options.open = true; // Default to true if not explicitly set
        }
        await guiAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const guiCommand = new GuiCommand();
