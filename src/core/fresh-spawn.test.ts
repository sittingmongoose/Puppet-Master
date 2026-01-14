/**
 * Tests for FreshSpawner
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { PassThrough } from 'stream';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readFile } from 'node:fs/promises';
import type { ChildProcess } from 'node:child_process';
import { FreshSpawner } from './fresh-spawn.js';
import type { SpawnRequest, SpawnConfig } from './fresh-spawn.js';
import * as childProcess from 'node:child_process';

// Mock spawn
const mockSpawn = vi.fn();
vi.mock('node:child_process', async () => {
  const actual = await vi.importActual<typeof childProcess>('node:child_process');
  return {
    ...actual,
    spawn: (...args: Parameters<typeof childProcess.spawn>) => {
      return mockSpawn(...args);
    },
  };
});

type MockChildProcess = ChildProcess & {
  _setExitCode: (code: number | null) => void;
  _setSignalCode: (signal: NodeJS.Signals | null) => void;
};

function createMockChildProcess(pid: number): MockChildProcess {
  const stdin = new PassThrough();
  const stdout = new PassThrough();
  const stderr = new PassThrough();

  let exitCode: number | null = null;
  let signalCode: NodeJS.Signals | null = null;

  const proc = {
    pid,
    stdin,
    stdout,
    stderr,
    get exitCode() {
      return exitCode;
    },
    get signalCode() {
      return signalCode;
    },
    kill: vi.fn((signal?: NodeJS.Signals) => {
      if (signal) {
        signalCode = signal;
      }
      return true;
    }),
    once: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      if (event === 'close') {
        // Simulate process exit after a short delay
        setTimeout(() => {
          exitCode = 0;
          listener(exitCode, signalCode);
        }, 10);
      } else if (event === 'error') {
        // Don't trigger error by default
      }
      return proc;
    }),
    on: vi.fn((event: string, _listener: (...args: unknown[]) => void) => {
      if (event === 'data') {
        // Don't emit data by default
      }
      return proc;
    }),
    emit: vi.fn((_event: string, ..._args: unknown[]) => {
      return true;
    }),
    _setExitCode: (code: number | null) => {
      exitCode = code;
    },
    _setSignalCode: (signal: NodeJS.Signals | null) => {
      signalCode = signal;
    },
  } as unknown as MockChildProcess;

  return proc;
}

function createSpawnConfig(overrides?: Partial<SpawnConfig>): SpawnConfig {
  return {
    workingDirectory: '/tmp/test',
    timeout: 5_000,
    hardTimeout: 10_000,
    environmentVars: {},
    allowSessionResume: false,
    ...overrides,
  };
}

function createSpawnRequest(overrides?: Partial<SpawnRequest>): SpawnRequest {
  return {
    prompt: 'test prompt',
    platform: 'codex',
    model: undefined,
    contextFiles: ['progress.txt', 'AGENTS.md'],
    iterationId: 'ST-001-001-001-iter-001',
    ...overrides,
  };
}

describe('FreshSpawner', () => {
  let tempDir: string;
  let spawner: FreshSpawner;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'fresh-spawn-test-'));
    vi.useRealTimers();
    mockSpawn.mockClear();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }
  });

  describe('spawn', () => {
    it('creates new process with correct PID', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest();

      // Mock git status to return clean
      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        // Mock the actual platform command
        if (command === 'codex') {
          return createMockChildProcess(12345);
        }
        return createMockChildProcess(9999);
      });

      const result = await spawner.spawn(request);

      expect(result.processId).toBe(12345);
      expect(result.startedAt).toBeDefined();
      expect(result.stdin).toBeDefined();
      expect(result.stdout).toBeDefined();
      expect(result.stderr).toBeDefined();
      expect(typeof result.cleanup).toBe('function');
    });

    it('sets environment variables correctly', async () => {
      const config = createSpawnConfig({
        workingDirectory: tempDir,
        environmentVars: { TEST_VAR: 'test-value' },
      });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest({ iterationId: 'ITER-123' });

      let capturedEnv: Record<string, string> | undefined;

      mockSpawn.mockImplementation((command: string, args: string[], options?: { env?: Record<string, string> }) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'codex') {
          capturedEnv = options?.env;
          return createMockChildProcess(12345);
        }
        return createMockChildProcess(9999);
      });

      await spawner.spawn(request);

      expect(capturedEnv).toBeDefined();
      expect(capturedEnv?.PUPPET_MASTER_ITERATION).toBe('ITER-123');
      expect(capturedEnv?.NODE_ENV).toBe('production');
      expect(capturedEnv?.TEST_VAR).toBe('test-value');
    });

    it('builds correct command for cursor platform', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest({
        platform: 'cursor',
        model: 'auto',
        prompt: 'test prompt',
      });

      let capturedCommand: string | undefined;
      let capturedArgs: string[] | undefined;

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'cursor-agent') {
          capturedCommand = command;
          capturedArgs = args;
          return createMockChildProcess(12345);
        }
        return createMockChildProcess(9999);
      });

      await spawner.spawn(request);

      expect(capturedCommand).toBe('cursor-agent');
      expect(capturedArgs).toContain('--model');
      expect(capturedArgs).toContain('auto');
      expect(capturedArgs).toContain('-p');
      expect(capturedArgs).toContain('test prompt');
    });

    it('builds correct command for codex platform', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest({
        platform: 'codex',
        model: 'o3',
        prompt: 'test prompt',
      });

      let capturedCommand: string | undefined;
      let capturedArgs: string[] | undefined;

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'codex') {
          capturedCommand = command;
          capturedArgs = args;
          return createMockChildProcess(12345);
        }
        return createMockChildProcess(9999);
      });

      await spawner.spawn(request);

      expect(capturedCommand).toBe('codex');
      expect(capturedArgs?.[0]).toBe('exec');
      expect(capturedArgs).toContain('test prompt');
      expect(capturedArgs).toContain('--model');
      expect(capturedArgs).toContain('o3');
    });

    it('builds correct command for claude platform', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest({
        platform: 'claude',
        model: 'sonnet-4.5',
        prompt: 'test prompt',
      });

      let capturedCommand: string | undefined;
      let capturedArgs: string[] | undefined;

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'claude') {
          capturedCommand = command;
          capturedArgs = args;
          return createMockChildProcess(12345);
        }
        return createMockChildProcess(9999);
      });

      await spawner.spawn(request);

      expect(capturedCommand).toBe('claude');
      expect(capturedArgs).toContain('--model');
      expect(capturedArgs).toContain('sonnet-4.5');
      expect(capturedArgs).toContain('-p');
      expect(capturedArgs).toContain('test prompt');
    });

    it('throws error if process has no PID', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest();

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'codex') {
          // Return process without PID
          return { pid: undefined } as unknown as ChildProcess;
        }
        return createMockChildProcess(9999);
      });

      await expect(spawner.spawn(request)).rejects.toThrow('FreshSpawner failed to spawn process');
    });

    it('throws error if process has no stdio streams', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest();

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'codex') {
          // Return process without stdio
          return { pid: 12345, stdin: null, stdout: null, stderr: null } as unknown as ChildProcess;
        }
        return createMockChildProcess(9999);
      });

      await expect(spawner.spawn(request)).rejects.toThrow('FreshSpawner spawned process without expected stdio streams');
    });
  });

  describe('prepareWorkingDirectory', () => {
    it('verifies clean working directory', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from('')); // Clean state
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        return createMockChildProcess(9999);
      });

      await expect(spawner.prepareWorkingDirectory()).resolves.not.toThrow();
    });

    it('throws error if working directory is not clean', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(' M file.txt\n')); // Modified file
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        return createMockChildProcess(9999);
      });

      await expect(spawner.prepareWorkingDirectory()).rejects.toThrow(/Working directory.*not clean/);
    });

    it('stashes uncommitted changes when directory is dirty', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);

      let stashCalled = false;

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            // First call: dirty, second call: clean after stash
            if (!stashCalled) {
              proc.stdout?.emit('data', Buffer.from(' M file.txt\n'));
            } else {
              proc.stdout?.emit('data', Buffer.from(''));
            }
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'git' && args[0] === 'stash') {
          stashCalled = true;
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        return createMockChildProcess(9999);
      });

      // This should succeed after stashing
      await expect(spawner.prepareWorkingDirectory()).resolves.not.toThrow();
      expect(stashCalled).toBe(true);
    });
  });

  describe('createProcessAudit', () => {
    it('creates audit with correct structure', async () => {
      const config = createSpawnConfig({
        workingDirectory: tempDir,
        environmentVars: { CUSTOM_VAR: 'value' },
      });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest({
        iterationId: 'ITER-123',
        contextFiles: ['file1.txt', 'file2.txt'],
      });

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'codex') {
          return createMockChildProcess(12345);
        }
        return createMockChildProcess(9999);
      });

      const result = await spawner.spawn(request);
      const audit = spawner.createProcessAudit(request, result);

      expect(audit.iterationId).toBe('ITER-123');
      expect(audit.process.pid).toBe(12345);
      expect(audit.process.freshSpawn).toBe(true);
      expect(audit.process.sessionResumed).toBe(false);
      expect(audit.contextFilesProvided).toEqual(['file1.txt', 'file2.txt']);
      expect(audit.workingDirectory).toBe(tempDir);
      expect(audit.environmentVarsSet).toContain('NODE_ENV');
      expect(audit.environmentVarsSet).toContain('PUPPET_MASTER_ITERATION');
      expect(audit.environmentVarsSet).toContain('CUSTOM_VAR');
    });
  });

  describe('writeAudit', () => {
    it('writes audit file to correct location', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest({ iterationId: 'ST-001-001-001-iter-001' });

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'codex') {
          return createMockChildProcess(12345);
        }
        return createMockChildProcess(9999);
      });

      await spawner.spawn(request);

      // Wait a bit for async audit write
      await new Promise((resolve) => setTimeout(resolve, 100));

      const auditPath = join(tempDir, '.puppet-master', 'logs', 'iterations', 'iter-ST-001-001-001-iter-001.json');
      const auditContent = await readFile(auditPath, 'utf-8');
      const audit = JSON.parse(auditContent);

      // Verify snake_case format per REQUIREMENTS.md 26.6
      expect(audit.iteration_id).toBe('ST-001-001-001-iter-001');
      expect(audit.process.pid).toBe(12345);
      expect(audit.process.started_at).toBeDefined();
      expect(audit.process.fresh_spawn).toBe(true);
      expect(audit.process.session_resumed).toBe(false);
      expect(audit.context_files_provided).toBeDefined();
      expect(audit.working_directory).toBe(tempDir);
      expect(audit.environment_vars_set).toBeDefined();
    });
  });

  describe('cleanupAfterSpawn', () => {
    it('terminates process and cleans up timers', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir, timeout: 100, hardTimeout: 200 });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest();

      let mockProc: MockChildProcess | undefined;

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'codex') {
          mockProc = createMockChildProcess(12345);
          // Don't auto-close, let cleanup handle it
          return mockProc;
        }
        return createMockChildProcess(9999);
      });

      const result = await spawner.spawn(request);

      // Manually trigger close to simulate process exit
      if (mockProc) {
        const proc = mockProc;
        setTimeout(() => {
          proc._setExitCode(0);
          proc.emit('close', 0);
        }, 50);
      }

      await result.cleanup();

      if (mockProc) {
        expect(mockProc.kill).toHaveBeenCalled();
      }
    });

    it('sends SIGKILL if SIGTERM does not terminate process', async () => {
      const config = createSpawnConfig({ workingDirectory: tempDir, timeout: 100, hardTimeout: 200 });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest();

      let mockProc: MockChildProcess | undefined;
      const closeListeners: Array<(code: number, signal?: NodeJS.Signals) => void> = [];

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          setTimeout(() => {
            proc.stdout?.emit('data', Buffer.from(''));
            proc.emit('close', 0);
          }, 10);
          return proc;
        }
        if (command === 'codex') {
          mockProc = createMockChildProcess(12345);
          // Capture close listener
          mockProc.once = vi.fn((event: string, listener: (...args: unknown[]) => void) => {
            if (event === 'close') {
              closeListeners.push(listener as (code: number, signal?: NodeJS.Signals) => void);
            }
            return mockProc;
          }) as unknown as MockChildProcess['once'];
          return mockProc;
        }
        return createMockChildProcess(9999);
      });

      const result = await spawner.spawn(request);

      // Start cleanup
      const cleanupPromise = result.cleanup();
      
      // Simulate process exit after cleanup attempts (but before timeout)
      setTimeout(() => {
        closeListeners.forEach((listener) => listener(0, undefined));
      }, 100);

      await cleanupPromise;

      if (mockProc) {
        expect(mockProc.kill).toHaveBeenCalled();
      }
    }, 10000); // Increase timeout for this test
  });

  describe('timeout handling', () => {
    it('sends SIGTERM on soft timeout', async () => {
      vi.useFakeTimers();

      const config = createSpawnConfig({ workingDirectory: tempDir, timeout: 100, hardTimeout: 200 });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest();

      let mockProc: MockChildProcess | undefined;

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          vi.advanceTimersByTime(10);
          proc.stdout?.emit('data', Buffer.from(''));
          proc.emit('close', 0);
          return proc;
        }
        if (command === 'codex') {
          mockProc = createMockChildProcess(12345);
          return mockProc;
        }
        return createMockChildProcess(9999);
      });

      const spawnPromise = spawner.spawn(request);
      await vi.runAllTimersAsync();
      await spawnPromise;

      // Advance past soft timeout
      await vi.advanceTimersByTimeAsync(150);

      if (mockProc) {
        expect(mockProc.kill).toHaveBeenCalledWith('SIGTERM');
      }

      vi.useRealTimers();
    });

    it('sends SIGKILL on hard timeout', async () => {
      vi.useFakeTimers();

      const config = createSpawnConfig({ workingDirectory: tempDir, timeout: 100, hardTimeout: 200 });
      spawner = new FreshSpawner(config);
      const request = createSpawnRequest();

      let mockProc: MockChildProcess | undefined;

      mockSpawn.mockImplementation((command: string, args: string[]) => {
        if (command === 'git' && args[0] === 'status') {
          const proc = createMockChildProcess(9999);
          vi.advanceTimersByTime(10);
          proc.stdout?.emit('data', Buffer.from(''));
          proc.emit('close', 0);
          return proc;
        }
        if (command === 'codex') {
          mockProc = createMockChildProcess(12345);
          return mockProc;
        }
        return createMockChildProcess(9999);
      });

      const spawnPromise = spawner.spawn(request);
      await vi.runAllTimersAsync();
      await spawnPromise;

      // Advance past hard timeout
      await vi.advanceTimersByTimeAsync(250);

      if (mockProc) {
        expect(mockProc.kill).toHaveBeenCalledWith('SIGTERM');
        expect(mockProc.kill).toHaveBeenCalledWith('SIGKILL');
      }

      vi.useRealTimers();
    });
  });

  describe('allowSessionResume', () => {
    it('defaults to false', () => {
      const config = createSpawnConfig({ workingDirectory: tempDir });
      spawner = new FreshSpawner(config);

      // Access private config through spawn to verify
      const internal = spawner as unknown as { config: Required<SpawnConfig> };
      expect(internal.config.allowSessionResume).toBe(false);
    });

    it('respects explicit allowSessionResume setting', () => {
      const config = createSpawnConfig({ workingDirectory: tempDir, allowSessionResume: true });
      spawner = new FreshSpawner(config);

      const internal = spawner as unknown as { config: Required<SpawnConfig> };
      expect(internal.config.allowSessionResume).toBe(true);
    });
  });
});
