/**
 * Tests for ProcessRegistry
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ProcessRegistry, type SessionRegistry, type ProcessRecord } from './process-registry.js';
import { spawn } from 'child_process';

describe('ProcessRegistry', () => {
  const testDir = '.puppet-master-test-registry';
  const sessionId = 'test-session-123';
  const registryPath = join(testDir, 'sessions', `${sessionId}.json`);
  let registry: ProcessRegistry;

  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(testDir, { recursive: true });

    registry = new ProcessRegistry(sessionId, registryPath);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
  });

  describe('initialize', () => {
    it('should create a new registry if file does not exist', async () => {
      await registry.initialize();

      const savedRegistry = registry.getRegistry();
      expect(savedRegistry).toBeDefined();
      expect(savedRegistry!.sessionId).toBe(sessionId);
      expect(savedRegistry!.processes).toEqual([]);
      expect(savedRegistry!.status).toBe('active');
      expect(savedRegistry!.orchestratorPid).toBe(process.pid);
    });

    it('should load existing registry from file', async () => {
      // Create a registry file manually
      const existingRegistry: SessionRegistry = {
        sessionId,
        orchestratorPid: 12345,
        processes: [
          {
            pid: 999,
            platform: 'cursor',
            command: 'test command',
            spawnedAt: new Date().toISOString(),
            status: 'running',
          },
        ],
        startedAt: new Date().toISOString(),
        status: 'active',
      };

      await fs.mkdir(join(testDir, 'sessions'), { recursive: true });
      await fs.writeFile(registryPath, JSON.stringify(existingRegistry), 'utf-8');

      await registry.initialize();

      const savedRegistry = registry.getRegistry();
      expect(savedRegistry).toBeDefined();
      expect(savedRegistry!.orchestratorPid).toBe(12345);
      expect(savedRegistry!.processes).toHaveLength(1);
      expect(savedRegistry!.processes[0]!.pid).toBe(999);
    });

    it('should persist new registry to disk', async () => {
      await registry.initialize();

      const content = await fs.readFile(registryPath, 'utf-8');
      const saved = JSON.parse(content) as SessionRegistry;

      expect(saved.sessionId).toBe(sessionId);
      expect(saved.orchestratorPid).toBe(process.pid);
    });
  });

  describe('registerProcess', () => {
    it('should register a new process', async () => {
      await registry.initialize();
      await registry.registerProcess(1234, 'cursor', 'test command');

      const processes = await registry.getRunningProcesses();
      expect(processes).toHaveLength(1);
      expect(processes[0]!.pid).toBe(1234);
      expect(processes[0]!.platform).toBe('cursor');
      expect(processes[0]!.command).toBe('test command');
      expect(processes[0]!.status).toBe('running');
    });

    it('should auto-initialize if not initialized', async () => {
      await registry.registerProcess(1234, 'cursor', 'test command');

      const processes = await registry.getRunningProcesses();
      expect(processes).toHaveLength(1);
    });

    it('should persist registered process to disk', async () => {
      await registry.initialize();
      await registry.registerProcess(1234, 'cursor', 'test command');

      const content = await fs.readFile(registryPath, 'utf-8');
      const saved = JSON.parse(content) as SessionRegistry;

      expect(saved.processes).toHaveLength(1);
      expect(saved.processes[0]!.pid).toBe(1234);
    });

    it('should register multiple processes', async () => {
      await registry.initialize();
      await registry.registerProcess(1001, 'cursor', 'command 1');
      await registry.registerProcess(1002, 'claude', 'command 2');
      await registry.registerProcess(1003, 'codex', 'command 3');

      const processes = await registry.getRunningProcesses();
      expect(processes).toHaveLength(3);
      expect(processes.map((p) => p.pid)).toEqual([1001, 1002, 1003]);
    });
  });

  describe('getRunningProcesses', () => {
    it('should return only running processes', async () => {
      await registry.initialize();

      // Manually add processes with different statuses
      const reg = registry.getRegistry()!;
      reg.processes.push(
        {
          pid: 1001,
          platform: 'cursor',
          command: 'cmd1',
          spawnedAt: new Date().toISOString(),
          status: 'running',
        },
        {
          pid: 1002,
          platform: 'claude',
          command: 'cmd2',
          spawnedAt: new Date().toISOString(),
          status: 'terminated',
        },
        {
          pid: 1003,
          platform: 'codex',
          command: 'cmd3',
          spawnedAt: new Date().toISOString(),
          status: 'running',
        }
      );

      const running = await registry.getRunningProcesses();
      expect(running).toHaveLength(2);
      expect(running.map((p) => p.pid)).toEqual([1001, 1003]);
    });

    it('should return empty array if no running processes', async () => {
      await registry.initialize();

      const running = await registry.getRunningProcesses();
      expect(running).toEqual([]);
    });
  });

  describe('terminateProcess', () => {
    it('should mark process as terminated', async () => {
      await registry.initialize();
      await registry.registerProcess(1234, 'cursor', 'test command');

      // Mock process.kill to prevent actual termination
      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

      await registry.terminateProcess(1234, false);

      const savedRegistry = registry.getRegistry()!;
      const record = savedRegistry.processes.find((p) => p.pid === 1234);
      expect(record!.status).toBe('terminated');

      killSpy.mockRestore();
    });

    it('should mark process as killed when force=true', async () => {
      await registry.initialize();
      await registry.registerProcess(1234, 'cursor', 'test command');

      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

      await registry.terminateProcess(1234, true);

      const savedRegistry = registry.getRegistry()!;
      const record = savedRegistry.processes.find((p) => p.pid === 1234);
      expect(record!.status).toBe('killed');

      killSpy.mockRestore();
    });

    it('should handle already terminated processes', async () => {
      await registry.initialize();
      await registry.registerProcess(1234, 'cursor', 'test command');

      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

      // Terminate once
      await registry.terminateProcess(1234, false);

      // Terminate again (should be no-op)
      await registry.terminateProcess(1234, false);

      const savedRegistry = registry.getRegistry()!;
      const record = savedRegistry.processes.find((p) => p.pid === 1234);
      expect(record!.status).toBe('terminated');

      killSpy.mockRestore();
    });

    it('should handle non-existent process gracefully', async () => {
      await registry.initialize();

      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

      // Should not throw
      await registry.terminateProcess(9999, false);

      killSpy.mockRestore();
    });

    it('should handle process that already exited (ESRCH error)', async () => {
      await registry.initialize();
      await registry.registerProcess(1234, 'cursor', 'test command');

      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => {
        const err = new Error('No such process') as NodeJS.ErrnoException;
        err.code = 'ESRCH';
        throw err;
      });

      // Should not throw, should mark as terminated
      await registry.terminateProcess(1234, false);

      const savedRegistry = registry.getRegistry()!;
      const record = savedRegistry.processes.find((p) => p.pid === 1234);
      expect(record!.status).toBe('terminated');

      killSpy.mockRestore();
    });
  });

  describe('terminateAll', () => {
    it('should terminate all running processes', async () => {
      await registry.initialize();
      await registry.registerProcess(1001, 'cursor', 'cmd1');
      await registry.registerProcess(1002, 'claude', 'cmd2');
      await registry.registerProcess(1003, 'codex', 'cmd3');

      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

      await registry.terminateAll(false);

      const savedRegistry = registry.getRegistry()!;
      expect(savedRegistry.status).toBe('stopped');
      expect(savedRegistry.processes.every((p) => p.status === 'terminated')).toBe(true);

      killSpy.mockRestore();
    });

    it('should mark session as stopped', async () => {
      await registry.initialize();

      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

      await registry.terminateAll(false);

      const savedRegistry = registry.getRegistry()!;
      expect(savedRegistry.status).toBe('stopped');

      killSpy.mockRestore();
    });

    it('should persist changes to disk', async () => {
      await registry.initialize();
      await registry.registerProcess(1001, 'cursor', 'cmd1');

      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

      await registry.terminateAll(false);

      const content = await fs.readFile(registryPath, 'utf-8');
      const saved = JSON.parse(content) as SessionRegistry;

      expect(saved.status).toBe('stopped');
      expect(saved.processes[0]!.status).toBe('terminated');

      killSpy.mockRestore();
    });
  });

  describe('cross-platform termination', () => {
    it('should use process.kill on Unix platforms', async () => {
      // Skip on Windows
      if (process.platform === 'win32') {
        return;
      }

      await registry.initialize();
      await registry.registerProcess(1234, 'cursor', 'test command');

      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

      await registry.terminateProcess(1234, false);

      // Should try process group kill first (-pid)
      expect(killSpy).toHaveBeenCalledWith(-1234, 'SIGTERM');

      killSpy.mockRestore();
    });

    it('should use SIGKILL when force=true on Unix', async () => {
      // Skip on Windows
      if (process.platform === 'win32') {
        return;
      }

      await registry.initialize();
      await registry.registerProcess(1234, 'cursor', 'test command');

      const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

      await registry.terminateProcess(1234, true);

      expect(killSpy).toHaveBeenCalledWith(-1234, 'SIGKILL');

      killSpy.mockRestore();
    });
  });
});
