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

vi.mock('../../core/session-tracker.js', () => ({
  SessionTracker: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.start = vi.fn();
    this.stop = vi.fn();
  }),
}));

vi.mock('open', () => ({
  default: vi.fn(),
}));

vi.mock('net', () => ({
  default: {
    createServer: vi.fn(),
  },
}));

vi.mock('node:http', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  appendFileSync: vi.fn(),
}));

vi.mock('node:url', () => ({
  fileURLToPath: vi.fn(),
}));

import { ConfigManager } from '../../config/config-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import { GuiServer } from '../../gui/server.js';
import { EventBus } from '../../logging/event-bus.js';
import open from 'open';
import net from 'net';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

describe('GuiCommand', () => {
  let command: GuiCommand;
  let mockProgram: Command;

  beforeEach(() => {
    vi.clearAllMocks();
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

      expect(descriptionSpy).toHaveBeenCalledWith(
        'Launch the GUI server and open the desktop GUI (Tauri if available; falls back to browser)'
      );
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
    getConfigPath: ReturnType<typeof vi.fn>;
  };
  let mockContainer: {
    resolve: ReturnType<typeof vi.fn>;
  };
  let mockGuiServer: {
    registerStateDependencies: ReturnType<typeof vi.fn>;
    registerOrchestratorInstance: ReturnType<typeof vi.fn>;
    registerStartChainDependencies: ReturnType<typeof vi.fn>;
    registerSessionTracker: ReturnType<typeof vi.fn>;
    initializeAuth: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    getUrl: ReturnType<typeof vi.fn>;
  };
  let mockOrchestrator: {
    initialize: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };
  let mockEventBus: unknown;
  let mockTierManager: unknown;
  let mockProgressManager: unknown;
  let mockAgentsManager: unknown;
  let mockNetServer: {
    listen: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
  };
  let mockSpawnChild: {
    unref: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
  };
  let mockHttpRequest: {
    on: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  };
  let mockHttpResponse: {
    statusCode: number;
    on: ReturnType<typeof vi.fn>;
  };

  // Store original process.exit to restore later
  const originalExit = process.exit;
  const originalOn = process.on;
  const originalConsole = { ...console };
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Mock console methods
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
    process.exit = vi.fn() as never;
    process.on = vi.fn() as never;
    // Set DISPLAY env var so Tauri launch works on Linux in tests
    process.env.DISPLAY = ':0';

    mockConfig = {
      project: {
        name: 'test-project',
        workingDirectory: '/test/project',
      },
      cliPaths: {
        cursor: 'cursor',
        codex: 'codex',
        claude: 'claude',
        gemini: 'gemini',
        copilot: 'copilot',
      },
      logging: {
        level: 'info',
        retentionDays: 7,
      },
      tiers: {
        phase: {
          platform: 'cursor',
          model: 'default',
          taskFailureStyle: 'spawn_new_agent',
          maxIterations: 10,
          escalation: null,
        },
        task: {
          platform: 'cursor',
          model: 'default',
          taskFailureStyle: 'spawn_new_agent',
          maxIterations: 10,
          escalation: null,
        },
        subtask: {
          platform: 'cursor',
          model: 'default',
          taskFailureStyle: 'spawn_new_agent',
          maxIterations: 10,
          escalation: null,
        },
        iteration: {
          platform: 'cursor',
          model: 'default',
          taskFailureStyle: 'spawn_new_agent',
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
        gemini: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        copilot: {
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
      getConfigPath: vi.fn().mockReturnValue('/test/project/.puppet-master/config.yaml'),
    };

    mockTierManager = {};
    mockProgressManager = {};
    mockAgentsManager = {};

    mockContainer = {
      resolve: vi.fn((key: string) => {
        const map: Record<string, unknown> = {
          tierStateManager: mockTierManager,
          progressManager: mockProgressManager,
          agentsManager: mockAgentsManager,
          // Orchestrator initialize deps
          configManager: mockConfigManager,
          prdManager: {},
          evidenceStore: {},
          usageTracker: {},
          gitManager: {},
          branchStrategy: {},
          commitFormatter: {},
          prManager: {},
          verificationIntegration: {},
          platformRegistry: {
            getAvailable: vi.fn().mockReturnValue(['cursor']),
            get: vi.fn(),
            register: vi.fn(),
          },
        };
        return map[key];
      }),
    };

    mockGuiServer = {
      registerStateDependencies: vi.fn(),
      registerOrchestratorInstance: vi.fn(),
      registerStartChainDependencies: vi.fn(),
      registerSessionTracker: vi.fn(),
      initializeAuth: vi.fn().mockResolvedValue(undefined),
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      getUrl: vi.fn().mockReturnValue('http://localhost:3847'),
    };

    mockOrchestrator = {
      initialize: vi.fn().mockResolvedValue(undefined),
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

    mockSpawnChild = {
      unref: vi.fn(),
      on: vi.fn().mockReturnThis(),
    };

    // Mock HTTP request/response for server readiness check
    mockHttpResponse = {
      statusCode: 200,
      on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
        if (event === 'data') {
          // Immediately call with health check response
          setTimeout(() => callback(Buffer.from('{"status":"ok"}')), 0);
        } else if (event === 'end') {
          // Immediately call end
          setTimeout(() => callback(), 0);
        }
        return mockHttpResponse;
      }),
    };

    mockHttpRequest = {
      on: vi.fn((event: string, _callback: (...args: unknown[]) => void) => {
        // Don't trigger error or timeout - simulate successful request
        return mockHttpRequest;
      }),
      destroy: vi.fn(),
    };

    // Setup mocks
    (ConfigManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return mockConfigManager;
    });
    (createContainer as ReturnType<typeof vi.fn>).mockReturnValue(mockContainer);
    (GuiServer as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return mockGuiServer;
    });
    (EventBus as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return mockEventBus;
    });
    (Orchestrator as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return mockOrchestrator;
    });
    (net.createServer as ReturnType<typeof vi.fn>).mockReturnValue(mockNetServer);
    (http.get as ReturnType<typeof vi.fn>).mockImplementation(
      (_url: string, _options: unknown, callback: (res: typeof mockHttpResponse) => void) => {
        // Immediately call the callback with the mock response
        setTimeout(() => callback(mockHttpResponse), 0);
        return mockHttpRequest;
      }
    );
    (open as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSpawnChild);
    (existsSync as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (fileURLToPath as unknown as ReturnType<typeof vi.fn>).mockReturnValue('/mock/path/dist/cli/commands/gui.js');
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.exit = originalExit;
    process.on = originalOn;
    Object.assign(console, originalConsole);
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe('server startup', () => {
    it('should start server on default port 3847', async () => {
      // Start the action but don't wait for it to complete (it waits forever)
      void guiAction({}).catch(() => {
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
    }, 10000);

    it('should start server on custom port', async () => {
      void guiAction({ port: 5000 }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(GuiServer).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 5000,
          host: 'localhost',
        }),
        expect.any(Object)
      );
    }, 10000);

    it('should start server on custom host', async () => {
      void guiAction({ host: '0.0.0.0' }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(GuiServer).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 3847,
          host: '0.0.0.0',
        }),
        expect.any(Object)
      );
    }, 10000);
  });

  describe('port availability checking', () => {
    it('should check port availability before starting server', async () => {
      void guiAction({ port: 3847 }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify net.createServer was called for port checking
      expect(net.createServer).toHaveBeenCalled();
    }, 10000);

    it('should exit with error if port is unavailable', async () => {
      // Mock port as unavailable - server.listen should trigger error
      mockNetServer.listen = vi.fn((_port: number, _host: string, _callback: () => void) => {
        // Simulate error - trigger error event instead of calling callback
        setTimeout(() => {
          const errorHandler = mockNetServer.on.mock.calls.find((call) => call[0] === 'error')?.[1];
          if (errorHandler) {
            errorHandler();
          }
        }, 10);
        return mockNetServer;
      });

      void guiAction({ port: 3847 }).catch(() => {});

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Port 3847 on localhost is already in use')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    }, 10000);
  });

  describe('browser opening', () => {
    it('should attempt Tauri GUI launch first then fallback to browser by default', async () => {
      // No Tauri binary found, so should fallback to browser
      (existsSync as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

      void guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should not spawn since no Tauri binary exists
      expect(spawn).not.toHaveBeenCalled();
      // Should fallback to open browser
      expect(open).toHaveBeenCalledWith('http://localhost:3847');
    }, 10000);

    it('should launch Tauri GUI when binary exists and not call open', async () => {
      // Mock install root detection and Tauri binary exists
      (existsSync as unknown as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        const pathStr = String(path);
        // Mock install root detection (needs bin and app directories)
        if (pathStr.includes('/bin') && !pathStr.includes('puppet-master-gui')) {
          return true;
        }
        if (pathStr.includes('/app') && !pathStr.includes('puppet-master-gui')) {
          return true;
        }
        // Mock Tauri binary exists
        if (pathStr.includes('puppet-master-gui')) {
          return true;
        }
        return false;
      });

      void guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should spawn Tauri GUI (not detached so Node exits when Tauri quits)
      expect(spawn).toHaveBeenCalledWith(
        expect.stringContaining('puppet-master-gui'),
        ['--server-url', 'http://localhost:3847'],
        expect.objectContaining({
          stdio: 'ignore',
          windowsHide: true,
        })
      );
      // Child must have exit handler so server shuts down when Tauri quits
      expect(mockSpawnChild.on).toHaveBeenCalledWith('exit', expect.any(Function));
      // Should NOT open browser
      expect(open).not.toHaveBeenCalled();
    }, 10000);

    it('should fallback to browser if Tauri spawn fails', async () => {
      // Mock install root detection and Tauri binary exists but spawn throws
      (existsSync as unknown as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        const pathStr = String(path);
        // Mock install root detection
        if (pathStr.includes('/bin') && !pathStr.includes('puppet-master-gui')) {
          return true;
        }
        if (pathStr.includes('/app') && !pathStr.includes('puppet-master-gui')) {
          return true;
        }
        // Mock Tauri binary exists
        if (pathStr.includes('puppet-master-gui')) {
          return true;
        }
        return false;
      });
      (spawn as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Spawn failed');
      });

      void guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should attempt spawn
      expect(spawn).toHaveBeenCalled();
      // Should fallback to browser
      expect(open).toHaveBeenCalledWith('http://localhost:3847');
      // Should warn about fallback
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not launch Tauri GUI, falling back to browser')
      );
    }, 10000);

    it('should not open browser or spawn when --no-open flag is set', async () => {
      void guiAction({ open: false }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(spawn).not.toHaveBeenCalled();
      expect(open).not.toHaveBeenCalled();
    }, 10000);

    it('should handle browser open errors gracefully when browser fallback is taken', async () => {
      // No Tauri binary, so browser fallback will be used
      (existsSync as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (open as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Browser open failed'));

      void guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not open browser automatically')
      );
      // Should not exit on browser open failure
      expect(process.exit).not.toHaveBeenCalled();
    }, 10000);

    it('should use verbose output for Tauri launch', async () => {
      // Mock install root detection and Tauri binary exists
      (existsSync as unknown as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        const pathStr = String(path);
        // Mock install root detection
        if (pathStr.includes('/bin') && !pathStr.includes('puppet-master-gui')) {
          return true;
        }
        if (pathStr.includes('/app') && !pathStr.includes('puppet-master-gui')) {
          return true;
        }
        // Mock Tauri binary exists
        if (pathStr.includes('puppet-master-gui')) {
          return true;
        }
        return false;
      });

      void guiAction({ verbose: true }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Launched Tauri GUI:')
      );
    }, 10000);
  });

  describe('server configuration', () => {
    it('should register state dependencies', async () => {
      void guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(mockGuiServer.registerStateDependencies).toHaveBeenCalledWith(
        mockTierManager,
        expect.any(Object),
        mockProgressManager,
        mockAgentsManager
      );
    }, 10000);

    it('should register orchestrator instance', async () => {
      void guiAction({}).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(mockGuiServer.registerOrchestratorInstance).toHaveBeenCalledWith(
        expect.any(Object)
      );
    }, 10000);
  });

  describe('error handling', () => {
    it('should handle config load errors', async () => {
      mockConfigManager.load = vi.fn().mockRejectedValue(new Error('Config load failed'));

      await guiAction({});

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error starting GUI server'),
        expect.stringContaining('Config load failed')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle server start errors', async () => {
      mockGuiServer.start = vi.fn().mockRejectedValue(new Error('Server start failed'));

      await guiAction({});

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error starting GUI server'),
        expect.stringContaining('Server start failed')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should show verbose output when verbose flag is set', async () => {
      void guiAction({ verbose: true }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(console.log).toHaveBeenCalledWith('Configuration loaded successfully');
      expect(console.log).toHaveBeenCalledWith('Project: test-project');
    }, 10000);
  });

  describe('URL display', () => {
    it('should display server URL and links', async () => {
      void guiAction({ classic: true }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Dashboard:'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Projects:'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Wizard:'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Configuration:'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Doctor:'));
    }, 10000);
  });
});
