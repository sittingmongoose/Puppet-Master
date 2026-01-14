/**
 * Tests for doctor command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { DoctorCommand, doctorAction, type DoctorOptions } from './doctor.js';

// Mock dependencies
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  access: vi.fn(),
  mkdir: vi.fn(),
  constants: {
    W_OK: 2,
  },
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn(),
}));

import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { ConfigManager } from '../../config/config-manager.js';

/**
 * Helper function to create a mock process that successfully completes
 */
function createMockSuccessProcess(): ReturnType<typeof spawn> {
  return {
    stdout: {
      on: vi.fn((event: string, handler: (data: Buffer) => void) => {
        if (event === 'data') handler(Buffer.from('version 1.0.0\n'));
      }),
    },
    stderr: { on: vi.fn() },
    on: vi.fn((event: string, handler: (code: number) => void) => {
      if (event === 'close') {
        setTimeout(() => handler(0), 10);
      }
    }),
    kill: vi.fn(),
  } as unknown as ReturnType<typeof spawn>;
}

describe('DoctorCommand', () => {
  let command: DoctorCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new DoctorCommand();
    mockProgram = new Command();
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register doctor command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('doctor');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Check system configuration and dependencies');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('--fix');
      expect(optionCalls).toContain('-v, --verbose');
    });
  });
});

