/**
 * Tests for Installation Manager
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T06 (Installation Manager).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import * as readline from 'node:readline';
import {
  InstallationManager,
  type InstallCommand,
  type InstallOptions,
} from './installation-manager.js';

// Mock child_process
vi.mock('node:child_process', () => {
  return {
    spawn: vi.fn(),
  };
});

// Mock readline
vi.mock('node:readline', () => {
  return {
    createInterface: vi.fn(),
  };
});

describe('InstallationManager', () => {
  let manager: InstallationManager;
  let mockSpawn: ReturnType<typeof vi.fn>;
  let mockCreateInterface: ReturnType<typeof vi.fn>;
  let originalPlatform: string;

  beforeEach(() => {
    // Save original platform
    originalPlatform = process.platform;
    
    manager = new InstallationManager();
    mockSpawn = vi.mocked(spawn);
    mockCreateInterface = vi.mocked(readline.createInterface);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original platform
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  /**
   * Helper to create a mock child process that succeeds
   */
  function createMockSuccessProcess(stdout: string = ''): ChildProcess {
    const proc = {
      stdout: {
        on: vi.fn((event: string, handler: (data: Buffer) => void) => {
          if (event === 'data' && stdout) {
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
  function createMockFailureProcess(
    exitCode: number = 1,
    stderr: string = ''
  ): ChildProcess {
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

  /**
   * Helper to set process.platform
   */
  function setPlatform(platform: string): void {
    Object.defineProperty(process, 'platform', {
      value: platform,
      writable: true,
      configurable: true,
    });
  }

  describe('constructor', () => {
    it('should initialize with default commands', () => {
      const cmd = manager.getInstallCommand('cursor-cli');
      expect(cmd).not.toBeNull();
      expect(cmd?.check).toBe('cursor-cli');
      expect(cmd?.description).toBe('Install Cursor Agent CLI');
    });

    it('should register codex-cli command', () => {
      const cmd = manager.getInstallCommand('codex-cli');
      expect(cmd).not.toBeNull();
      expect(cmd?.check).toBe('codex-cli');
      expect(cmd?.command).toContain('@openai/codex');
    });

    it('should register claude-cli command', () => {
      const cmd = manager.getInstallCommand('claude-cli');
      expect(cmd).not.toBeNull();
      expect(cmd?.check).toBe('claude-cli');
    });

    it('should use native Claude install (curl/powershell) per platform', () => {
      setPlatform('linux');
      const mgrLinux = new InstallationManager();
      const cmdLinux = mgrLinux.getInstallCommand('claude-cli');
      expect(cmdLinux?.command).toContain('curl');
      expect(cmdLinux?.command).toContain('claude.ai/install.sh');

      setPlatform('win32');
      const mgrWin = new InstallationManager();
      const cmdWin = mgrWin.getInstallCommand('claude-cli');
      expect(cmdWin?.command).toContain('powershell');
      expect(cmdWin?.command).toContain('claude.ai/install.ps1');
    });

    it('should register project-dir command', () => {
      const cmd = manager.getInstallCommand('project-dir');
      expect(cmd).not.toBeNull();
      expect(cmd?.check).toBe('project-dir');
      expect(cmd?.command).toBe('puppet-master init');
    });
  });

  describe('registerCommand', () => {
    it('should register a custom command', () => {
      const customCmd: InstallCommand = {
        check: 'custom-check',
        command: 'echo "test"',
        description: 'Custom test command',
        requiresSudo: false,
        platforms: ['linux'],
      };

      manager.registerCommand(customCmd);
      const retrieved = manager.getInstallCommand('custom-check');
      expect(retrieved).toEqual(customCmd);
    });

    it('should overwrite existing command with same check name', () => {
      const cmd1: InstallCommand = {
        check: 'test-check',
        command: 'command1',
        description: 'First command',
        requiresSudo: false,
        platforms: ['linux'],
      };

      const cmd2: InstallCommand = {
        check: 'test-check',
        command: 'command2',
        description: 'Second command',
        requiresSudo: true,
        platforms: ['darwin'],
      };

      manager.registerCommand(cmd1);
      manager.registerCommand(cmd2);
      const retrieved = manager.getInstallCommand('test-check');
      expect(retrieved).toEqual(cmd2);
    });
  });

  describe('getInstallCommand', () => {
    it('should return command for registered check', () => {
      const cmd = manager.getInstallCommand('cursor-cli');
      expect(cmd).not.toBeNull();
      expect(cmd?.check).toBe('cursor-cli');
    });

    it('should return null for unregistered check', () => {
      const cmd = manager.getInstallCommand('non-existent-check');
      expect(cmd).toBeNull();
    });
  });

  describe('getCurrentPlatform', () => {
    it('should return darwin for macOS', () => {
      setPlatform('darwin');
      const platform = manager.getCurrentPlatform();
      expect(platform).toBe('darwin');
    });

    it('should return linux for Linux', () => {
      setPlatform('linux');
      const platform = manager.getCurrentPlatform();
      expect(platform).toBe('linux');
    });

    it('should return win32 for Windows', () => {
      setPlatform('win32');
      const platform = manager.getCurrentPlatform();
      expect(platform).toBe('win32');
    });

    it('should default to linux for unknown platforms', () => {
      setPlatform('freebsd');
      const platform = manager.getCurrentPlatform();
      expect(platform).toBe('linux');
    });
  });

  describe('getAvailableInstalls', () => {
    it('should return only commands for current platform (linux)', () => {
      setPlatform('linux');
      const available = manager.getAvailableInstalls();
      expect(available.length).toBeGreaterThan(0);
      expect(available.every((cmd) => cmd.platforms.includes('linux'))).toBe(
        true
      );
    });

    it('should return only commands for current platform (darwin)', () => {
      setPlatform('darwin');
      const available = manager.getAvailableInstalls();
      expect(available.length).toBeGreaterThan(0);
      expect(available.every((cmd) => cmd.platforms.includes('darwin'))).toBe(
        true
      );
    });

    it('should return only commands for current platform (win32)', () => {
      setPlatform('win32');
      const available = manager.getAvailableInstalls();
      expect(available.length).toBeGreaterThan(0);
      expect(available.every((cmd) => cmd.platforms.includes('win32'))).toBe(
        true
      );
    });

    it('should filter out commands not supported on current platform', () => {
      setPlatform('win32');
      const available = manager.getAvailableInstalls();
      // cursor-cli now supports all platforms including win32
      const cursorCmd = available.find((cmd) => cmd.check === 'cursor-cli');
      expect(cursorCmd).toBeDefined();
      expect(cursorCmd?.platforms).toContain('win32');
    });
  });

  describe('install - dry run', () => {
    it('should log command without executing in dry run mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const options: InstallOptions = { dryRun: true };
      const result = await manager.install('cursor-cli', options);

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DRY RUN]')
      );
      expect(mockSpawn).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should show description in dry run mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const options: InstallOptions = { dryRun: true };
      await manager.install('codex-cli', options);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Description:')
      );

      consoleSpy.mockRestore();
    });

    it('should show sudo warning in dry run mode if required', async () => {
      const customCmd: InstallCommand = {
        check: 'sudo-test',
        command: 'sudo echo test',
        description: 'Test sudo command',
        requiresSudo: true,
        platforms: ['linux'],
      };
      manager.registerCommand(customCmd);

      setPlatform('linux');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const options: InstallOptions = { dryRun: true };
      await manager.install('sudo-test', options);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('requires elevated privileges')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('install - user confirmation', () => {
    it('should prompt user for confirmation', async () => {
      const mockRl = {
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('y');
        }),
        close: vi.fn(),
      };
      mockCreateInterface.mockReturnValue(mockRl as unknown as readline.Interface);

      setPlatform('linux');
      const proc = createMockSuccessProcess('Installation complete');
      mockSpawn.mockReturnValue(proc);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const options: InstallOptions = { skipConfirmation: false };
      await manager.install('cursor-cli', options);

      expect(mockCreateInterface).toHaveBeenCalled();
      expect(mockRl.question).toHaveBeenCalled();
      expect(mockRl.close).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should skip confirmation if skipConfirmation is true', async () => {
      setPlatform('linux');
      const proc = createMockSuccessProcess('Installation complete');
      mockSpawn.mockReturnValue(proc);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const options: InstallOptions = { skipConfirmation: true };
      await manager.install('cursor-cli', options);

      expect(mockCreateInterface).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should cancel installation if user says no', async () => {
      const mockRl = {
        question: vi.fn((_prompt: string, callback: (answer: string) => void) => {
          callback('n');
        }),
        close: vi.fn(),
      };
      mockCreateInterface.mockReturnValue(mockRl as unknown as readline.Interface);

      setPlatform('linux');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const options: InstallOptions = { skipConfirmation: false };
      const result = await manager.install('cursor-cli', options);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('cancelled')
      );
      expect(mockSpawn).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('install - execution', () => {
    it('should execute command successfully', async () => {
      setPlatform('linux');
      const proc = createMockSuccessProcess('Installation complete');
      mockSpawn.mockReturnValue(proc);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const options: InstallOptions = { skipConfirmation: true };
      const result = await manager.install('cursor-cli', options);

      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        [],
        expect.objectContaining({
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe'],
        })
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successfully installed')
      );

      consoleSpy.mockRestore();
    });

    it('should handle installation failure', async () => {
      setPlatform('linux');
      const proc = createMockFailureProcess(1, 'Installation failed');
      mockSpawn.mockReturnValue(proc);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const options: InstallOptions = { skipConfirmation: true };
      const result = await manager.install('cursor-cli', options);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installation failed')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle spawn errors', async () => {
      setPlatform('linux');
      const error = new Error('Command not found');
      const proc = createMockErrorProcess(error);
      mockSpawn.mockReturnValue(proc);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const options: InstallOptions = { skipConfirmation: true };
      const result = await manager.install('cursor-cli', options);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installation failed')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Command not found')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return false for unregistered check', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const options: InstallOptions = { skipConfirmation: true };
      const result = await manager.install('non-existent', options);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('No install command found')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return false for unsupported platform', async () => {
      // Register a command that specifically doesn't support win32
      const linuxOnlyCmd: InstallCommand = {
        check: 'linux-only-tool',
        command: 'apt-get install linux-tool',
        description: 'Install Linux-only tool',
        requiresSudo: true,
        platforms: ['linux'],
      };
      manager.registerCommand(linuxOnlyCmd);

      setPlatform('win32');
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const options: InstallOptions = { skipConfirmation: true };
      const result = await manager.install('linux-only-tool', options);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('not supported on platform')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle command timeout', async () => {
      setPlatform('linux');
      const proc = {
        stdout: {
          on: vi.fn(),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn(),
        kill: vi.fn(),
      } as unknown as ChildProcess;
      mockSpawn.mockReturnValue(proc);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Use vi.useFakeTimers to control setTimeout
      vi.useFakeTimers();

      const options: InstallOptions = { skipConfirmation: true };
      const installPromise = manager.install('cursor-cli', options);

      // Wait a bit for the spawn to be called and timeout to be set up
      await vi.advanceTimersByTimeAsync(10);
      
      // Fast-forward time to trigger timeout (300000ms = 5 minutes)
      await vi.advanceTimersByTimeAsync(300001);
      
      const result = await installPromise;
      
      expect(result).toBe(false);
      expect(proc.kill).toHaveBeenCalledWith('SIGKILL');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installation failed')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('timed out')
      );

      vi.useRealTimers();
      consoleErrorSpy.mockRestore();
    });
  });
});
