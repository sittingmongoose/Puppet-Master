/**
 * Tests for start command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { StartCommand, startAction } from './start.js';
import type { PuppetMasterConfig } from '../../types/config.js';

// Mock dependencies
vi.mock('fs/promises', () => ({
  access: vi.fn(),
}));

vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn(),
}));

vi.mock('../../core/container.js', () => ({
  createContainer: vi.fn(),
}));

vi.mock('../../core/orchestrator.js', () => ({
  Orchestrator: vi.fn(),
}));

vi.mock('../../platforms/registry.js', () => ({
  PlatformRegistry: {
    createDefault: vi.fn(),
  },
}));

import { access } from 'fs/promises';
import { ConfigManager } from '../../config/config-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import { PlatformRegistry } from '../../platforms/registry.js';

describe('StartCommand', () => {
  let command: StartCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new StartCommand();
    mockProgram = new Command();
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register start command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('start');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Start the orchestration loop');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('-p, --prd <path>');
      expect(optionCalls).toContain('-v, --verbose');
      expect(optionCalls).toContain('--dry-run');
    });
  });
});

describe('startAction', () => {
  let mockConfig: PuppetMasterConfig;
  let mockConfigManager: {
    load: ReturnType<typeof vi.fn>;
  };
  let mockContainer: {
    resolve: ReturnType<typeof vi.fn>;
  };
  let mockOrchestrator: {
    initialize: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    getProgress: ReturnType<typeof vi.fn>;
  };
  let mockPlatformRunner: {
    platform: 'cursor';
  };
  let mockDeps: {
    configManager: unknown;
    prdManager: unknown;
    progressManager: unknown;
    agentsManager: unknown;
    evidenceStore: unknown;
    usageTracker: unknown;
    gitManager: unknown;
    platformRunner: typeof mockPlatformRunner;
    verificationIntegration: unknown;
  };

  beforeEach(() => {
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

    mockPlatformRunner = {
      platform: 'cursor' as const,
    };

    mockDeps = {
      configManager: {},
      prdManager: {},
      progressManager: {},
      agentsManager: {},
      evidenceStore: {},
      usageTracker: {},
      gitManager: {},
      platformRunner: mockPlatformRunner,
      verificationIntegration: {},
    };

    mockConfigManager = {
      load: vi.fn().mockResolvedValue(mockConfig),
    };

    mockOrchestrator = {
      initialize: vi.fn().mockResolvedValue(undefined),
      start: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      getProgress: vi.fn().mockReturnValue({
        state: 'executing',
        currentPhase: null,
        currentTask: null,
        currentSubtask: null,
        completedSubtasks: 0,
        totalSubtasks: 0,
        iterationsRun: 0,
        startedAt: new Date().toISOString(),
        elapsedTime: 0,
      }),
    };

    // Create a mock registry that can return runners
    const mockRegistry = {
      getAvailable: vi.fn().mockReturnValue([]),
      get: vi.fn().mockReturnValue(undefined),
      register: vi.fn(),
    };

    mockContainer = {
      resolve: vi.fn((key: string) => {
        if (key === 'configManager') return mockConfigManager;
        if (key === 'prdManager') return mockDeps.prdManager;
        if (key === 'progressManager') return mockDeps.progressManager;
        if (key === 'agentsManager') return mockDeps.agentsManager;
        if (key === 'evidenceStore') return mockDeps.evidenceStore;
        if (key === 'usageTracker') return mockDeps.usageTracker;
        if (key === 'gitManager') return mockDeps.gitManager;
        if (key === 'verificationIntegration') return mockDeps.verificationIntegration;
        if (key === 'platformRegistry') {
          return mockRegistry;
        }
        return null;
      }) as ReturnType<typeof vi.fn>,
    };

    (ConfigManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockConfigManager);
    (createContainer as ReturnType<typeof vi.fn>).mockReturnValue(mockContainer);
    (Orchestrator as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockOrchestrator);
    const mockDefaultRegistry = {
      getAvailable: vi.fn().mockReturnValue(['cursor']),
      get: vi.fn((platform: string) => {
        if (platform === 'cursor') return mockPlatformRunner;
        return undefined;
      }),
    };
    
    (PlatformRegistry.createDefault as ReturnType<typeof vi.fn>).mockReturnValue(mockDefaultRegistry);

    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('config loading', () => {
    it('should load config using ConfigManager', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await startAction({});

      expect(ConfigManager).toHaveBeenCalled();
      expect(mockConfigManager.load).toHaveBeenCalled();
    });

    it('should use provided config path', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await startAction({ config: '/custom/config.yaml' });

      expect(ConfigManager).toHaveBeenCalledWith('/custom/config.yaml');
    });
  });

  describe('PRD file validation', () => {
    it('should validate PRD file exists', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await startAction({});

      expect(access).toHaveBeenCalledWith(mockConfig.memory.prdFile);
    });

    it('should use provided PRD path', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await startAction({ prd: '/custom/prd.json' });

      expect(access).toHaveBeenCalledWith('/custom/prd.json');
    });

    it('should exit with error if PRD file not found', async () => {
      (access as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('ENOENT'));

      await startAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('PRD file not found')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('dry-run mode', () => {
    it('should validate config and PRD without executing', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await startAction({ dryRun: true });

      expect(mockConfigManager.load).toHaveBeenCalled();
      expect(access).toHaveBeenCalled();
      expect(Orchestrator).not.toHaveBeenCalled();
      expect(mockOrchestrator.initialize).not.toHaveBeenCalled();
      expect(mockOrchestrator.start).not.toHaveBeenCalled();
    });

    it('should output validation success message', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await startAction({ dryRun: true });

      expect(console.log).toHaveBeenCalledWith('Configuration validated successfully');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('PRD file found')
      );
    });
  });

  describe('orchestrator initialization', () => {
    beforeEach(() => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // Ensure registry can return runner so initialization succeeds
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should create orchestrator instance', async () => {
      await startAction({});

      expect(Orchestrator).toHaveBeenCalledWith({
        config: mockConfig,
        projectPath: process.cwd(),
        prdPath: mockConfig.memory.prdFile,
      });
    });

    it('should initialize orchestrator with dependencies', async () => {
      await startAction({});

      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      const initCall = mockOrchestrator.initialize.mock.calls[0][0];
      expect(initCall).toHaveProperty('configManager');
      expect(initCall).toHaveProperty('prdManager');
      expect(initCall).toHaveProperty('platformRunner');
    });

    it('should start orchestrator after initialization', async () => {
      await startAction({});

      // Verify both were called
      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      expect(mockOrchestrator.start).toHaveBeenCalled();
      
      // Verify initialization was called first by checking call order
      const initCallOrder = mockOrchestrator.initialize.mock.invocationCallOrder[0];
      const startCallOrder = mockOrchestrator.start.mock.invocationCallOrder[0];
      expect(initCallOrder).toBeLessThan(startCallOrder!);
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      mockOrchestrator.initialize.mockRejectedValue(error);

      await startAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error starting orchestration'),
        'Initialization failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('signal handling', () => {
    beforeEach(() => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // Ensure registry can return runner so initialization succeeds
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should setup SIGINT handler', async () => {
      const sigintListeners = process.listenerCount('SIGINT');
      
      await startAction({});
      
      // Wait a bit for async setup
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(process.listenerCount('SIGINT')).toBeGreaterThan(sigintListeners);
    });

    it('should setup SIGTERM handler', async () => {
      const sigtermListeners = process.listenerCount('SIGTERM');
      
      await startAction({});
      
      // Wait a bit for async setup
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(process.listenerCount('SIGTERM')).toBeGreaterThan(sigtermListeners);
    });
  });

  describe('progress output', () => {
    beforeEach(() => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // Ensure registry can return runner so initialization succeeds
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should setup orchestrator with getProgress method', async () => {
      await startAction({});

      // Verify orchestrator was created and has getProgress method
      expect(Orchestrator).toHaveBeenCalled();
      expect(mockOrchestrator.getProgress).toBeDefined();
      expect(typeof mockOrchestrator.getProgress).toBe('function');
    });

    it('should initialize orchestrator successfully with progress support', async () => {
      await startAction({ verbose: true });

      // Verify initialization and start were called
      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      expect(mockOrchestrator.start).toHaveBeenCalled();
      
      // Verify orchestrator has getProgress method available
      expect(typeof mockOrchestrator.getProgress).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle config loading errors', async () => {
      const error = new Error('Config load failed');
      mockConfigManager.load.mockRejectedValue(error);

      await startAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error starting orchestration'),
        'Config load failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should output error details in verbose mode', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // Ensure registry can return runner so we get past initialization
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
      
      const error = new Error('Start failed');
      mockOrchestrator.start.mockRejectedValue(error);

      await startAction({ verbose: true });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error starting orchestration'),
        'Start failed'
      );
      // In verbose mode, should also log the error object
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('options handling', () => {
    beforeEach(() => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // Ensure registry can return runner so initialization succeeds
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should handle verbose option', async () => {
      await startAction({ verbose: true });

      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      expect(mockOrchestrator.start).toHaveBeenCalled();
    });

    it('should handle config and PRD options together', async () => {
      await startAction({
        config: '/custom/config.yaml',
        prd: '/custom/prd.json',
      });

      expect(ConfigManager).toHaveBeenCalledWith('/custom/config.yaml');
      expect(access).toHaveBeenCalledWith('/custom/prd.json');
    });
  });
});
