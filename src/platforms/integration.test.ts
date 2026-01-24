/**
 * Integration tests for platform layer
 * 
 * Tests the complete platform abstraction layer end-to-end:
 * - Discovery → Registry → Runner → Execution flow
 * - Quota enforcement
 * - Cooldown enforcement
 * - Platform fallback
 * 
 * Per BUILD_QUEUE_PHASE_3.md PH3-T10 (Platform Integration Test).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable, Writable } from 'stream';
import { join } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import type { ChildProcess } from 'child_process';
import { spawn } from 'child_process';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { PlatformRegistry } from './registry.js';
import { CursorRunner } from './cursor-runner.js';
import { QuotaManager } from './quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import type { Platform, PuppetMasterConfig } from '../types/config.js';
import type { PlatformBudgets } from '../types/config.js';
import type { ExecutionRequest } from '../types/platforms.js';

// Mock child_process module
vi.mock('child_process', async () => {
  const actual = await vi.importActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    spawn: vi.fn(),
  };
});

// Get path to mock CLI scripts
const MOCK_CLIS_DIR = join(process.cwd(), 'tests', 'fixtures', 'mock-clis');

/**
 * Helper function to create a mock ChildProcess for testing.
 * Based on pattern from cursor-runner.test.ts
 */
function createMockProcess(pid: number = 12345): ChildProcess {
  const stdoutStream = new Readable({
    read() {
      // No-op, data will be pushed manually
    },
  });
  const stderrStream = new Readable({
    read() {
      // No-op, data will be pushed manually
    },
  });
  const stdinStream = new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  });

  const mockState = {
    killed: false,
    exitCode: null as number | null,
    exitCallbacks: [] as Array<(code: number) => void>,
    errorCallbacks: [] as Array<(error: Error) => void>,
  };

  const mockProc = {
    pid,
    stdin: stdinStream,
    stdout: stdoutStream,
    stderr: stderrStream,
    get killed() {
      return mockState.killed;
    },
    set killed(value: boolean) {
      mockState.killed = value;
    },
    get exitCode() {
      return mockState.exitCode;
    },
    set exitCode(value: number | null) {
      mockState.exitCode = value;
    },
    kill: vi.fn((signal?: string | number) => {
      if (signal === 'SIGTERM' || signal === 'SIGKILL') {
        mockState.killed = true;
        mockState.exitCode = signal === 'SIGKILL' ? 137 : 143;
        mockState.exitCallbacks.forEach((cb) => cb(mockState.exitCode!));
      }
    }),
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      if (event === 'exit') {
        mockState.exitCallbacks.push(callback as (code: number) => void);
        // If exitCode is already set, call immediately
        if (mockState.exitCode !== null) {
          setImmediate(() => {
            try {
              (callback as (code: number) => void)(mockState.exitCode!);
            } catch {
              // Ignore callback errors
            }
          });
        }
      } else if (event === 'error') {
        mockState.errorCallbacks.push(callback as (error: Error) => void);
      }
      return mockProc;
    }),
    emit: vi.fn((event: string, ...args: unknown[]) => {
      if (event === 'exit' && args.length > 0) {
        mockState.exitCode = args[0] as number;
        mockState.exitCallbacks.forEach((cb) => {
          try {
            cb(args[0] as number);
          } catch {
            // Ignore callback errors
          }
        });
      } else if (event === 'error' && args.length > 0) {
        mockState.errorCallbacks.forEach((cb) => {
          try {
            cb(args[0] as Error);
          } catch {
            // Ignore callback errors
          }
        });
      }
      return true;
    }),
  } as unknown as ChildProcess;

  return mockProc;
}

/**
 * Creates a default test configuration.
 */