describe('doctorAction', () => {
  let mockSpawn: ReturnType<typeof vi.fn>;
  let originalVersion: string;
  let originalExit: typeof process.exit;

  beforeEach(() => {
    originalVersion = process.version;
    originalExit = process.exit;
    process.exit = vi.fn() as never;
    
    mockSpawn = vi.mocked(spawn);
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(process, 'version', {
      value: originalVersion,
      configurable: true,
    });
    process.exit = originalExit;
    vi.clearAllMocks();
  });

  describe('GitCheck', () => {
    it('should pass when Git CLI is available and .git exists', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      mockSpawn.mockReturnValue({
        stdout: { on: vi.fn((event: string, handler: (data: Buffer) => void) => {
          if (event === 'data') handler(Buffer.from('git version 2.40.0'));
        }) },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: () => void) => {
          if (event === 'close') setTimeout(() => handler(), 10);
        }),
        kill: vi.fn(),
      } as unknown as ReturnType<typeof spawn>);

      const options: DoctorOptions = { verbose: false };
      await expect(doctorAction(options)).resolves.not.toThrow();
    });

    it('should fail when Git CLI is not available', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      mockSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (err: Error) => void) => {
          if (event === 'error') setTimeout(() => handler(new Error('Command not found')), 10);
        }),
        kill: vi.fn(),
      } as unknown as ReturnType<typeof spawn>);

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should fail when not in a Git repository', async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      mockSpawn.mockReturnValue({
        stdout: { on: vi.fn((event: string, handler: (data: Buffer) => void) => {
          if (event === 'data') handler(Buffer.from('git version 2.40.0'));
        }) },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: () => void) => {
          if (event === 'close') setTimeout(() => handler(), 10);
        }),
        kill: vi.fn(),
      } as unknown as ReturnType<typeof spawn>);

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('NodeVersionCheck', () => {
    it('should pass when Node.js version is >= 20', async () => {
      Object.defineProperty(process, 'version', {
        value: 'v20.10.0',
        configurable: true,
      });

      // Mock existsSync for .git and .puppet-master
      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = String(path);
        if (pathStr === '.git') return true;
        if (pathStr === '.puppet-master') return true;
        return false;
      });

      // Mock access to succeed
      vi.mocked(access).mockResolvedValue(undefined);

      // Chain 4 spawn mocks (git, cursor, codex, claude)
      mockSpawn
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess());

      // Mock ConfigManager
      const mockConfigManager = {
        load: vi.fn().mockResolvedValue({}),
      };
      vi.mocked(ConfigManager).mockImplementation(() => mockConfigManager as unknown as ConfigManager);

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should fail when Node.js version is < 20', async () => {
      Object.defineProperty(process, 'version', {
        value: 'v18.17.0',
        configurable: true,
      });

      vi.mocked(existsSync).mockReturnValue(true);
      mockSpawn.mockReturnValue({
        stdout: { on: vi.fn((event: string, handler: (data: Buffer) => void) => {
          if (event === 'data') handler(Buffer.from('git version 2.40.0'));
        }) },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: () => void) => {
          if (event === 'close') setTimeout(() => handler(), 10);
        }),
        kill: vi.fn(),
      } as unknown as ReturnType<typeof spawn>);

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('CLI checks', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'version', {
        value: 'v20.10.0',
        configurable: true,
      });

      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = String(path);
        if (pathStr === '.git') return true;
        if (pathStr === '.puppet-master') return true;
        return false;
      });

      vi.mocked(access).mockResolvedValue(undefined);

      const mockConfigManager = {
        load: vi.fn().mockResolvedValue({}),
      };
      vi.mocked(ConfigManager).mockImplementation(() => mockConfigManager as unknown as ConfigManager);
    });

    it('should pass when all CLI tools are available', async () => {
      // Chain 4 spawn mocks (git, cursor, codex, claude)
      mockSpawn
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess());

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should fail when CLI tools are not available', async () => {
      mockSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: (err: Error) => void) => {
          if (event === 'error') setTimeout(() => handler(new Error('Command not found')), 10);
        }),
        kill: vi.fn(),
      } as unknown as ReturnType<typeof spawn>);

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('ConfigCheck', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'version', {
        value: 'v20.10.0',
        configurable: true,
      });

      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = String(path);
        if (pathStr === '.git') return true;
        if (pathStr === '.puppet-master') return true;
        return false;
      });

      vi.mocked(access).mockResolvedValue(undefined);

      // Chain 4 spawn mocks (git, cursor, codex, claude)
      mockSpawn
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess());
    });

    it('should pass when config is valid', async () => {
      const mockConfigManager = {
        load: vi.fn().mockResolvedValue({}),
      };
      vi.mocked(ConfigManager).mockImplementation(() => mockConfigManager as unknown as ConfigManager);

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should fail when config is invalid', async () => {
      const mockConfigManager = {
        load: vi.fn().mockRejectedValue(new Error('Config validation failed')),
      };
      vi.mocked(ConfigManager).mockImplementation(() => mockConfigManager as unknown as ConfigManager);

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('DirectoryCheck', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'version', {
        value: 'v20.10.0',
        configurable: true,
      });

      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = String(path);
        if (pathStr === '.git') return true;
        return false;
      });

      const mockConfigManager = {
        load: vi.fn().mockResolvedValue({}),
      };
      vi.mocked(ConfigManager).mockImplementation(() => mockConfigManager as unknown as ConfigManager);

      // Chain 4 spawn mocks (git, cursor, codex, claude)
      mockSpawn
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess())
        .mockReturnValueOnce(createMockSuccessProcess());
    });

    it('should pass when .puppet-master directory exists and is writable', async () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = String(path);
        if (pathStr === '.git') return true;
        if (pathStr === '.puppet-master') return true;
        return false;
      });
      vi.mocked(access).mockResolvedValue(undefined);

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should fail when .puppet-master directory does not exist', async () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = String(path);
        if (pathStr === '.git') return true;
        return false;
      });

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should fail when .puppet-master directory is not writable', async () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = String(path);
        if (pathStr === '.git') return true;
        if (pathStr === '.puppet-master') return true;
        return false;
      });
      vi.mocked(access).mockRejectedValue(new Error('Permission denied'));

      const options: DoctorOptions = { verbose: false };
      await doctorAction(options);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('verbose mode', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'version', {
        value: 'v20.10.0',
        configurable: true,
      });

      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = String(path);
        if (pathStr === '.git') return true;
        if (pathStr === '.puppet-master') return true;
        return false;
      });

      vi.mocked(access).mockResolvedValue(undefined);

      const mockConfigManager = {
        load: vi.fn().mockResolvedValue({}),
      };
      vi.mocked(ConfigManager).mockImplementation(() => mockConfigManager as unknown as ConfigManager);

      mockSpawn.mockReturnValue({
        stdout: { on: vi.fn((event: string, handler: (data: Buffer) => void) => {
          if (event === 'data') handler(Buffer.from('version 1.0.0'));
        }) },
        stderr: { on: vi.fn() },
        on: vi.fn((event: string, handler: () => void) => {
          if (event === 'close') setTimeout(() => handler(), 10);
        }),
        kill: vi.fn(),
      } as unknown as ReturnType<typeof spawn>);
    });

    it('should show detailed output when verbose is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const options: DoctorOptions = { verbose: true };
      await doctorAction(options);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
