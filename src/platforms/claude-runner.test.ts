/**
 * Tests for ClaudeRunner
 * 
 * Tests Claude-specific platform runner functionality including
 * CLI argument building, output parsing, and process spawning.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable, Writable } from 'stream';
import type { ChildProcess } from 'child_process';
import { ClaudeRunner } from './claude-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
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

describe('ClaudeRunner', () => {
  let capabilityService: CapabilityDiscoveryService;
  let runner: ClaudeRunner;

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

    runner = new ClaudeRunner(capabilityService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default command', () => {
      const defaultRunner = new ClaudeRunner(capabilityService);
      expect(defaultRunner.platform).toBe('claude');
    });

    it('should create instance with custom command', () => {
      const customRunner = new ClaudeRunner(capabilityService, 'custom-claude');
      expect(customRunner.platform).toBe('claude');
    });

    it('should create instance with custom timeouts', () => {
      const timeoutRunner = new ClaudeRunner(
        capabilityService,
        'claude',
        600_000,
        3_600_000
      );
      expect(timeoutRunner.defaultTimeout).toBe(600_000);
      expect(timeoutRunner.hardTimeout).toBe(3_600_000);
    });
  });

  describe('buildArgs', () => {
    it('should build args with -p flag and prompt for non-interactive mode', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('-p');
      expect(args).toContain('Test prompt');
      expect(args.indexOf('-p')).toBeLessThan(args.indexOf('Test prompt'));
    });

    it('should omit prompt argument for large prompts and rely on stdin', () => {
      const largePrompt = 'a'.repeat(50_000);
      const request: ExecutionRequest = {
        prompt: largePrompt,
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('-p');
      expect(args).not.toContain(largePrompt);
    });

    it('should include -p flag without prompt if prompt not provided', () => {
      const request: ExecutionRequest = {
        prompt: '',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('-p');
      expect(args).not.toContain('');
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
        model: 'claude-sonnet-4.5',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--model');
      expect(args).toContain('claude-sonnet-4.5');
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

    it('should include --max-turns flag when maxTurns is specified', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        maxTurns: 5,
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--max-turns');
      expect(args).toContain('5');
    });

    it('should build correct args for full request', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        model: 'claude-sonnet-4.5',
        maxTurns: 10,
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('-p');
      expect(args).toContain('Test prompt');
      expect(args).toContain('--no-session-persistence');
      expect(args).toContain('--model');
      expect(args).toContain('claude-sonnet-4.5');
      expect(args).toContain('--max-turns');
      expect(args).toContain('10');
    });

    it('should include --no-session-persistence in non-interactive mode', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--no-session-persistence');
    });

    it('should include --output-format when json or stream-json requested', () => {
      const reqJson: ExecutionRequest = {
        prompt: 'Test',
        workingDirectory: '/tmp',
        nonInteractive: true,
        outputFormat: 'json',
      };
      const argsJson = runner['buildArgs'](reqJson);
      expect(argsJson).toContain('--output-format');
      expect(argsJson).toContain('json');

      const reqStream: ExecutionRequest = {
        prompt: 'Test',
        workingDirectory: '/tmp',
        nonInteractive: true,
        outputFormat: 'stream-json',
      };
      const argsStream = runner['buildArgs'](reqStream);
      expect(argsStream).toContain('--output-format');
      expect(argsStream).toContain('stream-json');
    });

    it('should not include --output-format when text or unspecified', () => {
      const reqText: ExecutionRequest = {
        prompt: 'Test',
        workingDirectory: '/tmp',
        nonInteractive: true,
        outputFormat: 'text',
      };
      expect(runner['buildArgs'](reqText)).not.toContain('--output-format');

      const reqNone: ExecutionRequest = {
        prompt: 'Test',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };
      expect(runner['buildArgs'](reqNone)).not.toContain('--output-format');
    });

    it('should include --permission-mode and --allowedTools when provided', () => {
      const request: ExecutionRequest = {
        prompt: 'Test',
        workingDirectory: '/tmp',
        nonInteractive: true,
        permissionMode: 'bypassPermissions',
        allowedTools: 'Read,Edit,Bash',
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--permission-mode');
      expect(args).toContain('bypassPermissions');
      expect(args).toContain('--allowedTools');
      expect(args).toContain('Read,Edit,Bash');
    });

    it('should include --append-system-prompt when systemPrompt provided', () => {
      const request: ExecutionRequest = {
        prompt: 'Test',
        workingDirectory: '/tmp',
        nonInteractive: true,
        systemPrompt: 'Always use TypeScript.',
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--append-system-prompt');
      expect(args).toContain('Always use TypeScript.');
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

    it('should handle case-insensitive COMPLETE signal', () => {
      const output = 'Some output\n<ralph>complete</ralph>\nMore output';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(true);
    });

    it('should handle case-insensitive GUTTER signal', () => {
      const output = 'Some output\n<ralph>gutter</ralph>\nMore output';
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

    it('should extract token count if present (various formats)', () => {
      const testCases = [
        { output: 'Tokens: 1234\n<ralph>COMPLETE</ralph>', expected: 1234 },
        { output: 'tokens=5678\n<ralph>COMPLETE</ralph>', expected: 5678 },
        { output: 'tokens 9012\n<ralph>COMPLETE</ralph>', expected: 9012 },
        { output: '"tokens": 3456\n<ralph>COMPLETE</ralph>', expected: 3456 },
      ];

      for (const testCase of testCases) {
        const result = runner['parseOutput'](testCase.output);
        expect(result.tokensUsed).toBe(testCase.expected);
      }
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

    it('should handle JSON format output', () => {
      const output = '{"type":"output","data":"Task completed"}';
      const result = runner['parseOutput'](output);

      expect(result.output).toBe(output);
      expect(result.success).toBe(true);
    });

    it('should handle JSONL format output', () => {
      const output = `{"type":"output","data":"Task started"}
{"type":"output","data":"Working"}
{"type":"complete","data":"<ralph>COMPLETE</ralph>"}`;
      const result = runner['parseOutput'](output);

      expect(result.output).toBe(output);
      expect(result.success).toBe(true);
    });
  });

  describe('spawn', () => {
    it('should spawn claude with correct command', async () => {
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
      expect(callArgs[0]).toBe('claude');
      const args = callArgs[1] as string[];
      expect(args).toEqual(expect.arrayContaining(['-p', 'Test prompt', '--no-session-persistence']));
      expect(callArgs[2]).toMatchObject({
        cwd: '/tmp',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    });

    it('should use custom command if provided', async () => {
      const customRunner = new ClaudeRunner(capabilityService, 'custom-claude');
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await customRunner['spawn'](request);

      expect(spawn).toHaveBeenCalled();
      expect(vi.mocked(spawn).mock.calls[0][0]).toBe('custom-claude');
    });

    it('should write prompt to stdin if not passed via -p flag', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt content',
        workingDirectory: '/tmp',
        nonInteractive: false, // Not non-interactive, so prompt won't be in args
      };

      const mockProc = createMockProcess();
      const writeSpy = vi.spyOn(mockProc.stdin as Writable, 'write');
      const endSpy = vi.spyOn(mockProc.stdin as Writable, 'end');
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await runner['spawn'](request);

      expect(writeSpy).toHaveBeenCalledWith('Test prompt content', 'utf-8');
      expect(endSpy).toHaveBeenCalled();
    });

    it('should not write to stdin if prompt is passed via -p flag', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt content',
        workingDirectory: '/tmp',
        nonInteractive: true, // Non-interactive, so prompt will be in args
      };

      const mockProc = createMockProcess();
      const writeSpy = vi.spyOn(mockProc.stdin as Writable, 'write');
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await runner['spawn'](request);

      // Should not write to stdin since prompt is in args
      expect(writeSpy).not.toHaveBeenCalled();
    });

    it('should write large prompt to stdin when omitted from -p args', async () => {
      const largePrompt = 'a'.repeat(50_000);
      const request: ExecutionRequest = {
        prompt: largePrompt,
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const mockProc = createMockProcess();
      const writeSpy = vi.spyOn(mockProc.stdin as Writable, 'write');
      const endSpy = vi.spyOn(mockProc.stdin as Writable, 'end');
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await runner['spawn'](request);

      expect(spawn).toHaveBeenCalled();
      const callArgs = vi.mocked(spawn).mock.calls[0];
      expect(callArgs[1]).toContain('-p');
      expect(callArgs[1]).not.toContain(largePrompt);

      expect(writeSpy).toHaveBeenCalledWith(largePrompt, 'utf-8');
      expect(endSpy).toHaveBeenCalled();
    });

    it('should include model in args when specified', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        model: 'claude-sonnet-4.5',
        nonInteractive: true,
      };

      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as ChildProcess);

      await runner['spawn'](request);

      expect(spawn).toHaveBeenCalled();
      const callArgs = vi.mocked(spawn).mock.calls[0];
      expect(callArgs[1]).toEqual(
        expect.arrayContaining(['--model', 'claude-sonnet-4.5'])
      );
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

  describe('integration with BasePlatformRunner', () => {
    it('should extend BasePlatformRunner', () => {
      expect(runner).toBeInstanceOf(ClaudeRunner);
      // Check that it has BasePlatformRunner methods
      expect(typeof runner.spawnFreshProcess).toBe('function');
      expect(typeof runner.cleanupAfterExecution).toBe('function');
      expect(typeof runner.terminateProcess).toBe('function');
    });

    it('should have sessionReuseAllowed set to false', () => {
      expect(runner.sessionReuseAllowed).toBe(false);
    });

    it('should have default allowedContextFiles', () => {
      expect(runner.allowedContextFiles).toEqual([
        'progress.txt',
        'AGENTS.md',
        'prd.json',
        '.puppet-master/plans/*',
      ]);
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
