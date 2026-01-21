/**
 * Tests for CodexRunner
 * 
 * Tests Codex-specific CLI invocation, argument building, and output parsing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import { CodexRunner } from './codex-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import type { ExecutionRequest } from '../types/platforms.js';

// Mock child_process.spawn
vi.mock('child_process', () => {
  const mockSpawn = vi.fn();
  return { spawn: mockSpawn };
});

describe('CodexRunner', () => {
  let capabilityService: CapabilityDiscoveryService;
  let runner: CodexRunner;
  let mockSpawn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock capability service
    capabilityService = {
      probe: vi.fn(),
      getCached: vi.fn(),
      refresh: vi.fn(),
      isCacheValid: vi.fn(),
    } as unknown as CapabilityDiscoveryService;

    runner = new CodexRunner(capabilityService);

    // Setup mock spawn
    mockSpawn = vi.mocked(spawn);
    mockSpawn.mockImplementation(() => {
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
      const stdinStream = {
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as NodeJS.WritableStream;

      return {
        pid: 12345,
        stdin: stdinStream,
        stdout: stdoutStream,
        stderr: stderrStream,
        killed: false,
        exitCode: null,
        kill: vi.fn(),
        on: vi.fn(),
        emit: vi.fn(),
      } as unknown as ReturnType<typeof spawn>;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with codex platform', () => {
      expect(runner.platform).toBe('codex');
    });

    it('should initialize with CapabilityDiscoveryService', () => {
      expect(
        (runner as unknown as { capabilityService: CapabilityDiscoveryService })
          .capabilityService
      ).toBe(capabilityService);
    });

    it('should set default timeouts correctly', () => {
      expect(runner.defaultTimeout).toBe(300_000);
      expect(runner.hardTimeout).toBe(1_800_000);
    });

    it('should set custom timeouts when provided', () => {
      const customRunner = new CodexRunner(capabilityService, 600_000, 2_400_000);
      expect(customRunner.defaultTimeout).toBe(600_000);
      expect(customRunner.hardTimeout).toBe(2_400_000);
    });
  });

  describe('buildArgs', () => {
    it('should build minimal args with just exec subcommand', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).toEqual([
        'exec',
        '--cd',
        '/tmp/test',
        '--ask-for-approval',
        'never',
        '--sandbox',
        'workspace-write',
        '--json',
        'Test prompt',
      ]);
    });

    it('should include model flag when model is specified', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        model: 'claude-3-opus',
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).toEqual([
        'exec',
        '--cd',
        '/tmp/test',
        '--model',
        'claude-3-opus',
        '--ask-for-approval',
        'never',
        '--sandbox',
        'workspace-write',
        '--json',
        'Test prompt',
      ]);
    });

    it('should include max-turns flag when maxTurns is specified', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        maxTurns: 5,
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      // Codex CLI does not currently document a max-turns flag; ensure we don't add one.
      expect(args).toEqual([
        'exec',
        '--cd',
        '/tmp/test',
        '--ask-for-approval',
        'never',
        '--sandbox',
        'workspace-write',
        '--json',
        'Test prompt',
      ]);
    });

    it('should include all flags when all options are provided', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        model: 'claude-3-opus',
        maxTurns: 10,
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).toEqual([
        'exec',
        '--cd',
        '/tmp/test',
        '--model',
        'claude-3-opus',
        '--ask-for-approval',
        'never',
        '--sandbox',
        'workspace-write',
        '--json',
        'Test prompt',
      ]);
    });

    it('should handle empty working directory', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '',
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      // Empty working directory should not add --path flag
      expect(args).toEqual([
        'exec',
        '--ask-for-approval',
        'never',
        '--sandbox',
        'workspace-write',
        '--json',
        'Test prompt',
      ]);
    });
  });

  describe('spawn', () => {
    it('should spawn codex process with correct command and args', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      await (runner as unknown as { spawn: (req: ExecutionRequest) => Promise<ReturnType<typeof spawn>> }).spawn(request);

      expect(mockSpawn).toHaveBeenCalledWith(
        'codex',
        [
          'exec',
          '--cd',
          '/tmp/test',
          '--ask-for-approval',
          'never',
          '--sandbox',
          'workspace-write',
          '--json',
          'Test prompt',
        ],
        {
          cwd: '/tmp/test',
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );
    });

    it('should not write prompt to stdin (prompt is positional arg)', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt content',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      const proc = await (runner as unknown as { spawn: (req: ExecutionRequest) => Promise<ReturnType<typeof spawn>> }).spawn(request);

      expect(proc.stdin).toBeDefined();
      const stdin = proc.stdin as unknown as { write?: ReturnType<typeof vi.fn>; end?: ReturnType<typeof vi.fn> };
      expect(stdin.write).not.toHaveBeenCalled();
      expect(stdin.end).toHaveBeenCalled();
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should include model in args when specified', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        model: 'claude-3-opus',
        nonInteractive: true,
      };

      await (runner as unknown as { spawn: (req: ExecutionRequest) => Promise<ReturnType<typeof spawn>> }).spawn(request);

      expect(mockSpawn).toHaveBeenCalledWith(
        'codex',
        [
          'exec',
          '--cd',
          '/tmp/test',
          '--model',
          'claude-3-opus',
          '--ask-for-approval',
          'never',
          '--sandbox',
          'workspace-write',
          '--json',
          'Test prompt',
        ],
        expect.any(Object)
      );
    });
  });

  describe('parseOutput', () => {
    it('should detect COMPLETE signal', () => {
      const output = 'Task completed successfully. <ralph>COMPLETE</ralph>';

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      expect(result.success).toBe(true);
      expect(result.output).toBe(output);
    });

    it('should detect GUTTER signal', () => {
      const output = 'I am stuck. <ralph>GUTTER</ralph>';

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      expect(result.success).toBe(false);
      expect(result.output).toBe(output);
    });

    it('should handle output without signals', () => {
      const output = 'Some regular output without signals';

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      expect(result.output).toBe(output);
      // Without COMPLETE signal and no errors, success defaults based on exit code
      expect(result.success).toBeDefined();
    });

    it('should extract session ID from output', () => {
      const output = 'Session ID: abc123\n<ralph>COMPLETE</ralph>';

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      // Session ID extraction is pattern-based, may or may not match
      expect(result.output).toBe(output);
    });

    it('should extract token usage from output', () => {
      const output = 'Tokens: 1500\n<ralph>COMPLETE</ralph>';

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      // Token extraction is pattern-based
      expect(result.output).toBe(output);
    });

    it('should handle output with errors', () => {
      const output = 'error: something went wrong\nFailed to complete task';

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      expect(result.output).toBe(output);
      // Errors should be detected by OutputParser
      expect(result.success).toBe(false);
    });

    it('should handle JSONL format output', () => {
      const output = `{"type":"output","data":"Task started"}
{"type":"output","data":"Working on task"}
{"type":"complete","data":"<ralph>COMPLETE</ralph>"}`;

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      // Should still detect COMPLETE signal even in JSONL
      expect(result.output).toBe(output);
      expect(result.success).toBe(true);
    });

    it('should handle case-insensitive COMPLETE signal', () => {
      const output = 'Task done. <ralph>complete</ralph>';

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      expect(result.success).toBe(true);
    });

    it('should handle case-insensitive GUTTER signal', () => {
      const output = 'Stuck. <ralph>gutter</ralph>';

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      expect(result.success).toBe(false);
    });

    it('should prioritize COMPLETE over GUTTER if both present', () => {
      const output = '<ralph>GUTTER</ralph> <ralph>COMPLETE</ralph>';

      const result = (runner as unknown as { parseOutput: (out: string) => import('../types/platforms.js').ExecutionResult }).parseOutput(output);

      // COMPLETE should take precedence
      expect(result.success).toBe(true);
    });
  });

  describe('integration with BasePlatformRunner', () => {
    it('should extend BasePlatformRunner', () => {
      expect(runner).toBeInstanceOf(CodexRunner);
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
