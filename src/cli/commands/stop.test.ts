/**
 * Tests for stop command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { StopCommand, stopAction } from './stop.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { PRD } from '../../types/prd.js';

// Mock dependencies
vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn(),
}));

vi.mock('../../memory/prd-manager.js', () => ({
  PrdManager: vi.fn(),
}));

vi.mock('../../core/container.js', () => ({
  createContainer: vi.fn(),
}));

vi.mock('../../core/orchestrator.js', () => ({
  Orchestrator: vi.fn(),
}));

vi.mock('../../core/state-persistence.js', () => ({
  StatePersistence: vi.fn(),
}));

vi.mock('../../core/process-registry.js', () => ({
  ProcessRegistry: vi.fn(),
}));

vi.mock('../../core/session-tracker.js', () => ({
  SessionTracker: vi.fn(),
}));

vi.mock('../../platforms/registry.js', () => ({
  PlatformRegistry: {
    createDefault: vi.fn(),
  },
}));

import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import { StatePersistence } from '../../core/state-persistence.js';
import { ProcessRegistry } from '../../core/process-registry.js';
import { SessionTracker } from '../../core/session-tracker.js';
import { PlatformRegistry } from '../../platforms/registry.js';

describe('StopCommand', () => {
  let command: StopCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new StopCommand();
    mockProgram = new Command();
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register stop command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('stop');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Stop orchestration completely');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('--force');
      expect(optionCalls).toContain('--timeout <seconds>');
      expect(optionCalls).toContain('--no-save-checkpoint');
    });
  });
});

describe('stopAction', () => {
  let mockConfig: PuppetMasterConfig;
  let mockConfigManager: {
    load: ReturnType<typeof vi.fn>;
    getConfigPath: ReturnType<typeof vi.fn>;
  };
  let mockPrdManager: {
    load: ReturnType<typeof vi.fn>;
  };
  let mockContainer: {
    resolve: ReturnType<typeof vi.fn>;
  };
  let mockOrchestrator: {
    initialize: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };
  let mockStatePersistence: {
    createCheckpoint: ReturnType<typeof vi.fn>;
  };
  let mockProcessRegistry: {
    initialize: ReturnType<typeof vi.fn>;
    getRunningProcesses: ReturnType<typeof vi.fn>;
    terminateAll: ReturnType<typeof vi.fn>;
  };
  let mockPlatformRunner: {
    platform: 'cursor';
  };
  let mockPrd: PRD;

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

    mockPrd = {
      project: 'test-project',
      version: '1.0.0',
      description: 'Test project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branchName: 'main',
      phases: [],
      metadata: {
        totalPhases: 0,
        totalTasks: 0,
        totalSubtasks: 0,
        completedPhases: 0,
        completedTasks: 0,
        completedSubtasks: 0,
      },
      orchestratorState: 'executing',
      orchestratorContext: {
        state: 'executing',
        currentPhaseId: null,
        currentTaskId: null,
        currentSubtaskId: null,
        currentIterationId: null,
      },
    };

    mockPlatformRunner = {
      platform: 'cursor' as const,
    };

    mockConfigManager = {
      load: vi.fn().mockResolvedValue(mockConfig),
      getConfigPath: vi.fn().mockReturnValue('/test/project/puppet-master.config.yaml'),
    };

    mockPrdManager = {
      load: vi.fn().mockResolvedValue(mockPrd),
    };

    mockOrchestrator = {
      initialize: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    };

    mockStatePersistence = {
      createCheckpoint: vi.fn().mockResolvedValue(undefined),
    };

    mockProcessRegistry = {
      initialize: vi.fn().mockResolvedValue(undefined),
      getRunningProcesses: vi.fn().mockResolvedValue([]),
      terminateAll: vi.fn().mockResolvedValue(undefined),
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
        if (key === 'prdManager') return mockPrdManager;
        if (key === 'progressManager') return {};
        if (key === 'agentsManager') return {};
        if (key === 'evidenceStore') return {};
        if (key === 'usageTracker') return {};
        if (key === 'gitManager') return {};
        if (key === 'verificationIntegration') return {};
        if (key === 'platformRegistry') {
          return mockRegistry;
        }
        return null;
      }) as ReturnType<typeof vi.fn>,
    };

    (ConfigManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockConfigManager);
    (PrdManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockPrdManager);
    (createContainer as ReturnType<typeof vi.fn>).mockReturnValue(mockContainer);
    (Orchestrator as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockOrchestrator);
    (StatePersistence as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockStatePersistence);
    (ProcessRegistry as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockProcessRegistry);
    
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
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('orchestrator state detection', () => {
    it('should check if orchestrator is running', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({});
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(mockPrdManager.load).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should exit gracefully if orchestrator is not running', async () => {
      mockPrd.orchestratorState = 'idle';
      mockPrdManager.load.mockResolvedValue(mockPrd);

      await stopAction({});

      expect(console.log).toHaveBeenCalledWith('Orchestrator is not running.');
      expect(Orchestrator).not.toHaveBeenCalled();
    });

    it('should proceed if orchestrator is in executing state', async () => {
      vi.useFakeTimers();
      
      mockPrd.orchestratorState = 'executing';
      mockPrdManager.load.mockResolvedValue(mockPrd);
      
      // Ensure registry can return runner
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);

      const stopPromise = stopAction({});
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(Orchestrator).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should proceed if orchestrator is in planning state', async () => {
      vi.useFakeTimers();
      
      mockPrd.orchestratorState = 'planning';
      mockPrdManager.load.mockResolvedValue(mockPrd);
      
      // Ensure registry can return runner
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);

      const stopPromise = stopAction({});
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(Orchestrator).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should proceed if orchestrator is in paused state', async () => {
      vi.useFakeTimers();
      
      mockPrd.orchestratorState = 'paused';
      mockPrdManager.load.mockResolvedValue(mockPrd);
      
      // Ensure registry can return runner
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);

      const stopPromise = stopAction({});
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(Orchestrator).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('graceful stop', () => {
    beforeEach(() => {
      // Ensure registry can return runner
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should call orchestrator.stop() for graceful stop', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({});
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      expect(mockOrchestrator.stop).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should wait for grace period by default', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({});
      
      // Fast-forward time to check if wait is called
      await vi.advanceTimersByTimeAsync(11000); // 11 seconds
      
      await stopPromise;
      
      expect(mockOrchestrator.stop).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should use custom timeout when provided', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({ timeout: 5 });
      
      // Fast-forward time
      await vi.advanceTimersByTimeAsync(6000); // 6 seconds
      
      await stopPromise;
      
      expect(mockOrchestrator.stop).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('force stop', () => {
    beforeEach(() => {
      // Ensure registry can return runner
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should skip grace period when --force is used', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({ force: true });
      
      // Fast-forward minimal time
      await vi.advanceTimersByTimeAsync(100);
      
      await stopPromise;
      
      expect(mockOrchestrator.stop).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Force stopping...');
      
      vi.useRealTimers();
    });

    it('should not wait when force is true', async () => {
      const startTime = Date.now();
      
      await stopAction({ force: true });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete quickly without waiting
      expect(duration).toBeLessThan(1000);
      expect(mockOrchestrator.stop).toHaveBeenCalled();
    });
  });

  describe('checkpoint creation', () => {
    beforeEach(() => {
      // Ensure registry can return runner
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should create checkpoint by default', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({});
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(StatePersistence).toHaveBeenCalled();
      expect(mockStatePersistence.createCheckpoint).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should create checkpoint with timestamped name', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({});
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      const checkpointCall = mockStatePersistence.createCheckpoint.mock.calls[0];
      expect(checkpointCall).toBeDefined();
      expect(checkpointCall[0]).toMatch(/^stop-/);
      
      vi.useRealTimers();
    });

    it('should skip checkpoint when --no-save-checkpoint is used', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({ saveCheckpoint: false });
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(mockStatePersistence.createCheckpoint).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should handle checkpoint creation errors gracefully', async () => {
      vi.useFakeTimers();
      
      const error = new Error('Checkpoint creation failed');
      mockStatePersistence.createCheckpoint.mockRejectedValue(error);

      const stopPromise = stopAction({});
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not create checkpoint: Checkpoint creation failed')
      );
      // Should not fail the stop command
      expect(mockOrchestrator.stop).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('should handle config loading errors', async () => {
      const error = new Error('Config load failed');
      mockConfigManager.load.mockRejectedValue(error);

      await stopAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error stopping orchestrator'),
        'Config load failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle PRD loading errors', async () => {
      const error = new Error('PRD load failed');
      mockPrdManager.load.mockRejectedValue(error);

      await stopAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error stopping orchestrator'),
        'PRD load failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle orchestrator initialization errors', async () => {
      // Ensure registry can return runner
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
      
      const error = new Error('Initialization failed');
      mockOrchestrator.initialize.mockRejectedValue(error);

      await stopAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error stopping orchestrator'),
        'Initialization failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle orchestrator stop errors', async () => {
      // Ensure registry can return runner
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
      
      const error = new Error('Stop failed');
      mockOrchestrator.stop.mockRejectedValue(error);

      await stopAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error stopping orchestrator'),
        'Stop failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('options handling', () => {
    beforeEach(() => {
      // Ensure registry can return runner
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should handle config option', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({ config: '/custom/config.yaml' });
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(ConfigManager).toHaveBeenCalledWith('/custom/config.yaml');
      
      vi.useRealTimers();
    });

    it('should handle force option', async () => {
      await stopAction({ force: true });

      expect(console.log).toHaveBeenCalledWith('Force stopping...');
      expect(mockOrchestrator.stop).toHaveBeenCalled();
    });

    it('should handle timeout option', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({ timeout: 5 });
      await vi.advanceTimersByTimeAsync(6000);
      await stopPromise;

      expect(mockOrchestrator.stop).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should handle saveCheckpoint option', async () => {
      vi.useFakeTimers();
      
      const stopPromise = stopAction({ saveCheckpoint: false });
      await vi.advanceTimersByTimeAsync(11000);
      await stopPromise;

      expect(mockStatePersistence.createCheckpoint).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });
});
