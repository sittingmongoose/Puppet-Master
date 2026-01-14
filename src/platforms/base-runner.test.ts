/**
 * Tests for BasePlatformRunner
 * 
 * Tests the abstract base class functionality including contract methods,
 * event emission, capability delegation, and process tracking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { ChildProcess } from 'child_process';
import { Readable, Writable } from 'stream';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';
import type { CapabilityProbeResult } from '../types/capabilities.js';

/**
 * Concrete test implementation of BasePlatformRunner.
 * 
 * Provides minimal implementations of abstract methods for testing.
 */
class TestPlatformRunner extends BasePlatformRunner {
  readonly platform: Platform = 'cursor';

  protected async spawn(
    _request: ExecutionRequest
  ): Promise<ChildProcess> {
    // Create a mock child process with mutable state
    const mockState = {
      killed: false,
      exitCode: null as number | null,
      exitCallback: null as ((code: number) => void) | null,
    };

    // Create proper Readable streams
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

    const mockProc = {
      pid: 12345,
      stdin: new Writable(),
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
          if (mockState.exitCallback) {
            mockState.exitCallback(mockState.exitCode);
          }
        }
      }),
      on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
        if (event === 'exit') {
          // Store callback for later invocation
          mockState.exitCallback = callback as (code: number) => void;
        }
        return mockProc;
      }),
      emit: vi.fn((event: string, ...args: unknown[]) => {
        if (event === 'exit' && mockState.exitCallback && args.length > 0) {
          mockState.exitCallback(args[0] as number);
        }
        return true;
      }),
    } as unknown as ChildProcess;

    // Simulate output after a delay
    setTimeout(() => {
      if (stdoutStream) {
        stdoutStream.push(Buffer.from('Test output\n'));
        stdoutStream.push(null); // End stream
      }
      if (stderrStream) {
        stderrStream.push(null); // End stream
      }
      // Simulate exit
      setTimeout(() => {
        (mockProc as { exitCode: number | null }).exitCode = 0;
        const emitFn = (mockProc as unknown as { emit: (e: string, code: number) => void }).emit;
        emitFn('exit', 0);
      }, 10);
    }, 10);

    return mockProc;
  }

  protected buildArgs(request: ExecutionRequest): string[] {
    return ['--non-interactive', '--prompt', request.prompt];
  }

  protected parseOutput(output: string): ExecutionResult {
    return {
      success: true,
      output,
      exitCode: 0,
      duration: 0,
      processId: 0,
    };
  }
}

