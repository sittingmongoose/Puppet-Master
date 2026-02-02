/**
 * Tests for CLI Tools Checks
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T02 (CLI Tools Check).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  CursorCliCheck,
  CodexCliCheck,
  ClaudeCliCheck,
} from './cli-tools.js';
import { getCursorCommandCandidates } from '../../platforms/constants.js';
import { getPlatformAuthStatus } from '../../platforms/auth-status.js';

// Mock child_process
vi.mock('node:child_process', () => {
  return {
    spawn: vi.fn(),
  };
});

// Mock fs/promises
vi.mock('node:fs/promises', () => {
  return {
    access: vi.fn(),
  };
});

vi.mock('../../platforms/auth-status.js', () => ({
  getPlatformAuthStatus: vi.fn((platform: string) => {
    if (platform === 'codex') {
      return { status: 'not_authenticated', fixSuggestion: 'Run `codex login` or set OPENAI_API_KEY in your environment.' };
    }
    return { status: 'authenticated' };
  }),
}));

describe('CLI Tools Checks', () => {
  let mockSpawn: ReturnType<typeof vi.fn>;

  let codexAuthStatus: 'authenticated' | 'not_authenticated' = 'authenticated';

  beforeEach(() => {
    mockSpawn = vi.mocked(spawn);
    vi.mocked(access).mockClear();
    vi.mocked(access).mockRejectedValue(new Error('ENOENT'));
    codexAuthStatus = 'authenticated';
    process.env.OPENAI_API_KEY = 'test';
    process.env.ANTHROPIC_API_KEY = 'test';
    process.env.CURSOR_API_KEY = 'test';
    vi.mocked(getPlatformAuthStatus).mockImplementation((platform: string) => {
      if (platform === 'codex') {
        return { status: codexAuthStatus, fixSuggestion: 'Run `codex login` or set OPENAI_API_KEY in your environment.' };
      }
      return { status: 'authenticated' };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CURSOR_API_KEY;
  });

  /**
   * Helper to create a mock child process that succeeds
   */
  function createMockSuccessProcess(stdout: string): ChildProcess {
    const proc = {
      stdout: {
        on: vi.fn((event: string, handler: (data: Buffer) => void) => {
          if (event === 'data') {
            setTimeout(() => handler(Buffer.from(stdout)), 10);
          }
        }),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn((event: string, handler: (code: number) => void) => {
        if (event === 'close') {
          setTimeout(() => handler(0), 20);
        }
      }),
      kill: vi.fn(),
    } as unknown as ChildProcess;
    return proc;
  }

  /**
   * Helper to create a mock child process that fails
   */
  function createMockFailureProcess(exitCode: number = 1, stderr: string = ''): ChildProcess {
    const proc = {
      stdout: {
        on: vi.fn(),
      },
      stderr: {
        on: vi.fn((event: string, handler: (data: Buffer) => void) => {
          if (event === 'data' && stderr) {
            setTimeout(() => handler(Buffer.from(stderr)), 10);
          }
        }),
      },
      on: vi.fn((event: string, handler: (code: number) => void) => {
        if (event === 'close') {
          setTimeout(() => handler(exitCode), 20);
        }
      }),
      kill: vi.fn(),
    } as unknown as ChildProcess;
    return proc;
  }

  /**
   * Helper to create a mock child process that errors
   */
  function createMockErrorProcess(error: Error): ChildProcess {
    const proc = {
      stdout: {
        on: vi.fn(),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn((event: string, handler: (err: Error) => void) => {
        if (event === 'error') {
          setTimeout(() => handler(error), 10);
        }
      }),
      kill: vi.fn(),
    } as unknown as ChildProcess;
    return proc;
  }

  describe('CursorCliCheck', () => {
    it('should pass when cursor-agent is available', async () => {
      const check = new CursorCliCheck();
      const [primaryCommand] = getCursorCommandCandidates(null);
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('cursor-agent 1.2.3'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help\n--model\n--version'));

      const result = await check.run();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('runnable');
      expect(result.details).toContain('Version:');
      expect(result.fixSuggestion).toBeUndefined();
      expect(mockSpawn).toHaveBeenCalledWith(primaryCommand, ['--version'], expect.any(Object));
    });

    it('should pass when agent (fallback) is available', async () => {
      const check = new CursorCliCheck();
      // Fail first two candidates, succeed on third (platform-independent ordering)
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT'))); // candidates[0] --version
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT'))); // candidates[1] --version
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('agent 1.0.0')); // candidates[2] --version
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help')); // candidates[2] --help

      const result = await check.run();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('runnable');
    });

    it('should fail when neither cursor-agent nor agent is available', async () => {
      const check = new CursorCliCheck();
      mockSpawn.mockImplementation(() => createMockErrorProcess(new Error('ENOENT')));

      const result = await check.run();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
      expect(result.fixSuggestion).toContain('curl https://cursor.com/install');
    });

    it('should include version in details when available', async () => {
      const check = new CursorCliCheck();
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('cursor-agent 2.5.1'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));

      const result = await check.run();

      expect(result.details).toContain('2.5.1');
    });

    it('should handle --help check failure gracefully', async () => {
      const check = new CursorCliCheck();
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('cursor-agent 1.0.0'));
      mockSpawn.mockReturnValueOnce(createMockFailureProcess(1, 'help failed'));

      const result = await check.run();

      // Should still pass but note the help check failure
      expect(result.passed).toBe(true);
      expect(result.details).toContain('Help check');
    });
  });

  describe('CodexCliCheck', () => {
    // Mock fs.existsSync for SDK check
    beforeEach(() => {
      // Mock fs.existsSync to return true for SDK check
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      vi.spyOn(fs, 'existsSync').mockImplementation((path: unknown) => {
        if (typeof path === 'string' && path.includes('@openai/codex-sdk')) {
          return true; // SDK is installed
        }
        return originalExistsSync(path as Parameters<typeof originalExistsSync>[0]);
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should pass when codex CLI and SDK are available', async () => {
      const check = new CodexCliCheck();
      // Mock: codex --version
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('codex 1.0.0'));
      // Mock: codex --help
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));
      // Mock: codex exec --help
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('exec subcommand help'));

      const result = await check.run();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('authenticated');
      expect(result.details).toContain('Version:');
      expect(result.details).toContain('SDK package: yes');
      expect(result.fixSuggestion).toBeUndefined();
    });

    it('should try npx codex when codex is not available', async () => {
      const check = new CodexCliCheck();
      // codex not found
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT')));
      // npx --no-install codex --version succeeds
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('codex 1.0.0 via npx'));
      // npx --no-install codex --help succeeds
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));
      // npx --no-install codex exec --help succeeds
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('exec subcommand help'));

      const result = await check.run();

      expect(result.passed).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        ['--no-install', 'codex', '--version'],
        expect.any(Object)
      );
    });

    it('should fail when neither codex nor npx codex is available', async () => {
      const check = new CodexCliCheck();
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT')));
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT')));

      const result = await check.run();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
      expect(result.fixSuggestion).toContain('npm install -g @openai/codex');
      expect(result.fixSuggestion).toContain('@openai/codex-sdk');
    });

    it('should include version in details when available', async () => {
      const check = new CodexCliCheck();
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('codex 2.3.4'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('exec subcommand help'));

      const result = await check.run();

      expect(result.details).toContain('2.3.4');
      expect(result.details).toContain('SDK package: yes');
    });

    it('should handle npx codex timeout', async () => {
      const check = new CodexCliCheck();
      // codex not found
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT')));
      // npx codex times out (simulated by never calling close)
      const timeoutProc = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
      } as unknown as ChildProcess;
      mockSpawn.mockReturnValueOnce(timeoutProc);
      // Note: SDK check will still pass (mocked in beforeEach)

      // Advance timers to trigger timeout
      vi.useFakeTimers();
      const resultPromise = check.run();
      await vi.advanceTimersByTimeAsync(20000);
      const result = await resultPromise;
      vi.useRealTimers();

      expect(result.passed).toBe(false);
    });

    it('should fail when OPENAI_API_KEY is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      codexAuthStatus = 'not_authenticated';
      const check = new CodexCliCheck();
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('codex 1.0.0'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('exec subcommand help'));

      const result = await check.run();
      expect(result.passed).toBe(false);
      expect(result.message).toContain('not authenticated');
    });
  });

  describe('ClaudeCliCheck', () => {
    it('should pass when claude is available', async () => {
      const check = new ClaudeCliCheck();
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('claude 1.0.0'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('Installation OK')); // claude doctor

      const result = await check.run();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('authenticated');
      expect(result.details).toContain('Version:');
      expect(result.details).toContain('Doctor:');
      expect(result.fixSuggestion).toBeUndefined();
    });

    it('should try ~/.claude/local/claude when claude is not available', async () => {
      const check = new ClaudeCliCheck();
      // claude not found
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT')));
      // File exists
      vi.mocked(access).mockResolvedValueOnce(undefined);
      // Local claude works
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('claude 1.0.0'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('Installation OK')); // claude doctor

      const result = await check.run();

      expect(result.passed).toBe(true);
      expect(access).toHaveBeenCalledWith(join(homedir(), '.claude', 'local', 'claude'));
    });

    it('should fail when neither claude nor local claude is available', async () => {
      const check = new ClaudeCliCheck();
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT')));
      vi.mocked(access).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await check.run();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
      expect(result.fixSuggestion).toContain('curl -fsSL https://claude.ai/install.sh');
    });

    it('should include version in details when available', async () => {
      const check = new ClaudeCliCheck();
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('claude 3.5.0'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('Installation OK')); // claude doctor

      const result = await check.run();

      expect(result.details).toContain('3.5.0');
    });

    it('should handle local claude file not existing', async () => {
      const check = new ClaudeCliCheck();
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT')));
      vi.mocked(access).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await check.run();

      expect(result.passed).toBe(false);
    });

    it('should handle local claude existing but failing to run', async () => {
      const check = new ClaudeCliCheck();
      mockSpawn.mockReturnValueOnce(createMockErrorProcess(new Error('ENOENT')));
      vi.mocked(access).mockResolvedValueOnce(undefined);
      mockSpawn.mockReturnValueOnce(createMockFailureProcess(1, 'Permission denied'));

      const result = await check.run();

      expect(result.passed).toBe(false);
    });
  });

  describe('CheckResult structure', () => {
    it('should return valid CheckResult for CursorCliCheck', async () => {
      const check = new CursorCliCheck();
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('cursor-agent 1.0.0'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));

      const result = await check.run();

      expect(result).toHaveProperty('name', 'cursor-cli');
      expect(result).toHaveProperty('category', 'cli');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('durationMs', 0); // Set by CheckRegistry
      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.message).toBe('string');
    });

    it('should return valid CheckResult for CodexCliCheck', async () => {
      const check = new CodexCliCheck();
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('codex 1.0.0'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('exec subcommand help'));

      const result = await check.run();

      expect(result).toHaveProperty('name', 'codex-cli');
      expect(result).toHaveProperty('category', 'cli');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('message');
    });

    it('should return valid CheckResult for ClaudeCliCheck', async () => {
      const check = new ClaudeCliCheck();
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('claude 1.0.0'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('--help'));
      mockSpawn.mockReturnValueOnce(createMockSuccessProcess('Installation OK')); // claude doctor

      const result = await check.run();

      expect(result).toHaveProperty('name', 'claude-cli');
      expect(result).toHaveProperty('category', 'cli');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('message');
    });
  });
});
