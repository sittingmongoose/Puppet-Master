/**
 * Tests for AntigravityRunner
 *
 * Tests Antigravity-specific platform runner functionality.
 * NOTE: AntigravityRunner is a fail-fast implementation since `agy` CLI
 * is launcher-only and does not support headless execution.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AntigravityRunner } from './antigravity-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import type {
  ExecutionRequest,
} from '../types/platforms.js';

describe('AntigravityRunner', () => {
  let capabilityService: CapabilityDiscoveryService;
  let runner: AntigravityRunner;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock capability service
    capabilityService = {
      probe: vi.fn(),
      getCached: vi.fn(),
      refresh: vi.fn(),
      isCacheValid: vi.fn(),
    } as unknown as CapabilityDiscoveryService;

    runner = new AntigravityRunner(capabilityService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with correct platform', () => {
      const defaultRunner = new AntigravityRunner(capabilityService);
      expect(defaultRunner.platform).toBe('antigravity');
    });

    it('should accept custom timeouts (even though unused)', () => {
      const timeoutRunner = new AntigravityRunner(
        capabilityService,
        600_000,
        3_600_000
      );
      expect(timeoutRunner.platform).toBe('antigravity');
      // Timeouts are not used since runner fails fast
    });
  });

  describe('spawn', () => {
    it('should throw error immediately indicating no headless support', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      await expect(runner['spawn'](request)).rejects.toThrow(
        'Antigravity CLI (`agy`) does not support headless/non-interactive execution'
      );
    });

    it('should include guidance to use gemini or copilot in error message', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      await expect(runner['spawn'](request)).rejects.toThrow(
        'For headless automation, please use `gemini` or `copilot` platforms instead'
      );
    });

    it('should mention that agy is a GUI launcher', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      await expect(runner['spawn'](request)).rejects.toThrow(
        'The `agy` command is a GUI launcher only'
      );
    });

    it('should reference documentation in error message', async () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      await expect(runner['spawn'](request)).rejects.toThrow(
        /antigravity\.google|addgravity\.md/
      );
    });
  });

  describe('buildArgs', () => {
    it('should return empty array for any request', () => {
      const request: ExecutionRequest = {
        prompt: 'Test prompt',
        workingDirectory: '/tmp',
        model: 'gemini-2.5-pro',
        maxTurns: 10,
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toEqual([]);
    });

    it('should return empty array for minimal request', () => {
      const request: ExecutionRequest = {
        prompt: '',
        workingDirectory: '/tmp',
        nonInteractive: true,
      };

      const args = runner['buildArgs'](request);
      expect(args).toEqual([]);
    });
  });

  describe('parseOutput', () => {
    it('should return error result for any output', () => {
      const output = 'Some output text';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(false);
      expect(result.output).toBe('');
      expect(result.exitCode).toBe(1);
      expect(result.error).toBe('Antigravity CLI does not support headless execution');
    });

    it('should return error result for empty output', () => {
      const output = '';
      const result = runner['parseOutput'](output);

      expect(result.success).toBe(false);
      expect(result.output).toBe('');
      expect(result.exitCode).toBe(1);
      expect(result.error).toBe('Antigravity CLI does not support headless execution');
    });

    it('should return consistent error result structure', () => {
      const output = 'Any output';
      const result = runner['parseOutput'](output);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('exitCode');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('processId');
      expect(result).toHaveProperty('error');
      expect(result.duration).toBe(0);
      expect(result.processId).toBe(0);
    });
  });
});
