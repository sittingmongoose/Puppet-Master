/**
 * Tests for CopilotRunner
 *
 * Tests GitHub Copilot-specific platform runner functionality including
 * CLI argument building, text output parsing, and process spawning.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable, Writable } from 'stream';
import type { ChildProcess } from 'child_process';
import { CopilotRunner } from './copilot-runner.js';
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

describe('CopilotRunner', () => {
  let capabilityService: CapabilityDiscoveryService;
  let runner: CopilotRunner;

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

    runner = new CopilotRunner(capabilityService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default command', () => {
      const defaultRunner = new CopilotRunner(capabilityService);
      expect(defaultRunner.platform).toBe('copilot');
    });

    it('should create instance with custom command', () => {
      const customRunner = new CopilotRunner(capabilityService, 'custom-copilot');
      expect(customRunner.platform).toBe('copilot');
    });

    it('should create instance with custom timeouts', () => {
      const timeoutRunner = new CopilotRunner(
        capabilityService,
        'copilot',
        600_000,
        900_000
      );
      expect(timeoutRunner.platform).toBe('copilot');
      expect(timeoutRunner.defaultTimeout).toBe(600_000);
      expect(timeoutRunner.hardTimeout).toBe(900_000);
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

    it('should always include --allow-all-tools', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--allow-all-tools');
    });

    it('should always include --allow-all-paths', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--allow-all-paths');
    });

    it('should always include --silent', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--silent');
    });

    it('should always include --stream off', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--stream');
      expect(args).toContain('off');
      const streamIndex = args.indexOf('--stream');
      expect(args[streamIndex + 1]).toBe('off');
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
      // Empty prompt should not be in args
      expect(args.filter(arg => arg === '').length).toBe(0);
    });

    it('should not include -p flag for interactive mode', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: false,
      };

      const args = runner['buildArgs'](request);
      expect(args).not.toContain('-p');
      expect(args).toContain('--allow-all-tools');
      expect(args).toContain('--allow-all-paths');
      expect(args).toContain('--silent');
    });

    it('should include --model flag when provided', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        model: 'gpt-4',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--model');
      expect(args).toContain('gpt-4');
    });

    it('should build correct args for full request', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toEqual([
        '-p',
        'Test prompt',
        '--allow-all-tools',
        '--allow-all-paths',
        '--silent',
        '--stream',
        'off',
      ]);
    });
  });

  describe('parseOutput', () => {
    it('should parse text output and return it as-is', () => {
      const output = 'This is some text output from Copilot CLI';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(true);
      expect(result.output).toBe(output);
      expect(result.error).toBeUndefined();
    });

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

    it('should prioritize GUTTER over COMPLETE signal', () => {
      const output = '<ralph>COMPLETE</ralph>\n<ralph>GUTTER</ralph>';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent signaled GUTTER - stuck and cannot proceed');
    });

    it('should handle empty output', () => {
      const output = '';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(true);
      expect(result.output).toBe('');
      expect(result.error).toBeUndefined();
    });

    it('should handle output without signals', () => {
      const output = 'Regular output without any ralph signals';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(true);
      expect(result.output).toBe(output);
      expect(result.error).toBeUndefined();
    });

    it('should return consistent result structure', () => {
      const output = 'Test output';
      const result = runner['parseOutput'](output);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('exitCode');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('processId');
      expect(result.exitCode).toBe(0);
      expect(result.duration).toBe(0);
      expect(result.processId).toBe(0);
    });

    it('should detect COMPLETE signal case-insensitively', () => {
      const output = 'Output with <RALPH>COMPLETE</RALPH> in different case';
      const result = runner['parseOutput'](output);

      // COMPLETE is a success signal; even if detected, success should remain true.
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect GUTTER signal case-insensitively', () => {
      const output = 'Output with <RALPH>GUTTER</RALPH> in different case';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent signaled GUTTER - stuck and cannot proceed');
    });
  });

  describe('spawn', () => {
    it('should spawn process with correct command and args', async () => {
      const mockProc = {
        stdout: new Readable({ read() {} }),
        stderr: new Readable({ read() {} }),
        stdin: new Writable(),
        on: vi.fn(),
        kill: vi.fn(),
      } as unknown as ChildProcess;

      vi.mocked(spawn).mockReturnValue(mockProc);

      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp/test',
        nonInteractive: true,
      };

      await runner['spawn'](request);

      expect(spawn).toHaveBeenCalledWith(
        'copilot',
        expect.arrayContaining(['-p', 'Test prompt', '--allow-all-tools', '--allow-all-paths', '--silent', '--stream', 'off']),
        expect.objectContaining({
          cwd: '/tmp/test',
          stdio: ['pipe', 'pipe', 'pipe'],
        })
      );
    });

    it('should write prompt to stdin for large prompts', async () => {
      const mockStdin = new Writable({
        write(chunk: unknown, encoding: unknown, callback: unknown) {
          if (typeof callback === 'function') callback();
        },
      });
      const writeSpy = vi.spyOn(mockStdin, 'write');
      const endSpy = vi.spyOn(mockStdin, 'end');

      const mockProc = {
        stdout: new Readable({ read() {} }),
        stderr: new Readable({ read() {} }),
        stdin: mockStdin,
        on: vi.fn(),
        kill: vi.fn(),
      } as unknown as ChildProcess;

      vi.mocked(spawn).mockReturnValue(mockProc);

      const largePrompt = 'a'.repeat(50_000);
      const request: ExecutionRequest = {
        prompt: largePrompt,
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      await runner['spawn'](request);

      expect(writeSpy).toHaveBeenCalledWith(largePrompt, 'utf-8');
      expect(endSpy).toHaveBeenCalled();
    });
  });
});
