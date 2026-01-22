/**
 * Tests for CapabilityDiscoveryService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import type { CapabilityProbeResult } from '../types/capabilities.js';
import type { ChildProcess } from 'child_process';
import { tmpdir } from 'node:os';

// Mock child_process
vi.mock('child_process', () => {
  return {
    spawn: vi.fn(),
  };
});

describe('CapabilityDiscoveryService', () => {
  let service: CapabilityDiscoveryService;
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await fs.mkdtemp(join(tmpdir(), 'pm-capability-discovery-test-'));
    service = new CapabilityDiscoveryService(tempDir);
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('probe', () => {
    it('should probe platform CLI and return capabilities', async () => {
      const { spawn } = await import('child_process');
      const mockSpawn = vi.mocked(spawn);

      // Mock successful version command
      const mockVersionProc = {
        stdout: { on: vi.fn((event, handler) => handler(Buffer.from('version 1.2.3'))) },
        stderr: { on: vi.fn() },
        on: vi.fn((event, handler) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      // Mock successful help command
      const mockHelpProc = {
        stdout: { on: vi.fn((event, handler) => handler(Buffer.from('--help\n--model\n--stream'))) },
        stderr: { on: vi.fn() },
        on: vi.fn((event, handler) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      mockSpawn
        .mockReturnValueOnce(mockVersionProc as unknown as ChildProcess)
        .mockReturnValueOnce(mockHelpProc as unknown as ChildProcess);

      const result = await service.probe('cursor');

      expect(result.platform).toBe('cursor');
      expect(result.command).toBeDefined();
      expect(result.runnable).toBe(true);
      expect(result.authStatus).toBeDefined();
      expect(result.version).toBe('1.2.3');
      expect(result.capabilities).toBeDefined();
      expect(result.probeTimestamp).toBeDefined();
    });

    it('should handle missing CLI gracefully', async () => {
      const { spawn } = await import('child_process');
      const mockSpawn = vi.mocked(spawn);

      // Mock command not found error
      const mockProc = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, handler) => {
          if (event === 'error') {
            setTimeout(() => handler(new Error('Command not found')), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      const result = await service.probe('cursor');

      expect(result.platform).toBe('cursor');
      expect(result.command).toBeDefined();
      expect(result.runnable).toBe(false);
      expect(result.authStatus).toBeDefined();
      expect(result.version).toBe('unknown');
      expect(result.capabilities.streaming).toBe(false);
      expect(result.capabilities.supportedLanguages).toEqual([]);
    });

    it('should cache results after probing', async () => {
      const { spawn } = await import('child_process');
      const mockSpawn = vi.mocked(spawn);

      const mockProc = {
        stdout: { on: vi.fn((event, handler) => handler(Buffer.from('version 1.0.0'))) },
        stderr: { on: vi.fn() },
        on: vi.fn((event, handler) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      await service.probe('codex');

      // Check that cache files were created
      const yamlPath = join(tempDir, 'codex.yaml');
      const jsonPath = join(tempDir, 'codex.json');

      const yamlExists = await fs.access(yamlPath).then(() => true).catch(() => false);
      const jsonExists = await fs.access(jsonPath).then(() => true).catch(() => false);

      expect(yamlExists).toBe(true);
      expect(jsonExists).toBe(true);
    });
  });

  describe('getCached', () => {
    it('should read from YAML cache file', async () => {
      const testResult: CapabilityProbeResult = {
        platform: 'cursor',
        command: 'cursor',
        runnable: true,
        authStatus: 'authenticated',
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
          supportedLanguages: ['typescript'],
        },
        quotaInfo: {
          remaining: 100,
          limit: 1000,
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

      const yamlPath = join(tempDir, 'cursor.yaml');
      const yamlContent = yaml.dump(testResult);
      await fs.writeFile(yamlPath, yamlContent, 'utf-8');

      const cached = await service.getCached('cursor');

      expect(cached).not.toBeNull();
      expect(cached?.platform).toBe('cursor');
      expect(cached?.version).toBe('1.2.3');
    });

    it('should read from JSON cache file if YAML not found', async () => {
      const testResult: CapabilityProbeResult = {
        platform: 'codex',
        command: 'codex',
        runnable: true,
        authStatus: 'authenticated',
        version: '2.0.0',
        capabilities: {
          streaming: false,
          codeExecution: true,
          imageGeneration: false,
          fileAccess: false,
          webSearch: false,
          computerUse: false,
          maxContextTokens: 50000,
          maxOutputTokens: 2000,
          supportedLanguages: ['python'],
        },
        quotaInfo: {
          remaining: 50,
          limit: 500,
          resetsAt: new Date().toISOString(),
          period: 'hour',
        },
        cooldownInfo: {
          active: false,
          endsAt: null,
          reason: null,
        },
        probeTimestamp: new Date().toISOString(),
      };

      const jsonPath = join(tempDir, 'codex.json');
      await fs.writeFile(jsonPath, JSON.stringify(testResult, null, 2), 'utf-8');

      const cached = await service.getCached('codex');

      expect(cached).not.toBeNull();
      expect(cached?.platform).toBe('codex');
      expect(cached?.version).toBe('2.0.0');
    });

    it('should return null if no cache file exists', async () => {
      const cached = await service.getCached('claude');
      expect(cached).toBeNull();
    });
  });

  describe('refresh', () => {
    it('should force re-probe and update cache', async () => {
      const { spawn } = await import('child_process');
      const mockSpawn = vi.mocked(spawn);

      const mockProc = {
        stdout: { on: vi.fn((event, handler) => handler(Buffer.from('version 3.0.0'))) },
        stderr: { on: vi.fn() },
        on: vi.fn((event, handler) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      const result = await service.refresh('claude');

      expect(result.platform).toBe('claude');
      expect(result.version).toBe('3.0.0');

      // Verify cache was updated
      const cached = await service.getCached('claude');
      expect(cached?.version).toBe('3.0.0');
    });
  });

  describe('isCacheValid', () => {
    it('should return true for fresh cache', async () => {
      const testResult: CapabilityProbeResult = {
        platform: 'cursor',
        command: 'cursor',
        runnable: true,
        authStatus: 'authenticated',
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
        probeTimestamp: new Date().toISOString(), // Just created
      };

      const yamlPath = join(tempDir, 'cursor.yaml');
      await fs.writeFile(yamlPath, yaml.dump(testResult), 'utf-8');

      const isValid = await service.isCacheValid('cursor', 24 * 60 * 60 * 1000); // 24 hours
      expect(isValid).toBe(true);
    });

    it('should return false for stale cache', async () => {
      const oldTimestamp = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // 48 hours ago
      
      const testResult: CapabilityProbeResult = {
        platform: 'cursor',
        command: 'cursor',
        runnable: true,
        authStatus: 'authenticated',
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
        probeTimestamp: oldTimestamp,
      };

      const yamlPath = join(tempDir, 'cursor.yaml');
      await fs.writeFile(yamlPath, yaml.dump(testResult), 'utf-8');

      const isValid = await service.isCacheValid('cursor', 24 * 60 * 60 * 1000); // 24 hours
      expect(isValid).toBe(false);
    });

    it('should return false if cache does not exist', async () => {
      const isValid = await service.isCacheValid('claude', 24 * 60 * 60 * 1000);
      expect(isValid).toBe(false);
    });
  });

  describe('cache file formats', () => {
    it('should write both YAML and JSON cache files', async () => {
      const { spawn } = await import('child_process');
      const mockSpawn = vi.mocked(spawn);

      const mockProc = {
        stdout: { on: vi.fn((event, handler) => handler(Buffer.from('version 1.0.0'))) },
        stderr: { on: vi.fn() },
        on: vi.fn((event, handler) => {
          if (event === 'close') {
            setTimeout(() => handler(0), 10);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProc as unknown as ChildProcess);

      await service.probe('cursor');

      const yamlPath = join(tempDir, 'cursor.yaml');
      const jsonPath = join(tempDir, 'cursor.json');

      const yamlContent = await fs.readFile(yamlPath, 'utf-8');
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');

      // Verify YAML is valid
      const yamlData = yaml.load(yamlContent);
      expect(yamlData).toBeDefined();

      // Verify JSON is valid
      const jsonData = JSON.parse(jsonContent);
      expect(jsonData).toBeDefined();
      expect(jsonData.platform).toBe('cursor');
    });
  });
});
