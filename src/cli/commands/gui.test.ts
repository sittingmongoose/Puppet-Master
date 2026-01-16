/**
 * Tests for GUI command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { GuiCommand, guiAction } from './gui.js';
import type { PuppetMasterConfig } from '../../types/config.js';

// Mock dependencies
vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn(),
}));

vi.mock('../../core/container.js', () => ({
  createContainer: vi.fn(),
}));

vi.mock('../../core/orchestrator.js', () => ({
  Orchestrator: vi.fn(),
}));

vi.mock('../../gui/server.js', () => ({
  GuiServer: vi.fn(),
}));

vi.mock('../../logging/event-bus.js', () => ({
  EventBus: vi.fn(),
}));

vi.mock('open', () => ({
  default: vi.fn(),
}));

vi.mock('net', () => ({
  default: {
    createServer: vi.fn(),
  },
}));

import { ConfigManager } from '../../config/config-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import { GuiServer } from '../../gui/server.js';
import { EventBus } from '../../logging/event-bus.js';
import open from 'open';
import net from 'net';

describe('GuiCommand', () => {
  let command: GuiCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new GuiCommand();
    mockProgram = new Command();
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register gui command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('gui');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Launch the web-based GUI server');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('-p, --port <number>');
      expect(optionCalls).toContain('-h, --host <host>');
      expect(optionCalls).toContain('--no-open');
      expect(optionCalls).toContain('-v, --verbose');
    });
  });
});

describe('guiAction', () => {
  let mockConfig: PuppetMasterConfig;
  let mockConfigManager: {
    load: ReturnType<typeof vi.fn>;
  };
  let mockContainer: {
    resolve: ReturnType<typeof vi.fn>;
  };
  let mockGuiServer: {
    registerStateDependencies: ReturnType<typeof vi.fn>;
    registerOrchestratorInstance: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    getUrl: ReturnType<typeof vi.fn>;
  };
  let mockOrchestrator: {
    stop: ReturnType<typeof vi.fn>;
  };
  let mockEventBus: unknown;
  let mockTierManager: unknown;
  let mockOrchestratorStateMachine: unknown;
  let mockProgressManager: unknown;
  let mockAgentsManager: unknown;
  let mockNetServer: {
    listen: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
  };

  // Store original process.exit to restore later
  const originalExit = process.exit;
  const originalConsole = { ...console };

  beforeEach(() => {
    // Mock console methods
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
    process.exit = vi.fn() as never;

    mockConfig = {
      project: {
        name: 'test-project',
        workingDirectory: '/test/project',
      },
      cliPaths: {
        cursor: 'cursor',
        codex: 'codex',
        claude: 'claude',
      },
      logging: {
        level: 'info',
        retentionDays: 7,
      },
      tiers: {
        phase: {
          platform: 'cursor',
          model: 'default',
          selfFix: true,
          maxIterations: 10,
          escalation: null,
        },
        task: {
          platform: 'cursor',
          model: 'default',
          selfFix: true,
          maxIterations: 10,
          escalation: null,
        },
        subtask: {
          platform: 'cursor',
          model: 'default',
          selfFix: true,
          maxIterations: 10,
          escalation: null,
        },
        iteration: {
          platform: 'cursor',
          model: 'default',
          selfFix: true,
          maxIterations: 10,
          escalation: null,
        },
      },
      branching: {
        baseBranch: 'main',
        namingPattern: 'ralph/{id}',
        granularity: 'single',
        pushPolicy: 'per-iteration',
        mergePolicy: 'merge',
        autoPr: false,
      },
      verification: {
        browserAdapter: 'playwright',
        screenshotOnFailure: true,
        evidenceDirectory: '.puppet-master/evidence',
      },
      memory: {
        progressFile: 'progress.txt',
        agentsFile: 'AGENTS.md',
        prdFile: '.puppet-master/prd.json',
        multiLevelAgents: false,
        agentsEnforcement: {
          requireUpdateOnFailure: false,
          requireUpdateOnGotcha: false,
          gateFailsOnMissingUpdate: false,
          reviewerMustAcknowledge: false,
        },
      },
      budgets: {
        cursor: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        codex: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        claude: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
      },
      budgetEnforcement: {
        onLimitReached: 'fallback',
        warnAtPercentage: 80,
        notifyOnFallback: false,
      },
    };

    mockConfigManager = {
      load: vi.fn().mockResolvedValue(mockConfig),
    };

    mockTierManager = {};
    mockOrchestratorStateMachine = {};
    mockProgressManager = {};
    mockAgentsManager = {};

    mockContainer = {
      resolve: vi.fn((key: string) => {
        const map: Record<string, unknown> = {
          tierManager: mockTierManager,
          orchestrator: mockOrchestratorStateMachine,
          progressManager: mockProgressManager,
          agentsManager: mockAgentsManager,
        };
        return map[key];
      }),
    };

    mockGuiServer = {
      registerStateDependencies: vi.fn(),
      registerOrchestratorInstance: vi.fn(),
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      getUrl: vi.fn().mockReturnValue('http://localhost:3847'),
    };

    mockOrchestrator = {
      stop: vi.fn().mockResolvedValue(undefined),
    };

    mockEventBus = {};

    mockNetServer = {
      listen: vi.fn((port: number, host: string, callback: () => void) => {
        // Simulate successful listen
        setTimeout(() => callback(), 0);
        return mockNetServer;
      }),
      close: vi.fn((callback: () => void) => {
        setTimeout(() => callback(), 0);
        return mockNetServer;
      }),
      on: vi.fn(),
    };

    // Setup mocks
    (ConfigManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockConfigManager);
    (createContainer as ReturnType<typeof vi.fn>).mockReturnValue(mockContainer);
    (GuiServer as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockGuiServer);
    (EventBus as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockEventBus);
    (Orchestrator as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockOrchestrator);
    (net.createServer as ReturnType<typeof vi.fn>).mockReturnValue(mockNetServer);
    (open as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.exit = originalExit;
    Object.assign(console, originalConsole);
  });

  describe('server startup', () => {
    it('should start server on default port 3847', async () => {
      // Mock process.on to prevent hanging
      const originalOn = process.on;
      const mockOn = vi.fn();
      process.on = mockOn as never;

      // Start the action but don't wait for it to complete (it waits forever)
      const actionPromise = guiAction({}).catch(() => {
        // Ignore errors from the hanging promise
      });

      // Wait for server to start
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify server was created with default port
      expect(GuiServer).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 3847,
          host: 'localhost',
        }),
        expect.any(Object)
      );

      expect(mockGuiServer.start).toHaveBeenCalled();

      // Restore process.on
      process.on = originalOn;
    }, 10000);

    it('should start server on custom port', async () => {
      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({ port: 5000 }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(GuiServer).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 5000,
          host: 'localhost',
        }),
        expect.any(Object)
      );

      process.on = originalOn;
    }, 10000);

    it('should start server on custom host', async () => {
      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({ host: '0.0.0.0' }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(GuiServer).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 3847,
          host: '0.0.0.0',
        }),
        expect.any(Object)
      );

      process.on = originalOn;
    }, 10000);
  });

  describe('port availability checking', () => {
    it('should check port availability before starting server', async () => {
      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({ port: 3847 }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify net.createServer was called for port checking
      expect(net.createServer).toHaveBeenCalled();

      process.on = originalOn;
    }, 10000);

    it('should exit with error if port is unavailable', async () => {
      // Mock port as unavailable - server.listen should trigger error
      mockNetServer.listen = vi.fn((port: number, host: string, callback: () => void) => {
        // Simulate error - trigger error event instead of calling callback
        setTimeout(() => {
          const errorHandler = mockNetServer.on.mock.calls.find((call) => call[0] === 'error')?.[1];
          if (errorHandler) {
            errorHandler();
          }
        }, 10);
        return mockNetServer;
      });

      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({ port: 3847 }).catch(() => {});

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Port 3847 on localhost is already in use')
      );
      expect(process.exit).toHaveBeenCalledWith(1);

      process.on = originalOn;
    }, 10000);
  });

  describe('browser opening', () => {
    it('should open browser by default', async () => {
      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(open).toHaveBeenCalledWith('http://localhost:3847');

      process.on = originalOn;
    }, 10000);

    it('should not open browser when --no-open flag is set', async () => {
      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({ open: false }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(open).not.toHaveBeenCalled();

      process.on = originalOn;
    }, 10000);

    it('should handle browser open errors gracefully', async () => {
      (open as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Browser open failed'));

      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not open browser automatically')
      );
      // Should not exit on browser open failure
      expect(process.exit).not.toHaveBeenCalled();

      process.on = originalOn;
    }, 10000);
  });

  describe('server configuration', () => {
    it('should register state dependencies', async () => {
      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(mockGuiServer.registerStateDependencies).toHaveBeenCalledWith(
        mockTierManager,
        mockOrchestratorStateMachine,
        mockProgressManager,
        mockAgentsManager
      );

      process.on = originalOn;
    }, 10000);

    it('should register orchestrator instance', async () => {
      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(mockGuiServer.registerOrchestratorInstance).toHaveBeenCalledWith(
        expect.any(Object)
      );

      process.on = originalOn;
    }, 10000);
  });

  describe('error handling', () => {
    it('should handle config load errors', async () => {
      mockConfigManager.load = vi.fn().mockRejectedValue(new Error('Config load failed'));

      const originalOn = process.on;
      process.on = vi.fn() as never;

      await guiAction({});

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error starting GUI server'),
        expect.stringContaining('Config load failed')
      );
      expect(process.exit).toHaveBeenCalledWith(1);

      process.on = originalOn;
    });

    it('should handle server start errors', async () => {
      mockGuiServer.start = vi.fn().mockRejectedValue(new Error('Server start failed'));

      const originalOn = process.on;
      process.on = vi.fn() as never;

      await guiAction({});

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error starting GUI server'),
        expect.stringContaining('Server start failed')
      );
      expect(process.exit).toHaveBeenCalledWith(1);

      process.on = originalOn;
    });

    it('should show verbose output when verbose flag is set', async () => {
      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({ verbose: true }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(console.log).toHaveBeenCalledWith('Configuration loaded successfully');
      expect(console.log).toHaveBeenCalledWith('Project: test-project');

      process.on = originalOn;
    }, 10000);
  });

  describe('URL display', () => {
    it('should display server URL and links', async () => {
      const originalOn = process.on;
      process.on = vi.fn() as never;

      const actionPromise = guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Dashboard:'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Projects:'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Wizard:'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Configuration:'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Doctor:'));

      process.on = originalOn;
    }, 10000);
  });
});
