/**
 * Tests for PlatformHealthChecker
 * 
 * Tests platform health check functionality including CLI availability,
 * version checking, and capability integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ChildProcess } from 'child_process';
import { PlatformHealthChecker } from './health-check.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { PlatformRegistry } from './registry.js';
import type { CapabilityProbeResult } from '../types/capabilities.js';

// Mock child_process module
vi.mock('child_process', () => {
  return {
    spawn: vi.fn(),
  };
});

// Import spawn after mock is set up
import { spawn } from 'child_process';

describe('PlatformHealthChecker', () => {
  let checker: PlatformHealthChecker;
  let capabilityService: CapabilityDiscoveryService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    vi.mocked(spawn).mockClear();

    // Create capability service
    capabilityService = new CapabilityDiscoveryService();
    checker = new PlatformHealthChecker(capabilityService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkPlatform', () => {
    it('should return healthy result when CLI is available', async () => {
      const mockSpawn = vi.mocked(spawn);
      
      // Mock successful version command
      const mockProc = {
        stdout: {
          on: vi.fn((event: string, handler: (data: Buffer) => void) => {
            if (event === 'data') {
              handler(Buffer.from('cursor-agent version 1.2.3\n'));
            }
          }),
        },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (code?: number) => void) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      // Mock capability service
      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(null);
      vi.spyOn(capabilityService, 'probe').mockResolvedValue({
        platform: 'cursor',
        version: '1.2.3',
        capabilities: {
          streaming: true,
          codeExecution: false,
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
          resetsAt: new Date().toISOString(),
          period: 'day',
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      } as CapabilityProbeResult);

      const result = await checker.checkPlatform('cursor');

      expect(result.healthy).toBe(true);
      expect(result.message).toContain('available and executable');
      expect(result.version).toBe('1.2.3');
      expect(result.capabilities).toBeDefined();
      expect(result.capabilities?.streaming).toBe(true);
    });

    it('should return unhealthy result when CLI is not found', async () => {
      const mockSpawn = vi.mocked(spawn);
      
      // Mock command not found error
      const mockProc = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (error?: Error) => void) => {
          if (event === 'error') {
            const error = new Error('Command not found');
            (error as NodeJS.ErrnoException).code = 'ENOENT';
            setTimeout(() => handler(error), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      const result = await checker.checkPlatform('cursor');

      expect(result.healthy).toBe(false);
      expect(result.message).toContain('not found in PATH');
      expect(result.version).toBeUndefined();
      expect(result.capabilities).toBeUndefined();
    });

    it('should return unhealthy result when CLI is not executable', async () => {
      const mockSpawn = vi.mocked(spawn);
      
      // Mock permission denied error
      const mockProc = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (error?: Error) => void) => {
          if (event === 'error') {
            const error = new Error('Permission denied');
            (error as NodeJS.ErrnoException).code = 'EACCES';
            setTimeout(() => handler(error), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      const result = await checker.checkPlatform('codex');

      expect(result.healthy).toBe(false);
      expect(result.message).toContain('not executable');
      expect(result.version).toBeUndefined();
    });

    it('should return unhealthy result when CLI command fails', async () => {
      const mockSpawn = vi.mocked(spawn);
      
      // Mock command that exits with non-zero code
      const mockProc = {
        stdout: { on: vi.fn() },
        stderr: {
          on: vi.fn((event: string, handler: (data: Buffer) => void) => {
            if (event === 'data') {
              handler(Buffer.from('Error: Invalid command\n'));
            }
          }),
        },
        on: vi.fn((event: string, handler: (code?: number) => void) => {
          if (event === 'close') {
            setTimeout(() => handler(1), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      const result = await checker.checkPlatform('claude');

      expect(result.healthy).toBe(false);
      expect(result.message).toContain('check failed');
      expect(result.version).toBeUndefined();
    });

    it('should extract version from output', async () => {
      const mockSpawn = vi.mocked(spawn);
      
      // Mock version output with different formats
      const testCases = [
        { output: 'version 2.5.1', expected: '2.5.1' },
        { output: 'v3.0.0', expected: '3.0.0' },
        { output: 'Codex CLI 1.0.0', expected: '1.0.0' },
        { output: 'Some text 4.2.1 more text', expected: '4.2.1' },
      ];

      for (const testCase of testCases) {
        const mockProc = {
          stdout: {
            on: vi.fn((event: string, handler: (data: Buffer) => void) => {
              if (event === 'data') {
                handler(Buffer.from(testCase.output + '\n'));
              }
            }),
          },
          stderr: { on: vi.fn() },
          on: vi.fn((event: string, handler: (code?: number) => void) => {
            if (event === 'close') {
              setTimeout(() => handler(0), 10);
            }
          }),
        };

        mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);
        vi.spyOn(capabilityService, 'getCached').mockResolvedValue(null);
        vi.spyOn(capabilityService, 'probe').mockResolvedValue({
          platform: 'cursor',
          version: testCase.expected,
          capabilities: {
            streaming: false,
            codeExecution: false,
            imageGeneration: false,
            fileAccess: false,
            webSearch: false,
            computerUse: false,
            maxContextTokens: 0,
            maxOutputTokens: 0,
            supportedLanguages: [],
          },
          quotaInfo: {
            remaining: 0,
            limit: 0,
            resetsAt: new Date().toISOString(),
            period: 'day',
          },
          cooldownInfo: {
            active: false,
            endsAt: null,
            reason: null,
          },
          probeTimestamp: new Date().toISOString(),
        } as CapabilityProbeResult);

        const result = await checker.checkPlatform('cursor');

        expect(result.healthy).toBe(true);
        expect(result.version).toBe(testCase.expected);
      }
    });

    it('should use cached capabilities when available', async () => {
      const mockSpawn = vi.mocked(spawn);
      
      const mockProc = {
        stdout: {
          on: vi.fn((event: string, handler: (data: Buffer) => void) => {
            if (event === 'data') {
              handler(Buffer.from('version 1.0.0\n'));
            }
          }),
        },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (code?: number) => void) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      const cachedCapabilities: CapabilityProbeResult = {
        platform: 'cursor',
        version: '1.0.0',
        capabilities: {
          streaming: true,
          codeExecution: true,
          imageGeneration: false,
          fileAccess: true,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 200000,
          maxOutputTokens: 8000,
          supportedLanguages: ['typescript', 'javascript', 'python'],
        },
        quotaInfo: {
          remaining: 50,
          limit: 100,
          resetsAt: new Date().toISOString(),
          period: 'day',
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      };

      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(cachedCapabilities);
      const probeSpy = vi.spyOn(capabilityService, 'probe');

      const result = await checker.checkPlatform('cursor');

      expect(result.healthy).toBe(true);
      expect(result.capabilities).toEqual(cachedCapabilities.capabilities);
      // Should not call probe when cached is available
      expect(probeSpy).not.toHaveBeenCalled();
    });

    it('should probe for capabilities when not cached', async () => {
      const mockSpawn = vi.mocked(spawn);
      
      const mockProc = {
        stdout: {
          on: vi.fn((event: string, handler: (data: Buffer) => void) => {
            if (event === 'data') {
              handler(Buffer.from('version 1.0.0\n'));
            }
          }),
        },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (code?: number) => void) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      const probeResult: CapabilityProbeResult = {
        platform: 'codex',
        version: '1.0.0',
        capabilities: {
          streaming: false,
          codeExecution: true,
          imageGeneration: false,
          fileAccess: false,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 100000,
          maxOutputTokens: 4000,
          supportedLanguages: ['typescript'],
        },
        quotaInfo: {
          remaining: 100,
          limit: 100,
          resetsAt: new Date().toISOString(),
          period: 'day',
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      };

      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(null);
      vi.spyOn(capabilityService, 'probe').mockResolvedValue(probeResult);

      const result = await checker.checkPlatform('codex');

      expect(result.healthy).toBe(true);
      expect(result.capabilities).toEqual(probeResult.capabilities);
      expect(capabilityService.probe).toHaveBeenCalledWith('codex');
    });

    it('should handle capability discovery failure gracefully', async () => {
      const mockSpawn = vi.mocked(spawn);
      
      const mockProc = {
        stdout: {
          on: vi.fn((event: string, handler: (data: Buffer) => void) => {
            if (event === 'data') {
              handler(Buffer.from('version 1.0.0\n'));
            }
          }),
        },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (code?: number) => void) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      vi.spyOn(capabilityService, 'getCached').mockRejectedValue(new Error('Cache error'));
      vi.spyOn(capabilityService, 'probe').mockRejectedValue(new Error('Probe error'));

      const result = await checker.checkPlatform('claude');

      // CLI is available, so should be healthy even if capabilities fail
      expect(result.healthy).toBe(true);
      expect(result.version).toBe('1.0.0');
      expect(result.capabilities).toBeUndefined();
    });

    it('should work with default capability service', async () => {
      const checkerWithoutService = new PlatformHealthChecker();
      const mockSpawn = vi.mocked(spawn);
      
      const mockProc = {
        stdout: {
          on: vi.fn((event: string, handler: (data: Buffer) => void) => {
            if (event === 'data') {
              handler(Buffer.from('version 1.0.0\n'));
            }
          }),
        },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (code?: number) => void) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      const result = await checkerWithoutService.checkPlatform('cursor');

      expect(result.healthy).toBe(true);
    });
  });

  describe('checkAll', () => {
    it('should check all platforms in registry', async () => {
      const registry = new PlatformRegistry();
      const mockSpawn = vi.mocked(spawn);

      // Create mock runners and register them
      const { CursorRunner } = await import('./cursor-runner.js');
      const { CodexRunner } = await import('./codex-runner.js');
      
      const cursorRunner = new CursorRunner(capabilityService);
      const codexRunner = new CodexRunner(capabilityService);
      
      registry.register('cursor', cursorRunner);
      registry.register('codex', codexRunner);

      // Mock successful version commands for both platforms
      const createMockProc = (output: string) => ({
        stdout: {
          on: vi.fn((event: string, handler: (data: Buffer) => void) => {
            if (event === 'data') {
              handler(Buffer.from(output + '\n'));
            }
          }),
        },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (code?: number) => void) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      });

      mockSpawn
        .mockReturnValueOnce(createMockProc('cursor-agent version 1.0.0') as unknown as ChildProcess)
        .mockReturnValueOnce(createMockProc('codex version 2.0.0') as unknown as ChildProcess);

      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(null);
      vi.spyOn(capabilityService, 'probe').mockResolvedValue({
        platform: 'cursor',
        version: '1.0.0',
        capabilities: {
          streaming: false,
          codeExecution: false,
          imageGeneration: false,
          fileAccess: false,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 0,
          maxOutputTokens: 0,
          supportedLanguages: [],
        },
        quotaInfo: {
          remaining: 0,
          limit: 0,
          resetsAt: new Date().toISOString(),
          period: 'day',
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      } as CapabilityProbeResult);

      const results = await checker.checkAll(registry);

      expect(results.size).toBe(2);
      expect(results.has('cursor')).toBe(true);
      expect(results.has('codex')).toBe(true);
      
      const cursorResult = results.get('cursor');
      expect(cursorResult?.healthy).toBe(true);
      expect(cursorResult?.version).toBe('1.0.0');
      
      const codexResult = results.get('codex');
      expect(codexResult?.healthy).toBe(true);
      expect(codexResult?.version).toBe('2.0.0');
    });

    it('should handle empty registry', async () => {
      const registry = new PlatformRegistry();
      
      const results = await checker.checkAll(registry);

      expect(results.size).toBe(0);
    });

    it('should handle mixed healthy and unhealthy platforms', async () => {
      const registry = new PlatformRegistry();
      const mockSpawn = vi.mocked(spawn);

      const { CursorRunner } = await import('./cursor-runner.js');
      const { CodexRunner } = await import('./codex-runner.js');
      
      const cursorRunner = new CursorRunner(capabilityService);
      const codexRunner = new CodexRunner(capabilityService);
      
      registry.register('cursor', cursorRunner);
      registry.register('codex', codexRunner);

      // Mock successful for cursor, failure for codex
      const successProc = {
        stdout: {
          on: vi.fn((event: string, handler: (data: Buffer) => void) => {
            if (event === 'data') {
              handler(Buffer.from('version 1.0.0\n'));
            }
          }),
        },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (code?: number) => void) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      const failProc = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (error?: Error) => void) => {
          if (event === 'error') {
            const error = new Error('Command not found');
            (error as NodeJS.ErrnoException).code = 'ENOENT';
            setTimeout(() => handler(error), 10);
          }
        }),
      };

      mockSpawn
        .mockReturnValueOnce(successProc as unknown as ChildProcess)
        .mockReturnValueOnce(failProc as unknown as ChildProcess);

      vi.spyOn(capabilityService, 'getCached').mockResolvedValue(null);
      vi.spyOn(capabilityService, 'probe').mockResolvedValue({
        platform: 'cursor',
        version: '1.0.0',
        capabilities: {
          streaming: false,
          codeExecution: false,
          imageGeneration: false,
          fileAccess: false,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 0,
          maxOutputTokens: 0,
          supportedLanguages: [],
        },
        quotaInfo: {
          remaining: 0,
          limit: 0,
          resetsAt: new Date().toISOString(),
          period: 'day',
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      } as CapabilityProbeResult);

      const results = await checker.checkAll(registry);

      expect(results.size).toBe(2);
      expect(results.get('cursor')?.healthy).toBe(true);
      expect(results.get('codex')?.healthy).toBe(false);
    });
  });
});
