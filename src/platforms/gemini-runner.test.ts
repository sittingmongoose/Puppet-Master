/**
 * Tests for GeminiRunner
 *
 * Tests Gemini-specific platform runner functionality including
 * CLI argument building, JSON output parsing, and process spawning.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable, Writable } from 'stream';
import type { ChildProcess } from 'child_process';
import { GeminiRunner } from './gemini-runner.js';
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

describe('GeminiRunner', () => {
  let capabilityService: CapabilityDiscoveryService;
  let runner: GeminiRunner;

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

    runner = new GeminiRunner(capabilityService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default command', () => {
      const defaultRunner = new GeminiRunner(capabilityService);
      expect(defaultRunner.platform).toBe('gemini');
    });

    it('should create instance with custom command', () => {
      const customRunner = new GeminiRunner(capabilityService, 'custom-gemini');
      expect(customRunner.platform).toBe('gemini');
    });

    it('should create instance with custom timeouts', () => {
      const timeoutRunner = new GeminiRunner(
        capabilityService,
        'gemini',
        600_000,
        900_000
      );
      expect(timeoutRunner.platform).toBe('gemini');
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

    it('should always include --output-format json', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--output-format');
      expect(args).toContain('json');
      const formatIndex = args.indexOf('--output-format');
      expect(args[formatIndex + 1]).toBe('json');
    });

    it('should always include --approval-mode yolo', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--approval-mode');
      expect(args).toContain('yolo');
      const approvalIndex = args.indexOf('--approval-mode');
      expect(args[approvalIndex + 1]).toBe('yolo');
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
      expect(args).toContain('--output-format');
      expect(args).toContain('json');
    });

    it('should include --model flag when model is specified', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        model: 'gemini-2.5-pro',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toContain('--model');
      expect(args).toContain('gemini-2.5-pro');
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

    it('should not include --model flag when model is "auto"', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        model: 'auto',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).not.toContain('--model');
    });

    it('should build correct args for full request', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        model: 'gemini-2.5-flash',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toEqual([
        '-p',
        'Test prompt',
        '--output-format',
        'json',
        '--approval-mode',
        'yolo',
        '--model',
        'gemini-2.5-flash',
      ]);
    });
  });

  describe('parseOutput', () => {
    it('should parse valid JSON output with response field', () => {
      const jsonOutput = JSON.stringify({
        response: 'Test response text',
        stats: { tokens: 100 },
      });
      const result = runner['parseOutput'](jsonOutput);

      expect(result.success).toBe(true);
      expect(result.output).toBe('Test response text');
      expect(result.error).toBeUndefined();
    });

    it('should detect COMPLETE signal in response and set success to true', () => {
      const jsonOutput = JSON.stringify({
        response: 'Some output\n<ralph>COMPLETE</ralph>\nMore output',
      });
      const result = runner['parseOutput'](jsonOutput);

      expect(result.success).toBe(true);
      expect(result.output).toContain('<ralph>COMPLETE</ralph>');
    });

    it('should detect GUTTER signal in response and set success to false', () => {
      const jsonOutput = JSON.stringify({
        response: 'Some output\n<ralph>GUTTER</ralph>\nMore output',
      });
      const result = runner['parseOutput'](jsonOutput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent signaled GUTTER - stuck and cannot proceed');
      expect(result.output).toContain('<ralph>GUTTER</ralph>');
    });

    it('should handle JSON with error field', () => {
      const jsonOutput = JSON.stringify({
        response: 'Partial response',
        error: 'API error occurred',
      });
      const result = runner['parseOutput'](jsonOutput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API error occurred');
      expect(result.output).toBe('Partial response');
    });

    it('should handle malformed JSON gracefully', () => {
      const invalidJson = 'This is not valid JSON';
      const result = runner['parseOutput'](invalidJson);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse Gemini JSON output');
      expect(result.output).toBe(invalidJson);
    });

    it('should handle empty response field in JSON', () => {
      const jsonOutput = JSON.stringify({
        response: '',
        stats: { tokens: 0 },
      });
      const result = runner['parseOutput'](jsonOutput);

      expect(result.success).toBe(true);
      expect(result.output).toBe('');
    });

    it('should handle missing response field in JSON', () => {
      const jsonOutput = JSON.stringify({
        stats: { tokens: 100 },
      });
      const result = runner['parseOutput'](jsonOutput);

      expect(result.success).toBe(true);
      expect(result.output).toBe('');
    });

    it('should prioritize GUTTER over COMPLETE signal', () => {
      const jsonOutput = JSON.stringify({
        response: '<ralph>COMPLETE</ralph>\n<ralph>GUTTER</ralph>',
      });
      const result = runner['parseOutput'](jsonOutput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent signaled GUTTER - stuck and cannot proceed');
    });

    it('should return consistent result structure', () => {
      const jsonOutput = JSON.stringify({
        response: 'Test response',
      });
      const result = runner['parseOutput'](jsonOutput);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('exitCode');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('processId');
      expect(result.exitCode).toBe(0);
      expect(result.duration).toBe(0);
      expect(result.processId).toBe(0);
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
        'gemini',
        expect.arrayContaining(['-p', 'Test prompt', '--output-format', 'json']),
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
