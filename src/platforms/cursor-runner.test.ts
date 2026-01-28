/**
 * Tests for CursorRunner
 * 
 * Tests Cursor-specific platform runner functionality including
 * CLI argument building, output parsing, and process spawning.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable, Writable } from 'stream';
import type { ChildProcess } from 'child_process';
import { CursorRunner } from './cursor-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { PLATFORM_COMMANDS } from './constants.js';
import type {
  ExecutionRequest,
} from '../types/platforms.js';

// Mock child_process module
vi.mock('child_process', async () => {
  const actual = await vi.importActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    spawn: vi.fn(),
  };
});

// Import spawn after mock is set up
import { spawn } from 'child_process';

describe('CursorRunner', () => {
  let capabilityService: CapabilityDiscoveryService;
  let runner: CursorRunner;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    vi.mocked(spawn).mockClear();

    // Create mock capability service
    capabilityService = {
      probe: vi.fn(),
      getCached: vi.fn(),
      refresh: vi.fn(),
      isCacheValid: vi.fn(),
    } as unknown as CapabilityDiscoveryService;

    runner = new CursorRunner(capabilityService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default command', () => {
      const defaultRunner = new CursorRunner(capabilityService);
      expect(defaultRunner.platform).toBe('cursor');
    });

    it('should create instance with custom command', () => {
      const customRunner = new CursorRunner(capabilityService, 'custom-cursor');
      expect(customRunner.platform).toBe('cursor');
    });

    it('should create instance with custom timeouts', () => {
      const timeoutRunner = new CursorRunner(
        capabilityService,
        'cursor-agent',
        600_000,
        3_600_000
      );
      expect(timeoutRunner.defaultTimeout).toBe(600_000);
      expect(timeoutRunner.hardTimeout).toBe(3_600_000);
    });
  });

  describe('buildArgs', () => {
    it('should build args with -p flag for non-interactive mode', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('-p');
    });

    it('should not include -p flag for interactive mode', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: false,
      };

      const args = runner['buildArgs'](request);
      expect(args).not.toContain('-p');
    });

    it('should include --model flag when model is specified', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        model: 'sonnet-4.5-thinking',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--model');
      expect(args).toContain('sonnet-4.5-thinking');
    });

    it('should not include --model flag when model is not specified', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).not.toContain('--model');
    });

    it('should build correct args for full request', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        model: 'auto',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toEqual(['-p', 'Test prompt', '--model', 'auto']);
    });

    it('should include plan mode flag when enabled and supported', () => {
      (runner as unknown as { modeFlagSupport: boolean | null }).modeFlagSupport = true;

      const request: ExecutionRequest = {
        prompt: 'Plan this',
        workingDirectory: '/tmp',
        model: 'auto',
        planMode: true,
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--mode=plan');
    });
  });

  describe('parseOutput', () => {
    it('should detect COMPLETE signal and set success to true', () => {
      const output = 'Some output\n<ralph>COMPLETE</ralph>\nMore output';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(true);
      expect(result.output).toBe(output);
    });

    it('should detect GUTTER signal and set success to false', () => {
      const output = 'Some output\n<ralph>GUTTER</ralph>\nMore output';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent signaled GUTTER - stuck and cannot proceed');
      expect(result.output).toBe(output);
    });

    it('should prioritize GUTTER over COMPLETE if both present', () => {
      const output = '<ralph>COMPLETE</ralph>\n<ralph>GUTTER</ralph>';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent signaled GUTTER - stuck and cannot proceed');
    });

    it('should extract session ID if present', () => {
      const output = 'Session: PM-2026-01-10-14-30-00-001\n<ralph>COMPLETE</ralph>';
      const result = runner['parseOutput'](output);

      expect(result.sessionId).toBe('PM-2026-01-10-14-30-00-001');
    });

    it('should not set sessionId if not present', () => {
      const output = 'Some output\n<ralph>COMPLETE</ralph>';
      const result = runner['parseOutput'](output);

      expect(result.sessionId).toBeUndefined();
    });

    it('should extract token count if present', () => {
      const output = 'Tokens: 1234\n<ralph>COMPLETE</ralph>';
      const result = runner['parseOutput'](output);

      expect(result.tokensUsed).toBe(1234);
    });

    it('should handle output without signals (default to success)', () => {
      const output = 'Some regular output';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(true);
      expect(result.output).toBe(output);
    });

    it('should set exitCode and duration to 0 (will be set by execute)', () => {
      const output = '<ralph>COMPLETE</ralph>';
      const result = runner['parseOutput'](output);

      expect(result.exitCode).toBe(0);
      expect(result.duration).toBe(0);
      expect(result.processId).toBe(0);
    });
  });

  describe('spawn', () => {
    it('should spawn cursor-agent with correct command', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      // Create mock process
      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await runner['spawn'](request);

      expect(spawn).toHaveBeenCalled();
      const callArgs = vi.mocked(spawn).mock.calls[0];
      expect(callArgs[0]).toBe(PLATFORM_COMMANDS.cursor);
      expect(callArgs[1]).toEqual(expect.arrayContaining(['-p']));
      expect(callArgs[2]).toMatchObject({
        cwd: '/tmp',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    });

    it('should use custom command if provided', async () => {
      const customRunner = new CursorRunner(capabilityService, 'custom-cursor');
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await customRunner['spawn'](request);

      expect(spawn).toHaveBeenCalled();
      expect(vi.mocked(spawn).mock.calls[0][0]).toBe('custom-cursor');
    });

    it('should write large prompt to stdin', async () => {
      const prompt = 'a'.repeat(40000);
      const request: ExecutionRequest = {
        prompt,
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const mockProc = createMockProcess();
      const writeSpy = vi.spyOn(mockProc.stdin as Writable, 'write');
      const endSpy = vi.spyOn(mockProc.stdin as Writable, 'end');
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await runner['spawn'](request);

      expect(writeSpy).toHaveBeenCalledWith(prompt);
      expect(endSpy).toHaveBeenCalled();
    });

    it('should prepend plan-first instruction when plan mode enabled but unsupported', async () => {
      // Force the internal support flag to false so we take the prompt fallback path.
      (runner as unknown as { modeFlagSupport: boolean | null }).modeFlagSupport = false;

      const request: ExecutionRequest = {
        prompt: 'Do the work',
        workingDirectory: '/tmp',
        nonInteractive: true,
        planMode: true,
      };

      const builtPrompt = (runner as unknown as { buildPrompt: (r: ExecutionRequest) => string }).buildPrompt(request);
      expect(builtPrompt).toContain('PLAN FIRST');
      expect(builtPrompt).toContain('Do the work');
    });

    it('should set CURSOR_NON_INTERACTIVE environment variable', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await runner['spawn'](request);

      expect(spawn).toHaveBeenCalled();
      const callArgs = vi.mocked(spawn).mock.calls[0];
      expect(callArgs[2].env).toMatchObject({
        CURSOR_NON_INTERACTIVE: '1',
      });
    });

    it('should preserve existing environment variables', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await runner['spawn'](request);

      expect(spawn).toHaveBeenCalled();
      const callArgs = vi.mocked(spawn).mock.calls[0];
      const env = callArgs[2].env;
      expect(env).toBeDefined();
      expect(env).toHaveProperty('CURSOR_NON_INTERACTIVE');
      if (env) {
        expect(Object.keys(env).length).toBeGreaterThan(1); // Should have more than just CURSOR_NON_INTERACTIVE
      }
    });
  });

  describe('execute (integration)', () => {
    it('should execute request and return result with COMPLETE signal', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      // Simulate output with COMPLETE signal
      setTimeout(() => {
        if (mockProc.stdout) {
          mockProc.stdout.push(Buffer.from('Output\n<ralph>COMPLETE</ralph>\n'));
          mockProc.stdout.push(null);
        }
        if (mockProc.stderr) {
          mockProc.stderr.push(null);
        }
        (mockProc as { exitCode: number }).exitCode = 0;
        mockProc.emit('exit', 0);
      }, 10);

      const result = await runner.execute(request);

      expect(result.success).toBe(true);
      expect(result.output).toContain('<ralph>COMPLETE</ralph>');
      expect(result.processId).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should execute request and return result with GUTTER signal', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      // Simulate output with GUTTER signal
      setTimeout(() => {
        if (mockProc.stdout) {
          mockProc.stdout.push(Buffer.from('Output\n<ralph>GUTTER</ralph>\n'));
          mockProc.stdout.push(null);
        }
        if (mockProc.stderr) {
          mockProc.stderr.push(null);
        }
        (mockProc as { exitCode: number }).exitCode = 1;
        mockProc.emit('exit', 1);
      }, 10);

      const result = await runner.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('GUTTER');
      expect(result.output).toContain('<ralph>GUTTER</ralph>');
    });
  });

  describe('fresh agent enforcement', () => {
    it('should create new process on each spawn call', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const mockProc1 = createMockProcess(1001);
      const mockProc2 = createMockProcess(1002);
      vi.mocked(spawn)
        .mockReturnValueOnce(mockProc1 as ChildProcess)
        .mockReturnValueOnce(mockProc2 as ChildProcess);

      await runner['spawn'](request);
      await runner['spawn'](request);

      expect(spawn).toHaveBeenCalledTimes(2);
      // Each call should create a new process
      expect(mockProc1.pid).not.toBe(mockProc2.pid);
    });
  });
});

  /**
   * Helper function to create a mock ChildProcess for testing.
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
      }
      return mockProc;
    }),
    emit: vi.fn((event: string, ...args: unknown[]) => {
      if (event === 'exit' && args.length > 0) {
        mockState.exitCode = args[0] as number;
        mockState.exitCallbacks.forEach((cb) => cb(args[0] as number));
      }
      return true;
    }),
  } as unknown as ChildProcess;

  return mockProc;
}
