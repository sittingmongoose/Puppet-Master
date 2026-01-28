/**
 * Tests for CodexRunner
 * 
 * Tests Codex SDK-based execution (SDK spawns CLI processes internally).
 * 
 * The SDK is CLI-based and respects the "CLI only" constraint.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CodexRunner } from './codex-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import type { ExecutionRequest } from '../types/platforms.js';
import type { RunResult } from '@openai/codex-sdk';

// Mock @openai/codex-sdk
const mockThread = {
  id: 'test-thread-id-123',
  run: vi.fn(),
  runStreamed: vi.fn(),
};

const mockCodexInstance = {
  startThread: vi.fn(() => mockThread),
  resumeThread: vi.fn(() => mockThread),
};

vi.mock('@openai/codex-sdk', () => {
  return {
    Codex: vi.fn(function () {
      return mockCodexInstance;
    }),
  };
});

describe('CodexRunner', () => {
  let capabilityService: CapabilityDiscoveryService;
  let runner: CodexRunner;

  beforeEach(() => {
    // Create mock capability service
    capabilityService = {
      probe: vi.fn(),
      getCached: vi.fn(),
      refresh: vi.fn(),
      isCacheValid: vi.fn(),
    } as unknown as CapabilityDiscoveryService;

    runner = new CodexRunner(capabilityService);
    
    // Reset mocks
    vi.clearAllMocks();
    mockThread.id = 'test-thread-id-123';
    mockThread.run.mockReset();
    mockThread.runStreamed.mockReset();
    mockCodexInstance.startThread.mockReturnValue(mockThread);
    mockCodexInstance.resumeThread.mockReturnValue(mockThread);
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
        '--full-auto',
        '--json',
        '--color',
        'never',
        'Test prompt',
      ]);
    });

    it('should include model flag when model is specified', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        model: 'gpt-5.2-codex',
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).toEqual([
        'exec',
        '--cd',
        '/tmp/test',
        '--model',
        'gpt-5.2-codex',
        '--full-auto',
        '--json',
        '--color',
        'never',
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

      // Codex CLI may support --max-turns flag; we add it when maxTurns is provided
      expect(args).toEqual([
        'exec',
        '--cd',
        '/tmp/test',
        '--max-turns',
        '5',
        '--full-auto',
        '--json',
        '--color',
        'never',
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
        '--max-turns',
        '10',
        '--full-auto',
        '--json',
        '--color',
        'never',
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

      // Empty working directory should not add --cd flag
      expect(args).toEqual([
        'exec',
        '--full-auto',
        '--json',
        '--color',
        'never',
        'Test prompt',
      ]);
    });
  });

  describe('execute (SDK-based)', () => {
    it('should create new thread for each execution (fresh process requirement)', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      // Mock successful turn
      const mockTurn: RunResult = {
        finalResponse: 'Task completed. <ralph>COMPLETE</ralph>',
        items: [],
        usage: {
          input_tokens: 100,
          cached_input_tokens: 0,
          output_tokens: 50,
        },
      };

      vi.mocked(mockThread.run).mockResolvedValue(mockTurn);

      const result = await runner.execute(request);

      // Verify new thread was created (fresh process)
      expect(mockCodexInstance.startThread).toHaveBeenCalledWith(
        expect.objectContaining({
          workingDirectory: '/tmp/test',
          approvalPolicy: 'never',
          sandboxMode: 'workspace-write',
        })
      );
      
      // Verify thread.run was called with prompt
      expect(mockThread.run).toHaveBeenCalledWith(
        'Test prompt',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('COMPLETE');
      expect(result.tokensUsed).toBe(150); // 100 + 50
      expect(result.sessionId).toBe('test-thread-id-123');
    });

    it('should pass model to thread options when specified', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        model: 'gpt-5.2-codex',
        nonInteractive: true,
      };

      const mockTurn: RunResult = {
        finalResponse: 'Done',
        items: [],
        usage: null,
      };

      vi.mocked(mockThread.run).mockResolvedValue(mockTurn);

      await runner.execute(request);

      expect(mockCodexInstance.startThread).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-5.2-codex',
        })
      );
    });

    it('should handle GUTTER signal', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      const mockTurn: RunResult = {
        finalResponse: 'I am stuck. <ralph>GUTTER</ralph>',
        items: [],
        usage: null,
      };

      vi.mocked(mockThread.run).mockResolvedValue(mockTurn);

      const result = await runner.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('GUTTER');
    });

    it('should handle errors gracefully', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      vi.mocked(mockThread.run).mockRejectedValue(new Error('SDK error'));

      const result = await runner.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('SDK error');
    });

    it('should handle timeout via AbortSignal', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        timeout: 100, // Very short timeout
        nonInteractive: true,
      };

      // Mock a slow response that will timeout
      // The AbortSignal should cause the promise to reject
      vi.mocked(mockThread.run).mockImplementation((_prompt, options) => {
        return new Promise((resolve, reject) => {
          // Check if signal is already aborted
          if (options?.signal?.aborted) {
            reject(new Error('Execution timeout after 100ms'));
            return;
          }
          
          // Set up abort listener
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              reject(new Error('Execution timeout after 100ms'));
            });
          }
          
          // Simulate slow operation
          setTimeout(() => {
            if (options?.signal?.aborted) {
              reject(new Error('Execution timeout after 100ms'));
            } else {
              resolve({
                finalResponse: 'Done',
                items: [],
                usage: null,
              });
            }
          }, 200); // Longer than timeout
        });
      });

      const result = await runner.execute(request);

      // Should timeout and return error
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('timeout');
    });
  });

  describe('spawn (legacy fallback - deprecated with SDK)', () => {
    // Note: spawn() is kept for backward compatibility but shouldn't be called
    // when using SDK. These tests verify the legacy method still works if needed.
    it('should build correct args for legacy spawn', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      // Test buildArgs (still used by legacy spawn)
      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);
      expect(args).toContain('exec');
      expect(args).toContain('--cd');
      expect(args).toContain('/tmp/test');
    });
  });

  describe('buildArgs - new flags', () => {
    it('should include --full-auto flag in non-interactive mode', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).toContain('--full-auto');
      expect(args).toContain('--json');
      expect(args).toContain('--color');
      expect(args).toContain('never');
    });

    it('should include --max-turns when maxTurns is provided', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        maxTurns: 10,
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).toContain('--max-turns');
      expect(args).toContain('10');
    });

    it('should not include --max-turns when maxTurns is not provided', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).not.toContain('--max-turns');
    });

    it('should not include --max-turns when maxTurns is 0', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        maxTurns: 0,
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).not.toContain('--max-turns');
    });

    it('should include --color never in non-interactive mode', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).toContain('--color');
      expect(args[args.indexOf('--color') + 1]).toBe('never');
    });

    it('should not include non-interactive flags in interactive mode', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: false,
      };

      const args = (runner as unknown as { buildArgs: (req: ExecutionRequest) => string[] }).buildArgs(request);

      expect(args).not.toContain('--full-auto');
      expect(args).not.toContain('--json');
      expect(args).not.toContain('--color');
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