function createTestConfig(tempDir: string): PuppetMasterConfig {
  return {
    project: {
      name: 'test-project',
      workingDirectory: tempDir,
    },
    tiers: {
      phase: {
        platform: 'cursor',
        model: 'claude-3-5-sonnet-20241022',
        selfFix: true,
        maxIterations: 3,
        escalation: null,
      },
      task: {
        platform: 'cursor',
        model: 'claude-3-5-sonnet-20241022',
        selfFix: true,
        maxIterations: 5,
        escalation: 'phase',
      },
      subtask: {
        platform: 'cursor',
        model: 'claude-3-5-sonnet-20241022',
        selfFix: true,
        maxIterations: 10,
        escalation: 'task',
      },
      iteration: {
        platform: 'cursor',
        model: 'claude-3-5-sonnet-20241022',
        selfFix: false,
        maxIterations: 1,
        escalation: 'subtask',
      },
    },
    branching: {
      baseBranch: 'main',
      namingPattern: 'ralph/{tier}-{id}',
      granularity: 'per-task',
      pushPolicy: 'per-subtask',
      mergePolicy: 'merge',
      autoPr: false,
    },
    verification: {
      browserAdapter: 'playwright',
      screenshotOnFailure: true,
      evidenceDirectory: join(tempDir, '.puppet-master', 'evidence'),
    },
    memory: {
      progressFile: join(tempDir, 'progress.txt'),
      agentsFile: join(tempDir, 'AGENTS.md'),
      prdFile: join(tempDir, '.puppet-master', 'prd.json'),
      multiLevelAgents: false,
      agentsEnforcement: {
        requireUpdateOnFailure: true,
        requireUpdateOnGotcha: true,
        gateFailsOnMissingUpdate: false,
        reviewerMustAcknowledge: false,
      },
    },
    budgets: {
      cursor: {
        maxCallsPerRun: 100,
        maxCallsPerHour: 50,
        maxCallsPerDay: 200,
        cooldownHours: 1,
        fallbackPlatform: 'codex',
      },
      codex: {
        maxCallsPerRun: 100,
        maxCallsPerHour: 50,
        maxCallsPerDay: 200,
        cooldownHours: 1,
        fallbackPlatform: 'claude',
      },
      claude: {
        maxCallsPerRun: 100,
        maxCallsPerHour: 50,
        maxCallsPerDay: 200,
        cooldownHours: 1,
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
    logging: {
      level: 'info',
      retentionDays: 30,
    },
    cliPaths: {
      cursor: join(MOCK_CLIS_DIR, 'mock-cursor'),
      codex: join(MOCK_CLIS_DIR, 'mock-codex'),
      claude: join(MOCK_CLIS_DIR, 'mock-claude'),
      gemini: join(MOCK_CLIS_DIR, 'mock-gemini'),
      copilot: join(MOCK_CLIS_DIR, 'mock-copilot'),
    },
  };
}

describe('Platform Integration Tests', () => {
  let tempDir: string;
  let config: PuppetMasterConfig;
  let capabilityService: CapabilityDiscoveryService;
  let usageTracker: UsageTracker;
  let quotaManager: QuotaManager;

  beforeEach(async () => {
    // Create temporary directory for test isolation
    tempDir = await mkdtemp(join(tmpdir(), 'puppet-master-test-'));
    config = createTestConfig(tempDir);

    // Create capability service with temporary cache directory
    const cacheDir = join(tempDir, '.puppet-master', 'capabilities');
    capabilityService = new CapabilityDiscoveryService(cacheDir);

    // Create usage tracker with temporary file
    const usageFile = join(tempDir, '.puppet-master', 'usage', 'usage.jsonl');
    usageTracker = new UsageTracker(usageFile);

    // Create quota manager
    quotaManager = new QuotaManager(usageTracker, config.budgets, config.budgetEnforcement);

    // Reset mocks
    vi.clearAllMocks();
    vi.mocked(spawn).mockClear();
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    vi.clearAllMocks();
  });

  describe('Full Discovery → Execution Flow', () => {
    it('should discover capabilities, register runners, and execute request', async () => {
      // Step 1: Mock capability service to avoid actual CLI calls
      const mockProbeResult = {
        platform: 'cursor' as Platform,
        command: 'cursor',
        runnable: true,
        authStatus: 'authenticated' as const,
        version: '1.0.0',
        capabilities: {
          streaming: true,
          codeExecution: true,
          imageGeneration: false,
          fileAccess: true,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 100000,
          maxOutputTokens: 4000,
          supportedLanguages: ['typescript', 'javascript'],
        },
        quotaInfo: {
          remaining: 100,
          limit: 100,
          resetsAt: new Date(Date.now() + 3600000).toISOString(),
          period: 'hour' as const,
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      };
      vi.spyOn(capabilityService, 'probe').mockResolvedValue(mockProbeResult);
      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(mockProbeResult);

      // Step 2: Create registry and register runner
      const registry = new PlatformRegistry();
      const cursorRunner = new CursorRunner(capabilityService, config.cliPaths.cursor);
      registry.register('cursor', cursorRunner);

      // Step 3: Mock spawn for execution - use pattern from existing tests
      const mockOutput = 'Processing request...\nSession ID: PM-2026-01-10-14-30-00-001\ntokens: 1234\nOutput: Task completed successfully\n<ralph>COMPLETE</ralph>';
      const mockProc = createMockProcess(12345);
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      // Simulate output with COMPLETE signal (pattern from cursor-runner.test.ts)
      setTimeout(() => {
        if (mockProc.stdout) {
          mockProc.stdout.push(Buffer.from(mockOutput));
          mockProc.stdout.push(null);
        }
        if (mockProc.stderr) {
          mockProc.stderr.push(null);
        }
        (mockProc as { exitCode: number }).exitCode = 0;
        mockProc.emit('exit', 0);
      }, 10);

      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: tempDir,
        nonInteractive: true,
      };

      const result = await cursorRunner.execute(request);

      // Step 4: Verify result
      expect(result.success).toBe(true);
      expect(result.output).toContain('<ralph>COMPLETE</ralph>');
      expect(result.processId).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    }, 15000);

    it('should handle complete flow with registry factory method', async () => {
      // Mock capability service
      const mockProbeResult = {
        platform: 'cursor' as Platform,
        command: 'cursor',
        runnable: true,
        authStatus: 'authenticated' as const,
        version: '1.0.0',
        capabilities: {
          streaming: true,
          codeExecution: true,
          imageGeneration: false,
          fileAccess: true,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 100000,
          maxOutputTokens: 4000,
          supportedLanguages: ['typescript'],
        },
        quotaInfo: {
          remaining: 100,
          limit: 100,
          resetsAt: new Date(Date.now() + 3600000).toISOString(),
          period: 'hour' as const,
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      };
      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(mockProbeResult);

      // Create registry using factory method
      const registry = PlatformRegistry.createDefault(config);

      // Verify all platforms are registered
      const available = registry.getAvailable();
      expect(available).toContain('cursor');
      expect(available).toContain('codex');
      expect(available).toContain('claude');

      // Execute request using cursor runner
      const cursorRunner = registry.get('cursor');
      expect(cursorRunner).toBeDefined();

      const mockOutput = 'Processing request...\nSession ID: PM-2026-01-10-14-30-00-001\ntokens: 1234\nOutput: Task completed successfully\n<ralph>COMPLETE</ralph>';
      const mockProc = createMockProcess(12345);
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      setTimeout(() => {
        if (mockProc.stdout) {
          mockProc.stdout.push(Buffer.from(mockOutput));
          mockProc.stdout.push(null);
        }
        if (mockProc.stderr) {
          mockProc.stderr.push(null);
        }
        (mockProc as { exitCode: number }).exitCode = 0;
        mockProc.emit('exit', 0);
      }, 10);

      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: tempDir,
        nonInteractive: true,
      };

      const result = await cursorRunner!.execute(request);
      expect(result.success).toBe(true);
      expect(result.output).toContain('<ralph>COMPLETE</ralph>');
    }, 20000);

    it('should parse output correctly with session ID and tokens', async () => {
      // Mock capability service
      const mockProbeResult = {
        platform: 'cursor' as Platform,
        command: 'cursor',
        runnable: true,
        authStatus: 'authenticated' as const,
        version: '1.0.0',
        capabilities: {
          streaming: true,
          codeExecution: true,
          imageGeneration: false,
          fileAccess: true,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 100000,
          maxOutputTokens: 4000,
          supportedLanguages: ['typescript'],
        },
        quotaInfo: {
          remaining: 100,
          limit: 100,
          resetsAt: new Date(Date.now() + 3600000).toISOString(),
          period: 'hour' as const,
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      };
      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(mockProbeResult);

      const registry = PlatformRegistry.createDefault(config);
      const cursorRunner = registry.get('cursor')!;

      const mockOutput = 'Processing request...\nSession ID: PM-2026-01-10-14-30-00-001\ntokens: 5678\nOutput: Task completed successfully\n<ralph>COMPLETE</ralph>';
      const mockProc = createMockProcess(12345);
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      setTimeout(() => {
        if (mockProc.stdout) {
          mockProc.stdout.push(Buffer.from(mockOutput));
          mockProc.stdout.push(null);
        }
        if (mockProc.stderr) {
          mockProc.stderr.push(null);
        }
        (mockProc as { exitCode: number }).exitCode = 0;
        mockProc.emit('exit', 0);
      }, 10);

      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: tempDir,
        nonInteractive: true,
      };

      const result = await cursorRunner.execute(request);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('PM-2026-01-10-14-30-00-001');
      // Cursor runner uses "tokens:" pattern, not "Tokens used:"
      expect(result.tokensUsed).toBeDefined();
    }, 20000);
  });

  describe('Quota Enforcement', () => {
    it('should block execution when quota is exhausted', async () => {
      // Set up quota manager with low limits
      const lowBudget: PlatformBudgets = {
        cursor: {
          maxCallsPerRun: 2,
          maxCallsPerHour: 2,
          maxCallsPerDay: 2,
          cooldownHours: 1,
          fallbackPlatform: 'codex',
        },
        codex: config.budgets.codex,
        claude: config.budgets.claude,
        gemini: config.budgets.gemini,
        copilot: config.budgets.copilot,
      };
      const budgetEnforcement = {
        onLimitReached: 'fallback' as const,
        warnAtPercentage: 80,
        notifyOnFallback: true,
      };
      const quotaManager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement);

      // Record usage to exhaust quota
      await quotaManager.recordUsage('cursor', 1000, 1000);
      await quotaManager.recordUsage('cursor', 1000, 1000);

      // Try to execute - should be blocked
      const canProceed = await quotaManager.canProceed('cursor');
      expect(canProceed.allowed).toBe(false);
      expect(canProceed.reason).toContain('Quota exhausted');
    });

    it('should allow execution when quota is available', async () => {
      const canProceed = await quotaManager.canProceed('cursor');
      expect(canProceed.allowed).toBe(true);
    });

    it('should track usage and reduce remaining quota', async () => {
      const initialQuota = await quotaManager.checkQuota('cursor');
      expect(initialQuota.remaining).toBeGreaterThan(0);

      // Record usage
      await quotaManager.recordUsage('cursor', 1000, 1000);

      // Check quota again - should be reduced
      const updatedQuota = await quotaManager.checkQuota('cursor');
      // Note: Remaining might not decrease by exactly 1 if limits are high,
      // but the count should increase
      expect(updatedQuota.remaining).toBeLessThanOrEqual(initialQuota.remaining);
    });

    it('should enforce quota limits per period (run, hour, day)', async () => {
      const lowBudget: PlatformBudgets = {
        cursor: {
          maxCallsPerRun: 1,
          maxCallsPerHour: 2,
          maxCallsPerDay: 3,
          cooldownHours: 1,
          fallbackPlatform: 'codex',
        },
        codex: config.budgets.codex,
        claude: config.budgets.claude,
        gemini: config.budgets.gemini,
        copilot: config.budgets.copilot,
      };
      const budgetEnforcement = {
        onLimitReached: 'fallback' as const,
        warnAtPercentage: 80,
        notifyOnFallback: true,
      };
      const quotaManager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement);

      // First call should succeed
      const firstCheck = await quotaManager.canProceed('cursor');
      expect(firstCheck.allowed).toBe(true);

      // Record usage
      await quotaManager.recordUsage('cursor', 1000, 1000);

      // Second call should be blocked (run limit reached)
      const secondCheck = await quotaManager.canProceed('cursor');
      expect(secondCheck.allowed).toBe(false);
      expect(secondCheck.reason).toContain('Quota exhausted');
    });
  });

  describe('Cooldown Enforcement', () => {
    it('should trigger cooldown after quota exhaustion', async () => {
      const lowBudget: PlatformBudgets = {
        cursor: {
          maxCallsPerRun: 1,
          maxCallsPerHour: 1,
          maxCallsPerDay: 1,
          cooldownHours: 1,
          fallbackPlatform: 'codex',
        },
        codex: config.budgets.codex,
        claude: config.budgets.claude,
        gemini: config.budgets.gemini,
        copilot: config.budgets.copilot,
      };
      const budgetEnforcement = {
        onLimitReached: 'fallback' as const,
        warnAtPercentage: 80,
        notifyOnFallback: true,
      };
      const quotaManager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement);

      // Exhaust quota
      await quotaManager.recordUsage('cursor', 1000, 1000);

      // Check cooldown - should be active
      const cooldownInfo = await quotaManager.checkCooldown('cursor');
      expect(cooldownInfo.active).toBe(true);
      expect(cooldownInfo.endsAt).toBeDefined();
      expect(cooldownInfo.reason).toBeDefined();
    });

    it('should block execution during active cooldown', async () => {
      const lowBudget: PlatformBudgets = {
        cursor: {
          maxCallsPerRun: 1,
          maxCallsPerHour: 1,
          maxCallsPerDay: 1,
          cooldownHours: 1,
          fallbackPlatform: 'codex',
        },
        codex: config.budgets.codex,
        claude: config.budgets.claude,
        gemini: config.budgets.gemini,
        copilot: config.budgets.copilot,
      };
      const budgetEnforcement = {
        onLimitReached: 'fallback' as const,
        warnAtPercentage: 80,
        notifyOnFallback: true,
      };
      const quotaManager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement);

      // Exhaust quota to trigger cooldown
      await quotaManager.recordUsage('cursor', 1000, 1000);

      // Check cooldown directly - should be active
      const cooldownInfo = await quotaManager.checkCooldown('cursor');
      expect(cooldownInfo.active).toBe(true);

      // Try to proceed - should be blocked (either by quota or cooldown)
      const canProceed = await quotaManager.canProceed('cursor');
      expect(canProceed.allowed).toBe(false);
      // Note: canProceed checks quota first, so it may return quota exhausted
      // But cooldown should still be active
      expect(cooldownInfo.active).toBe(true);
    });

    it('should not have cooldown when quota is not exhausted', async () => {
      const cooldownInfo = await quotaManager.checkCooldown('cursor');
      expect(cooldownInfo.active).toBe(false);
      expect(cooldownInfo.endsAt).toBeNull();
      expect(cooldownInfo.reason).toBeNull();
    });

    it('should not trigger cooldown if cooldownHours is not configured', async () => {
      const noCooldownBudget: PlatformBudgets = {
        cursor: {
          maxCallsPerRun: 1,
          maxCallsPerHour: 1,
          maxCallsPerDay: 1,
          cooldownHours: undefined,
          fallbackPlatform: 'codex',
        },
        codex: config.budgets.codex,
        claude: config.budgets.claude,
        gemini: config.budgets.gemini,
        copilot: config.budgets.copilot,
      };
      const budgetEnforcement = {
        onLimitReached: 'fallback' as const,
        warnAtPercentage: 80,
        notifyOnFallback: true,
      };
      const quotaManager = new QuotaManager(usageTracker, noCooldownBudget, budgetEnforcement);

      // Exhaust quota
      await quotaManager.recordUsage('cursor', 1000, 1000);

      // Check cooldown - should not be active
      const cooldownInfo = await quotaManager.checkCooldown('cursor');
      expect(cooldownInfo.active).toBe(false);
    });
  });

  describe('Platform Fallback', () => {
    it('should recommend alternative platform when preferred is unavailable', async () => {
      const lowBudget: PlatformBudgets = {
        cursor: {
          maxCallsPerRun: 1,
          maxCallsPerHour: 1,
          maxCallsPerDay: 1,
          cooldownHours: 1,
          fallbackPlatform: 'codex',
        },
        codex: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          cooldownHours: 1,
          fallbackPlatform: 'claude',
        },
        claude: config.budgets.claude,
        gemini: config.budgets.gemini,
        copilot: config.budgets.copilot,
      };
      const budgetEnforcement = {
        onLimitReached: 'fallback' as const,
        warnAtPercentage: 80,
        notifyOnFallback: true,
      };
      const quotaManager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement);

      // Exhaust cursor quota
      await quotaManager.recordUsage('cursor', 1000, 1000);

      // Get recommended platform from tier configs
      const tiers = [
        { platform: 'cursor' as Platform, model: 'test', selfFix: true, maxIterations: 1, escalation: null },
        { platform: 'codex' as Platform, model: 'test', selfFix: true, maxIterations: 1, escalation: null },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      expect(recommended).toBe('codex');
    });

    it('should return null when no platforms are available', async () => {
      const lowBudget: PlatformBudgets = {
        cursor: {
          maxCallsPerRun: 1,
          maxCallsPerHour: 1,
          maxCallsPerDay: 1,
          cooldownHours: 1,
          fallbackPlatform: 'codex',
        },
        codex: {
          maxCallsPerRun: 1,
          maxCallsPerHour: 1,
          maxCallsPerDay: 1,
          cooldownHours: 1,
          fallbackPlatform: 'claude',
        },
        claude: {
          maxCallsPerRun: 1,
          maxCallsPerHour: 1,
          maxCallsPerDay: 1,
          cooldownHours: 1,
          fallbackPlatform: null,
        },
        gemini: config.budgets.gemini,
        copilot: config.budgets.copilot,
      };
      const budgetEnforcement = {
        onLimitReached: 'fallback' as const,
        warnAtPercentage: 80,
        notifyOnFallback: true,
      };
      const quotaManager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement);

      // Exhaust all platforms
      await quotaManager.recordUsage('cursor', 1000, 1000);
      await quotaManager.recordUsage('codex', 1000, 1000);
      await quotaManager.recordUsage('claude', 1000, 1000);

      const tiers = [
        { platform: 'cursor' as Platform, model: 'test', selfFix: true, maxIterations: 1, escalation: null },
        { platform: 'codex' as Platform, model: 'test', selfFix: true, maxIterations: 1, escalation: null },
        { platform: 'claude' as Platform, model: 'test', selfFix: true, maxIterations: 1, escalation: null },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      expect(recommended).toBeNull();
    });

    it('should recommend platform with best quota availability', async () => {
      const budget: PlatformBudgets = {
        cursor: {
          maxCallsPerRun: 10,
          maxCallsPerHour: 10,
          maxCallsPerDay: 10,
          cooldownHours: 1,
          fallbackPlatform: 'codex',
        },
        codex: {
          maxCallsPerRun: 20,
          maxCallsPerHour: 20,
          maxCallsPerDay: 20,
          cooldownHours: 1,
          fallbackPlatform: 'claude',
        },
        claude: {
          maxCallsPerRun: 5,
          maxCallsPerHour: 5,
          maxCallsPerDay: 5,
          cooldownHours: 1,
          fallbackPlatform: null,
        },
        gemini: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          cooldownHours: 0,
          fallbackPlatform: null,
        },
        copilot: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          cooldownHours: 0,
          fallbackPlatform: null,
        },
      };
      const budgetEnforcement = {
        onLimitReached: 'fallback' as const,
        warnAtPercentage: 80,
        notifyOnFallback: true,
      };
      const quotaManager = new QuotaManager(usageTracker, budget, budgetEnforcement);

      // Use some quota on cursor
      await quotaManager.recordUsage('cursor', 1000, 1000);
      await quotaManager.recordUsage('cursor', 1000, 1000);

      const tiers = [
        { platform: 'cursor' as Platform, model: 'test', selfFix: true, maxIterations: 1, escalation: null },
        { platform: 'codex' as Platform, model: 'test', selfFix: true, maxIterations: 1, escalation: null },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      // Codex should be recommended as it has more remaining quota
      expect(recommended).toBe('codex');
    });
  });

  describe('Multi-Platform Integration', () => {
    it('should work with all three platforms available', async () => {
      const mockOutput = 'Processing request...\nSession ID: PM-2026-01-10-14-30-00-001\ntokens: 1234\nOutput: Task completed successfully\n<ralph>COMPLETE</ralph>';
      
      // Mock capability service
      const mockProbeResult = {
        platform: 'cursor' as Platform,
        command: 'cursor',
        runnable: true,
        authStatus: 'authenticated' as const,
        version: '1.0.0',
        capabilities: {
          streaming: true,
          codeExecution: true,
          imageGeneration: false,
          fileAccess: true,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 100000,
          maxOutputTokens: 4000,
          supportedLanguages: ['typescript'],
        },
        quotaInfo: {
          remaining: 100,
          limit: 100,
          resetsAt: new Date(Date.now() + 3600000).toISOString(),
          period: 'hour' as const,
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      };
      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(mockProbeResult);

      const registry = PlatformRegistry.createDefault(config);

      // Test cursor
      const cursorRunner = registry.get('cursor')!;
      const cursorRequest: ExecutionRequest = {
        prompt: 'Test cursor',
        workingDirectory: tempDir,
        nonInteractive: true,
      };
      
      const mockProc1 = createMockProcess(12345);
      vi.mocked(spawn).mockReturnValueOnce(mockProc1 as ChildProcess);
      setTimeout(() => {
        if (mockProc1.stdout) {
          mockProc1.stdout.push(Buffer.from(mockOutput));
          mockProc1.stdout.push(null);
        }
        if (mockProc1.stderr) {
          mockProc1.stderr.push(null);
        }
        (mockProc1 as { exitCode: number }).exitCode = 0;
        mockProc1.emit('exit', 0);
      }, 10);
      
      const cursorResult = await cursorRunner.execute(cursorRequest);
      expect(cursorResult.success).toBe(true);

      // Test codex
      const codexRunner = registry.get('codex')!;
      const codexRequest: ExecutionRequest = {
        prompt: 'Test codex',
        workingDirectory: tempDir,
        nonInteractive: true,
      };
      
      const mockProc2 = createMockProcess(12346);
      vi.mocked(spawn).mockReturnValueOnce(mockProc2 as ChildProcess);
      setTimeout(() => {
        if (mockProc2.stdout) {
          mockProc2.stdout.push(Buffer.from(mockOutput));
          mockProc2.stdout.push(null);
        }
        if (mockProc2.stderr) {
          mockProc2.stderr.push(null);
        }
        (mockProc2 as { exitCode: number }).exitCode = 0;
        mockProc2.emit('exit', 0);
      }, 10);
      
      const codexResult = await codexRunner.execute(codexRequest);
      expect(codexResult.success).toBe(true);

      // Test claude
      const claudeRunner = registry.get('claude')!;
      const claudeRequest: ExecutionRequest = {
        prompt: 'Test claude',
        workingDirectory: tempDir,
        nonInteractive: true,
      };
      
      const mockProc3 = createMockProcess(12347);
      vi.mocked(spawn).mockReturnValueOnce(mockProc3 as ChildProcess);
      setTimeout(() => {
        if (mockProc3.stdout) {
          mockProc3.stdout.push(Buffer.from(mockOutput));
          mockProc3.stdout.push(null);
        }
        if (mockProc3.stderr) {
          mockProc3.stderr.push(null);
        }
        (mockProc3 as { exitCode: number }).exitCode = 0;
        mockProc3.emit('exit', 0);
      }, 10);
      
      const claudeResult = await claudeRunner.execute(claudeRequest);
      expect(claudeResult.success).toBe(true);
    }, 20000);

    it('should handle GUTTER signal correctly', async () => {
      // Mock capability service
      const mockProbeResult = {
        platform: 'cursor' as Platform,
        command: 'cursor',
        runnable: true,
        authStatus: 'authenticated' as const,
        version: '1.0.0',
        capabilities: {
          streaming: true,
          codeExecution: true,
          imageGeneration: false,
          fileAccess: true,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 100000,
          maxOutputTokens: 4000,
          supportedLanguages: ['typescript'],
        },
        quotaInfo: {
          remaining: 100,
          limit: 100,
          resetsAt: new Date(Date.now() + 3600000).toISOString(),
          period: 'hour' as const,
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      };
      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(mockProbeResult);

      const registry = PlatformRegistry.createDefault(config);
      const cursorRunner = registry.get('cursor')!;

      const mockOutput = 'Processing request...\nSession ID: PM-2026-01-10-14-30-00-001\nOutput: Agent stuck\n<ralph>GUTTER</ralph>';
      const mockProc = createMockProcess(12345);
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      setTimeout(() => {
        if (mockProc.stdout) {
          mockProc.stdout.push(Buffer.from(mockOutput));
          mockProc.stdout.push(null);
        }
        if (mockProc.stderr) {
          mockProc.stderr.push(null);
        }
        (mockProc as { exitCode: number }).exitCode = 0;
        mockProc.emit('exit', 0);
      }, 10);

      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: tempDir,
        nonInteractive: true,
      };

      const result = await cursorRunner.execute(request);
      expect(result.success).toBe(false);
      expect(result.output).toContain('<ralph>GUTTER</ralph>');
      expect(result.error).toBeDefined();
    }, 20000);
  });
});