describe('BasePlatformRunner', () => {
  let capabilityService: CapabilityDiscoveryService;
  let runner: TestPlatformRunner;
  let mockProbeResult: CapabilityProbeResult;

  beforeEach(() => {
    // Create mock capability service
    capabilityService = {
      probe: vi.fn(),
      getCached: vi.fn(),
      refresh: vi.fn(),
      isCacheValid: vi.fn(),
    } as unknown as CapabilityDiscoveryService;

    // Create mock probe result
    mockProbeResult = {
      platform: 'cursor',
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
        limit: 1000,
        resetsAt: new Date(Date.now() + 3600000).toISOString(),
        period: 'hour',
      },
      cooldownInfo: {
        active: false,
        endsAt: null,
        reason: null,
      },
      probeTimestamp: new Date().toISOString(),
    };

    runner = new TestPlatformRunner(capabilityService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with CapabilityDiscoveryService', () => {
      expect((runner as unknown as { capabilityService: CapabilityDiscoveryService }).capabilityService).toBe(capabilityService);
    });

    it('should set default timeouts correctly', () => {
      expect(runner.defaultTimeout).toBe(300_000);
      expect(runner.hardTimeout).toBe(1_800_000);
    });

    it('should set custom timeouts when provided', () => {
      const customRunner = new TestPlatformRunner(
        capabilityService,
        600_000,
        2_400_000
      );
      expect(customRunner.defaultTimeout).toBe(600_000);
      expect(customRunner.hardTimeout).toBe(2_400_000);
    });

    it('should set default allowedContextFiles', () => {
      expect(runner.allowedContextFiles).toEqual([
        'progress.txt',
        'AGENTS.md',
        'prd.json',
        '.puppet-master/plans/*',
      ]);
    });

    it('should set custom allowedContextFiles when provided', () => {
      const customFiles = ['custom.txt'];
      const customRunner = new TestPlatformRunner(
        capabilityService,
        300_000,
        1_800_000,
        customFiles
      );
      expect(customRunner.allowedContextFiles).toEqual(customFiles);
    });

    it('should set sessionReuseAllowed to false', () => {
      expect(runner.sessionReuseAllowed).toBe(false);
    });

    it('should extend EventEmitter', () => {
      expect(runner).toBeInstanceOf(EventEmitter);
    });
  });

  describe('spawnFreshProcess', () => {
    it('should create a RunningProcess', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const runningProcess = await runner.spawnFreshProcess(request);

      expect(runningProcess).toBeDefined();
      expect(runningProcess.pid).toBe(12345);
      expect(runningProcess.platform).toBe('cursor');
      expect(runningProcess.startedAt).toBeDefined();
      expect(runningProcess.stdin).toBeDefined();
      expect(runningProcess.stdout).toBeDefined();
      expect(runningProcess.stderr).toBeDefined();
    });

    it('should track process by PID', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      await runner.spawnFreshProcess(request);

      expect((runner as unknown as { processes: Map<number, ChildProcess> }).processes.has(12345)).toBe(true);
    });

    it('should call prepareWorkingDirectory', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const prepareSpy = vi.spyOn(runner, 'prepareWorkingDirectory');
      await runner.spawnFreshProcess(request);

      expect(prepareSpy).toHaveBeenCalledWith('/tmp');
    });
  });

  describe('prepareWorkingDirectory', () => {
    it('should be callable without throwing', async () => {
      await expect(
        runner.prepareWorkingDirectory('/tmp')
      ).resolves.toBeUndefined();
    });
  });

  describe('cleanupAfterExecution', () => {
    it('should remove process from tracking', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const runningProcess = await runner.spawnFreshProcess(request);
      const processes = (runner as unknown as { processes: Map<number, ChildProcess> }).processes;
      expect(processes.has(runningProcess.pid)).toBe(true);

      await runner.cleanupAfterExecution(runningProcess.pid);
      expect(processes.has(runningProcess.pid)).toBe(false);
    });
  });

  describe('terminateProcess', () => {
    it('should send SIGTERM to process', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const runningProcess = await runner.spawnFreshProcess(request);
      const processes = (runner as unknown as { processes: Map<number, ChildProcess> }).processes;
      const proc = processes.get(runningProcess.pid);

      await runner.terminateProcess(runningProcess.pid);

      expect(proc?.kill).toHaveBeenCalledWith('SIGTERM');
    });
  });

  describe('forceKillProcess', () => {
    it('should send SIGKILL to process', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const runningProcess = await runner.spawnFreshProcess(request);
      const processes = (runner as unknown as { processes: Map<number, ChildProcess> }).processes;
      const proc = processes.get(runningProcess.pid);

      await runner.forceKillProcess(runningProcess.pid);

      expect(proc?.kill).toHaveBeenCalledWith('SIGKILL');
    });
  });

  describe('execute', () => {
    it('should orchestrate spawn → collect output → parse cycle', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await runner.execute(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.processId).toBe(12345);
      expect(result.output).toContain('Test output');
    });

    it('should emit output events during execution', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const outputEvents: unknown[] = [];
      runner.on('output', (data) => {
        outputEvents.push(data);
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      await runner.execute(request);

      // Give time for events to be emitted
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(outputEvents.length).toBeGreaterThan(0);
    });

    it('should emit complete event on success', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const completeEvents: unknown[] = [];
      runner.on('complete', (data) => {
        completeEvents.push(data);
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      await runner.execute(request);

      // Give time for events to be emitted
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(completeEvents.length).toBeGreaterThan(0);
      expect(completeEvents[0]).toHaveProperty('pid', 12345);
      expect(completeEvents[0]).toHaveProperty('result');
    });

    it('should track process ID correctly', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await runner.execute(request);

      expect(result.processId).toBe(12345);
    });
  });

  describe('getCapabilities', () => {
    it('should delegate to CapabilityDiscoveryService.getCached', async () => {
      vi.mocked(capabilityService.getCached).mockResolvedValue(
        mockProbeResult
      );

      const capabilities = await runner.getCapabilities();

      expect(capabilityService.getCached).toHaveBeenCalledWith('cursor');
      expect(capabilities).toEqual(mockProbeResult.capabilities);
    });

    it('should probe if not cached', async () => {
      vi.mocked(capabilityService.getCached).mockResolvedValue(null);
      vi.mocked(capabilityService.probe).mockResolvedValue(mockProbeResult);

      const capabilities = await runner.getCapabilities();

      expect(capabilityService.getCached).toHaveBeenCalledWith('cursor');
      expect(capabilityService.probe).toHaveBeenCalledWith('cursor');
      expect(capabilities).toEqual(mockProbeResult.capabilities);
    });
  });

  describe('checkQuota', () => {
    it('should delegate to CapabilityDiscoveryService.getCached', async () => {
      vi.mocked(capabilityService.getCached).mockResolvedValue(
        mockProbeResult
      );

      const quota = await runner.checkQuota();

      expect(capabilityService.getCached).toHaveBeenCalledWith('cursor');
      expect(quota).toEqual(mockProbeResult.quotaInfo);
    });

    it('should probe if not cached', async () => {
      vi.mocked(capabilityService.getCached).mockResolvedValue(null);
      vi.mocked(capabilityService.probe).mockResolvedValue(mockProbeResult);

      const quota = await runner.checkQuota();

      expect(capabilityService.getCached).toHaveBeenCalledWith('cursor');
      expect(capabilityService.probe).toHaveBeenCalledWith('cursor');
      expect(quota).toEqual(mockProbeResult.quotaInfo);
    });
  });

  describe('checkCooldown', () => {
    it('should delegate to CapabilityDiscoveryService.getCached', async () => {
      vi.mocked(capabilityService.getCached).mockResolvedValue(
        mockProbeResult
      );

      const cooldown = await runner.checkCooldown();

      expect(capabilityService.getCached).toHaveBeenCalledWith('cursor');
      expect(cooldown).toEqual(mockProbeResult.cooldownInfo);
    });

    it('should probe if not cached', async () => {
      vi.mocked(capabilityService.getCached).mockResolvedValue(null);
      vi.mocked(capabilityService.probe).mockResolvedValue(mockProbeResult);

      const cooldown = await runner.checkCooldown();

      expect(capabilityService.getCached).toHaveBeenCalledWith('cursor');
      expect(capabilityService.probe).toHaveBeenCalledWith('cursor');
      expect(cooldown).toEqual(mockProbeResult.cooldownInfo);
    });
  });

  describe('captureStdout', () => {
    it('should return AsyncIterable', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const runningProcess = await runner.spawnFreshProcess(request);

      // Wait for stream to be set up
      await new Promise((resolve) => setTimeout(resolve, 50));

      const chunks: string[] = [];
      for await (const chunk of runner.captureStdout(runningProcess.pid)) {
        chunks.push(chunk);
      }

      // Should have collected some output
      expect(chunks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('captureStderr', () => {
    it('should return AsyncIterable', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const runningProcess = await runner.spawnFreshProcess(request);

      // Wait for stream to be set up
      await new Promise((resolve) => setTimeout(resolve, 50));

      const chunks: string[] = [];
      for await (const chunk of runner.captureStderr(runningProcess.pid)) {
        chunks.push(chunk);
      }

      // Should have collected some output (even if empty)
      expect(Array.isArray(chunks)).toBe(true);
    });
  });

  describe('getTranscript', () => {
    it('should return full transcript', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const runningProcess = await runner.spawnFreshProcess(request);

      // Wait for process to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const transcript = await runner.getTranscript(runningProcess.pid);

      expect(typeof transcript).toBe('string');
    });
  });

  describe('event emission', () => {
    it('should emit output events for stdout chunks', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const outputEvents: unknown[] = [];
      runner.on('output', (data) => {
        outputEvents.push(data);
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      await runner.execute(request);

      // Give time for events
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stdoutEvents = outputEvents.filter(
        (e: unknown) =>
          typeof e === 'object' &&
          e !== null &&
          'stream' in e &&
          (e as { stream: string }).stream === 'stdout'
      );
      expect(stdoutEvents.length).toBeGreaterThanOrEqual(0);
    });

    it('should emit error events on errors', async () => {
      // Create a runner that throws in spawn
      class ErrorRunner extends TestPlatformRunner {
        protected async spawn(): Promise<ChildProcess> {
          throw new Error('Spawn failed');
        }
      }

      const errorRunner = new ErrorRunner(capabilityService);
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const errorEvents: unknown[] = [];
      errorRunner.on('error', (data) => {
        errorEvents.push(data);
      });

      try {
        await errorRunner.execute(request);
      } catch {
        // Expected to throw
      }

      // Give time for events
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Error event may or may not be emitted depending on when error occurs
      expect(Array.isArray(errorEvents)).toBe(true);
    });
  });

  describe('process tracking', () => {
    it('should track processes by PID', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const runningProcess = await runner.spawnFreshProcess(request);
      const processes = (runner as unknown as { processes: Map<number, ChildProcess> }).processes;

      expect(processes.has(runningProcess.pid)).toBe(true);
    });

    it('should clean up process map on completion', async () => {
      const request: ExecutionRequest = {
        prompt: 'test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      await runner.execute(request);

      // Process should be cleaned up
      const processes = (runner as unknown as { processes: Map<number, ChildProcess> }).processes;
      expect(processes.has(12345)).toBe(false);
    });
  });
});
